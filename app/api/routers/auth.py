import jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4, uuid5, NAMESPACE_DNS
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings, get_supabase_client

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Access Control"])

SECRET_KEY = "healthguard-secret-key-change-in-production-longitudinal-record"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ==========================================
# Pydantic Schemas for Auth
# ==========================================

class LoginRequest(BaseModel):
    email: str = Field(..., example="dr.eleanor@healthguard.ai")
    password: str = Field(..., example="password123")
    role: Optional[str] = Field("clinician", example="clinician")


class RegisterRequest(BaseModel):
    email: str = Field(..., example="dr.smith@healthguard.ai")
    password: str = Field(..., min_length=6, example="password123")
    full_name: str = Field(..., example="Dr. Smith")
    role: str = Field("clinician", example="clinician")
    specialty: Optional[str] = Field("General Medicine", example="Nephrology")
    license_number: Optional[str] = Field(None, example="MD-987654")


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    specialty: Optional[str] = None
    avatar: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# Demo Users Registry
DEMO_USERS = {
    "dr.eleanor@healthguard.ai": {
        "id": "u-101",
        "email": "dr.eleanor@healthguard.ai",
        "password": "password123",
        "full_name": "Dr. Eleanor Vance",
        "role": "clinician",
        "specialty": "Chief Nephrologist & Chronic Care Lead",
        "avatar": "EV"
    },
    "dr.marcus@healthguard.ai": {
        "id": "u-102",
        "email": "dr.marcus@healthguard.ai",
        "password": "password123",
        "full_name": "Dr. Marcus Thorne",
        "role": "clinician",
        "specialty": "Cardiologist",
        "avatar": "MT"
    },
    "admin@healthguard.ai": {
        "id": "u-100",
        "email": "admin@healthguard.ai",
        "password": "admin123",
        "full_name": "HealthGuard Administrator",
        "role": "admin",
        "specialty": "System Administrator",
        "avatar": "HA"
    },
    "patient@healthguard.ai": {
        "id": "a2d6ce81-f878-42d0-9704-fcbccb0a303d",
        "email": "patient@healthguard.ai",
        "password": "password123",
        "full_name": "Aarav Mehta",
        "role": "patient",
        "specialty": "Patient Portal",
        "avatar": "AM"
    }
}


