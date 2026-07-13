import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Configurable mock inbox path
MOCK_INBOX_PATH = r"C:\Users\RADHIKADSHET\.gemini\antigravity-ide\brain\2e97dfe6-9092-4c41-ac0a-079c705f965c\scratch\sent_emails.log"

def send_mock_email(to_email: str, subject: str, body: str):
    """
    Simulates sending an email by logging it to a local sent_emails.log file
    for diagnostic evaluation and research compliance.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    email_content = (
        f"========================================================================\n"
        f"TIMESTAMP: {timestamp}\n"
        f"TO: {to_email}\n"
        f"SUBJECT: {subject}\n"
        f"------------------------------------------------------------------------\n"
        f"{body}\n"
        f"========================================================================\n\n"
    )
    
    logger.info(f"Dispatching MOCK EMAIL to '{to_email}' with subject '{subject}'...")
    
    try:
        # Ensure parent directories exist
        os.makedirs(os.path.dirname(MOCK_INBOX_PATH), exist_ok=True)
        
        # Append email content to log
        with open(MOCK_INBOX_PATH, "a", encoding="utf-8") as f:
            f.write(email_content)
            
        logger.info(f"Mock email successfully logged to '{MOCK_INBOX_PATH}'")
    except Exception as e:
        logger.error(f"Failed to log mock email to '{MOCK_INBOX_PATH}': {e}")
