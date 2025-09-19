# MySQL 설정 및 변환 가이드

## 1. MySQL 서버 설치 및 설정

### Windows에서 MySQL 설치
1. MySQL Community Server 다운로드: https://dev.mysql.com/downloads/mysql/
2. MySQL Workbench 다운로드: https://dev.mysql.com/downloads/workbench/
3. 설치 후 MySQL 서버 시작

### MySQL 데이터베이스 생성
```sql
-- MySQL Workbench에서 실행
CREATE DATABASE ecooo_mysql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecooo_mysql;
```

## 2. Python MySQL 커넥터 설치
```bash
pip install mysql-connector-python
```

## 3. 변환 스크립트 실행
1. `convert_to_mysql.py`에서 MySQL 비밀번호 수정
2. 변환 실행:
```bash
python convert_to_mysql.py
```

## 4. MySQL Workbench에서 확인
- 연결: localhost:3306
- 데이터베이스: ecooo_mysql
- 모든 테이블과 데이터 확인 가능

## 5. 백엔드 설정 변경

### database.py 수정
```python
# SQLite → MySQL 변경
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL 연결 문자열
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:your_password@localhost:3306/ecooo_mysql"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### requirements.txt에 추가
```
mysql-connector-python==8.0.33
```

## 6. 기능적 차이점

### 장점 (MySQL)
- ✅ MySQL Workbench로 시각적 관리
- ✅ 더 나은 성능 (대용량 데이터)
- ✅ 강력한 인덱싱
- ✅ 복제 및 백업 기능
- ✅ 더 나은 동시성

### 주의사항
- ⚠️ 서버 설치 필요
- ⚠️ 메모리 사용량 증가
- ⚠️ 설정 복잡도 증가
- ⚠️ 포트 3306 열어야 함

## 7. 데이터 확인 쿼리 예시

```sql
-- 사용자별 크레딧 잔액
SELECT 
    u.username,
    COALESCE(SUM(cl.points), 0) as total_credits
FROM users u
LEFT JOIN credits_ledger cl ON u.user_id = cl.user_id
GROUP BY u.user_id, u.username;

-- 정원 진행상황
SELECT 
    u.username,
    gl.level_name,
    ug.waters_count,
    gl.required_waters
FROM users u
JOIN user_gardens ug ON u.user_id = ug.user_id
JOIN garden_levels gl ON ug.current_level_id = gl.level_id;

-- 최근 크레딧 거래 내역
SELECT 
    u.username,
    cl.type,
    cl.points,
    cl.reason,
    cl.created_at
FROM credits_ledger cl
JOIN users u ON cl.user_id = u.user_id
ORDER BY cl.created_at DESC
LIMIT 20;
```

