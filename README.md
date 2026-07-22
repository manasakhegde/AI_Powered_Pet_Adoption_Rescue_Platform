# Pet Adoption and Rescue Platform

A full-stack web application for managing pet adoptions and rescue operations.

## Tech Stack

- **Backend**: Java Spring Boot with Maven
- **Frontend**: React with Node.js
- **Database**: MongoDB
- **CI/CD**: Jenkins
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Java 11+
- Node.js 14+
- MongoDB 4.4+
- Docker & Docker Compose

### Using Docker Compose (Recommended)

```bash
# Clone and navigate
git clone <repo-url>
cd pet-adoption-platform

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Access the application
# Frontend:  http://localhost:3000
# API:       http://localhost:8080/api
# DB Admin:  http://localhost:8081
```

### Local Development

#### Backend
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

#### Frontend
```bash
cd Frontend
npm install
npm start
```

## Database

MongoDB collections:
- `pets` - Pet listings
- `users` - User accounts
- `adoptions` - Adoption applications
- `rescues` - Rescue operations

**Default credentials**:
- Username: admin
- Password: password

## API Endpoints

Base URL: `http://localhost:8080/api`

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/available` - Get available pets
- `GET /api/pets/{id}` - Get pet details
- `POST /api/pets` - Create new pet
- `PUT /api/pets/{id}` - Update pet
- `DELETE /api/pets/{id}` - Delete pet
- `GET /api/pets/species/{species}` - Filter by species
- `GET /api/pets/location/{location}` - Filter by location

## Project Structure

```
.
├── Backend/                     # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── Frontend/                    # React frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── mongodb-init.js
└── README.md
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit: `git commit -m "Add feature description"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## Deployment

### Staging
```bash
docker-compose up -d
```

### Production (with Jenkins)
- Push to main branch
- Jenkins pipeline automatically builds and deploys

## Contributing

1. Follow the development workflow
2. Write tests for new features
3. Ensure all tests pass
4. Submit PR for review

## License

MIT License
