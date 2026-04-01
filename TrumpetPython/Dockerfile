FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 80

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the standard Azure port
EXPOSE 80

# Production run command: Gunicorn + Uvicorn workers
# -w 4 (4 worker processes)
# -k uvicorn.workers.UvicornWorker (Uvicorn worker class)
# -b 0.0.0.0:80 (Bind to all interfaces on port 80)
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:80", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
