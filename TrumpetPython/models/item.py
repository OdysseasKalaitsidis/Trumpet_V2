from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Item(SQLModel, table=True):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )
    
    id: str = Field(default="", primary_key=True)
    name: str = Field(default="")
    handle: str = Field(default="")
    last_modified: Optional[datetime] = Field(default=None)
    withdrawn: bool = Field(default=False)
    archived: bool = Field(default=False)
    
    collection_id: str = Field(default="", foreign_key="collection.id")
    collection: Optional["Collection"] = Relationship(back_populates="items")
    
    metadata: List["MetadataValue"] = Relationship(back_populates="item")
    bitstreams: List["Bitstream"] = Relationship(back_populates="item")
