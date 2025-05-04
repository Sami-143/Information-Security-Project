from odmantic import Model
from datetime import datetime
from typing import Optional

class Document(Model):
    filename: str
    file_hash: str
    signature: str
    public_key: str
    created_at: datetime = datetime.utcnow()