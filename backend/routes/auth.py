from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/login")
def login_for_access_token(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # In a real application, you would create and return a JWT token here.
    # For simplicity, we'll just return the user_id.
    return {"user_id": user.user_id, "username": user.username, "role": user.role}

@router.post("/register", response_model=schemas.User)
def register_user(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    # In a real application, you would hash the password before storing.
    # For simplicity, we're storing it directly for now.
    db_user = crud.create_user(db=db, user=user_create)
    return db_user
