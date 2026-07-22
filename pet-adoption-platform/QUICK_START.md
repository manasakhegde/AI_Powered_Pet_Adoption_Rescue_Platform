# Pet Adoption Platform - Quick Start Guide

## 🚀 Start in 5 Minutes

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Clone and navigate
git clone <repo-url>
cd pet-adoption-platform

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend:  http://localhost:3000
# API:       http://localhost:8080/api
# DB Admin:  http://localhost:8081
```

### Option 2: Local Development

#### Start Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

#### Start Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

#### Start MongoDB
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:5.0
```

## 📋 Useful Commands

### Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (clean start)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Restart a service
docker-compose restart backend
```

### Backend (Maven)
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Test
mvn test

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Create JAR
mvn clean package -DskipTests
```

### Frontend (Node)
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build Docker image
docker build -t pet-adoption-frontend:latest .
```

### Database (MongoDB)
```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017

# Run initialization script
mongosh mongodb://admin:password@localhost:27017 < mongodb-init.js

# Backup database
mongodump --username admin --password password --authenticationDatabase admin

# Restore database
mongorestore --username admin --password password --authenticationDatabase admin dump/
```

## 🌐 API Endpoints Quick Reference

### Pets
```bash
# Get all pets
curl http://localhost:8080/api/pets

# Get available pets
curl http://localhost:8080/api/pets/available

# Get pet by ID
curl http://localhost:8080/api/pets/{id}

# Filter by species
curl http://localhost:8080/api/pets/species/Dog

# Filter by location
curl http://localhost:8080/api/pets/location/NewYork

# Create pet (POST)
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

### Adoptions
```bash
# Get all adoptions
curl http://localhost:8080/api/adoptions

# Submit adoption application (POST)
curl -X POST http://localhost:8080/api/adoptions \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "pet-id",
    "adopterId": "user-id",
    "adoptionReason": "I love dogs"
  }'
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill the process
kill -9 <PID>

# Check MongoDB connection
curl http://localhost:27017

# View logs
docker logs pet-adoption-backend
```

### Frontend won't load
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -i :3000

# View logs
docker logs pet-adoption-frontend
```

### MongoDB connection issues
```bash
# Check MongoDB container
docker ps | grep mongodb

# View MongoDB logs
docker logs pet-adoption-mongodb

# Test connection
mongosh mongodb://admin:password@localhost:27017
```

### Permission issues (Linux/Mac)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

## 📝 Configuration

### Change Database Credentials
Edit `.env`:
```env
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_URI=mongodb://your_username:your_password@mongodb:27017/Pet_adoption_platform
```

### Change API Port
Edit `backend/src/main/resources/application.yml`:
```yaml
server:
  port: 9000
```

### Change Frontend Port
Edit `frontend/package.json`:
```json
"start": "PORT=3001 react-scripts start"
```

### Change JWT Secret
Edit `.env`:
```env
JWT_SECRET=your-super-secret-key-here
```

## 📦 Technology Versions

- **Java**: 11+
- **Node.js**: 14+
- **Spring Boot**: 2.7.14
- **React**: 18.2.0
- **MongoDB**: 5.0
- **Docker**: Latest
- **Maven**: 3.6+

## 🔒 Default Credentials

### MongoDB
- **Username**: admin
- **Password**: password
- **Database**: Pet_adoption_platform

### MongoDB Express
- **Username**: admin
- **Password**: password
- **URL**: http://localhost:8081

### Admin User
- **Email**: admin@petadoption.com
- **Password**: admin

## 📚 More Information

- Full setup guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Architecture details: [ARCHITECTURE.md](ARCHITECTURE.md)
- Project structure: [PROJECT_STRUCTURE.txt](PROJECT_STRUCTURE.txt)
- Main README: [README.md](README.md)

## 🆘 Need Help?

1. **Check logs**: `docker-compose logs -f`
2. **Review**: SETUP_GUIDE.md troubleshooting section
3. **Verify**: All ports are accessible (3000, 8080, 27017)
4. **Restart**: `docker-compose down && docker-compose up -d`

## ✅ Verification Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] API responds at http://localhost:8080/api/pets
- [ ] MongoDB admin at http://localhost:8081
- [ ] Docker containers running: `docker ps`
- [ ] No port conflicts
- [ ] Environment variables set
- [ ] Database initialized with sample data

## 🎯 Next Steps

1. ✅ Get the app running locally
2. 📖 Review the architecture
3. 🧪 Run tests
4. 🔧 Make your first change
5. 🚀 Deploy to staging/production

Happy coding! 🐾
