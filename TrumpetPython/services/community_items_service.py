from typing import List
from sqlmodel import Session, select, or_
from sqlalchemy.orm import selectinload
from models.item import Item
from models.community import Community
from models.collection import Collection

class CommunityItemsService:
    def __init__(self, session: Session):
        self.session = session

    async def get_items_by_community_id(self, community_id: str) -> List[Item]:
        # 1. Get all sub-community IDs recursively
        all_community_ids = {community_id}
        current_level_ids = [community_id]

        while current_level_ids:
            statement = select(Community.id).where(Community.parent_community_id.in_(current_level_ids))
            next_level_ids = self.session.exec(statement).all()
            
            # Find IDs we haven't seen yet to prevent infinite loops and stop when no more found
            new_ids = [nid for nid in next_level_ids if nid not in all_community_ids]
            if not new_ids:
                break
                
            all_community_ids.update(new_ids)
            current_level_ids = new_ids

        # 2. Find items from collections belonging to any of the found communities
        # We join Item -> Collection to check the parent_community_id
        statement = (
            select(Item)
            .join(Collection, Item.collection_id == Collection.id)
            .where(Collection.parent_community_id.in_(list(all_community_ids)))
            .options(
                selectinload(Item.metadata),
                selectinload(Item.bitstreams)
            )
            .order_by(Item.name)
        )
        
        results = self.session.exec(statement).all()
        return list(results)
