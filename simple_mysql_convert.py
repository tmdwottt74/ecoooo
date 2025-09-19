import sqlite3
import json

def export_sqlite_to_sql():
    """SQLite 데이터를 MySQL INSERT 문으로 내보내기"""
    
    sqlite_conn = sqlite3.connect('backend/ecooo.db')
    sqlite_cursor = sqlite_conn.cursor()
    
    # MySQL INSERT 문 생성
    mysql_scripts = []
    
    # 1. 사용자 데이터
    sqlite_cursor.execute("SELECT * FROM users")
    users = sqlite_cursor.fetchall()
    
    mysql_scripts.append("-- 사용자 데이터")
    mysql_scripts.append("INSERT INTO users (user_id, username, email, password_hash, user_group_id, role, created_at) VALUES")
    
    user_values = []
    for user in users:
        # users 테이블: (user_id, username, email, created_at)
        user_values.append(f"({user[0]}, '{user[1]}', '{user[2]}', NULL, NULL, 'USER', '{user[3]}')")
    
    mysql_scripts.append(",\n".join(user_values) + ";")
    mysql_scripts.append("")
    
    # 2. 정원 레벨 데이터
    sqlite_cursor.execute("SELECT * FROM garden_levels")
    levels = sqlite_cursor.fetchall()
    
    mysql_scripts.append("-- 정원 레벨 데이터")
    mysql_scripts.append("INSERT INTO garden_levels (level_id, level_number, level_name, image_path, required_waters, description) VALUES")
    
    level_values = []
    for level in levels:
        level_values.append(f"({level[0]}, {level[1]}, '{level[2]}', '{level[3]}', {level[4]}, '{level[5] or ''}')")
    
    mysql_scripts.append(",\n".join(level_values) + ";")
    mysql_scripts.append("")
    
    # 3. 크레딧 장부 데이터
    sqlite_cursor.execute("SELECT * FROM credits_ledger")
    credits = sqlite_cursor.fetchall()
    
    mysql_scripts.append("-- 크레딧 장부 데이터")
    mysql_scripts.append("INSERT INTO credits_ledger (entry_id, user_id, ref_log_id, type, points, reason, meta_json, created_at) VALUES")
    
    credit_values = []
    for credit in credits:
        meta_json = "NULL"
        if credit[6]:  # meta_json
            try:
                if isinstance(credit[6], str):
                    escaped_str = credit[6].replace("'", "\\'")
                    meta_json = f"'{escaped_str}'"
                else:
                    json_str = json.dumps(credit[6])
                    escaped_str = json_str.replace("'", "\\'")
                    meta_json = f"'{escaped_str}'"
            except:
                meta_json = "NULL"
        
        reason_escaped = credit[5].replace("'", "\\'")
        credit_values.append(f"({credit[0]}, {credit[1]}, {credit[2] or 'NULL'}, '{credit[3]}', {credit[4]}, '{reason_escaped}', {meta_json}, '{credit[7]}')")
    
    mysql_scripts.append(",\n".join(credit_values) + ";")
    mysql_scripts.append("")
    
    # 4. 모빌리티 로그 데이터
    sqlite_cursor.execute("SELECT * FROM mobility_logs")
    mobility = sqlite_cursor.fetchall()
    
    mysql_scripts.append("-- 모빌리티 로그 데이터")
    mysql_scripts.append("INSERT INTO mobility_logs (log_id, user_id, source_id, mode, distance_km, started_at, ended_at, raw_ref_id, co2_baseline_g, co2_actual_g, co2_saved_g, points_earned, description, start_point, end_point, used_at, created_at) VALUES")
    
    mobility_values = []
    for log in mobility:
        # mobility_logs: (log_id, user_id, source_id, mode, distance_km, started_at, ended_at, raw_ref_id, co2_baseline_g, co2_actual_g, co2_saved_g, points_earned, description, start_point, end_point, used_at, created_at)
        raw_ref = f"'{log[7]}'" if len(log) > 7 and log[7] else 'NULL'
        description = f"'{log[12]}'" if len(log) > 12 and log[12] else 'NULL'
        start_point = f"'{log[13]}'" if len(log) > 13 and log[13] else 'NULL'
        end_point = f"'{log[14]}'" if len(log) > 14 and log[14] else 'NULL'
        used_at = f"'{log[15]}'" if len(log) > 15 and log[15] else 'NULL'
        created_at = log[16] if len(log) > 16 else 'CURRENT_TIMESTAMP'
        
        mobility_values.append(f"({log[0]}, {log[1]}, {log[2] or 'NULL'}, '{log[3]}', {log[4]}, '{log[5]}', '{log[6]}', {raw_ref}, {log[8] or 'NULL'}, {log[9] or 'NULL'}, {log[10] or 'NULL'}, {log[11] or 0}, {description}, {start_point}, {end_point}, {used_at}, '{created_at}')")
    
    mysql_scripts.append(",\n".join(mobility_values) + ";")
    mysql_scripts.append("")
    
    # 5. 정원 데이터
    sqlite_cursor.execute("SELECT * FROM user_gardens")
    gardens = sqlite_cursor.fetchall()
    
    mysql_scripts.append("-- 정원 데이터")
    mysql_scripts.append("INSERT INTO user_gardens (garden_id, user_id, current_level_id, waters_count, total_waters, created_at, updated_at) VALUES")
    
    garden_values = []
    for garden in gardens:
        garden_values.append(f"({garden[0]}, {garden[1]}, {garden[2]}, {garden[3]}, {garden[4]}, '{garden[5]}', '{garden[6]}')")
    
    mysql_scripts.append(",\n".join(garden_values) + ";")
    
    # 파일로 저장
    with open('mysql_import.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(mysql_scripts))
    
    print("✅ MySQL import 파일 생성 완료: mysql_import.sql")
    print("📋 MySQL Workbench에서 이 파일을 실행하여 데이터를 가져올 수 있습니다.")
    
    sqlite_conn.close()

if __name__ == "__main__":
    export_sqlite_to_sql()
