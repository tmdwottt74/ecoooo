from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user # 인증된 사용자만 접근 가능하도록

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)

# 알림 생성 (관리자 또는 내부 시스템에서 사용)
@router.post("/", response_model=schemas.Notification, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 관리자 권한 필요 또는 내부 로직에서만 사용
):
    """
    새로운 알림을 생성합니다. (관리자 또는 내부 시스템에서 사용)
    """
    # 여기서는 예시로 관리자만 생성 가능하도록 설정
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create notifications")
    
    db_notification = crud.create_notification(db, notification=notification)
    return db_notification

# 사용자별 알림 조회
@router.get("/my", response_model=List[schemas.Notification])
def get_my_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    현재 로그인한 사용자의 알림 목록을 조회합니다.
    """
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.user_id
    ).offset(skip).limit(limit).all()
    return notifications

# 알림 읽음 처리
@router.put("/{notification_id}/read", response_model=schemas.Notification)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    특정 알림을 읽음 처리합니다.
    """
    db_notification = crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    # 요청한 사용자가 해당 알림의 소유자인지 확인
    if db_notification.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this notification as read"
        )
    
    notification_update = schemas.NotificationUpdate(status="READ", read_at=datetime.now())
    updated_notification = crud.update_notification(db=db, notification_id=notification_id, notification=notification_update)
    return updated_notification

# 알림 삭제
@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    특정 알림을 삭제합니다.
    """
    db_notification = crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    # 요청한 사용자가 해당 알림의 소유자인지 확인
    if db_notification.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )
    
    crud.delete_notification(db=db, notification_id=notification_id)
    return {"message": "Notification deleted successfully"}
