# backend/routes/chat_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from ..models import ChatLog, User
from backend.bedrock_logic import invoke_llm  # ✅ Bedrock LLM 호출 함수
from datetime import datetime

router = APIRouter(prefix="/api/chat", tags=["chat"])

# 📌 1. 사용자 질문 → AI 답변
@router.post("/ask")
async def ask_chatbot(user_id: int, message: str, db: Session = Depends(get_db)):
    if not message.strip():
        raise HTTPException(status_code=400, detail="메시지를 입력하세요.")

    # AI 모델 호출 (Bedrock)
    system_prompt = "You are an eco-friendly assistant. Answer about carbon reduction and eco lifestyle."
    ai_response = invoke_llm(system_prompt, message)

    if not ai_response:
        raise HTTPException(status_code=500, detail="AI 응답을 생성할 수 없습니다.")

    # DB에 대화 로그 저장
    chat_log = ChatLog(
        user_id=user_id,
        user_message=message,
        bot_response=ai_response,
        created_at=datetime.utcnow()
    )
    db.add(chat_log)
    db.commit()
    db.refresh(chat_log)

    return {
        "user_message": message,
        "bot_response": ai_response,
        "created_at": chat_log.created_at
    }


# 📌 2. 특정 사용자 대화 기록 불러오기
@router.get("/history/{user_id}")
async def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(ChatLog).filter(ChatLog.user_id == user_id).order_by(ChatLog.created_at.desc()).all()

    return [
        {
            "id": log.id,
            "user_message": log.user_message,
            "bot_response": log.bot_response,
            "created_at": log.created_at
        }
        for log in logs
    ]
