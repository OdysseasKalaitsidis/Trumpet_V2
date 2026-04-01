from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Any, Dict
from sqlmodel import Session
from database import get_session
from services.items_service import ItemsService
from services.tagging_service import TaggingService
from services.recommendation_service import RecommendationService
from models.item import Item

router = APIRouter(prefix="/api/items", tags=["Items"])

@router.get("/fields", response_model=List[str])
async def get_fields(session: Session = Depends(get_session)):
    service = ItemsService(session)
    return await service.get_fields()

@router.get("/path-values", response_model=List[str])
async def get_path_values(session: Session = Depends(get_session)):
    service = ItemsService(session)
    return await service.get_path_values()

@router.get("/path-counts", response_model=List[Dict[str, Any]])
async def get_path_counts(session: Session = Depends(get_session)):
    service = ItemsService(session)
    return await service.get_path_counts()

@router.get("/search-all", response_model=List[Dict[str, Any]])
async def search_all_metadata(value: str, session: Session = Depends(get_session)):
    service = ItemsService(session)
    return await service.search_all_metadata(value)

@router.get("", response_model=List[Item])
async def get_items(
    path: Optional[str] = None,
    search: Optional[str] = None,
    communityId: Optional[str] = None,
    collectionId: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    session: Session = Depends(get_session)
):
    service = ItemsService(session)
    return await service.get_items(path, search, communityId, collectionId, page, pageSize)

@router.get("/{id}", response_model=Item)
async def get_item(id: str, session: Session = Depends(get_session)):
    service = ItemsService(session)
    item = await service.get_item(id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/{id}/tags/generate", response_model=List[str])
async def generate_tags(id: str, session: Session = Depends(get_session)):
    items_service = ItemsService(session)
    tagging_service = TaggingService(session)
    
    item = await items_service.get_item(id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return await tagging_service.generate_tags(item)

@router.post("/tags/generate-all")
async def generate_all_tags(session: Session = Depends(get_session)):
    tagging_service = TaggingService(session)
    count = await tagging_service.backfill_tags()
    return {"message": f"Tag generation completed for {count} items."}

@router.get("/{id}/recommendations", response_model=List[Item])
async def get_recommendations(id: str, session: Session = Depends(get_session)):
    service = RecommendationService(session)
    return await service.get_recommendations(id)
