from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from .. import crud, schemas, models
from ..database import get_db
from ..services.chatbot_service import ChatbotService
from .auth import get_current_user # 인증된 사용자만 접근 가능하도록

router = APIRouter(
    prefix="/chatbot",
    tags=["chatbot"],
)

@router.post("/ask", response_model=Dict[str, str])
async def ask_chatbot(
    user_query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    AI 챗봇에게 질문하고 답변을 받습니다.
    사용자의 이동 기록, 절감량 등의 정보를 챗봇 컨텍스트로 전달할 수 있습니다.
    """
    chatbot_service = ChatbotService()

    # 사용자 컨텍스트 정보 (예시: 사용자의 최근 이동 기록, 총 절감량 등)
    # 실제 구현에서는 더 다양한 사용자 데이터를 가져와 컨텍스트로 활용할 수 있습니다.
    user_context = {
        "username": current_user.username,
        "user_id": current_user.user_id,
        # 여기에 사용자의 이동 기록 요약, 총 절감량, 참여 챌린지 정보 등을 추가
        # 예:
        # "total_saved_co2_g": crud.get_total_saved_co2_g_for_user(db, current_user.user_id),
        # "recent_mobility_logs": crud.get_recent_mobility_logs_for_user(db, current_user.user_id, limit=3)
    }

    response = chatbot_service.get_chatbot_response(user_query, user_context)
    return {"response": response}
