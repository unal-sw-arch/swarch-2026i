from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=0, max_length=2000)
    clear_history: bool = False


class ChatResponse(BaseModel):
    response: str