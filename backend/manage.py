#!/usr/bin/env python
import os
import sys
from importlib.util import find_spec


def check_backend_dependencies():
    required_modules = {
        "django": "Django",
        "dotenv": "python-dotenv",
        "dj_database_url": "dj-database-url",
        "rest_framework": "djangorestframework",
        "corsheaders": "django-cors-headers",
        "whitenoise": "whitenoise",
        "PIL": "Pillow",
    }
    if os.getenv("AWS_STORAGE_BUCKET_NAME"):
        required_modules["storages"] = "django-storages"

    missing = [package for module, package in required_modules.items() if find_spec(module) is None]
    if missing:
        print("Missing backend dependencies: " + ", ".join(missing))
        print(f"Python currently in use: {sys.executable}")
        print("From the backend folder, use .\\.venv\\Scripts\\python.exe or run .\\run.ps1.")
        print("Install dependencies with .\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt.")
        raise SystemExit(1)

if __name__ == "__main__":
    check_backend_dependencies()
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
