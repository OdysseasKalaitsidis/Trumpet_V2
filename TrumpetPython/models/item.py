from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators, computed_field

class Item(SQLModel, table=True):
    __tablename__ = "Items"
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )
    
    Id: str = Field(default="", primary_key=True)
    Name: str = Field(default="")
    Handle: str = Field(default="")
    LastModified: Optional[datetime] = Field(default=None)
    Withdrawn: bool = Field(default=False)
    Archived: bool = Field(default=False)
    
    CollectionId: str = Field(default="", foreign_key="Collections.Id")
    collection: Optional["Collection"] = Relationship(back_populates="items")
    
    # Internal relationship renamed to avoid SQLAlchemy conflict
    # We exclude it from JSON serialization to use the computed property instead
    metadata_entries: List["MetadataValue"] = Relationship(
        back_populates="item", 
        sa_relationship_kwargs={"lazy": "selectin"}
    )
    
    bitstreams: List["Bitstream"] = Relationship(back_populates="item")

    @computed_field(alias="metadata")
    @property
    def metadata_list(self) -> List["MetadataValue"]:
        return self.metadata_entries
