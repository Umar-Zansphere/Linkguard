from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_SAFE_BROWSING_API_KEY: str
    VIRUSTOTAL_API_KEY: str
    ABUSEIPDB_API_KEY: str
    URLSCAN_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()