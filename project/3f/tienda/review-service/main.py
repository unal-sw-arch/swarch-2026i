import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a MongoDB con reintento
def connect_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/reviewsdb")
    while True:
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            client.admin.command("ping")
            print("Conectado a MongoDB")
            return client["reviewsdb"]["reviews"]
        except ConnectionFailure:
            print("Esperando MongoDB...")
            time.sleep(2)

collection = connect_db()

# Schema entrada
class ReviewIn(BaseModel):
    product_id: int
    autor: str
    comentario: str
    estrellas: int

# Helper para serializar ObjectId
def serialize(review) -> dict:
    review["_id"] = str(review["_id"])
    if isinstance(review.get("fecha"), datetime):
        review["fecha"] = review["fecha"].isoformat()
    return review

# Obtener reseñas de un producto
@app.get("/reviews/{product_id}")
def get_reviews(product_id: int):
    reviews = list(
        collection.find({"product_id": product_id}).sort("fecha", -1)
    )
    return [serialize(r) for r in reviews]

# Crear reseña
@app.post("/reviews", status_code=201)
def create_review(review: ReviewIn):
    if not 1 <= review.estrellas <= 5:
        return {"error": "Las estrellas deben ser entre 1 y 5"}, 400

    doc = review.dict()
    doc["fecha"] = datetime.utcnow()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["fecha"] = doc["fecha"].isoformat()
    return doc

# Eliminar reseña
@app.delete("/reviews/{id}")
def delete_review(id: str):
    collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Reseña eliminada"}
