#!/usr/bin/env python3
"""
데이터베이스 초기화 스크립트
스키마 생성 및 시드 데이터 삽입
"""

import sqlite3
import os
from pathlib import Path

def init_database():
    """데이터베이스 초기화"""
    db_path = Path(__file__).parent / "ecooo.db"
    
    # 기존 데이터베이스 파일이 있으면 삭제
    if db_path.exists():
        os.remove(db_path)
        print(f"기존 데이터베이스 파일 삭제: {db_path}")
    
    # 데이터베이스 연결
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 스키마 파일 읽기
        schema_path = Path(__file__).parent / "schema.sql"
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # 스키마 실행
        cursor.executescript(schema_sql)
        print("✅ 데이터베이스 스키마 생성 완료")
        
        # 시드 데이터 파일 읽기
        seed_path = Path(__file__).parent / "seed.sql"
        with open(seed_path, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        
        # 시드 데이터 실행
        cursor.executescript(seed_sql)
        print("✅ 시드 데이터 삽입 완료")
        
        # 커밋
        conn.commit()
        print(f"✅ 데이터베이스 초기화 완료: {db_path}")
        
        # 데이터 확인
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"📊 사용자 수: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM credits_ledger")
        credit_count = cursor.fetchone()[0]
        print(f"📊 크레딧 거래 수: {credit_count}")
        
        cursor.execute("SELECT COUNT(*) FROM garden_levels")
        garden_level_count = cursor.fetchone()[0]
        print(f"📊 정원 레벨 수: {garden_level_count}")
        
    except Exception as e:
        print(f"❌ 데이터베이스 초기화 실패: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    init_database()
