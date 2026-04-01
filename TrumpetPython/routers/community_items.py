from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session
from database import get_session
from services.community_items_service import CommunityItemsService
from models.item import Item

router = APIRouter(prefix="/api/CommunityItems", tags=["CommunityItems"])

@router.get("/{community_id}", response_model=List[Item])
async def get_community_items(community_id: str, session: Session = Depends(get_session)):
    service = CommunityItemsService(session)
    return await service.get_items_by_community_id(community_id)
