import os
from datetime import datetime, timedelta
from typing import Optional
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from database import settings

class StorageService:
    def __init__(self):
        self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.container_name = settings.AZURE_CONTAINER_NAME
        self.blob_service_client = None
        
        if self.connection_string:
            self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)

    def get_blob_url(self, blob_path: str) -> str:
        """
        Generates a direct URL or a signed SAS URL for the blob.
        If no connection string is provided, returns a placeholder.
        """
        if not self.blob_service_client:
            # Fallback for local development if storage is NOT configured
            return f"/media/{blob_path}"

        # Normalize path (remove leading slashes for blob names)
        blob_name = blob_path.lstrip("/")
        
        try:
            # Generate a SAS token valid for 1 hour
            sas_token = generate_blob_sas(
                account_name=self.blob_service_client.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.blob_service_client.credential.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=1)
            )
            
            return f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
        except Exception as e:
            # If SAS generation fails (e.g., missing credentials), return the direct public URL
            return f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}"

    def upload_file(self, local_path: str, blob_name: str):
        """
        Uploads a local file to the blob container.
        """
        if not self.blob_service_client:
            raise Exception("Azure Storage is not configured.")
            
        blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
        with open(local_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            
storage_service = StorageService()
