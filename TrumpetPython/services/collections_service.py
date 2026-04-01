from typing import List, Optional, Any, Dict
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from models.collection import Collection

class CollectionsService:
    def __init__(self, session: Session):
        self.session = session

    async def get_collections(self) -> List[Collection]:
        statement = select(Collection)
        results = self.session.exec(statement).all()
        return list(results)

    async def get_collection(self, id: str) -> Optional[Collection]:
        statement = select(Collection).where(Collection.id == id).options(
            selectinload(Collection.items)
        )
        result = self.session.exec(statement).first()
        return result

    async def get_collection_mappings(self) -> List[Dict[str, str]]:
        statement = select(Collection.id, Collection.name)
        results = self.session.exec(statement).all()
        return [{"id": row[0], "name": row[1]} for row in results]
