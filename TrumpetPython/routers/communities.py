from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlmodel import Session
from database import get_session
from services.communities_service import CommunitiesService
from models.community import Community

router = APIRouter(prefix="/api/communities", tags=["Communities"])

@router.get("", response_model=List[Community])
async def get_communities(path: Optional[str] = None, session: Session = Depends(get_session)):
    service = CommunitiesService(session)
    return await service.get_communities(path)

@router.get("/{id}", response_model=Community)
async def get_community(id: str, session: Session = Depends(get_session)):
    service = CommunitiesService(session)
    community = await service.get_community(id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community
