from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user # 인증된 사용자만 접근 가능하도록

router = APIRouter(
    prefix="/achievements",
    tags=["achievements"],
)

# 업적 생성 (관리자만 가능)
@router.post("/", response_model=schemas.Achievement, status_code=status.HTTP_201_CREATED)
def create_achievement(
    achievement: schemas.AchievementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    새로운 업적을 생성합니다. (관리자만 가능)
    """
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create achievements")
    
    db_achievement = crud.get_achievement_by_code(db, code=achievement.code)
    if db_achievement:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Achievement code already exists")
    
    return crud.create_achievement(db=db, achievement=achievement)

# 모든 업적 조회
@router.get("/", response_model=List[schemas.Achievement])
def read_achievements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 인증된 사용자만 조회 가능
):
    """
    모든 업적 목록을 조회합니다.
    """
    achievements = crud.get_achievements(db, skip=skip, limit=limit)
    return achievements

# 특정 업적 조회
@router.get("/{achievement_id}", response_model=schemas.Achievement)
def read_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 인증된 사용자만 조회 가능
):
    """
    특정 업적 정보를 조회합니다.
    """
    db_achievement = crud.get_achievement(db, achievement_id=achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return db_achievement

# 업적 업데이트 (관리자만 가능)
@router.put("/{achievement_id}", response_model=schemas.Achievement)
def update_achievement(
    achievement_id: int,
    achievement: schemas.AchievementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    업적 정보를 업데이트합니다. (관리자만 가능)
    """
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update achievements")
    
    db_achievement = crud.get_achievement(db, achievement_id=achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    
    updated_achievement = crud.update_achievement(db=db, achievement_id=achievement_id, achievement=achievement)
    return updated_achievement

# 업적 삭제 (관리자만 가능)
@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    업적을 삭제합니다. (관리자만 가능)
    """
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete achievements")
    
    db_achievement = crud.get_achievement(db, achievement_id=achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    
    crud.delete_achievement(db=db, achievement_id=achievement_id)
    return {"message": "Achievement deleted successfully"}

# 사용자에게 업적 부여 (관리자만 가능 또는 특정 로직에 의해 호출)
@router.post("/{achievement_id}/grant/{user_id}", response_model=schemas.UserAchievement, status_code=status.HTTP_201_CREATED)
def grant_achievement_to_user(
    achievement_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    특정 사용자에게 업적을 부여합니다. (관리자만 가능)
    """
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to grant achievements")
    
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db_achievement = crud.get_achievement(db, achievement_id=achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    
    # 이미 부여된 업적인지 확인
    db_user_achievement = crud.get_user_achievement(db, user_id=user_id, achievement_id=achievement_id)
    if db_user_achievement:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has this achievement")
    
    user_achievement_in = schemas.UserAchievementCreate(user_id=user_id, achievement_id=achievement_id)
    return crud.create_user_achievement(db=db, user_achievement=user_achievement_in)

# 사용자별 획득 업적 조회
@router.get("/my_achievements", response_model=List[schemas.UserAchievement])
def get_my_achievements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    현재 로그인한 사용자가 획득한 업적 목록을 조회합니다.
    """
    user_achievements = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == current_user.user_id
    ).offset(skip).limit(limit).all()
    return user_achievements
