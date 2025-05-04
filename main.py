from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from routes import auth, inference, admin, signature, security
from utils.rate_limiter import limiter

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cyber-is-secure.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Root health-check
@app.get("/", response_class=JSONResponse)
async def read_root():
    return {"message": "Hello World"}

# Rate-limit handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"success": False, "detail": "Too many requests. Please try again later."}
    )

# Routers
app.include_router(auth.router)
app.include_router(inference.router, prefix="/model")
app.include_router(admin.router, prefix="/admin")
app.include_router(signature.router, prefix="/documents")
app.include_router(security.router, prefix="/security")
