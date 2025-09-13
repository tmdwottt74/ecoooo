
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True)
    password = Column(String(255))
    total_mileage = Column(Integer, default=0)
    total_co2_reduction = Column(Float, default=0.0)

    activities = relationship("Activity", back_populates="owner")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String(50))
    distance = Column(Float)
    co2_reduction = Column(Float)
    mileage_earned = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="activities")