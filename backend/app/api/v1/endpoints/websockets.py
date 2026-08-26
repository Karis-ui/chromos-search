from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends, Query
from fastapi.websockets import WebSocketState
from typing import Dict, Set, Optional, Any, List
import json
import asyncio
from datetime import datetime, timedelta
import logging
import time

from app.core.security import verify_token, rate_limit
from app.core.redis_client import get_redis
from app.core.logger import logger, get_correlation_id
from app.core.exceptions import UnauthorizedException

router = APIRouter(prefix="/ws", tags=["WebSocket"])

class WebSocketConnectionManager:
    def __init__(self):
        self.active_connection: Dict[str,Set[WebSocket]] = {}
        self.connection_metadata:Dict[WebSocket,Dict[str,Any]] = {}
        self.heartbeat_tasks:Dict[WebSocket,asyncio.Task] = {}
        self.message_quests:Dict[str,asyncio.Queue] = {}
        self._lock = asyncio.Lock()
    
    async def connect(
        self,task_id:str,websocket:WebSocket,user_id:Optional[str] = None,metadata:Optional[Dict[str,Any]] = None
    ):
        await websocket.accept()
        async with self._lock:
            if task_id not in self.active_connection:
                self.active_connection[task_id] = set()
            
            self.active_connection[task_id].add(websocket)
            self.connection_metadata[websocket] = {
                "task_id":task_id,
                "user_id":user_id,
                "connection_at":datetime.utcnow(),
                "last_heartbeat":datetime.utcnow(),
                "metadata":metadata or {},
            }
        
        self.heartbeat_tasks[websocket] = asyncio.create_task(
            self._heartbeat_loop(websocket,task_id)
        )
        
        if task_id not in self.message_quests:
            self.message_quests[task_id] = asyncio.Queue()
            asyncio.create_task(self._process_message_queue(task_id))
        logger.info(f"Websocket connected:task={task_id},user={user_id}")
        await websocket.send_text(json.dumps({
            "type": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "task_id": task_id,
            "user_id": user_id,
            "message": "Connected to Chronos real-time feed"
        }))
    
    def disconnect(self,websocket:WebSocket):
        metadata = self.connection_metadata.get(websocket,{})
        task_id = metadata.get("task_id")
        
        if task_id and task_id in self.active_connection:
            self.active_connection[task_id].discard(websocket)
            if not self.active_connection[task_id]:
                del self.active_connection[task_id]
        
        if websocket in self.heartbeat_tasks:
            self.heartbeat_tasks[websocket].cancel()
            del self.active_connection[task_id]   
        
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
        
        logger.info(f"Websocket disconnected: task={tak_id}")
    
    async def _heartbeat_loop(self,websocket: WebSocket,task_id:str):
        try:
            while True:
                await asyncio.sleep(30)
                
                if websocket.client_state == WebSocketState.DISCONNECTED:
                    break
                
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["last_heartbeat"] = datetime.utcnow()
                    
                try:
                    await websocket.send_text(json.dumps({
                        "type": "heartbeat",
                        "timestamp":datetime.utcnow().isoformat()
                    }))
                except WebSocketDisconnect:
                    break
                except Exception as e:
                    logger.error(f"Heartbeat error: {str(e)}")
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Heartbeat loop error: {str(e)}")
        finally:
            self.disconnect(websocket)
    
    async def _process_message_queue(self,task_id:str):
        queue = self.message_quests(task_id)
        if not queue:
            return
        
        while True:
            try:
                message = await queue.get()
                if message is None:
                    break
                await self.broadcast_message(task_id,message)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Message queue error: {str(e)}")
                await asyncio.sleep(1)
    
    async def broadcast_message(self,task_id:str,message:Dict[str,Any],exclude:Optional[WebSocket] = None):
        if task_id not in self.active_connection:
            return
        try:
            if isinstance(message,dict):
                message_json = json.dumps({
                    "type": message.get("type", "message"),
                    "data": message,
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                message_json = message
        except Exception as e:
            logger.error(f"Message serialization error: {str(e)}")
            return
        disconnected = set()
        for connection in self.active_connection.get(task_id,[]):
            if connection == exclude:
                continue
            try:
                await connection.send_text(message_json)
            except WebSocketDisconnect:
                disconnected.add(connection)
            except Exception as e:
                logger.error(f"Broadcast error: {str(e)}")
                disconnected.add(connection)
    
    async def send_message(self,task_id:str,message: Dict[str,Any]):
        queue = self.message_quests.get(task_id)
        if queue:
            await queue.put(message)
    
    async def send_direct(self,websocket: WebSocket,message: Dict[str,Any]):
        try:
            message_json = json.dumps({
                "type": message.get("type", "message"),
                "data": message,
                "timestamp": datetime.utcnow().isoformat()
            })
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Direct send error: {str(e)}")
            
    async def get_active_connection(self,task_id: str) -> int:
        return len(self.active_connection.get(task_id,set()))
    
    async def get_connection_metadata(self,websocket: WebSocket) -> Optional[Dict[str,Any]]:
        return self.connection_metadata.get(websocket)

manager = WebSocketConnectionManager()

@router.websocket("/search/{task_id}")
async def websocket_search(
    websocket: WebSocket,
    task_id: str,
    token: Optional[str] = Query(None),
    redis = Depends(get_redis)
):
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008, reason="Invalid token payload")
        return
    
    task_exists = await redis.exists(f"search:task:{task_id}")
    if not task_exists:
        await websocket.close(code=1008, reason="Task not found")
        return
    
    task_user_id = await redis.hget(f"search:task:{task_id}", "user_id")
    if task_user_id and task_user_id.decode() != user_id:
        pass
    
    try:
        await manager.connect(
            task_id=task_id,
            websocket=websocket,
            user_id=user_id,
            metadata={
                "task_id": task_id,
                "user_id": user_id,
                "connected_at": datetime.utcnow().isoformat()
            }
        )
        
        status_data = await redis.hgetall(f"search:task:{task_id}")
        
        await manager.send_direct(websocket, {
            "type": "init",
            "status": status_data.get("status", "unknown"),
            "progress": float(status_data.get("progress", 0)),
            "results_count": int(status_data.get("results_count", 0)),
            "task_id": task_id,
            "user_id": user_id,
            "message": "Connected to real-time feed"
        })
        
        pubsub = redis.pubsub()
        await pubsub.subscribe(f"search:updates:{task_id}")
        
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    try:
                        data = json.loads(message['data'])
                        await manager.send_direct(websocket, data)
                    except Exception as e:
                        logger.error(f"Pub/sub message error: {str(e)}")
                
                try:
                    client_message = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=0.1
                    )
                    try:
                        data = json.loads(client_message)
                        if data.get("type") == "pong":
                            if websocket in manager.connection_metadata:
                                manager.connection_metadata[websocket]["last_heartbeat"] = datetime.utcnow()
                    except json.JSONDecodeError:
                        pass
                except asyncio.TimeoutError:
                    continue
                except WebSocketDisconnect:
                    break
                
                await asyncio.sleep(0.01)
                
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.error(f"WebSocket loop error: {str(e)}")
        finally:
            await pubsub.unsubscribe(f"search:updates:{task_id}")
            await pubsub.close()
            manager.disconnect(websocket)
            logger.info(f"WebSocket disconnected: task={task_id}, user={user_id}")
            
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass
        
@router.websocket("/admin")
async def websocket_admin(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    await websocket.accept()
    
    try:
        while True:
            stats = {
                "type": "admin_stats",
                "total_connections": sum(len(conns) for conns in manager.active_connections.values()),
                "active_tasks": list(manager.active_connections.keys()),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await websocket.send_text(json.dumps(stats))
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Admin WebSocket error: {str(e)}")

__all__ = [
    "manager",
    "websocket_search",
    "websocket_admin",
]