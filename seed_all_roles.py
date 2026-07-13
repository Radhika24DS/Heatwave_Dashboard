import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from sqlalchemy.future import select
from app.utils.security import hash_password

async def seed_all_roles():
    roles = [
        ("PUBLIC", "public@test.com", "System Public"),
        ("AUTHORITY", "authority@test.com", "System Authority"),
        ("ADMIN", "admin@test.com", "System Admin"),
    ]
    
    password = "Password123!"
    hashed = hash_password(password)
    
    async with SessionLocal() as db:
        # Clean up users with old roles from database
        from sqlalchemy import text
        await db.execute(text("DELETE FROM users WHERE role NOT IN ('PUBLIC', 'AUTHORITY', 'ADMIN')"))
        await db.commit()
        
        for role_name, email, name in roles:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            
            role_enum = getattr(UserRole, role_name)
            
            if user:
                print(f"Updating password and role for existing user {email}")
                user.hashed_password = hashed
                user.role = role_enum
                user.is_active = True
            else:
                print(f"Creating new {role_name} user {email}")
                user = User(
                    name=name,
                    email=email,
                    hashed_password=hashed,
                    role=role_enum,
                    is_active=True
                )
                db.add(user)
                
        await db.commit()
        print("\nSUCCESS! Seeded users for all roles with password: Password123!")

if __name__ == "__main__":
    asyncio.run(seed_all_roles())
