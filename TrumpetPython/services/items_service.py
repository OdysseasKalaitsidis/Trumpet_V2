from typing import List, Optional, Any, Dict
from sqlmodel import Session, select, func, or_, and_
from sqlalchemy.orm import selectinload
from models.item import Item
from models.metadata_value import MetadataValue
from models.collection import Collection

class ItemsService:
    def __init__(self, session: Session):
        self.session = session

    async def get_fields(self) -> List[str]:
        statement = select(MetadataValue.field).distinct()
        results = self.session.exec(statement).all()
        return list(results)

    async def get_path_values(self) -> List[Optional[str]]:
        statement = select(MetadataValue.value).where(
            and_(MetadataValue.field == "dc.musicsubpath", MetadataValue.language == "en")
        ).distinct()
        results = self.session.exec(statement).all()
        return list(results)

    async def get_path_counts(self) -> List[Dict[str, Any]]:
        statement = (
            select(MetadataValue.value, func.count(MetadataValue.id))
            .where(and_(MetadataValue.field == "dc.musicsubpath", MetadataValue.language == "en"))
            .group_by(MetadataValue.value)
        )
        results = self.session.exec(statement).all()
        return [{"value": row[0], "count": row[1]} for row in results]

    async def search_all_metadata(self, value: str) -> List[Dict[str, Any]]:
        statement = (
            select(MetadataValue.field, func.count(MetadataValue.id))
            .where(MetadataValue.value.contains(value))
            .group_by(MetadataValue.field)
        )
        results = self.session.exec(statement).all()
        return [{"field": row[0], "count": row[1]} for row in results]

    async def get_items(
        self, 
        path: Optional[str] = None, 
        search: Optional[str] = None, 
        community_id: Optional[str] = None, 
        collection_id: Optional[str] = None, 
        page: int = 1, 
        page_size: int = 10
    ) -> List[Item]:
        # Using selectinload to eagerly load metadata and bitstreams (similar to .Include in EF Core)
        statement = select(Item).options(
            selectinload(Item.metadata),
            selectinload(Item.bitstreams)
        )

        if path:
            search_values = []
            if path == "ArtMusic":
                search_values = ["Art music", "Μουσική του άστεως", "Μουσική του Άστεως", "Art"]
            elif path == "UrbanPopular":
                search_values = ["Urban popular music", "Αστικολαϊκή μουσική", "Urban"]
            elif path == "RuralMusic":
                search_values = ["Rural music", "Μουσική της υπαίθρου", "Rural"]
            elif path == "SacredMusic":
                search_values = ["Sacred music", "Εκκλησιαστική μουσική", "Sacred"]
            
            if search_values:
                # Filter items that have metadata with matching values
                sub_query = select(MetadataValue.item_id).where(
                    and_(
                        MetadataValue.field == "dc.musicsubpath",
                        or_(*[MetadataValue.value.contains(sv) for sv in search_values])
                    )
                )
                statement = statement.where(Item.id.in_(sub_query))

        if community_id:
            # Filter by community (via collection)
            coll_sub_query = select(Collection.id).where(Collection.parent_community_id == community_id)
            statement = statement.where(Item.collection_id.in_(coll_sub_query))

        if collection_id:
            statement = statement.where(Item.collection_id == collection_id)

        if search:
            # Search in Name or any Metadata value
            meta_sub_query = select(MetadataValue.item_id).where(MetadataValue.value.contains(search))
            statement = statement.where(
                or_(
                    Item.name.contains(search),
                    Item.id.in_(meta_sub_query)
                )
            )

        # Pagination
        statement = statement.order_by(Item.name).offset((page - 1) * page_size).limit(page_size)
        
        results = self.session.exec(statement).all()
        return list(results)

    async def get_item(self, id: str) -> Optional[Item]:
        statement = select(Item).where(Item.id == id).options(
            selectinload(Item.metadata),
            selectinload(Item.bitstreams)
        )
        result = self.session.exec(statement).first()
        return result
