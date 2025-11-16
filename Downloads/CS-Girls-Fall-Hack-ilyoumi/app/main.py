import sys

# Compatibility check: FastAPI 0.95.x requires pydantic v1.x.
# If a user has pydantic v2 installed, importing FastAPI will raise
# an ImportError deep inside the package. Fail fast with a clear message.
try:
    import pydantic
    pv = tuple(int(x) for x in pydantic.__version__.split(".")[:1])
    if pv[0] >= 2:
        print("\nERROR: Incompatible pydantic version detected:", pydantic.__version__)
        print("FastAPI 0.95.x is incompatible with pydantic v2.\n")
        print("To fix, run in your activated venv:\n  pip install 'pydantic==1.10.24'\n")
        sys.exit(1)
except Exception:
    # If pydantic isn't available yet, let FastAPI import handle it later.
    pass

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
import httpx

from app.database import engine, get_db, Base
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, User as UserSchema, GoogleAuth
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_user_by_email,
    get_user_by_google_id,
    get_current_user
)
from app.config import get_settings

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hybrid Auth API")

# Add session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS - UPDATED FOR PORT 8080 (NEW FRONTEND PORT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",      # New frontend port
        "http://127.0.0.1:8080",
        "http://localhost:5173",      # Vite default (fallback)
        "http://127.0.0.1:5173",
        "http://localhost:5000",      # Alternative port (fallback)
        "http://127.0.0.1:5000",
        settings.FRONTEND_URL          # From .env file
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth Setup
config_data = {
    'GOOGLE_CLIENT_ID': settings.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': settings.GOOGLE_CLIENT_SECRET
}
starlette_config = Config(environ=config_data)
oauth = OAuth(starlette_config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# ============ TRADITIONAL AUTH ENDPOINTS ============

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        auth_provider="local",
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/auth/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=user_credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if user.auth_provider != "local":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account uses {user.auth_provider} login. Please use that method."
        )
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# ============ GOOGLE OAUTH ENDPOINTS ============

@app.get("/auth/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        google_id = user_info.get('sub')
        email = user_info.get('email')
        name = user_info.get('name')
        picture = user_info.get('picture')
        
        # Check if user exists by Google ID
        user = get_user_by_google_id(db, google_id=google_id)
        
        if not user:
            # Check if email exists (user might have registered with email/password)
            user = get_user_by_email(db, email=email)
            if user:
                # Link Google account to existing user
                user.google_id = google_id
                user.auth_provider = "google"
                user.avatar_url = picture
                user.is_verified = True
            else:
                # Create new user
                user = User(
                    email=email,
                    full_name=name,
                    google_id=google_id,
                    auth_provider="google",
                    avatar_url=picture,
                    is_verified=True
                )
                db.add(user)
        
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token - PORT 8080
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============ PROTECTED ENDPOINTS ============

@app.get("/auth/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/")
def root():
    return {"message": "Hybrid Auth API is running on port 8000! Frontend should be on port 8080."}