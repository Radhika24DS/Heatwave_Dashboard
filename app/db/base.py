from app.db.base_class import Base

# Import all models here so that Alembic can detect them via Base.metadata
from app.models.user import User
from app.models.location import District
from app.models.weather import IMDWeatherData, AerosolData
from app.models.prediction import HeatwavePrediction, ModelRegistry
from app.models.advisory import Advisory
from app.models.alert import Alert
from app.models.log import SystemLog
from app.models.dataset import Dataset
