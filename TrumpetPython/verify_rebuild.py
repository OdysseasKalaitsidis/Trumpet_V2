from typing import List
from pydantic import TypeAdapter
from models.item import Item
import json

def verify_rebuild():
    print("\n--- Verifying Pydantic Model Rebuild ---")
    try:
        # Create a TypeAdapter for List[Item] - this was the failing point in the trace
        adapter = TypeAdapter(List[Item])
        
        # Test validation with some mock data
        mock_data = [{
            "Id": "test-id",
            "Name": "Test Item",
            "Handle": "12345/678",
            "MetadataList": [
                {
                    "ItemId": "test-id",
                    "Field": "dc.title",
                    "Value": "Test Item Title",
                    "Language": "en"
                }
            ],
            "Bitstreams": []
        }]
        
        items = adapter.validate_python(mock_data)
        print(f"Success: Successfully validated Item list with {len(items)} items")
        print(f"Item 0 Name: {items[0].Name}")
        print(f"Metadata Count: {len(items[0].metadata_list)}")
        
        print("\n--- Verification Complete: Pydantic circular references resolved ---")
        
    except Exception as e:
        print(f"\nERROR: Pydantic rebuild failed or models are still not fully defined!")
        print(str(e))
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    verify_rebuild()
