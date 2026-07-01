import jwt
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserLogin, User as UserSchema
from app.utils.security import hash_password, verify_password
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)

router = APIRouter()

def create_access_token(user: User) -> str:
    """
    Creates a signed JWT access token for the user.
    """
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {
        "sub": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "exp": expire
    }
    encoded_jwt = jwt.encode(
        payload, 
        settings.SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

@router.post("/register")
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a new user in the system.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # Limit allowed registration roles for security
    allowed_roles = [UserRole.PUBLIC, UserRole.FARMER, UserRole.TRAVELLER, UserRole.RESEARCH]
    role = user_in.role
    if role not in allowed_roles:
        logger.warning(f"Registration attempted with restricted role '{role}'. Defaulting to PUBLIC.")
        role = UserRole.PUBLIC
        
    hashed_pwd = hash_password(user_in.password)
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=role,
        is_active=user_in.is_active
    )
    
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
        logger.info(f"Successfully registered user: {new_user.email} (Role: {new_user.role})")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to commit new user registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a database error."
        )
        
    # Serialize using User Schema
    user_data = UserSchema.model_validate(new_user)
    return standard_response(
        status="success",
        data=user_data,
        message="Registration successful"
    )

@router.post("/login")
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticates user credentials and returns a JWT access token.
    """
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
        
    token = create_access_token(user)
    refresh_token = f"mock_refresh_token_for_{user.role.value}"
    
    # Return matched payload format
    return standard_response(
        status="success",
        data={
            "access_token": token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        },
        message="Login successful"
    )
