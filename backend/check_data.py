import sqlite3

conn = sqlite3.connect('ecooo.db')
cursor = conn.cursor()

print("=== 데이터베이스 확인 ===")
cursor.execute('SELECT COUNT(*) FROM users')
print('Users:', cursor.fetchone()[0])

cursor.execute('SELECT COUNT(*) FROM credits_ledger')
print('Credits:', cursor.fetchone()[0])

cursor.execute('SELECT COUNT(*) FROM user_gardens')
print('Gardens:', cursor.fetchone()[0])

cursor.execute('SELECT COUNT(*) FROM garden_levels')
print('Garden Levels:', cursor.fetchone()[0])

cursor.execute('SELECT COUNT(*) FROM mobility_logs')
print('Mobility Logs:', cursor.fetchone()[0])

print("\n=== 사용자 데이터 ===")
cursor.execute('SELECT * FROM users LIMIT 3')
users = cursor.fetchall()
for user in users:
    print(user)

print("\n=== 크레딧 데이터 ===")
cursor.execute('SELECT * FROM credits_ledger LIMIT 3')
credits = cursor.fetchall()
for credit in credits:
    print(credit)

conn.close()