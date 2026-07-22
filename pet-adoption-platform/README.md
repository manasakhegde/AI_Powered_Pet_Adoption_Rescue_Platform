# Pet Adoption and Rescue Platform

A full-stack web application for managing pet adoptions and rescue operations.

## Tech Stack

- **Backend**: Java Spring Boot with Maven
- **Frontend**: React with Node.js
- **Database**: MongoDB
- **CI/CD**: Jenkins
- **Containerization**: Docker

## Project Structure

```
pet-adoption-platform/
├── backend/                 # Spring Boot application
├── frontend/                # React application
├── docker-compose.yml       # Docker services orchestration
├── Jenkinsfile              # CI/CD pipeline
└── README.md
```

## Quick Start

### Prerequisites
- Java 11+
- Node.js 14+
- MongoDB 4.4+
- Docker & Docker Compose

### Development Setup

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Using Docker Compose
```bash
docker-compose up -d
```

## API Documentation

Base URL: `http://localhost:8080/api`

### Endpoints
- `GET /api/pets` - Get all pets
- `POST /api/pets` - Create new pet listing
- `GET /api/adoptions` - Get adoption records
- `POST /api/adoptions` - Submit adoption application

## Database

MongoDB collections:
- `pets` - Pet listings
- `users` - User accounts
- `adoptions` - Adoption applications
- `rescues` - Rescue operations

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## License

MIT License
