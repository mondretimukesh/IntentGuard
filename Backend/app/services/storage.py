import os
import shutil
import logging
from typing import BinaryIO
from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        self.export_dir = os.path.abspath(settings.EXPORT_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.export_dir, exist_ok=True)

    def save_apk_file(self, filename: str, content: bytes) -> str:
        """Save uploaded APK binary content to disk / object storage."""
        safe_filename = os.path.basename(filename)
        dest_path = os.path.join(self.upload_dir, safe_filename)
        with open(dest_path, "wb") as f:
            f.write(content)
        logger.info("Saved APK file locally at: %s", dest_path)
        return dest_path

    def delete_apk_file(self, filepath: str) -> bool:
        """Purge temporary APK file if autoDeleteApks is active."""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info("Auto-deleted temporary APK payload: %s", filepath)
                return True
        except Exception as e:
            logger.warning("Failed to auto-delete APK %s: %s", filepath, e)
        return False

    def save_pdf_report(self, job_id: str, pdf_bytes: bytes) -> str:
        """Save generated PDF report to disk / object storage."""
        dest_path = os.path.join(self.export_dir, f"report_{job_id}.pdf")
        with open(dest_path, "wb") as f:
            f.write(pdf_bytes)
        return dest_path


storage_service = StorageService()
