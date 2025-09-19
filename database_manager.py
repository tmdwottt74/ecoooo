"""
Ecooo 데이터베이스 통합 관리 시스템
모든 데이터를 확인하고 관리할 수 있는 통합 도구
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class EcoooDatabaseManager:
    def __init__(self, db_path: str = "backend/ecooo.db"):
        self.db_path = db_path
        self.conn = None
        
    def connect(self):
        """데이터베이스 연결"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row  # 딕셔너리 형태로 결과 반환
            return True
        except Exception as e:
            print(f"데이터베이스 연결 오류: {e}")
            return False
    
    def disconnect(self):
        """데이터베이스 연결 해제"""
        if self.conn:
            self.conn.close()
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """쿼리 실행 및 결과 반환"""
        if not self.conn:
            self.connect()
        
        try:
            cursor = self.conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            print(f"쿼리 실행 오류: {e}")
            return []
    
    def get_all_tables(self) -> List[str]:
        """모든 테이블 목록 조회"""
        query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        result = self.execute_query(query)
        return [row['name'] for row in result]
    
    def get_table_info(self, table_name: str) -> List[Dict]:
        """테이블 구조 정보 조회"""
        query = f"PRAGMA table_info({table_name});"
        return self.execute_query(query)
    
    def get_table_data(self, table_name: str, limit: int = 100) -> List[Dict]:
        """테이블 데이터 조회"""
        query = f"SELECT * FROM {table_name} LIMIT {limit};"
        return self.execute_query(query)
    
    def get_user_summary(self) -> Dict[str, Any]:
        """사용자별 요약 정보"""
        query = """
        SELECT 
            u.user_id,
            u.username,
            u.email,
            COALESCE(SUM(cl.points), 0) as total_credits,
            COUNT(DISTINCT cl.entry_id) as transaction_count,
            ug.waters_count,
            ug.total_waters,
            gl.level_name,
            gl.level_number
        FROM users u
        LEFT JOIN credits_ledger cl ON u.user_id = cl.user_id
        LEFT JOIN user_gardens ug ON u.user_id = ug.user_id
        LEFT JOIN garden_levels gl ON ug.current_level_id = gl.level_id
        GROUP BY u.user_id, u.username, u.email, ug.waters_count, ug.total_waters, gl.level_name, gl.level_number
        ORDER BY u.user_id;
        """
        return self.execute_query(query)
    
    def get_credit_summary(self) -> Dict[str, Any]:
        """크레딧 시스템 요약"""
        query = """
        SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN type = 'EARN' THEN points ELSE 0 END) as total_earned,
            SUM(CASE WHEN type = 'SPEND' THEN ABS(points) ELSE 0 END) as total_spent,
            COUNT(DISTINCT user_id) as active_users,
            DATE(created_at) as date,
            COUNT(*) as daily_transactions
        FROM credits_ledger
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30;
        """
        return self.execute_query(query)
    
    def get_garden_progress(self) -> List[Dict]:
        """정원 진행상황 요약"""
        query = """
        SELECT 
            u.username,
            gl.level_name,
            gl.level_number,
            ug.waters_count,
            gl.required_waters,
            ROUND((ug.waters_count * 100.0 / gl.required_waters), 2) as progress_percent,
            ug.total_waters,
            ug.created_at,
            ug.updated_at
        FROM user_gardens ug
        JOIN users u ON ug.user_id = u.user_id
        JOIN garden_levels gl ON ug.current_level_id = gl.level_id
        ORDER BY ug.user_id;
        """
        return self.execute_query(query)
    
    def get_recent_activities(self, days: int = 7) -> List[Dict]:
        """최근 활동 내역"""
        query = """
        SELECT 
            u.username,
            cl.type,
            cl.points,
            cl.reason,
            cl.created_at,
            cl.meta_json
        FROM credits_ledger cl
        JOIN users u ON cl.user_id = u.user_id
        WHERE cl.created_at >= datetime('now', '-{} days')
        ORDER BY cl.created_at DESC
        LIMIT 50;
        """.format(days)
        return self.execute_query(query)
    
    def get_mobility_stats(self) -> List[Dict]:
        """모빌리티 통계"""
        query = """
        SELECT 
            u.username,
            ml.mode,
            COUNT(*) as trip_count,
            SUM(ml.distance_km) as total_distance,
            SUM(ml.co2_saved_g) as total_co2_saved,
            SUM(ml.points_earned) as total_points,
            AVG(ml.distance_km) as avg_distance
        FROM mobility_logs ml
        JOIN users u ON ml.user_id = u.user_id
        GROUP BY u.user_id, u.username, ml.mode
        ORDER BY u.user_id, total_distance DESC;
        """
        return self.execute_query(query)
    
    def get_achievements_summary(self) -> List[Dict]:
        """업적 요약"""
        query = """
        SELECT 
            u.username,
            a.title,
            a.description,
            ua.granted_at
        FROM user_achievements ua
        JOIN users u ON ua.user_id = u.user_id
        JOIN achievements a ON ua.achievement_id = a.achievement_id
        ORDER BY ua.granted_at DESC;
        """
        return self.execute_query(query)
    
    def export_all_data(self) -> Dict[str, Any]:
        """모든 데이터 내보내기"""
        tables = self.get_all_tables()
        export_data = {}
        
        for table in tables:
            if table != 'sqlite_sequence':  # 시스템 테이블 제외
                export_data[table] = self.get_table_data(table, limit=1000)
        
        return export_data
    
    def generate_report(self) -> str:
        """종합 리포트 생성"""
        report = []
        report.append("=" * 60)
        report.append("🌱 ECOOO 데이터베이스 종합 리포트")
        report.append("=" * 60)
        report.append(f"📅 생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # 1. 테이블 목록
        tables = self.get_all_tables()
        report.append("📊 데이터베이스 테이블 목록:")
        for table in tables:
            if table != 'sqlite_sequence':
                count_query = f"SELECT COUNT(*) as count FROM {table};"
                count_result = self.execute_query(count_query)
                count = count_result[0]['count'] if count_result else 0
                report.append(f"  - {table}: {count}개 레코드")
        report.append("")
        
        # 2. 사용자 요약
        users = self.get_user_summary()
        report.append("👥 사용자 요약:")
        for user in users:
            report.append(f"  - {user['username']} ({user['email']})")
            report.append(f"    크레딧: {user['total_credits']}C, 거래: {user['transaction_count']}회")
            report.append(f"    정원: {user['level_name']} (물주기 {user['waters_count']}/{user.get('required_waters', 10)})")
        report.append("")
        
        # 3. 크레딧 요약
        credit_summary = self.get_credit_summary()
        if credit_summary:
            total_earned = sum(row['total_earned'] for row in credit_summary)
            total_spent = sum(row['total_spent'] for row in credit_summary)
            report.append("💰 크레딧 시스템 요약:")
            report.append(f"  - 총 적립: {total_earned:,}C")
            report.append(f"  - 총 사용: {total_spent:,}C")
            report.append(f"  - 순 잔액: {total_earned - total_spent:,}C")
            report.append(f"  - 활성 사용자: {credit_summary[0]['active_users']}명")
        report.append("")
        
        # 4. 정원 진행상황
        gardens = self.get_garden_progress()
        report.append("🌿 정원 진행상황:")
        for garden in gardens:
            report.append(f"  - {garden['username']}: {garden['level_name']} ({garden['progress_percent']}%)")
        report.append("")
        
        # 5. 최근 활동
        recent = self.get_recent_activities(7)
        report.append("📈 최근 7일 활동:")
        for activity in recent[:10]:  # 최근 10개만
            report.append(f"  - {activity['username']}: {activity['reason']} ({activity['points']:+d}C)")
        report.append("")
        
        # 6. 모빌리티 통계
        mobility = self.get_mobility_stats()
        report.append("🚌 모빌리티 통계:")
        for stat in mobility:
            report.append(f"  - {stat['username']} ({stat['mode']}): {stat['trip_count']}회, {stat['total_distance']:.1f}km")
        report.append("")
        
        report.append("=" * 60)
        return "\n".join(report)
    
    def save_report_to_file(self, filename: str = None):
        """리포트를 파일로 저장"""
        if not filename:
            filename = f"ecooo_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        report = self.generate_report()
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"📄 리포트가 {filename}에 저장되었습니다.")
        return filename

def main():
    """메인 실행 함수"""
    db_manager = EcoooDatabaseManager()
    
    if not db_manager.connect():
        print("❌ 데이터베이스 연결 실패")
        return
    
    try:
        print("🔍 데이터베이스 연결 성공!")
        print()
        
        # 종합 리포트 생성 및 출력
        report = db_manager.generate_report()
        print(report)
        
        # 파일로 저장
        db_manager.save_report_to_file()
        
        # JSON 데이터 내보내기
        export_data = db_manager.export_all_data()
        export_filename = f"ecooo_data_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        print(f"📊 전체 데이터가 {export_filename}에 내보내기되었습니다.")
        
    finally:
        db_manager.disconnect()

if __name__ == "__main__":
    main()

