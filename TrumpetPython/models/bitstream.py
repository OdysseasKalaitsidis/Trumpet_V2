from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, alias_generators

class Bitstream(SQLModel, table=True):
    __tablename__ = "Bitstreams"
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
    )

    Id: str = Field(default="", primary_key=True)
    ItemId: str = Field(default="", foreign_key="Items.Id")
    Name: str = Field(default="")
    MimeType: Optional[str] = Field(default=None)
    SizeBytes: int = Field(default=0)
    LocalFilePath: str = Field(default="")
    
    item: Optional["Item"] = Relationship(back_populates="bitstreams")
