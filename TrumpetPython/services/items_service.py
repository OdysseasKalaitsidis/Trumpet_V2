from typing import List, Optional, Any, Dict
from sqlmodel import Session, select, func, or_, and_
from sqlalchemy.orm import selectinload
from starlette.concurrency import run_in_threadpool
from functools import lru_cache
from models.item import Item
from models.metadata_value import MetadataValue
from models.collection import Collection

class ItemsService:
    _cache = {}

    def __init__(self, session: Session):
        self.session = session

    async def get_fields(self) -> List[str]:
        if "fields" in self._cache:
            return self._cache["fields"]
        statement = select(MetadataValue.Field).distinct()
        results = await run_in_threadpool(lambda: self.session.exec(statement).all())
        self._cache["fields"] = list(results)
        return self._cache["fields"]

    async def get_path_values(self) -> List[Optional[str]]:
        statement = select(MetadataValue.Value).where(
            and_(MetadataValue.Field == "dc.musicsubpath", MetadataValue.Language == "en")
        ).distinct()
        results = await run_in_threadpool(lambda: self.session.exec(statement).all())
        return list(results)

    async def get_path_counts(self) -> List[Dict[str, Any]]:
        if "path_counts" in self._cache:
            return self._cache["path_counts"]
        statement = (
            select(MetadataValue.Value, func.count(MetadataValue.Id))
            .where(and_(MetadataValue.Field == "dc.musicsubpath", MetadataValue.Language == "en"))
            .group_by(MetadataValue.Value)
        )
        results = await run_in_threadpool(lambda: self.session.exec(statement).all())
        self._cache["path_counts"] = [{"value": row[0], "count": row[1]} for row in results]
        return self._cache["path_counts"]

    async def search_all_metadata(self, value: str) -> List[Dict[str, Any]]:
        statement = (
            select(MetadataValue.Field, func.count(MetadataValue.Id))
            .where(MetadataValue.Value.contains(value))
            .group_by(MetadataValue.Field)
        )
        results = await run_in_threadpool(lambda: self.session.exec(statement).all())
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
            selectinload(Item.metadata_entries),
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
                sub_query = select(MetadataValue.ItemId).where(
                    and_(
                        MetadataValue.Field == "dc.musicsubpath",
                        or_(*[MetadataValue.Value.contains(sv) for sv in search_values])
                    )
                )
                statement = statement.where(Item.Id.in_(sub_query))

        if community_id:
            # Filter by community (via collection)
            coll_sub_query = select(Collection.Id).where(Collection.ParentCommunityId == community_id)
            statement = statement.where(Item.CollectionId.in_(coll_sub_query))

        if collection_id:
            statement = statement.where(Item.CollectionId == collection_id)

        if search:
            # Search in Name or any Metadata value
            meta_sub_query = select(MetadataValue.ItemId).where(MetadataValue.Value.contains(search))
            statement = statement.where(
                or_(
                    Item.Name.contains(search),
                    Item.Id.in_(meta_sub_query)
                )
            )

        # Pagination
        statement = statement.order_by(Item.Name).offset((page - 1) * page_size).limit(page_size)
        
        results = await run_in_threadpool(lambda: self.session.exec(statement).all())
        return list(results)

    async def get_item(self, id: str) -> Optional[Item]:
        statement = select(Item).where(Item.Id == id).options(
            selectinload(Item.metadata_entries),
            selectinload(Item.bitstreams)
        )
        result = await run_in_threadpool(lambda: self.session.exec(statement).first())
        return result
