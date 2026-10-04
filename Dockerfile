# Use lightweight Python 3.11 base image
FROM python:3.11-slim

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set working directory inside container
WORKDIR /app

# Install essential system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy complete application codebase
COPY . .

# Expose port (Render sets $PORT at runtime, default to 8000)
EXPOSE 8000

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start Uvicorn ASGI server binding to 0.0.0.0 and dynamic $PORT
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
