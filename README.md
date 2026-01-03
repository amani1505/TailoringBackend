# 🎯 Tailoring Measurement Backend API

AI-powered body measurement system using MediaPipe for tailoring applications. This production-ready backend provides REST APIs for processing body images and extracting precise measurements.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **AI-Powered Measurements**: Uses Google MediaPipe for accurate body measurement extraction
- ✅ **User Management**: Complete CRUD operations for users
- ✅ **Measurement History**: Store and retrieve past measurements
- ✅ **Share with Tailors**: Send measurements directly to registered tailors
- ✅ **RESTful API**: Clean, well-documented API endpoints
- ✅ **PostgreSQL Database**: Reliable data storage with TypeORM
- ✅ **Docker Support**: Easy deployment with Docker and Docker Compose
- ✅ **Production Ready**: Error handling, validation, and logging

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **AI Engine**: MediaPipe (Python)
- **Image Processing**: OpenCV
- **Language**: TypeScript
- **Containerization**: Docker

## 📦 Prerequisites

### Option 1: Local Development
- Node.js 18+ 
- PostgreSQL 15+
- Python 3.8+
- npm or yarn

### Option 2: Docker (Recommended)
- Docker 20+
- Docker Compose 2+

## 🚀 Installation

### Method 1: Local Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd tailoring-backend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Install Python dependencies**
```bash
# Create a virtual environment
python3 -m venv venv

# Install dependencies in the virtual environment
./venv/bin/pip install -r requirements.txt
```

4. **Create PostgreSQL database**
```bash
# Using psql
createdb tailoring_app

# Or using Docker
docker run --name tailoring-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=tailoring_app \
  -p 5432:5432 \
  -d postgres:15
```

5. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

6. **Create uploads directory**
```bash
mkdir -p uploads
```

### Method 2: Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd tailoring-backend
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

That's it! The application will be running on `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password123
DB_DATABASE=tailoring_app

# Python
PYTHON_PATH=python3

# CORS
CORS_ORIGIN=*
```

### Production Settings

For production, update these values:

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
DB_SSL=true
```

## 🏃 Running the Application

### Local Development

```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Docker

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Verify Installation

Check if the server is running:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "services": {
    "database": "ok",
    "python": "Python 3.x.x",
    "mediapipe": "v0.x.x"
  }
}
```

## 📚 API Documentation

Base URL: `http://localhost:3000/api/v1`

### Authentication
Currently, the API doesn't require authentication. Add JWT authentication for production use.

### Endpoints

#### 1. Health Check
```http
GET /health
```

#### 2. Users

**Create User**
```http
POST /users
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "gender": "male",
  "height": 175,
  "weight": 70
}
```

**Get All Users**
```http
GET /users
```

**Get User by ID**
```http
GET /users/:id
```

**Update User**
```http
PATCH /users/:id
Content-Type: application/json

{
  "height": 180
}
```

**Delete User**
```http
DELETE /users/:id
```

#### 3. Measurements

**Process and Save Measurement**
```http
POST /measurements/process
Content-Type: multipart/form-data

{
  "frontImage": <file>,
  "sideImage": <file>,
  "userId": "uuid",
  "height": 175,
  "gender": "male",
  "notes": "Optional notes"
}
```

**Get All Measurements**
```http
GET /measurements
```

**Get User Measurements**
```http
GET /measurements/user/:userId
```

**Get Single Measurement**
```http
GET /measurements/:id
```

**Share Measurement with Tailor**
```http
POST /measurements/share?userId=<user-uuid>
Content-Type: application/json

{
  "measurementId": "uuid",
  "tailorId": "uuid",
  "message": "Please make a suit"
}
```

**Get Shared Measurements**
```http
GET /measurements/shared/user/:userId
```

**Delete Measurement**
```http
DELETE /measurements/:id?userId=<user-uuid>
```

#### 4. Tailors

**Create Tailor**
```http
POST /tailors
Content-Type: application/json

{
  "businessName": "Expert Tailoring",
  "ownerName": "Jane Smith",
  "email": "jane@tailoring.com",
  "phoneNumber": "+1234567890",
  "city": "New York",
  "specialties": ["suits", "dresses"]
}
```

**Get All Tailors**
```http
GET /tailors
```

**Get Tailor by ID**
```http
GET /tailors/:id
```

**Get Measurements Received by Tailor**
```http
GET /tailors/:id/measurements
```

**Update Tailor**
```http
PATCH /tailors/:id
```

**Delete Tailor**
```http
DELETE /tailors/:id
```

### Example Requests

**Using cURL:**

```bash
# Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "gender": "male"
  }'

# Process measurement
curl -X POST http://localhost:3000/api/v1/measurements/process \
  -F "frontImage=@front.jpg" \
  -F "sideImage=@side.jpg" \
  -F "userId=your-user-uuid" \
  -F "height=175" \
  -F "gender=male"
```

**Using Postman:**

1. Import the collection from `/docs/postman_collection.json` (if provided)
2. Set base URL to `http://localhost:3000/api/v1`
3. Use form-data for file uploads

## 🚢 Deployment

### Deploy to Production Server

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Install dependencies**
```bash
npm ci --only=production
pip3 install mediapipe opencv-python-headless numpy pillow
```

4. **Build the application**
```bash
npm run build
```

5. **Run with PM2** (recommended)
```bash
npm install -g pm2
pm2 start dist/main.js --name tailoring-api
pm2 save
pm2 startup
```

### Deploy with Docker

```bash
# Build image
docker build -t tailoring-backend .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  --name tailoring-api \
  tailoring-backend
```

### Deploy to Cloud Platforms

**Heroku:**
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql
git push heroku main
```

**AWS/GCP/Azure:**
Use the provided Dockerfile and deploy to:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances

## 🐛 Troubleshooting

### Common Issues

**1. Python/MediaPipe not found**
```bash
# Check Python installation
python3 --version

# Install MediaPipe
pip3 install mediapipe opencv-python
```

**2. Database connection failed**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d tailoring_app
```

**3. Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

**4. Image upload fails**
- Check file size limit (default: 10MB)
- Ensure `uploads/` directory exists and is writable
- Verify image format (JPG, JPEG, PNG only)

**5. Measurements inaccurate**
- Ensure full body is visible in both images
- User should wear tight-fitting clothes
- Good lighting and clear background
- Correct height input

### Logs

**View application logs:**
```bash
# Local
npm run start:dev

# Docker
docker-compose logs -f backend

# PM2
pm2 logs tailoring-api
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## 📄 License

MIT License - feel free to use this project for commercial purposes.

## 🤝 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@yourdomain.com

## 🔄 Updates

Check for updates regularly:
```bash
git pull origin main
npm install
```

---

**Built with ❤️ for tailors and fashion businesses**
