# Pet Adoption Platform - Setup Guide

## Prerequisites

### Required
- Java 11 or higher (JDK 11+)
- Node.js 14 or higher
- Maven 3.6 or higher
- Docker & Docker Compose
- Git

## Local Development Setup

### 1. Environment Configuration

```bash
cp .env.example .env
# Update .env with your configuration
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# The backend will start on http://localhost:8080
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm start

# The frontend will start on http://localhost:3000
```

## Docker Setup (Recommended)

### Quick Start

```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
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
  - Username: admin
  - Password: password

## Database Setup

The database is automatically initialized with sample data when running Docker Compose.

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
cd Backend
mvn test
```

### Frontend Tests

```bash
cd Frontend
npm test
```

## Building for Production

### Backend

```bash
cd Backend
mvn clean package -DskipTests
```

### Frontend

```bash
cd Frontend
npm run build
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
4. Configure build triggers
5. Set up credentials (Docker Hub, SonarQube, etc.)

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

# Verify port availability
lsof -i :8080
```

### Frontend Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :3000
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs
3. Check documentation files
4. Create an issue on GitHub
