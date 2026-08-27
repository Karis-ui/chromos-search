import pytest
from httpx import AsyncClient
import uuid

async def test_search_initiate(async_client: AsyncClient, auth_headers):
    import io
    from PIL import Image
    
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    files = {
        'media_file': ('test.jpg', img_bytes, 'image/jpeg')
    }
    
    response = await async_client.post(
        "/api/v1/search/initiate",
        files=files,
        headers=auth_headers,
        params={
            "time_range_days": 180,
            "min_confidence": 0.68
        }
    )
    
    assert response.status_code == 202
    data = response.json()
    assert "task_id" in data
    assert data["status"] == "queued"
    assert "websocket_url" in data

async def test_get_search_status(async_client: AsyncClient, auth_headers):
    import io
    from PIL import Image
    
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    files = {
        'media_file': ('test.jpg', img_bytes, 'image/jpeg')
    }
    
    init_response = await async_client.post(
        "/api/v1/search/initiate",
        files=files,
        headers=auth_headers
    )
    
    task_id = init_response.json()["task_id"]
    
    response = await async_client.get(
        f"/api/v1/search/status/{task_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] in ["queued", "processing", "completed"]

async def test_get_search_results(async_client: AsyncClient, auth_headers):
    task_id = str(uuid.uuid4())
    
    response = await async_client.get(
        f"/api/v1/search/results/{task_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 404

async def test_submit_feedback(async_client: AsyncClient, auth_headers):
    result_id = str(uuid.uuid4())
    
    response = await async_client.post(
        f"/api/v1/search/feedback/{result_id}",
        headers=auth_headers,
        json={
            "is_match": True,
            "rating": 5,
            "feedback_text": "Great match!",
        }
    )
    
    assert response.status_code == 404