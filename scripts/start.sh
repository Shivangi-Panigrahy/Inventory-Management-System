#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Inventory Management System...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from template...${NC}"
    cp backend/env.example backend/.env
    echo -e "${GREEN}✅ Backend .env file created. Please update with your configuration.${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env file not found. Creating from template...${NC}"
    echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env
    echo "REACT_APP_NAME=Inventory Management System" >> frontend/.env
    echo -e "${GREEN}✅ Frontend .env file created.${NC}"
fi

# Check if MongoDB is running
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB manually.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB not found. Please install MongoDB or use Docker.${NC}"
fi

# Check if Redis is running
echo -e "${YELLOW}🔍 Checking Redis connection...${NC}"
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis is not running. Please start Redis manually.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Redis not found. Please install Redis or use Docker.${NC}"
fi

# Check if RabbitMQ is running
echo -e "${YELLOW}🔍 Checking RabbitMQ connection...${NC}"
if command -v rabbitmq-server &> /dev/null; then
    if pgrep -x "beam.smp" > /dev/null; then
        echo -e "${GREEN}✅ RabbitMQ is running${NC}"
    else
        echo -e "${YELLOW}⚠️  RabbitMQ is not running. Please start RabbitMQ manually.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  RabbitMQ not found. Please install RabbitMQ or use Docker.${NC}"
fi

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Update backend/.env with your configuration"
echo -e "2. Start the services:"
echo -e "   - MongoDB: mongod"
echo -e "   - Redis: redis-server"
echo -e "   - RabbitMQ: rabbitmq-server"
echo -e "3. Run the application: npm run dev"
echo -e ""
echo -e "${GREEN}🌐 Application will be available at:${NC}"
echo -e "   - Frontend: http://localhost:3000"
echo -e "   - Backend API: http://localhost:8000"
echo -e "   - RabbitMQ Management: http://localhost:15672"
echo -e ""
echo -e "${YELLOW}💡 Tip: Use 'docker-compose up' for easy setup with Docker${NC}" 