from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user # auth 라우터에서 정의한 get_current_user 임포트

router = APIRouter(
    prefix="/mobility_logs",
    tags=["mobility_logs"],
)

# 탄소 절감량 계산 헬퍼 함수
def calculate_co2_savings(db: Session, mode: str, distance_km: Decimal) -> dict:
    car_factor = db.query(models.CarbonFactor).filter(
        models.CarbonFactor.mode == "CAR",
        models.CarbonFactor.valid_from <= datetime.now(),
        models.CarbonFactor.valid_to >= datetime.now()
    ).first()
    actual_factor = db.query(models.CarbonFactor).filter(
        models.CarbonFactor.mode == mode,
        models.CarbonFactor.valid_from <= datetime.now(),
        models.CarbonFactor.valid_to >= datetime.now()
    ).first()

    if not car_factor or not actual_factor:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Carbon factors not found for calculation"
        )

    co2_baseline_g = car_factor.g_per_km * distance_km
    co2_actual_g = actual_factor.g_per_km * distance_km
    co2_saved_g = co2_baseline_g - co2_actual_g
    if co2_saved_g < 0: # 절감량이 음수면 0으로 처리
        co2_saved_g = Decimal("0.000")

    return {
        "co2_baseline_g": co2_baseline_g,
        "co2_actual_g": co2_actual_g,
        "co2_saved_g": co2_saved_g
    }

# 이동 기록 생성
@router.post("/", response_model=schemas.MobilityLog, status_code=status.HTTP_201_CREATED)
def create_mobility_log(
    mobility_log: schemas.MobilityLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 요청한 사용자의 ID와 MobilityLogCreate의 user_id가 일치하는지 확인
    if mobility_log.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create mobility log for this user"
        )

    # 탄소 절감량 계산
    co2_data = calculate_co2_savings(db, mobility_log.mode, mobility_log.distance_km)

    db_mobility_log = crud.create_mobility_log(
        db=db,
        mobility_log=schemas.MobilityLogCreate(
            **mobility_log.model_dump(exclude_unset=True),
            **co2_data
        )
    )

    # 탄소 절감량이 발생했을 경우 포인트 적립
    if db_mobility_log.co2_saved_g and db_mobility_log.co2_saved_g > 0:
        # 절감량 1g당 1포인트 (예시, 정책에 따라 변경 가능)
        points_to_earn = int(db_mobility_log.co2_saved_g) # 소수점 이하 버림
        
        credit_ledger_in = schemas.CreditLedgerCreate(
            user_id=current_user.user_id,
            ref_log_id=db_mobility_log.log_id,
            type="EARN",
            points=points_to_earn,
            reason="MOBILITY:SAVING"
        )
        crud.create_credit_ledger_entry(db, credit_ledger=credit_ledger_in)
        print(f"사용자 {current_user.username}에게 {points_to_earn} 포인트 적립됨.")

    return db_mobility_log

# 사용자별 이동 기록 조회
@router.get("/my", response_model=List[schemas.MobilityLog])
def read_my_mobility_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 현재 로그인한 사용자의 이동 기록만 조회
    mobility_logs = db.query(models.MobilityLog).filter(
        models.MobilityLog.user_id == current_user.user_id
    ).offset(skip).limit(limit).all()
    return mobility_logs

# 특정 이동 기록 조회
@router.get("/{log_id}", response_model=schemas.MobilityLog)
def read_mobility_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_mobility_log = crud.get_mobility_log(db, log_id=log_id)
    if db_mobility_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mobility log not found")
    
    # 요청한 사용자가 해당 이동 기록의 소유자인지 확인
    if db_mobility_log.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this mobility log"
        )
    return db_mobility_log

# 이동 기록 업데이트
@router.put("/{log_id}", response_model=schemas.MobilityLog)
def update_mobility_log(
    log_id: int,
    mobility_log: schemas.MobilityLogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_mobility_log = crud.get_mobility_log(db, log_id=log_id)
    if db_mobility_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mobility log not found")
    
    # 요청한 사용자가 해당 이동 기록의 소유자인지 확인
    if db_mobility_log.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this mobility log"
        )
    
    # 모드나 거리가 변경되면 탄소 절감량 재계산
    if mobility_log.mode or mobility_log.distance_km:
        new_mode = mobility_log.mode if mobility_log.mode else db_mobility_log.mode
        new_distance = mobility_log.distance_km if mobility_log.distance_km else db_mobility_log.distance_km
        co2_data = calculate_co2_savings(db, new_mode, new_distance)
        mobility_log_update_data = mobility_log.model_dump(exclude_unset=True)
        mobility_log_update_data.update(co2_data)
        updated_log = crud.update_mobility_log(db=db, log_id=log_id, mobility_log=schemas.MobilityLogUpdate(**mobility_log_update_data))
    else:
        updated_log = crud.update_mobility_log(db=db, log_id=log_id, mobility_log=mobility_log)
    
    return updated_log

# 이동 기록 삭제
@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mobility_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_mobility_log = crud.get_mobility_log(db, log_id=log_id)
    if db_mobility_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mobility log not found")
    
    # 요청한 사용자가 해당 이동 기록의 소유자인지 확인
    if db_mobility_log.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this mobility log"
        )
    
    crud.delete_mobility_log(db=db, log_id=log_id)
    return {"message": "Mobility log deleted successfully"}
