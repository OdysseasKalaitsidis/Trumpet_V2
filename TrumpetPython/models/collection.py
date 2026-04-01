from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Collection(SQLModel, table=True):
    __tablename__ = "Collections"
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    Id: str = Field(default="", primary_key=True)
    Name: str = Field(default="")
    Handle: str = Field(default="")
    IntroductoryText: Optional[str] = Field(default=None)
    
    ParentCommunityId: Optional[str] = Field(default=None, foreign_key="Communities.Id")
    parent_community: Optional["Community"] = Relationship(back_populates="collections")
    
    items: List["Item"] = Relationship(back_populates="collection")
