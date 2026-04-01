from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Community(SQLModel, table=True):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    id: str = Field(default="", primary_key=True)
    name: str = Field(default="")
    handle: str = Field(default="")
    introductory_text: Optional[str] = Field(default=None)
    
    parent_community_id: Optional[str] = Field(default=None, foreign_key="community.id")
    parent_community: Optional["Community"] = Relationship(
        back_populates="sub_communities", 
        sa_relationship_kwargs={"remote_side": "Community.id"}
    )
    
    sub_communities: List["Community"] = Relationship(back_populates="parent_community")
    collections: List["Collection"] = Relationship(back_populates="parent_community")
