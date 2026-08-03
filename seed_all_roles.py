import asyncio
import traceback
from sqlalchemy.future import select
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.user import User
from app.models.location import District
from app.models.alert import Alert
from app.models.enums import UserRole, RiskLevel, AlertStatus
from app.utils.security import hash_password

async def seed_users():
    print("--- Seeding Users ---")
    roles = [
        ("PUBLIC", "public@test.com", "System Public"),
        ("AUTHORITY", "authority@test.com", "System Authority"),
        ("ADMIN", "admin@test.com", "System Admin"),
    ]
    password = "Password123!"
    hashed = hash_password(password)
    
    async with SessionLocal() as db:
        # Clean up old users
        await db.execute(text("DELETE FROM users WHERE role NOT IN ('PUBLIC', 'AUTHORITY', 'ADMIN')"))
        await db.commit()
        
        for role_name, email, name in roles:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            role_enum = getattr(UserRole, role_name)
            
            if user:
                print(f"Updating user: {email}")
                user.hashed_password = hashed
                user.role = role_enum
                user.is_active = True
            else:
                print(f"Creating user: {email}")
                user = User(
                    name=name,
                    email=email,
                    hashed_password=hashed,
                    role=role_enum,
                    is_active=True
                )
                db.add(user)
        await db.commit()
    print("Users seeded successfully.")

async def seed_alerts():
    print("--- Seeding Alerts ---")
    async with SessionLocal() as db:
        # Get authority user id
        authority_res = await db.execute(select(User).where(User.email == "authority@test.com"))
        auth_user = authority_res.scalars().first()
        if not auth_user:
            print("Authority user not found. Run seed_users first.")
            return
        auth_user_id = auth_user.id

        # Get district ids
        bangalore_res = await db.execute(select(District).where(District.name == "Bangalore"))
        bangalore = bangalore_res.scalars().first()
        mysore_res = await db.execute(select(District).where(District.name == "Mysore"))
        mysore = mysore_res.scalars().first()
        
        if not bangalore or not mysore:
            print("Bangalore or Mysore district not found. Run seed.py first.")
            return
            
        bangalore_id = bangalore.id
        mysore_id = mysore.id

        # Clean up existing alerts
        await db.execute(text("DELETE FROM alerts"))
        await db.commit()

        # Add alerts
        sample_alerts = [
            Alert(
                district_id=bangalore_id,
                issued_by_user_id=auth_user_id,
                risk_level=RiskLevel.HIGH,
                message="🔔 EMERGENCY WARNING: High risk of dehydration and heat stroke in Bangalore. Drink plenty of water and stay indoors.",
                status=AlertStatus.ACTIVE
            ),
            Alert(
                district_id=mysore_id,
                issued_by_user_id=auth_user_id,
                risk_level=RiskLevel.EXTREME,
                message="🚨 CRITICAL EXTREME HEAT WARNING: Temperatures expected to surpass 42°C in Mysore. Mandatory suspension of outdoor agricultural work from 12 PM to 4 PM.",
                status=AlertStatus.ACTIVE
            ),
            Alert(
                district_id=bangalore_id,
                issued_by_user_id=auth_user_id,
                risk_level=RiskLevel.MODERATE,
                message="📝 Draft Alert for Bangalore: Moderate risk conditions forecasted. Maintain adequate water supplies.",
                status=AlertStatus.DRAFT
            )
        ]
        db.add_all(sample_alerts)
        await db.commit()
    print("Alerts seeded successfully.")

async def main():
    try:
        await seed_users()
        await seed_alerts()
        print("\nAll seeding complete successfully!")
    except Exception as e:
        print("Seeding failed:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
