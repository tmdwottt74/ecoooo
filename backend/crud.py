from sqlalchemy.orm import Session
from datetime import datetime, timezone
from sqlalchemy import func
from . import models, schemas
from .schemas import UserContext

# =========================
# UserGroup
# =========================
def create_user_group(db: Session, group: schemas.UserGroupCreate):
    db_group = models.UserGroup(
        group_name=group.group_name,
        group_type=group.group_type,
        region_code=group.region_code
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_user_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.UserGroup).offset(skip).limit(limit).all()


# =========================
# User
# =========================
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password_hash,
        role=user.role,
        user_group_id=user.user_group_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_with_group(db: Session, user_id: int) -> UserContext | None:
    result = (
        db.query(models.User.username, models.UserGroup.group_name, models.UserGroup.group_type)
        .join(models.UserGroup, models.User.user_group_id == models.UserGroup.group_id, isouter=True)
        .filter(models.User.id == user_id)
        .first()
    )
    if result:
        username, group_name, group_type = result
        return UserContext(username=username, group_name=group_name, group_type=group_type)
    return None