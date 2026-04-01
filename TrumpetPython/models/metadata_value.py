from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class MetadataValue(SQLModel, table=True):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: str = Field(default="", foreign_key="item.id")
    field: str = Field(default="")
    value: Optional[str] = Field(default=None)
    language: Optional[str] = Field(default=None)
    
    item: Optional["Item"] = Relationship(back_populates="metadata")
