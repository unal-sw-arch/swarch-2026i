from fastapi import APIRouter, Header, HTTPException

from ..core.security import get_user_id_from_token
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.Ai_service import AiService

router = APIRouter(prefix="/chat", tags=["chat"])
ai_service = AiService()


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    authorization: str | None = Header(default=None),
) -> ChatResponse:
    if not request.clear_history and not request.message.strip():
        raise HTTPException(status_code=400, detail="Mensaje vacio")

    user_id = get_user_id_from_token(authorization)

    respuesta = await ai_service.get_response(
        user_message=request.message,
        auth_token=authorization,
        user_id=user_id,
        clear_history=request.clear_history,
    )
    return ChatResponse(response=respuesta)
