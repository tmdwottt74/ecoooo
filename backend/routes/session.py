from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime

from ..database import get_db
from ..models import UserSessionState, User
from ..schemas import SessionStateCreate, SessionStateUpdate, SessionStateResponse

router = APIRouter(prefix="/api/session", tags=["session"])

@router.get("/{user_id}/{session_key}")
async def get_session_state(
    user_id: int,
    session_key: str,
    db: Session = Depends(get_db)
):
    """사용자의 특정 세션 상태 조회"""
    try:
        session_state = db.query(UserSessionState).filter(
            UserSessionState.user_id == user_id,
            UserSessionState.session_key == session_key
        ).first()
        
        if not session_state:
            return {"session_key": session_key, "data": None}
        
        return {
            "session_key": session_key,
            "data": session_state.session_data,
            "updated_at": session_state.updated_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"세션 상태 조회 실패: {str(e)}")

@router.post("/{user_id}/{session_key}")
async def save_session_state(
    user_id: int,
    session_key: str,
    session_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """사용자의 세션 상태 저장/업데이트"""
    try:
        # 기존 세션 상태 확인
        existing_state = db.query(UserSessionState).filter(
            UserSessionState.user_id == user_id,
            UserSessionState.session_key == session_key
        ).first()
        
        if existing_state:
            # 업데이트
            existing_state.session_data = session_data
            existing_state.updated_at = datetime.utcnow()
            db.commit()
            return {"message": "세션 상태가 업데이트되었습니다", "session_key": session_key}
        else:
            # 새로 생성
            new_state = UserSessionState(
                user_id=user_id,
                session_key=session_key,
                session_data=session_data
            )
            db.add(new_state)
            db.commit()
            return {"message": "세션 상태가 저장되었습니다", "session_key": session_key}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"세션 상태 저장 실패: {str(e)}")

@router.delete("/{user_id}/{session_key}")
async def delete_session_state(
    user_id: int,
    session_key: str,
    db: Session = Depends(get_db)
):
    """사용자의 특정 세션 상태 삭제"""
    try:
        session_state = db.query(UserSessionState).filter(
            UserSessionState.user_id == user_id,
            UserSessionState.session_key == session_key
        ).first()
        
        if not session_state:
            raise HTTPException(status_code=404, detail="세션 상태를 찾을 수 없습니다")
        
        db.delete(session_state)
        db.commit()
        return {"message": "세션 상태가 삭제되었습니다"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"세션 상태 삭제 실패: {str(e)}")

@router.get("/{user_id}")
async def get_all_session_states(
    user_id: int,
    db: Session = Depends(get_db)
):
    """사용자의 모든 세션 상태 조회"""
    try:
        session_states = db.query(UserSessionState).filter(
            UserSessionState.user_id == user_id
        ).all()
        
        result = {}
        for state in session_states:
            result[state.session_key] = {
                "data": state.session_data,
                "updated_at": state.updated_at
            }
        
        return {"user_id": user_id, "session_states": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"세션 상태 조회 실패: {str(e)}")

@router.delete("/{user_id}")
async def clear_all_session_states(
    user_id: int,
    db: Session = Depends(get_db)
):
    """사용자의 모든 세션 상태 삭제 (로그아웃 시 사용)"""
    try:
        db.query(UserSessionState).filter(
            UserSessionState.user_id == user_id
        ).delete()
        db.commit()
        return {"message": "모든 세션 상태가 삭제되었습니다"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"세션 상태 삭제 실패: {str(e)}")