def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/login", response_model=TokenResponse, summary="Authenticate User & Get Token")
def login(req: LoginRequest):
    """
    Authenticates clinician, doctor, admin, or patient credentials.
    Supports Supabase Auth integration with local fallback for demo credentials.
    """
    email_clean = req.email.strip().lower()
    supabase = get_supabase_client()

    # 1. Attempt Supabase Auth Sign In if configured
    if supabase:
        try:
            res = supabase.auth.sign_in_with_password({"email": email_clean, "password": req.password})
            if res and res.user:
                token = res.session.access_token if res.session else create_jwt_token({"sub": res.user.id, "email": res.user.email})
                user_info = UserResponse(
                    id=str(res.user.id),
                    email=res.user.email,
                    full_name=res.user.user_metadata.get("full_name", email_clean.split("@")[0].title()),
                    role=res.user.user_metadata.get("role", req.role or "clinician"),
                    specialty=res.user.user_metadata.get("specialty", "Clinical Specialist"),
                    avatar=res.user.email[:2].upper()
                )
                return TokenResponse(
                    access_token=token,
                    expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                    user=user_info
                )
        except Exception as e:
            print(f"[AUTH] Supabase Auth sign-in bypassed: {e}")

    # 2. Check Demo Credentials or Registered user lookup
    user_record = DEMO_USERS.get(email_clean)
    if user_record:
        token = create_jwt_token({"sub": user_record["id"], "email": email_clean, "role": req.role or user_record["role"]})
        user_info = UserResponse(
            id=user_record["id"],
            email=user_record["email"],
            full_name=user_record["full_name"],
            role=req.role or user_record["role"],
            specialty=user_record.get("specialty", "Patient Portal"),
            avatar=user_record.get("avatar") or "".join([p[0] for p in user_record["full_name"].split()[:2]]).upper()
        )
        return TokenResponse(
            access_token=token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info
        )

    # 3. Dynamic generic login for any valid email format during testing
    if len(req.password) >= 4 and "@" in email_clean:
        raw_name = email_clean.split("@")[0].replace(".", " ").replace("_", " ")
        # strip digits if it's an email handle like ihaab998
        cleaned_name = "".join([c for c in raw_name if not c.isdigit()]).strip().title() or raw_name.title()
        user_id = str(uuid5(NAMESPACE_DNS, email_clean))
        full_name = f"Dr. {cleaned_name}" if req.role == "clinician" else cleaned_name
        user_info = UserResponse(
            id=user_id,
            email=email_clean,
            full_name=full_name,
            role=req.role or "patient",
            specialty="General Medicine",
            avatar="".join([p[0] for p in cleaned_name.split()[:2]]).upper() or "US"
        )
        token = create_jwt_token({"sub": user_id, "email": email_clean, "role": user_info.role})
        return TokenResponse(
            access_token=token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password. Please check your credentials."
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register New User")
def register(req: RegisterRequest):
    """
    Registers a new clinician or user in the platform.
    """
    email_clean = req.email.strip().lower()
    supabase = get_supabase_client()

    if supabase:
        try:
            res = supabase.auth.sign_up({
                "email": email_clean,
                "password": req.password,
                "options": {
                    "data": {
                        "full_name": req.full_name,
                        "role": req.role,
                        "specialty": req.specialty,
                        "license_number": req.license_number
                    }
                }
            })
            if res and res.user:
                token = create_jwt_token({"sub": res.user.id, "email": res.user.email, "role": req.role})
                user_info = UserResponse(
                    id=str(res.user.id),
                    email=email_clean,
                    full_name=req.full_name,
                    role=req.role,
                    specialty=req.specialty or "Clinical Care Provider",
                    avatar=req.full_name[:2].upper()
                )
                return TokenResponse(
                    access_token=token,
                    expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                    user=user_info
                )
        except Exception as e:
            print(f"[AUTH] Supabase Auth sign-up error: {e}")

    # Fallback registration
    user_id = str(uuid5(NAMESPACE_DNS, email_clean))
    user_info = UserResponse(
        id=user_id,
        email=email_clean,
        full_name=req.full_name,
        role=req.role,
        specialty=req.specialty or "Clinical Care Provider",
        avatar="".join([p[0] for p in req.full_name.split()[:2]]).upper() or "MD"
    )
    DEMO_USERS[email_clean] = {
        "id": user_id,
        "email": email_clean,
        "password": req.password,
        "full_name": req.full_name,
        "role": req.role,
        "specialty": req.specialty,
        "avatar": user_info.avatar
    }
    token = create_jwt_token({"sub": user_id, "email": email_clean, "role": req.role})

    return TokenResponse(
        access_token=token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_info
    )


@router.get("/me", response_model=UserResponse, summary="Get Current Logged In User Profile")
def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verifies the Authorization Bearer token and returns user information.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Default active session fallback for seamless development
        return UserResponse(
            id="u-101",
            email="dr.eleanor@healthguard.ai",
            full_name="Dr. Eleanor Vance",
            role="clinician",
            specialty="Chief Nephrologist & Chronic Care Lead",
            avatar="EV"
        )

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "clinician")

        # Find in demo users or construct profile
        if email in DEMO_USERS:
            u = DEMO_USERS[email]
            return UserResponse(
                id=u["id"],
                email=u["email"],
                full_name=u["full_name"],
                role=u["role"],
                specialty=u["specialty"],
                avatar=u["avatar"]
            )

        return UserResponse(
            id=user_id or str(uuid4()),
            email=email or "user@healthguard.ai",
            full_name="Dr. Active User",
            role=role,
            specialty="Clinical Specialist",
            avatar="AU"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again."
        )


@router.post("/logout", summary="Logout User Session")
def logout():
    """
    Logs out the user session.
    """
    return {"status": "success", "message": "Successfully logged out."}
