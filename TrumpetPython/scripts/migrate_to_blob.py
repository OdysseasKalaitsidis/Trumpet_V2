import os
import sys
import argparse
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Add the parent directory to sys.path to allow importing from database/services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import settings

def migrate_to_blob(resources_path, connection_string, container_name):
    """
    Recursively uploads all files from resources_path to Azure Blob Storage.
    """
    if not connection_string:
        print("[ERROR] Azure Storage Connection String is missing. Check your .env file.")
        return

    print(f"[*] Starting migration from: {resources_path}")
    print(f"[*] Target Container: {container_name}")
    
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(container_name)
    
    # Create container if it doesn't exist
    try:
        container_client.create_container()
        print(f"[+] Created container: {container_name}")
    except Exception:
        print(f"[*] Container {container_name} already exists.")

    count = 0
    errors = 0

    for root, dirs, files in os.walk(resources_path):
        for file in files:
            local_file_path = os.path.join(root, file)
            # Calculate the relative path to use as the blob name
            blob_name = os.path.relpath(local_file_path, resources_path).replace("\\", "/")
            
            # Skip hidden files or system files
            if blob_name.startswith(".") or "item_expanded.json" in blob_name:
                continue

            try:
                print(f"    - Uploading: {blob_name}...", end="", flush=True)
                blob_client = container_client.get_blob_client(blob_name)
                with open(local_file_path, "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                print(" OK")
                count += 1
            except Exception as e:
                print(f" FAILED: {str(e)}")
                errors += 1

    print("-" * 30)
    print(f"[*] Migration completed.")
    print(f"[*] Total Files Uploaded: {count}")
    print(f"[*] Errors: {errors}")

if __name__ == "__main__":
    # Allow overriding via command line or just use settings
    parser = argparse.ArgumentParser(description="Migrate local resources to Azure Blob Storage")
    parser.add_argument("--path", help="Local resources path", default=settings.RESOURCES_PATH)
    parser.add_argument("--connection", help="Azure Connection String", default=settings.AZURE_STORAGE_CONNECTION_STRING)
    parser.add_argument("--container", help="Azure Container Name", default=settings.AZURE_CONTAINER_NAME)
    
    args = parser.parse_args()
    
    # Ensure current directory is root of project for relative path resolution
    load_dotenv()
    
    migrate_to_blob(args.path, args.connection, args.container)
