from typing import List, Optional
from sqlmodel import Session, select, func, and_
from sqlalchemy.orm import selectinload
from models.item import Item
from models.metadata_value import MetadataValue

class RecommendationService:
    def __init__(self, session: Session):
        self.session = session

    async def get_recommendations(self, item_id: str, max_results: int = 5) -> List[Item]:
        # 1. Get the tags of the source item
        source_tags_statement = select(MetadataValue.Value).where(
            and_(MetadataValue.ItemId == item_id, MetadataValue.Field == "trumpet.tag")
        )
        source_tags = self.session.exec(source_tags_statement).all()
        
        if not source_tags:
            return []

        # 2. Find other items that have these tags and count matches
        recommendations_statement = (
            select(MetadataValue.ItemId, func.count(MetadataValue.Id).label("match_count"))
            .where(
                and_(
                    MetadataValue.Field == "trumpet.tag",
                    MetadataValue.ItemId != item_id,
                    MetadataValue.Value.in_(source_tags)
                )
            )
            .group_by(MetadataValue.ItemId)
            .order_by(func.count(MetadataValue.Id).desc())
            .limit(max_results)
        )
        
        recommendations = self.session.exec(recommendations_statement).all()
        
        if not recommendations:
            return []

        recommended_item_ids = [r[0] for r in recommendations]
        match_counts = {r[0]: r[1] for r in recommendations}

        # 3. Fetch the actual Items
        items_statement = select(Item).where(
            Item.Id.in_(recommended_item_ids)
        ).options(
            selectinload(Item.metadata_entries),
            selectinload(Item.collection)
        )
        
        items = self.session.exec(items_statement).all()
        
        # Sort items based on match counts (since SQL IN doesn't preserve order)
        sorted_items = sorted(items, key=lambda i: match_counts.get(i.Id, 0), reverse=True)
        
        return list(sorted_items)
