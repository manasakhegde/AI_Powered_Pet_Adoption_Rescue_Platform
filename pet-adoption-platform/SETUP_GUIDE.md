# Pet Adoption Platform - Setup Guide

## Prerequisites

### Required
- Java 11 or higher
- Node.js 14 or higher
- Maven 3.6 or higher
- Docker & Docker Compose
- Git

### Optional
- MongoDB Compass (for database management)
- Postman (for API testing)
- Jenkins (for CI/CD)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pet-adoption-platform
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Update .env with your configuration
# Important: Change JWT_SECRET and database credentials
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# The backend will start on http://localhost:8080
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# The frontend will start on http://localhost:3000
```

## Docker Setup (Recommended)

### Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### What's Started

- **MongoDB** (port 27017): Database
- **MongoDB Express** (port 8081): Admin UI
- **Backend** (port 8080): Spring Boot API
- **Frontend** (port 3000): React Application

### Accessing Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- MongoDB Express: http://localhost:8081
- Swagger UI: http://localhost:8080/api/swagger-ui.html

## Database Setup

### Using Docker Compose

The database is automatically initialized with sample data when running `docker-compose up`.

### Manual MongoDB Setup

```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017

# Run initialization script
mongosh mongodb://admin:password@localhost:27017 < mongodb-init.js
```

## Testing

### Backend Tests

```bash
cd backend

# Run unit tests
mvn test

# Run tests with coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Building for Production

### Backend

```bash
cd backend
mvn clean package -DskipTests
```

### Frontend

```bash
cd frontend
npm run build
```

## Docker Images

### Build Images

```bash
# Build backend image
docker build -t pet-adoption-backend:1.0.0 ./backend

# Build frontend image
docker build -t pet-adoption-frontend:1.0.0 ./frontend
```

### Run Images

```bash
# Run backend
docker run -p 8080:8080 -e SPRING_DATA_MONGODB_URI=mongodb://... pet-adoption-backend:1.0.0

# Run frontend
docker run -p 3000:3000 -e REACT_APP_API_URL=http://localhost:8080/api pet-adoption-frontend:1.0.0
```

## Jenkins CI/CD Setup

### Prerequisites

- Jenkins server running
- Docker installed on Jenkins agent
- GitHub/GitLab webhook configured

### Configuration

1. Create a new Pipeline job in Jenkins
2. Set the repository URL
3. Point to the `Jenkinsfile`
4. Configure build triggers (webhooks)
5. Set up credentials (Docker Hub, SonarQube, etc.)

### Running the Pipeline

```bash
# Push to main branch to trigger the pipeline
git push origin main
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker logs pet-adoption-mongodb

# Verify connection
mongosh mongodb://admin:password@localhost:27017
```

### Backend Not Starting

```bash
# Check logs
docker logs pet-adoption-backend

# Verify database is ready
curl http://localhost:27017
```

### Frontend Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check logs
docker logs pet-adoption-frontend
```

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Key Endpoints

#### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/{id}` - Get pet by ID
- `POST /api/pets` - Create new pet
- `PUT /api/pets/{id}` - Update pet
- `DELETE /api/pets/{id}` - Delete pet

#### Adoptions
- `GET /api/adoptions` - Get all adoptions
- `POST /api/adoptions` - Submit adoption application
- `GET /api/adoptions/{id}` - Get adoption by ID

#### Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile

## Deployment

### AWS Deployment

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag pet-adoption-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/pet-adoption-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/pet-adoption-backend:latest
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs
3. Create an issue on GitHub
4. Contact the development team

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Commit and push
5. Create a Pull Request

## License

MIT License - See LICENSE file for details
