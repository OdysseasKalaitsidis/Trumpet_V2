from .item import Item
from .collection import Collection
from .community import Community
from .metadata_value import MetadataValue
from .bitstream import Bitstream

# Rebuild models to resolve circular references in Pydantic v2 / SQLModel
Item.model_rebuild()
Collection.model_rebuild()
Community.model_rebuild()
MetadataValue.model_rebuild()
Bitstream.model_rebuild()
