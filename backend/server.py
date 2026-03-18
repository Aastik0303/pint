from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid
import shutil

app = FastAPI(title="GlowCare API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "glowcare")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
products_collection = db["products"]

# JWT config
SECRET_KEY = os.environ.get("JWT_SECRET", "glowcare_secret_key_2024")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def serialize_product(product):
    """Convert MongoDB document to JSON-serializable dict"""
    return {
        "id": str(product["_id"]),
        "product_name": product.get("product_name", ""),
        "description": product.get("description", ""),
        "price": product.get("price", 0),
        "category": product.get("category", ""),
        "product_image": product.get("product_image", ""),
        "created_at": product.get("created_at", "")
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "GlowCare API"}

# Admin login
@app.post("/api/admin/login")
async def admin_login(password: str = Form(...)):
    if password == ADMIN_PASSWORD:
        token = create_access_token({"sub": "admin", "role": "admin"})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid password")

# Verify admin token
@app.get("/api/admin/verify")
async def verify_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = verify_token(token)
    
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {"valid": True, "role": "admin"}

# Get all products (public)
@app.get("/api/products")
async def get_products(category: str = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    
    products = list(products_collection.find(query).sort("created_at", -1))
    return {"products": [serialize_product(p) for p in products]}

# Get single product (public)
@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_product(product)
    except:
        raise HTTPException(status_code=404, detail="Product not found")

# Create product (admin only)
@app.post("/api/admin/products")
async def create_product(
    product_name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    product_image: UploadFile = File(...)
):
    # Save image
    file_ext = product_image.filename.split(".")[-1] if "." in product_image.filename else "jpg"
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(product_image.file, buffer)
    
    # Create product document
    product_doc = {
        "product_name": product_name,
        "description": description,
        "price": price,
        "category": category,
        "product_image": f"/api/uploads/{filename}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = products_collection.insert_one(product_doc)
    product_doc["id"] = str(result.inserted_id)
    if "_id" in product_doc:
        del product_doc["_id"]
    
    return {"message": "Product created successfully", "product": product_doc}

# Update product (admin only)
@app.put("/api/admin/products/{product_id}")
async def update_product(
    product_id: str,
    product_name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    product_image: UploadFile = File(None)
):
    try:
        existing = products_collection.find_one({"_id": ObjectId(product_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        
        update_data = {
            "product_name": product_name,
            "description": description,
            "price": price,
            "category": category
        }
        
        # Handle new image if provided
        if product_image and product_image.filename:
            file_ext = product_image.filename.split(".")[-1] if "." in product_image.filename else "jpg"
            filename = f"{uuid.uuid4()}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(product_image.file, buffer)
            
            update_data["product_image"] = f"/api/uploads/{filename}"
            
            # Delete old image
            old_image = existing.get("product_image", "")
            if old_image:
                old_path = os.path.join(UPLOAD_DIR, old_image.replace("/api/uploads/", ""))
                if os.path.exists(old_path):
                    os.remove(old_path)
        
        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        updated = products_collection.find_one({"_id": ObjectId(product_id)})
        return {"message": "Product updated successfully", "product": serialize_product(updated)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Delete product (admin only)
@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str):
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Delete image file
        image_path = product.get("product_image", "")
        if image_path:
            file_path = os.path.join(UPLOAD_DIR, image_path.replace("/api/uploads/", ""))
            if os.path.exists(file_path):
                os.remove(file_path)
        
        products_collection.delete_one({"_id": ObjectId(product_id)})
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get categories
@app.get("/api/categories")
async def get_categories():
    return {"categories": ["Skincare", "Haircare", "Makeup", "Healthcare"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
