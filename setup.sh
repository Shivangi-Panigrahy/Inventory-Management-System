#!/bin/bash

# Inventory Management System - Automated Setup Script
# This script will set up the entire system on a new machine

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    
    print_status "Waiting for $service to be ready..."
    for i in {1..30}; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service is ready!"
            return 0
        fi
        sleep 2
    done
    print_error "$service failed to start"
    return 1
}

# Main setup function
main() {
    echo "🚀 Inventory Management System - Automated Setup"
    echo "================================================"
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_warning "This script should not be run as root"
        exit 1
    fi
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) is installed"
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker is available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. Will use manual setup."
        DOCKER_AVAILABLE=false
    fi
    
    # Check if ports are available
    print_status "Checking port availability..."
    
    if port_in_use 3000; then
        print_error "Port 3000 is already in use"
        exit 1
    fi
    
    if port_in_use 8000; then
        print_error "Port 8000 is already in use"
        exit 1
    fi
    
    print_success "Required ports are available"
    
    # Create .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend environment file..."
        cat > backend/.env << EOF
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_management

# JWT Configuration
JWT_SECRET=inventory-management-system-jwt-secret-key-2024
JWT_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        print_success "Backend environment file created"
    else
        print_warning "Backend environment file already exists"
    fi
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
    
    # Setup database
    print_status "Setting up database..."
    cd backend
    if [ -f "scripts/setup-database.js" ]; then
        node scripts/setup-database.js
        print_success "Database setup completed"
    else
        print_warning "Database setup script not found. Please run manually."
    fi
    cd ..
    
    # Start services
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Starting services with Docker..."
        docker-compose up -d
        
        # Wait for services to be ready
        wait_for_service localhost 27017 "MongoDB"
        wait_for_service localhost 6379 "Redis"
        wait_for_service localhost 5672 "RabbitMQ"
        
        print_success "All services started with Docker"
    else
        print_status "Please start the following services manually:"
        echo "1. MongoDB: sudo systemctl start mongod"
        echo "2. Redis: sudo systemctl start redis"
        echo "3. RabbitMQ: sudo systemctl start rabbitmq-server"
        echo ""
        echo "Then run:"
        echo "cd backend && npm run dev"
        echo "cd frontend && npm start"
    fi
    
    print_success "Setup completed successfully!"
    echo ""
    echo "🎉 Your Inventory Management System is ready!"
    echo ""
    echo "📱 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo ""
    echo "👤 Default login credentials:"
    echo "   Admin: admin@example.com / admin123"
    echo "   User: user@example.com / user123"
    echo ""
    echo "📚 For more information, see SETUP.md"
}

# Run main function
main "$@" 