from sqlmodel import Session, select
from database import engine
from models.item import Item
from models.metadata_value import MetadataValue
import logging

# Setup basic logging to see SQL
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

def verify_models():
    print("\n--- Verifying Model-Database Alignment ---")
    with Session(engine) as session:
        try:
            # 1. Test Item query
            print("\n1. Testing Item query (select first item)...")
            item_stmt = select(Item).limit(1)
            item = session.exec(item_stmt).first()
            if item:
                print(f"Success: Found item with Id: {item.Id}, Name: {item.Name}")
            else:
                print("No items found in database (but query succeeded).")

            # 2. Test MetadataValue query
            print("\n2. Testing MetadataValue query (select first entry)...")
            meta_stmt = select(MetadataValue).limit(1)
            meta = session.exec(meta_stmt).first()
            if meta:
                print(f"Success: Found metadata with Field: {meta.Field}, Value: {meta.Value}")
            else:
                print("No metadata found in database (but query succeeded).")

            print("\n--- Verification Complete: Models are aligned with DB columns ---")
            
        except Exception as e:
            print(f"\nERROR: Model-Database mismatch detected!")
            print(str(e))
            exit(1)

if __name__ == "__main__":
    verify_models()
