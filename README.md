# Pet Adoption and Rescue Platform

A full-stack web application for managing pet adoptions and rescue operations.

## Tech Stack

- **Backend**: Node.js and Express
- **Frontend**: React
- **Database**: MongoDB
- **CI/CD**: Jenkins
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Node.js 14+
- MongoDB 4.4+
- Docker & Docker Compose (Optional)

### Using Docker Compose (Optional)

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
# API:       http://localhost:5000/api
# DB Admin:  http://localhost:8081
```

### Local Development

#### Backend
```bash
cd Backend
npm install
npm start
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
- `customers` - User accounts
- `admins` - Admin accounts
- `adoptions` - Adoption applications
- `rescue_centers` - Rescue operations
- `rescue_reports` - Rescue operation reports

**Default credentials**:
- Username: admin
- Password: password

## API Endpoints

Base URL: `http://localhost:5000/api`

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/{id}` - Get pet details
- `POST /api/pets` - Create new pet
- `PUT /api/pets/{id}` - Update pet
- `DELETE /api/pets/{id}` - Delete pet

## Project Structure

```
.
├── Backend/                     # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── server.js
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
