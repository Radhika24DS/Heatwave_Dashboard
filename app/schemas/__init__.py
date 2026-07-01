from app.schemas.user import User, UserCreate, UserUpdate, UserLogin
from app.schemas.district import District, DistrictCreate, DistrictUpdate
from app.schemas.weather import IMDWeatherData, IMDWeatherDataCreate, IMDWeatherDataUpdate
from app.schemas.aerosol import AerosolData, AerosolDataCreate, AerosolDataUpdate
from app.schemas.prediction import HeatwavePrediction, HeatwavePredictionCreate, PredictionRequest
from app.schemas.advisory import Advisory, AdvisoryCreate, AdvisoryUpdate
from app.schemas.alert import Alert, AlertCreate, AlertUpdate
from app.schemas.log import SystemLog, SystemLogCreate
from app.schemas.dataset import Dataset, DatasetCreate, DatasetUpdate
from app.schemas.model import ModelRegistry, ModelRegistryCreate, ModelRegistryUpdate

__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
    "UserLogin",
    "District",
    "DistrictCreate",
    "DistrictUpdate",
    "IMDWeatherData",
    "IMDWeatherDataCreate",
    "IMDWeatherDataUpdate",
    "AerosolData",
    "AerosolDataCreate",
    "AerosolDataUpdate",
    "HeatwavePrediction",
    "HeatwavePredictionCreate",
    "PredictionRequest",
    "Advisory",
    "AdvisoryCreate",
    "AdvisoryUpdate",
    "Alert",
    "AlertCreate",
    "AlertUpdate",
    "SystemLog",
    "SystemLogCreate",
    "Dataset",
    "DatasetCreate",
    "DatasetUpdate",
    "ModelRegistry",
    "ModelRegistryCreate",
    "ModelRegistryUpdate",
]
