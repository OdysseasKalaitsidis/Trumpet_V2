FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    python3 \
    python3-pip \
    python3-venv \
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/trumpet

# Copy existing application directory contents
COPY ./Backend /var/www/trumpet/Backend
COPY ./python_services /var/www/trumpet/python_services
COPY ./resources /var/www/trumpet/resources

# Install Backend dependencies
WORKDIR /var/www/trumpet/Backend
RUN composer install --no-interaction --no-plugins --no-scripts

# Setup Python environment
WORKDIR /var/www/trumpet/python_services
RUN python3 -m venv venv
RUN ./venv/bin/pip install -r requirements.txt

WORKDIR /var/www/trumpet

EXPOSE 9000
CMD ["php-fpm"]
