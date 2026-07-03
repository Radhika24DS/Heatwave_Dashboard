import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from sqlalchemy.future import select
from app.utils.security import hash_password

async def seed_admin():
    async with SessionLocal() as db:
        email = "admin_RDS@gmail.com"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        password = "AdminPassword123!"
        hashed = hash_password(password)
        
        if user:
            print(f"Updating password for existing user {email}")
            user.hashed_password = hashed
            user.role = UserRole.ADMIN
            user.is_active = True
        else:
            print(f"Creating new admin user {email}")
            user = User(
                name="System Admin",
                email=email,
                hashed_password=hashed,
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(user)
            
        await db.commit()
        print(f"\nSUCCESS! You can now log in to Swagger with:")
        print(f"Email: {email}")
        print(f"Password: {password}\n")

if __name__ == "__main__":
    asyncio.run(seed_admin())
