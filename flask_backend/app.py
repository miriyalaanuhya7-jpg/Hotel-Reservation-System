"""Optional Flask API for teams that want a standalone Python service.

The webdev preview uses the typed server procedures in /server so the UI works
inside the managed runtime. This service mirrors the same MySQL data model and
can be run independently for a traditional Flask deployment.
"""
from datetime import datetime
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "hotel_reservations"),
    )


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "aurastays-flask-api"})


@app.get("/api/reservations")
def list_reservations():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM reservations ORDER BY createdAt DESC LIMIT 100")
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(rows)


@app.post("/api/reservations")
def create_reservation():
    payload = request.get_json(force=True)
    confirmation = payload.get("confirmationCode", f"AS-{int(datetime.now().timestamp()) % 10000:04d}")
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        """INSERT INTO reservations
        (confirmationCode, guestName, guestEmail, roomNumber, roomType, checkIn, checkOut, amount, status, source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            confirmation,
            payload["guestName"],
            payload.get("guestEmail"),
            payload["roomNumber"],
            payload["roomType"],
            payload["checkIn"],
            payload["checkOut"],
            int(payload["amount"]),
            payload.get("status", "confirmed"),
            payload.get("source", "Direct"),
        ),
    )
    connection.commit()
    reservation_id = cursor.lastrowid
    cursor.close()
    connection.close()
    return jsonify({"id": reservation_id, "confirmationCode": confirmation}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("FLASK_PORT", "5050")), debug=True)
