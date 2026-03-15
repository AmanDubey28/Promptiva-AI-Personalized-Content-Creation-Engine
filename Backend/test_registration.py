from api.auth_routes import UserRegisterRequest
from database import engine, Base, SessionLocal
from models import User, Generation
from auth import get_password_hash, create_access_token

# Create tables
Base.metadata.create_all(bind=engine)

# Test validation
try:
    req = UserRegisterRequest(
        email="test@example.com",
        username="testuser",
        password="password123",
        password_confirm="password123"
    )
    print("✓ Validation passed")
    print(f"Email: {req.email}")
    print(f"Username: {req.username}")
    
    # Test password hashing
    hashed = get_password_hash(req.password)
    print(f"✓ Password hashed: {hashed[:20]}...")
    
    # Test token creation
    token = create_access_token({"user_id": 1, "email": "test@example.com", "username": "testuser"})
    print(f"✓ Token created: {token[:20]}...")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
