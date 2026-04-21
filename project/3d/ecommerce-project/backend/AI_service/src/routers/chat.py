from fastapi import APIRouter, HTTPException
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.Ai_service import AiService

router = APIRouter(prefix="/chat", tags=["chat"])
ai_service = AiService()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Mensaje vacío")
    respuesta = ai_service.get_response(request.message)
    return ChatResponse(response=respuesta)