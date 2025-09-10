from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager

# --- Database Configuration (User needs to fill this in) ---
# 나중에 실제 MySQL 데이터베이스 정보를 이곳에 입력해주세요.
DB_CONFIG = {
    'host': 'localhost',
    'database': 'eco_chatbot_db',
    'user': 'your_username',
    'password': 'your_password'
}

@contextmanager
def get_db_connection():
    """Database connection context manager."""
    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        yield conn
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        if conn and conn.is_connected():
            conn.close()

def create_users_table():
    """Creates the users table if it does not exist."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(255) PRIMARY KEY,
                co2_saved_today FLOAT DEFAULT 0,
                eco_credits_earned INT DEFAULT 0,
                garden_level INT DEFAULT 1
            )
            """)
            conn.commit()
            print("Users table checked/created successfully.")
    except Error as e:
        print(f"Error creating table: {e}")

# --- Pydantic Models (Data Structures) ---

class ChatMessage(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response_message: str

class DashboardData(BaseModel):
    user_id: str
    co2_saved_today: float
    eco_credits_earned: int
    garden_level: int

class Activity(BaseModel):
    user_id: str
    activity_type: str # e.g., 'subway', 'bike'

# --- FastAPI App Initialization ---
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """On startup, check and create the database table."""
    create_users_table()

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Eco Chatbot API is running"}

@app.post("/chat", response_model=ChatResponse)
async def handle_chat(message: ChatMessage):
    response_text = f"'{message.message}' 라고 말씀하셨네요! 이 기능을 곧 구현할 예정입니다."
    return ChatResponse(response_message=response_text)

@app.get("/dashboard/{user_id}", response_model=DashboardData)
async def get_dashboard_data(user_id: str):
    """Retrieves dashboard data from the database."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            user_data = cursor.fetchone()
            if not user_data:
                # Create a new user with default values if not found
                cursor.execute("INSERT INTO users (user_id) VALUES (%s)", (user_id,))
                conn.commit()
                cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                user_data = cursor.fetchone()
            return DashboardData(**user_data)
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

@app.post("/activity", response_model=DashboardData)
async def log_activity(activity: Activity):
    """Logs a user activity and updates their stats."""
    # Simple logic for prototype
    credits_earned = 0
    co2_saved = 0.0

    if activity.activity_type == 'subway':
        credits_earned = 150
        co2_saved = 2.5
    elif activity.activity_type == 'bike':
        credits_earned = 80
        co2_saved = 0.8

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            # Use INSERT ... ON DUPLICATE KEY UPDATE to handle new and existing users
            query = """
            INSERT INTO users (user_id, co2_saved_today, eco_credits_earned)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
            co2_saved_today = co2_saved_today + VALUES(co2_saved_today),
            eco_credits_earned = eco_credits_earned + VALUES(eco_credits_earned)
            """
            cursor.execute(query, (activity.user_id, co2_saved, credits_earned))
            conn.commit()

            # Fetch the updated data to return
            cursor.execute("SELECT * FROM users WHERE user_id = %s", (activity.user_id,))
            updated_user_data = cursor.fetchone()
            return DashboardData(**updated_user_data)

    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database update error: {e}")

# To run this app:
# 1. Make sure you have a MySQL server running and a database named 'eco_chatbot_db'.
# 2. Update DB_CONFIG with your MySQL credentials.
# 3. Run the command in the 'backend' directory: uvicorn main:app --reload
