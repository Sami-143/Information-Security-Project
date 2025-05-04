
# Stage 1: Build
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 gcc

COPY requirements.txt .

# Create virtual environment
RUN python -m venv venv
ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim AS runner

WORKDIR /app

# Install OpenCV runtime dependencies
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && apt-get clean

# Copy environment and app code from builder
COPY --from=builder /app/venv /app/venv
COPY . .

ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Expose FastAPI port
EXPOSE 8000

# Start the FastAPI server using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
