# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth  # Import the auth router

app = FastAPI()

# CORS settings to allow frontend (React) access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication router
app.include_router(auth.router)
