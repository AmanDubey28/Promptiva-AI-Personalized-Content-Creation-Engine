import json
from database import engine, Base, SessionLocal
from models import User
from auth import get_password_hash, create_access_token

# Create tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Create test user
db = SessionLocal()

test_user = User(
    email="test@aman.com",
    username="test",
    hashed_password=get_password_hash("test")
)

db.add(test_user)
db.commit()
db.refresh(test_user)

# Create token
token = create_access_token({
    "user_id": test_user.id,
    "email": test_user.email,
    "username": test_user.username
})

print("✅ Test User Created!")
print(f"   Email: {test_user.email}")
print(f"   Username: {test_user.username}")
print(f"   Password: test")
print(f"\n✅ Test Token: {token[:50]}...")

db.close()
