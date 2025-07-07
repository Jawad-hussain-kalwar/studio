"""chat_models.services
=======================
Service helpers related to chat-completion models.
Only responsibility right now: list locally-available models from Ollama.
"""
from __future__ import annotations

import time
from typing import List, Dict

import httpx
from django.conf import settings

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

__all__ = [
    "get_chat_models",
]


# ---------------------------------------------------------------------------
# Simple  in-memory cache (10-second TTL) so we don't hammer Ollama on reloads
# ---------------------------------------------------------------------------

_CACHE: dict[str, tuple[float, List[Dict]]] = {}
_TTL_SECONDS = 10


def get_chat_models() -> List[Dict]:
    """Return a list of models that can handle *chat completions*.

    The function queries ``GET <OLLAMA_BASE_URL>/api/tags`` and normalises the
    response to the frontend schema::
        [{"id": "llama3:latest", "name": "llama3:latest", "description": "",
          "contextLength": 0}]
    On any failure (timeout, connection error, non-200, invalid JSON) an empty
    list is returned ‑ the frontend will show a friendly notice.
    """
    now = time.time()
    cached = _CACHE.get("models")
    if cached and (now - cached[0] < _TTL_SECONDS):
        return cached[1]

    models: List[Dict] = []
    base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
    url = f"{base_url.rstrip('/')}/api/tags"

    try:
        with httpx.Client(timeout=5) as client:
            response = client.get(url)
            response.raise_for_status()
            payload = response.json()
    except Exception:
        # Any exception (network, JSON, etc.) results in an empty list.
        _CACHE["models"] = (now, models)
        return models

    for entry in payload.get("models", []):
        name = entry.get("name") or entry.get("model")
        if not name:
            continue
        details = entry.get("details") or {}
        param_size = details.get("parameter_size")
        friendly_name = name
        if param_size:
            friendly_name = f"{name} ({param_size})"

        models.append({
            "id": name,
            "name": friendly_name,
            "contextLength": 0,
        })

    _CACHE["models"] = (now, models)
    return models 