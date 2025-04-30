# utils/send_email.py

import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

class EmailSendError(Exception):
    """Custom exception for email sending failure."""
    pass

async def send_email(to: str, subject: str, body: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = os.getenv("EMAIL_USER")
    msg["To"] = to
    msg.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_KEY"))
            server.send_message(msg)
    except Exception as e:
        raise EmailSendError(f"Failed to send email to {to}: {e}")
