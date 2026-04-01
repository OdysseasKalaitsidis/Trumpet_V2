import os
from sqlmodel import SQLModel, create_engine, Session
import models  # Force registration of all models
from sqlalchemy import create_engine as sa_create_engine
from typing import Generator, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///../data/database/trumpet.db"
    RESOURCES_PATH: str = "../resources"
    ALLOWED_ORIGINS: list[str] = ["*"]
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = None
    AZURE_CONTAINER_NAME: str = "media"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

# Azure environment fix: SQLModel needs slightly different handling for connect_args in SQLite
connect_args = {"check_same_thread": False}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)
