"""
Script to add a test user to the database
"""
from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash
from datetime import datetime

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Create database session
db = SessionLocal()

try:
    # Check if test user already exists
    existing_user = db.query(User).filter(User.username == "test").first()
    
    if existing_user:
        print("Test user already exists!")
        print(f"Username: {existing_user.username}")
        print(f"Email: {existing_user.email}")
        print(f"Created at: {existing_user.created_at}")
    else:
        # Create test user
        hashed_password = get_password_hash("test123")
        test_user = User(
            email="test@example.com",
            username="test",
            hashed_password=hashed_password
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✓ Test user created successfully!")
        print(f"Username: {test_user.username}")
        print(f"Email: {test_user.email}")
        print(f"Password: test123")
        print(f"User ID: {test_user.id}")
        
finally:
    db.close()
