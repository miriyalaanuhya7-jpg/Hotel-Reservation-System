# Aura Stays Flask API

This folder contains a standalone Python Flask API for the hotel reservation system. The managed web preview uses the built-in typed server procedures so it can run as one deployable service, while this companion API is ready for a traditional Flask + MySQL deployment.

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export MYSQL_HOST=127.0.0.1
export MYSQL_DATABASE=hotel_reservations
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
python app.py
```

The API exposes `GET /api/health`, `GET /api/reservations`, and `POST /api/reservations`. The MySQL tables are defined in `../drizzle/schema.ts` and can be mirrored in a Flask migration for a pure Python deployment.
