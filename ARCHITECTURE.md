# System Architecture

## Overview

The Tailoring Measurement Backend is a modern, production-ready API service that combines AI-powered computer vision with a robust backend infrastructure.

## Architecture Diagram

```
┌─────────────────┐
│  Flutter App    │
│  (Mobile/Web)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────────┐
│           Nginx (Reverse Proxy)             │
│              Port 80/443                    │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│         NestJS Application Server           │
│              Port 3000                      │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Controllers (HTTP Layer)           │  │
│  │  - UsersController                   │  │
│  │  - MeasurementsController            │  │
│  │  - TailorsController                 │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │   Services (Business Logic)          │  │
│  │  - UsersService                      │  │
│  │  - MeasurementService ───┐           │  │
│  │  - TailorsService         │           │  │
│  └────────────┬──────────────┼──────────┘  │
│               │              │              │
│               │              │ Exec Python  │
│               │              ▼              │
│               │    ┌─────────────────────┐ │
│               │    │  MediaPipe Engine   │ │
│               │    │  (Python Script)    │ │
│               │    │  - Pose Detection   │ │
│               │    │  - Measurement      │ │
│               │    │    Extraction       │ │
│               │    └─────────────────────┘ │
│               │                             │
│               ▼                             │
│  ┌─────────────────────────────────────┐  │
│  │    TypeORM (Database Layer)         │  │
│  └─────────────┬───────────────────────┘  │
└────────────────┼─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          PostgreSQL Database                │
│                                             │
│  Tables:                                    │
│  - users                                    │
│  - measurements                             │
│  - tailors                                  │
│  - shared_measurements                      │
└─────────────────────────────────────────────┘
```

## Technology Stack

### Backend Framework
- **NestJS**: Modern, scalable Node.js framework
- **TypeScript**: Type-safe development
- **Express**: Underlying HTTP server

### Database
- **PostgreSQL**: Relational database for structured data
- **TypeORM**: Object-Relational Mapping for type-safe queries

### AI/ML Components
- **MediaPipe**: Google's ML framework for pose detection
- **Python**: Measurement extraction script
- **OpenCV**: Image processing
- **NumPy**: Numerical computations

### Infrastructure
- **Docker**: Containerization
- **Nginx**: Reverse proxy and load balancer
- **PM2**: Process manager for production

## Data Flow

### 1. User Registration Flow
```
Client → POST /users
  ↓
UsersController.create()
  ↓
UsersService.create()
  ↓
TypeORM → INSERT INTO users
  ↓
Response with User object
```

### 2. Measurement Processing Flow
```
Client → POST /measurements/process
  with frontImage, sideImage, height, gender
  ↓
MeasurementController.processMeasurement()
  ↓
MeasurementService.processAndSaveMeasurements()
  ↓
1. Save images to /uploads directory
  ↓
2. Execute Python script:
   python3 body_measurement.py front.jpg side.jpg 175 male
  ↓
3. Python/MediaPipe:
   - Load images
   - Detect pose landmarks (33 points)
   - Calculate pixel distances
   - Convert to centimeters
   - Return JSON with measurements
  ↓
4. Parse Python output (JSON)
  ↓
5. Create Measurement entity
  ↓
6. TypeORM → INSERT INTO measurements
  ↓
Response with Measurement object + 12 body measurements
```

### 3. Share with Tailor Flow
```
Client → POST /measurements/share
  with measurementId, tailorId, userId
  ↓
MeasurementController.shareMeasurement()
  ↓
MeasurementService.shareMeasurement()
  ↓
1. Validate ownership
2. Check tailor exists
3. Create SharedMeasurement
  ↓
TypeORM → INSERT INTO shared_measurements
  ↓
Tailor can now access measurement via
GET /tailors/:id/measurements
```

## Database Schema

### Users Table
```sql
users (
  id              UUID PRIMARY KEY,
  firstName       VARCHAR(100),
  lastName        VARCHAR(100),
  email           VARCHAR UNIQUE,
  phoneNumber     VARCHAR(20),
  gender          ENUM('male', 'female'),
  height          DECIMAL(5,2),
  weight          DECIMAL(5,2),
  dateOfBirth     DATE,
  address         TEXT,
  city            VARCHAR(100),
  country         VARCHAR(100),
  profileImage    TEXT,
  isActive        BOOLEAN DEFAULT true,
  createdAt       TIMESTAMP,
  updatedAt       TIMESTAMP
)
```

