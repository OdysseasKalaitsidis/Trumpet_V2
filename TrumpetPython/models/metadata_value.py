from typing import Optional
from sqlmodel import SQLModel, Field as SqlField, Relationship
from pydantic import ConfigDict, alias_generators

class MetadataValue(SQLModel, table=True):
    __tablename__ = "MetadataValues"
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    Id: Optional[int] = SqlField(default=None, primary_key=True)
    ItemId: str = SqlField(default="", foreign_key="Items.Id")
    Field: str = SqlField(default="")
    Value: Optional[str] = SqlField(default=None)
    Language: Optional[str] = SqlField(default=None)
    
    item: Optional["Item"] = Relationship(back_populates="metadata_entries")
