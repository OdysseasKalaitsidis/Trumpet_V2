from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Any, Dict
from sqlmodel import Session
from database import get_session
from services.collections_service import CollectionsService
from models.collection import Collection

router = APIRouter(prefix="/api/collections", tags=["Collections"])

@router.get("", response_model=List[Collection])
async def get_collections(session: Session = Depends(get_session)):
    service = CollectionsService(session)
    return await service.get_collections()

@router.get("/mappings", response_model=List[Dict[str, str]])
async def get_collection_mappings(session: Session = Depends(get_session)):
    service = CollectionsService(session)
    return await service.get_collection_mappings()

@router.get("/{id}", response_model=Collection)
async def get_collection(id: str, session: Session = Depends(get_session)):
    service = CollectionsService(session)
    collection = await service.get_collection(id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection
