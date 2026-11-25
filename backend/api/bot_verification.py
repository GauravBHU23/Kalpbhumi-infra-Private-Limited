import json
import os
import urllib.parse
import urllib.request


def verify_turnstile(request) -> bool:
    secret = os.getenv("TURNSTILE_SECRET_KEY", "").strip()
    if not secret:
        return True
    token = str(request.data.get("turnstile_token", "")).strip()
    if not token:
        return False
    try:
        payload = urllib.parse.urlencode({
            "secret": secret,
            "response": token,
            "remoteip": request.META.get("REMOTE_ADDR", ""),
        }).encode()
        req = urllib.request.Request(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data=payload,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return bool(json.loads(response.read().decode()).get("success"))
    except Exception:
        return False
