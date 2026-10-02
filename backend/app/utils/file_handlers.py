import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional

from app.core.config import settings
from app.core.logger import logger
from app.core.exceptions import FileException

async def save_uploaded_file(
    file_bytes: bytes,
    filename: str,
    subfolder: str = "uploads",
) -> str:
    try:
        if not file_bytes:
            raise FileException(message="Empty file")
        
        if len(file_bytes) > 50 * 1024 * 1024:
            raise FileException(message="File too large")
        
        ext = Path(filename).suffix.lower() if filename else ".jpg"
        if not ext:
            ext = ".jpg"
        
        unique_id = uuid.uuid4().hex[:16]
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        new_filename = f"{timestamp}_{unique_id}{ext}"
        
        upload_dir = Path(settings.UPLOAD_DIR or "uploads") / subfolder
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / new_filename
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        base_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')
        file_url = f"{base_url}/static/{subfolder}/{new_filename}"
        
        logger.info(f"💾 Saved file: {file_url}")
        return file_url
        
    except FileException:
        raise
    except Exception as e:
        logger.error(f"File save failed: {e}", exc_info=True)
        raise FileException(message=f"Failed to save file: {str(e)}")


async def delete_file(file_url: str) -> bool:
    try:
        if "/static/" in file_url:
            rel_path = file_url.split("/static/", 1)[1]
            file_path = Path(settings.STATIC_DIR or "static") / rel_path
            
            if file_path.exists():
                file_path.unlink()
                logger.info(f"🗑️ Deleted file: {file_path}")
                return True
        
        return False
    except Exception as e:
        logger.error(f"File delete failed: {e}")
        return False