### Measurements Table
```sql
measurements (
  id                    UUID PRIMARY KEY,
  userId                UUID FOREIGN KEY → users(id),
  height                DECIMAL(5,2),
  shoulderWidth         DECIMAL(5,2),
  chestCircumference    DECIMAL(5,2),
  waistCircumference    DECIMAL(5,2),
  hipCircumference      DECIMAL(5,2),
  sleeveLength          DECIMAL(5,2),
  upperArmLength        DECIMAL(5,2),
  neckCircumference     DECIMAL(5,2),
  inseam                DECIMAL(5,2),
  torsoLength           DECIMAL(5,2),
  bicepCircumference    DECIMAL(5,2),
  wristCircumference    DECIMAL(5,2),
  thighCircumference    DECIMAL(5,2),
  frontImageUrl         TEXT,
  sideImageUrl          TEXT,
  metadata              JSON,
  confidence            JSON,
  notes                 TEXT,
  isFavorite            BOOLEAN DEFAULT false,
  createdAt             TIMESTAMP,
  updatedAt             TIMESTAMP
)
```

### Tailors Table
```sql
tailors (
  id              UUID PRIMARY KEY,
  businessName    VARCHAR(100),
  ownerName       VARCHAR(100),
  email           VARCHAR UNIQUE,
  phoneNumber     VARCHAR(20),
  address         TEXT,
  city            VARCHAR(100),
  country         VARCHAR(100),
  bio             TEXT,
  profileImage    TEXT,
  specialties     TEXT[],
  rating          DECIMAL(3,2) DEFAULT 0,
  totalOrders     INTEGER DEFAULT 0,
  isActive        BOOLEAN DEFAULT true,
  isVerified      BOOLEAN DEFAULT false,
  createdAt       TIMESTAMP,
  updatedAt       TIMESTAMP
)
```

### Shared Measurements Table
```sql
shared_measurements (
  id              UUID PRIMARY KEY,
  userId          UUID FOREIGN KEY → users(id),
  measurementId   UUID FOREIGN KEY → measurements(id),
  tailorId        UUID FOREIGN KEY → tailors(id),
  status          ENUM('pending', 'viewed', 'accepted', 'rejected'),
  message         TEXT,
  tailorNotes     TEXT,
  viewedAt        TIMESTAMP,
  sharedAt        TIMESTAMP
)
```

## MediaPipe AI Engine

### Pose Detection Process

1. **Image Input**: Receives front and side body images
2. **Pose Detection**: Identifies 33 body landmarks including:
   - Nose (0)
   - Shoulders (11, 12)
   - Elbows (13, 14)
   - Wrists (15, 16)
   - Hips (23, 24)
   - Knees (25, 26)
   - Ankles (27, 28)
3. **Measurement Extraction**:
   - Calculate pixel distances between landmarks
   - Use height as reference for scale
   - Convert pixels to centimeters
   - Apply gender-specific ratios
4. **Output**: JSON with 12+ body measurements

### Accuracy Factors
- Image quality
- Lighting conditions
- Clothing fit (tight-fitting recommended)
- Pose (standing straight, arms at sides)
- Full body visibility

## Security Features

### Current Implementation
- Input validation (class-validator)
- SQL injection prevention (TypeORM parameterized queries)
- File upload restrictions (size, type)
- CORS configuration
- Error handling and logging

### Recommended Additions for Production
- JWT authentication
- Rate limiting
- API keys for external access
- Helmet.js for HTTP headers
- Request encryption (HTTPS only)
- Role-based access control (RBAC)

## Scalability Considerations

### Horizontal Scaling
- Stateless design allows multiple instances
- Load balancer distributes traffic
- Shared file storage for uploads (S3, Cloud Storage)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database indexes

### Caching Strategy
- Redis for session management
- Cache frequently accessed measurements
- CDN for static assets

### Asynchronous Processing
- Queue system for measurement processing (Bull, Redis)
- Background jobs for heavy computations
- Webhook notifications

## Monitoring and Logging

### Application Monitoring
- PM2 monitoring
- Custom health checks
- Error tracking (Sentry)

### Database Monitoring
- Query performance analysis
- Connection pool monitoring
- Backup automation

### Infrastructure Monitoring
- Server metrics (CPU, memory, disk)
- Network monitoring
- Uptime monitoring

## Deployment Strategies

### Blue-Green Deployment
- Maintain two identical production environments
- Switch traffic after testing new version
- Instant rollback capability

### Canary Deployment
- Gradually roll out changes to subset of users
- Monitor performance and errors
- Full deployment if successful

### Docker Swarm / Kubernetes
- Container orchestration
- Auto-scaling
- Self-healing

## Performance Optimization

### Backend
- Connection pooling
- Query optimization
- Caching frequently accessed data
- Compression (gzip)

### Database
- Proper indexing
- Query optimization
- Read replicas
- Partitioning for large tables

### AI Processing
- Parallel processing for multiple requests
- GPU acceleration for MediaPipe (optional)
- Image compression before processing

## Future Enhancements

- Real-time measurement updates via WebSockets
- Machine learning model fine-tuning with user data
- 3D body model generation
- AR visualization
- Size recommendation engine
- Integration with tailoring management systems
- Mobile SDK for direct integration

