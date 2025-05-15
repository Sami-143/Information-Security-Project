from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, inference, admin, signature, security  # Import the necessary routers
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from slowapi.middleware import SlowAPIMiddleware
from utils.rate_limiter import limiter  
app = FastAPI()

# CORS settings to allow frontend (React) access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins for now (adjust later if needed)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add SlowAPI rate limiting middleware (optional, adjust based on your use case)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Custom exception handler for rate limiting
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"success": False, "detail": "Too many requests. Please try again later."}
    )

# Include the routers (you can add more routes as needed)
app.include_router(auth.router)
app.include_router(inference.router, prefix="/model")
app.include_router(admin.router, prefix="/admin")  
app.include_router(signature.router, prefix="/documents")  
app.include_router(security.router, prefix="/security")
