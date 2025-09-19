from datetime import datetime
from sqlalchemy.orm import Session
import hashlib

from . import models, schemas, crud

def _hash_plain(pw: str) -> str:
    # 외부 라이브러리 없이 간단 해시(예시). 실제 운영에선 bcrypt/argon2 사용 권장.
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def seed_admin_user(db: Session):
    """
    관리자 계정이 없으면 생성, 있으면 그대로 반환.
    - 테이블 생성은 init_db()에서 처리하므로 여기선 create_all 금지
    """
    admin_username = "admin"
    admin_email = "admin@admin"
    default_password = "12345678"

    # 이미 존재하면 패스
    existing = (
        db.query(models.User)
        .filter((models.User.username == admin_username) | (models.User.email == admin_email))
        .first()
    )
    if existing:
        print("⚠️ Admin user already exists, skipping seed.")
        return existing

    # role 값 준비 (Enum 또는 문자열 둘 다 대응)
    role_value = getattr(models, "UserRole", None)
    role_admin = role_value.ADMIN if role_value else "ADMIN"

    # 1) CRUD 경로 우선(프로젝트 규약 준수)
    try:
        # UserCreate 스키마가 password 필드를 기대하는 경우
        admin_payload = None
        if hasattr(schemas, "UserCreate"):
            # 가능한 필드 이름 케이스를 최대한 맞춰줌
            try:
                admin_payload = schemas.UserCreate(
                    username=admin_username,
                    email=admin_email,
                    password=default_password,     # 보통 UserCreate는 plain password를 받음
                    role=role_admin,
                    user_group_id=None,
                )
            except TypeError:
                # 만약 스키마가 password_hash만 받는 구조라면:
                admin_payload = schemas.UserCreate(
                    username=admin_username,
                    email=admin_email,
                    password_hash=_hash_plain(default_password),
                    role=role_admin,
                    user_group_id=None,
                )

        if admin_payload is not None and hasattr(crud, "create_user"):
            created = crud.create_user(db=db, user=admin_payload)
            print("✅ Admin user created via CRUD.")
            return created
    except Exception as e:
        # CRUD 경로 실패 시 아래 직접 생성으로 폴백
        print(f"ℹ️ CRUD create_user fallback: {e}")

    # 2) 직접 생성(폴백)
    new_admin = models.User(
        username=admin_username,
        email=admin_email,
        password_hash=_hash_plain(default_password),
        role=role_admin,
        created_at=datetime.utcnow(),
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    print("✅ Admin user created (direct).")
    return new_admin


