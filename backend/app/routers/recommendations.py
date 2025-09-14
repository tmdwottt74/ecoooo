from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..database import get_db
from ..services.recommendation_service import RecommendationService
from .auth import get_current_user # 인증된 사용자만 접근 가능하도록

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)

@router.get("/challenges", response_model=List[schemas.Challenge])
def get_recommended_challenges(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    현재 로그인한 사용자에게 맞춤형 챌린지를 추천합니다.
    """
    recommendation_service = RecommendationService(db)
    recommended_challenges = recommendation_service.recommend_challenges_for_user(current_user.user_id, limit)
    
    if not recommended_challenges:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No challenges recommended")
    
    return recommended_challenges
