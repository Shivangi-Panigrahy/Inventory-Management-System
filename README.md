# 🏪 Inventory Management System

A comprehensive Inventory Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring CRUD operations, caching, queuing, search, and filtering functionalities.

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, Read, Update, and Delete inventory items
- **User Authentication**: JWT-based authentication with role-based access control
- **Real-time Updates**: Instant inventory updates with cache invalidation
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Modern, mobile-friendly UI

### Advanced Features
- **Caching**: Redis-based caching for improved performance
- **Queue System**: RabbitMQ integration for background tasks
- **Data Validation**: Comprehensive input validation and error handling
- **Rate Limiting**: Protection against API abuse
- **Stock Alerts**: Automated low stock notifications

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Redis** - Caching
- **RabbitMQ** - Message queuing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Redis** (for caching)
- **RabbitMQ** (for queuing)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Shivangi-Panigrahy/Inventory-Management-System.git
cd Inventory-Management-System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment (.env)
Create a `.env` file in the `backend` directory:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start Services

#### Option A: Using Docker (Recommended)
```bash
# Start all services with Docker Compose
docker-compose up -d
```

#### Option B: Manual Setup
```bash
# Start MongoDB
brew services start mongodb-community

# Start Redis
brew services start redis

# Start RabbitMQ
brew services start rabbitmq

# Start Backend
cd backend
npm run dev

# Start Frontend (in a new terminal)
cd frontend
npm start
```

### 5. Create Admin User
```bash
cd backend
node scripts/createAdminUser.js
```

## 👤 Default Users

After running the setup script, you can login with:

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `admin123`

- **Regular User**:
  - Email: `user@example.com`
  - Password: `admin123`

## 📱 Usage

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/health

### Key Features

#### Inventory Management
- Add new inventory items with detailed information
- View, edit, and delete existing items
- Search and filter items by various criteria
- Real-time stock status monitoring

#### User Management
- Role-based access control (Admin, Manager, User)
- Users can manage their own inventory items
- Admins can manage all items and users

#### Advanced Features
- Automatic SKU generation
- Low stock alerts
- Stock status tracking
- Comprehensive audit trail

## 🏗️ Project Structure

```
inventory-management-system/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   └── server.js          # Server entry point
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── docker-compose.yml     # Docker configuration
├── setup.sh              # Setup script
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new item
- `GET /api/inventory/:id` - Get single item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/stats` - Get inventory statistics

### Users (Admin Only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/toggle-status` - Toggle user status

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Environment Variables
Make sure to update environment variables for production:
- Use strong JWT secrets
- Configure production database URLs
- Set up Redis and RabbitMQ production instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shivangi Panigrahy**
- GitHub: [@Shivangi-Panigrahy](https://github.com/Shivangi-Panigrahy)

## 🙏 Acknowledgments

- React.js team for the amazing framework
- MongoDB team for the database
- Redis team for caching solutions
- RabbitMQ team for message queuing
- All open-source contributors

---

**Note**: This is a comprehensive Inventory Management System built for evaluation purposes. It includes all the required features: CRUD operations, caching, queuing, search, filtering, authentication, authorization, and data validation. 