# 🚀 Quick Start Guide

Get your Tailoring Measurement API up and running in 5 minutes!

## Prerequisites
- Docker installed (recommended) OR Node.js 18+ and PostgreSQL 15+

## Option 1: Docker (Easiest - Recommended) ⭐

```bash
# 1. Clone and navigate
git clone <your-repo> && cd tailoring-backend

# 2. Create environment file
cp .env.example .env

# 3. Start everything
docker-compose up -d

# 4. Check health
curl http://localhost:3000/api/v1/health
```

✅ Done! API is running on http://localhost:3000

## Option 2: Local Setup

```bash
# 1. Install dependencies
npm install
pip3 install mediapipe opencv-python numpy

# 2. Setup database
createdb tailoring_app

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Create uploads directory
mkdir uploads

# 5. Start development server
npm run start:dev
```

## First API Call

### 1. Create a User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "gender": "male",
    "height": 175
  }'
```

Save the returned `id` (UUID).

### 2. Process Body Measurements

```bash
curl -X POST http://localhost:3000/api/v1/measurements/process \
  -F "frontImage=@/path/to/front.jpg" \
  -F "sideImage=@/path/to/side.jpg" \
  -F "userId=<USER_ID_FROM_STEP_1>" \
  -F "height=175" \
  -F "gender=male"
```

### 3. Get Measurements

```bash
curl http://localhost:3000/api/v1/measurements/user/<USER_ID>
```

## Photo Guidelines

For best results:
- ✅ Full body visible in frame
- ✅ Wear tight-fitting clothes
- ✅ Good lighting
- ✅ Plain background
- ✅ Stand straight, arms at sides
- ❌ No loose clothing
- ❌ No accessories covering body

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| POST | `/measurements/process` | Process measurements |
| GET | `/measurements/user/:userId` | Get user measurements |
| POST | `/tailors` | Create tailor |
| POST | `/measurements/share` | Share with tailor |

## Next Steps

1. Read [README.md](README.md) for complete documentation
2. Check [API Documentation](#api-documentation) for all endpoints
3. See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
4. Configure authentication (recommended for production)

## Troubleshooting

**Docker not starting?**
```bash
docker-compose logs -f
```

**Python issues?**
```bash
pip3 install mediapipe opencv-python numpy --break-system-packages
```

**Port 3000 in use?**
```bash
# Change PORT in .env
PORT=8000
```

**Database connection failed?**
```bash
# Check PostgreSQL is running
docker-compose ps
# or
pg_isready
```

## Support

- 📧 Email: support@yourdomain.com
- 🐛 Issues: GitHub Issues
- 📚 Docs: [README.md](README.md)

Happy coding! 🎉
