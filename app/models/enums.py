import enum

class UserRole(str, enum.Enum):
    PUBLIC = "PUBLIC"
    FARMER = "FARMER"
    TRAVELLER = "TRAVELLER"
    RESEARCH = "RESEARCH"
    AUTHORITY = "AUTHORITY"
    ADMIN = "ADMIN"

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"

class AdvisoryRole(str, enum.Enum):
    PUBLIC = "PUBLIC"
    FARMER = "FARMER"
    TRAVELLER = "TRAVELLER"

class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"

class DatasetStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
