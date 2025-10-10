from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RetrievalMethod(str, Enum):
    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"

class QueryRequest(BaseModel):
    question: str
    top_k: int = 3
    method: RetrievalMethod = RetrievalMethod.HYBRID

class Source(BaseModel):
    document_id: str
    file_path: Optional[str] = None
    title: Optional[str] = None
    text: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    metadata: Dict[str, Any] = {}
    
class ConversationRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    stream: bool = False

class ConversationResponse(BaseModel):
    answer: str
    session_id: str
    sources: List[Source] = []
    metadata: Dict[str, Any] = {}

class Message(BaseModel):
    role: str
    content: str
    sources: List[Source] = []
    timestamp: datetime = Field(default_factory=datetime.now)

class Session(BaseModel):
    id: str
    title: str
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class DocumentChunk(BaseModel):
    document_id: str
    chunk_id: str
    text: str
    metadata: Dict[str, Any] = {}
    embedding: Optional[List[float]] = None
