import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole, RiskLevel, AlertStatus
from app.models.alert import Alert
from sqlalchemy import func
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

        # Seed some real sample alerts issued by the authority
        authority_res = await db.execute(select(User).where(User.email == "authority@test.com"))
        auth_user = authority_res.scalars().first()
        
        if auth_user:
            # Clean up existing alerts to remove auto-generated / dummy prediction alerts
            from sqlalchemy import text
            await db.execute(text("DELETE FROM alerts"))
            await db.commit()
            
            print("Seeding sample real alerts issued by authority...")
            from app.models.location import District
            bangalore_res = await db.execute(select(District).where(District.name == "Bangalore"))
            bangalore = bangalore_res.scalars().first()
            mysore_res = await db.execute(select(District).where(District.name == "Mysore"))
            mysore = mysore_res.scalars().first()
            
            if bangalore and mysore:
                sample_alerts = [
                    Alert(
                        district_id=bangalore.id,
                        issued_by_user_id=auth_user.id,
                        risk_level=RiskLevel.HIGH,
                        message="🔔 EMERGENCY WARNING: High risk of dehydration and heat stroke in Bangalore. Drink plenty of water and stay indoors.",
                        status=AlertStatus.ACTIVE
                    ),
                    Alert(
                        district_id=mysore.id,
                        issued_by_user_id=auth_user.id,
                        risk_level=RiskLevel.EXTREME,
                        message="🚨 CRITICAL EXTREME HEAT WARNING: Temperatures expected to surpass 42°C in Mysore. Mandatory suspension of outdoor agricultural work from 12 PM to 4 PM.",
                        status=AlertStatus.ACTIVE
                    ),
                    Alert(
                        district_id=bangalore.id,
                        issued_by_user_id=auth_user.id,
                        risk_level=RiskLevel.MODERATE,
                        message="📝 Draft Alert for Bangalore: Moderate risk conditions forecasted. Maintain adequate water supplies.",
                        status=AlertStatus.DRAFT
                    )
                ]
                db.add_all(sample_alerts)
                await db.commit()
                print("Successfully seeded 3 real alerts (2 active, 1 draft).")
            else:
                print("Could not seed alerts because Bangalore or Mysore districts were not found. Please run seed.py first.")

if __name__ == "__main__":
    asyncio.run(seed_all_roles())
