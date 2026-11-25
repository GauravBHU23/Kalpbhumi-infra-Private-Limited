# Kalpbhumi Infra website

Next.js 16 (TypeScript) frontend and Django REST API. PostgreSQL is configured for deployment; local development can use SQLite by leaving `DATABASE_URL` unset. Use Node.js 20.9+ and Python 3.11+.

## Run locally

1. Backend (PowerShell): `cd backend`, create `.venv` with `python -m venv .venv`, install dependencies using `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`, copy `.env.example` to `.env`, and leave `DJANGO_DEBUG=true` with `DATABASE_URL` unset for local SQLite. Start it with `.\run.ps1`; this uses the backend virtual environment directly and applies migrations. Create an admin user with `.\.venv\Scripts\python.exe manage.py createsuperuser`.
2. Frontend: `cd frontend`, copy `.env.example` to `.env.local`, run `npm install`, then `npm run dev`.
3. In Django Admin at `http://localhost:8000/admin/`, create the company profile first, then manage published projects (including client type and status), upload multiple project photos / 2D / 3D files, publish site video links, manage government/private tenders and work orders, organize all staff departments, and review quotation enquiries.

Public API routes are `/api/company/`, `/api/projects/`, `/api/tenders/`, `/api/team/`, and `POST /api/enquiries/`.

The frontend follows the Next.js `src/` layout: route and global layout files are in `frontend/src/app/`; reusable page sections are in `frontend/src/components/sections/`; shared header/footer components are in `frontend/src/components/layout/`; and API helpers are in `frontend/src/lib/`.

The Django backend follows Django's standard project/app layout (a separate `src/` folder is not required): `backend/config/` holds settings and root routing; `backend/api/` holds database models, serializers, API views/routes, Django Admin configuration and migrations. `backend/manage.py` is the management entry point.

The frontend calls Django through the same-origin `/backend-api` Next.js rewrite, so browser requests also work through an HTTPS preview tunnel. Locally the rewrite targets `http://127.0.0.1:8000`; set `BACKEND_API_URL` to the deployed API origin in production. Keep `NEXT_PUBLIC_API_URL=/backend-api` so browser requests stay same-origin. The portfolio, contact details, team profiles, imagery and tender copy currently contain illustrative/demo content. Replace these with verified company information before launch. The enquiry form stores submissions in Django and is rate limited. For production, set `DJANGO_DEBUG=false`, a unique `DJANGO_SECRET_KEY`, `DATABASE_URL` for managed PostgreSQL, allowed host/origin settings, and `NEXT_PUBLIC_SITE_URL`; serve over HTTPS and configure backups, email notifications and durable media. Set `AWS_STORAGE_BUCKET_NAME` and `AWS_S3_REGION_NAME` to store uploaded project photos, drawings and tender documents in S3-compatible object storage.

For a Django deployment, run `python manage.py migrate` and `python manage.py collectstatic --noinput`, then serve `config.wsgi:application` with Gunicorn. Create the initial admin account with `python manage.py createsuperuser`.
