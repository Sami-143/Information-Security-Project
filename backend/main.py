from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, inference, admin, signature, security  # Import the necessary routers
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from slowapi.middleware import SlowAPIMiddleware
from utils.rate_limiter import limiter  # Import rate limiter (optional, if you want rate limiting)

app = FastAPI()

# CORS settings to allow frontend (React) access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cyber-is-secure.netlify.app"],  # Allow all origins for now (adjust later if needed)
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
app.include_router(inference.router, prefix="/model")  # You may not have this yet, but it's added for future use
app.include_router(admin.router, prefix="/admin")  # Same as above
app.include_router(signature.router, prefix="/documents")  # Same as above
app.include_router(security.router, prefix="/security")  # Same as above
