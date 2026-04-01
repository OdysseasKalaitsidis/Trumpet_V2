from typing import List, Optional
from sqlmodel import Session, select, or_
from sqlalchemy.orm import selectinload
from models.community import Community

class CommunitiesService:
    def __init__(self, session: Session):
        self.session = session

    async def get_communities(self, path: Optional[str] = None) -> List[Community]:
        statement = select(Community).options(
            selectinload(Community.collections),
            selectinload(Community.sub_communities).selectinload(Community.collections)
        )

        if path:
            search_terms = []
            if path == "ArtMusic":
                search_terms = ["Art music", "Art", "μουσική του άστεως", "Μουσική του Άστεως"]
            elif path == "UrbanPopular":
                search_terms = ["Urban popular music", "Urban", "αστικολαϊκή μουσική", "Αστικολαϊκή μουσική"]
            elif path == "RuralMusic":
                search_terms = ["Rural music", "Rural", "μουσική της υπαίθρου", "Μουσική της υπαίθρου"]
            elif path == "SacredMusic":
                search_terms = ["Sacred music", "Sacred", "εκκλησιαστική μουσική", "Εκκλησιαστική μουσική"]
            
            if search_terms:
                statement = statement.where(
                    or_(*[Community.introductory_text.contains(term) for term in search_terms])
                )

        results = self.session.exec(statement).all()
        return list(results)

    async def get_community(self, community_id: str) -> Optional[Community]:
        statement = select(Community).where(Community.id == community_id).options(
            selectinload(Community.collections),
            selectinload(Community.sub_communities).selectinload(Community.collections)
        )
        result = self.session.exec(statement).first()
        return result
