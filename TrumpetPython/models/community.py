from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Community(SQLModel, table=True):
    __tablename__ = "Communities"
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    Id: str = Field(default="", primary_key=True)
    Name: str = Field(default="")
    Handle: str = Field(default="")
    IntroductoryText: Optional[str] = Field(default=None)
    
    ParentCommunityId: Optional[str] = Field(default=None, foreign_key="Communities.Id")
    parent_community: Optional["Community"] = Relationship(
        back_populates="sub_communities", 
        sa_relationship_kwargs={"remote_side": "Community.Id"}
    )
    
    sub_communities: List["Community"] = Relationship(back_populates="parent_community")
    collections: List["Collection"] = Relationship(back_populates="parent_community")
