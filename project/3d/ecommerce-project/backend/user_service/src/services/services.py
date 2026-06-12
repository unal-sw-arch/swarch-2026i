from ..models.models import User, Address
from ..events.publisher import EventPublisher
from fastapi import HTTPException

publisher = EventPublisher()

class UserService:

    def __init__(self, db):
        self.db = db
        self.publisher = publisher

    def create_user(self, data):
        existing_user = self.db.query(User).filter(User.email == data.email).first()

        if existing_user:
            raise HTTPException(status_code=409, detail="Email already exists")

        user = User(
            name=data.name,
            email=data.email,
            phone=data.phone,
            role=data.role
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        try:
            self.publisher.publish(
                event_type="USER_CREATED",
                data={
                    "user_id": str(user.id),
                    "email": user.email
                }
            )
        except Exception as e:
            print("Error sending event:", e)

        return user

    def create_profile(self, data):
        existing_user = self.db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already exists")

        kwargs = dict(name=data.name, email=data.email, phone=data.phone, role=data.role)
        if data.id is not None:
            kwargs["id"] = data.id

        user = User(**kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user(self, user_id):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def get_user_by_email(self, email):
        normalized_email = str(email).strip().lower()
        user = self.db.query(User).filter(User.email == normalized_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def update_user(self, user_id, user_data):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        updates = user_data.dict(exclude_unset=True)
        if not updates:
            return user

        if "name" in updates and isinstance(updates["name"], str):
            updates["name"] = updates["name"].strip()

        if "phone" in updates and isinstance(updates["phone"], str):
            cleaned_phone = updates["phone"].strip()
            updates["phone"] = cleaned_phone or None

        for field, value in updates.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user
    
    def add_address(self, user_id, address_data):
        user = self.db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        address = Address(user_id=user_id, **address_data.dict())

        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)

        try:
            self.publisher.publish(
                event_type="ADDRESS_ADDED",
                data={
                    "user_id": str(user_id),
                    "address_id": str(address.id)
                }
            )
        except Exception as e:
            print("Error sending event:", e)

        return address
    
    def get_user_addresses(self, user_id):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return self.db.query(Address).filter(Address.user_id == user_id).all()