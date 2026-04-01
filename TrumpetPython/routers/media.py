from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from services.storage_service import storage_service
import os

router = APIRouter(prefix="/media", tags=["Media"])

@router.get("/{path:path}")
async def get_media(path: str):
    """
    Redirects legacy local file requests to Azure Blob Storage.
    The 'path' should match the blob name in the container.
    """
    # 1. Resolve the path to a Blob URL (Signed SAS URL)
    blob_url = storage_service.get_blob_url(path)
    
    # 2. Return a redirect (307 is better for temporary resources)
    return RedirectResponse(url=blob_url)
