# Unified Dockerfile: Nginx + PHP 8.3 + Python
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    python3 \
    py3-pip \
    libzip-dev \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/trumpet

# Copy Nginx config
COPY ./nginx/trumpet.conf /etc/nginx/http.d/default.conf

# Copy application code
COPY ./Backend /var/www/trumpet/Backend
COPY ./python_services /var/www/trumpet/python_services
RUN mkdir -p /var/www/trumpet/resources
COPY ./Frontend /var/www/trumpet/Frontend

# Install Backend dependencies
WORKDIR /var/www/trumpet/Backend
RUN composer install --no-interaction --no-plugins --no-scripts

# Build Frontend
WORKDIR /var/www/trumpet/Frontend
RUN apk add --no-cache nodejs npm
RUN npm install && npm run build
RUN cp -r dist/* /usr/share/nginx/html/

# Setup Python environment
WORKDIR /var/www/trumpet/python_services
RUN python3 -m venv venv
RUN ./venv/bin/pip install -r requirements.txt

# Setup Supervisor to run both Nginx and PHP-FPM
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/trumpet

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
