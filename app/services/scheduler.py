import asyncio
import logging
from datetime import date, timedelta
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.location import District
from app.services.prediction import PredictionService
from app.models.enums import UserRole

logger = logging.getLogger(__name__)

async def run_nightly_predictions():
    logger.info("Scheduler: Starting automatic heatwave forecast generation for all districts...")
    prediction_service = PredictionService()
    async with SessionLocal() as db:
        try:
            # Query all districts
            result = await db.execute(select(District))
            districts = result.scalars().all()
            logger.info(f"Scheduler: Found {len(districts)} districts to process.")
            
            today = date.today()
            for district in districts:
                logger.info(f"Scheduler: Generating 3-day forecast for {district.name}...")
                for i in range(3):
                    target_date = today + timedelta(days=i)
                    try:
                        # Call predict_and_warn to fetch weather, predict, and save to DB
                        await prediction_service.predict_and_warn(
                            db=db,
                            district_id=district.id,
                            forecast_date=target_date,
                            user_id=None,
                            user_role=UserRole.ADMIN,
                            client_ip="127.0.0.1",
                            background_tasks=None
                        )
                    except Exception as ex:
                        logger.error(f"Scheduler: Prediction failed for {district.name} on {target_date}: {ex}")
            logger.info("Scheduler: Automatic forecast generation completed successfully.")
        except Exception as e:
            logger.error(f"Scheduler: Error running nightly forecast: {e}")

async def scheduler_loop():
    # Wait a brief moment after startup before running first check
    await asyncio.sleep(5)
    while True:
        try:
            await run_nightly_predictions()
        except Exception as e:
            logger.error(f"Scheduler: Unexpected loop error: {e}")
        
        # Sleep for 24 hours
        logger.info("Scheduler: Sleeping for 24 hours...")
        await asyncio.sleep(86400)

def start_scheduler():
    logger.info("Scheduler: Starting background scheduler task loop...")
    asyncio.create_task(scheduler_loop())
