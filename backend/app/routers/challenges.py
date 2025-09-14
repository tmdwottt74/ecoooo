from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user # 인증된 사용자만 접근 가능하도록

router = APIRouter(
    prefix="/challenges",
    tags=["challenges"],
)

# 챌린지 생성
@router.post("/", response_model=schemas.Challenge, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge: schemas.ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    새로운 챌린지를 생성합니다.
    """
    # 챌린지 생성자는 현재 로그인한 사용자
    challenge.created_by = current_user.user_id
    db_challenge = crud.create_challenge(db, challenge=challenge)
    return db_challenge

# 모든 챌린지 조회
@router.get("/", response_model=List[schemas.Challenge])
def read_challenges(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 인증된 사용자만 조회 가능
):
    """
    모든 챌린지 목록을 조회합니다.
    """
    challenges = crud.get_challenges(db, skip=skip, limit=limit)
    return challenges

# 특정 챌린지 조회
@router.get("/{challenge_id}", response_model=schemas.Challenge)
def read_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 인증된 사용자만 조회 가능
):
    """
    특정 챌린지 정보를 조회합니다.
    """
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    return db_challenge

# 챌린지 업데이트
@router.put("/{challenge_id}", response_model=schemas.Challenge)
def update_challenge(
    challenge_id: int,
    challenge: schemas.ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    챌린지 정보를 업데이트합니다. (챌린지 생성자 또는 관리자만 가능)
    """
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    
    # 챌린지 생성자 또는 관리자만 업데이트 가능
    if db_challenge.created_by != current_user.user_id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this challenge")
    
    updated_challenge = crud.update_challenge(db=db, challenge_id=challenge_id, challenge=challenge)
    return updated_challenge

# 챌린지 삭제
@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    챌린지를 삭제합니다. (챌린지 생성자 또는 관리자만 가능)
    """
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    
    # 챌린지 생성자 또는 관리자만 삭제 가능
    if db_challenge.created_by != current_user.user_id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this challenge")
    
    crud.delete_challenge(db=db, challenge_id=challenge_id)
    return {"message": "Challenge deleted successfully"}

# 챌린지 참여
@router.post("/{challenge_id}/join", response_model=schemas.ChallengeMember, status_code=status.HTTP_201_CREATED)
def join_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    사용자가 챌린지에 참여합니다.
    """
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    
    # 이미 참여 중인지 확인
    db_member = crud.get_challenge_member(db, challenge_id=challenge_id, user_id=current_user.user_id)
    if db_member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already joined this challenge")
    
    challenge_member_in = schemas.ChallengeMemberCreate(
        challenge_id=challenge_id,
        user_id=current_user.user_id
    )
    db_challenge_member = crud.create_challenge_member(db, challenge_member=challenge_member_in)
    return db_challenge_member

# 챌린지 탈퇴
@router.delete("/{challenge_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    사용자가 챌린지에서 탈퇴합니다.
    """
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    
    db_member = crud.get_challenge_member(db, challenge_id=challenge_id, user_id=current_user.user_id)
    if db_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this challenge")
    
    crud.delete_challenge_member(db, challenge_id=challenge_id, user_id=current_user.user_id)
    return {"message": "Successfully left the challenge"}

# 특정 챌린지의 참여 멤버 조회
@router.get("/{challenge_id}/members", response_model=List[schemas.ChallengeMember])
def get_challenge_members(
    challenge_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # 인증된 사용자만 조회 가능
):
    """
    특정 챌린지에 참여 중인 멤버 목록을 조회합니다.
    """
    # 챌린지 존재 여부 확인
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    members = db.query(models.ChallengeMember).filter(
        models.ChallengeMember.challenge_id == challenge_id
    ).offset(skip).limit(limit).all()
    return members
