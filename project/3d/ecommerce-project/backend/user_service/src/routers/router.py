from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.db import SessionLocal
from ..services.services import UserService
from ..schemas.schemas import (
    AddressCreate,
    AddressResponse,
    ProfileCreate,
    UserCreate,
    UserResponse,
    UserUpdate,
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.create_user(user)

@router.post(
    "/internal/profiles",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.create_profile(profile)

@router.get("/users/by-email", response_model=UserResponse)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_user_by_email(email)

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_user(user_id)


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, payload: UserUpdate, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.update_user(user_id, payload)

@router.post(
    "/users/{user_id}/addresses",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_address(user_id: str, address: AddressCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.add_address(user_id, address)

@router.get("/users/{user_id}/addresses", response_model=list[AddressResponse])
def get_user_addresses(user_id: str, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_user_addresses(user_id)