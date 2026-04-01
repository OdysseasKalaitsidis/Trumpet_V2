from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Bitstream(SQLModel, table=True):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    id: str = Field(default="", primary_key=True)
    item_id: str = Field(default="", foreign_key="item.id")
    name: str = Field(default="")
    mime_type: Optional[str] = Field(default=None)
    size_bytes: int = Field(default=0)
    local_file_path: str = Field(default="")
    
    item: Optional["Item"] = Relationship(back_populates="bitstreams")
