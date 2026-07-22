# Quick Start Guide - 5 Minutes

## Option 1: Docker Compose (Easiest)

```bash
# 1. Clone
git clone <repo-url>
cd pet-adoption-platform

# 2. Start services
docker-compose up -d

# 3. Access
# Frontend:  http://localhost:3000
# API:       http://localhost:8080/api
# DB Admin:  http://localhost:8081
```

## Option 2: Local Development

### Backend
```bash
cd Backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

### Frontend
```bash
cd Frontend
npm install
npm start
# Runs on http://localhost:3000
```

### MongoDB
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:5.0
```

## Useful Commands

### Docker Compose
```bash
docker-compose up -d       # Start
docker-compose logs -f     # View logs
docker-compose down        # Stop
docker-compose restart     # Restart
```

### Backend (Maven)
```bash
mvn clean install          # Build
mvn spring-boot:run        # Run
mvn test                   # Test
```

### Frontend (Node)
```bash
npm install                # Install
npm start                  # Run dev server
npm run build              # Build for production
npm test                   # Test
```

## Default Credentials

**MongoDB**:
- Username: admin
- Password: password

**MongoDB Express**: http://localhost:8081
- Username: admin
- Password: password

**Admin User**:
- Email: admin@petadoption.com
- Password: admin

## Sample API Calls

```bash
# Get all pets
curl http://localhost:8080/api/pets

# Get available pets
curl http://localhost:8080/api/pets/available

# Create pet
curl -X POST http://localhost:8080/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "Dog",
    "breed": "Golden Retriever",
    "age": 3,
    "adoptionStatus": "Available"
  }'
```

## Next Steps

1. ✅ Get running with Docker Compose
2. 📖 Read SETUP_GUIDE.md for detailed setup
3. 🧪 Run tests
4. 🔧 Make your first change
5. 🚀 Deploy

Need help? Check SETUP_GUIDE.md or troubleshooting sections.
