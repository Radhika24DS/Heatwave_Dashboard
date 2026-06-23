from typing import Any, Dict, Optional

def standard_response(
    status: str,
    data: Optional[Any] = None,
    message: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns a unified response envelope for API endpoints.
    Format:
    {
        "status": "success" | "error",
        "data": [...] or {...},
        "message": "Optional messaging details"
    }
    """
    envelope = {
        "status": status,
        "data": data if data is not None else []
    }
    if message is not None:
        envelope["message"] = message
    return envelope
