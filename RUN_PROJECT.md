# How to Run Pet Adoption Platform

## Option 1: Docker Compose (Easiest - Recommended) ⭐

### Step 1: Install Prerequisites
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Restart your computer after installation

### Step 2: Run the Project
```bash
# Navigate to project folder
cd pet-adoption-platform

# Start all services
docker-compose up -d
```

### Step 3: Wait for Services to Start
Wait about 30 seconds for all containers to start up.

### Step 4: Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API** | http://localhost:8080/api | - |
| **MongoDB Admin** | http://localhost:8081 | admin / password |

### Step 5: Test the Application
```bash
# Get all pets
curl http://localhost:8080/api/pets

# Get available pets
curl http://localhost:8080/api/pets/available
```

### Stop Services
```bash
docker-compose down
```

---

## Option 2: Local Development (Windows/Mac/Linux)

### Prerequisites Installation

#### Windows
1. Download **JDK 11** from [adoptopenjdk.net](https://adoptopenjdk.net/)
   - Install and set `JAVA_HOME` environment variable
2. Download **Maven** from [maven.apache.org](https://maven.apache.org/download.cgi)
   - Add Maven to PATH
3. Download **Node.js 14+** from [nodejs.org](https://nodejs.org/)
4. Download **MongoDB Community** from [mongodb.com](https://www.mongodb.com/try/download/community)

#### Mac
```bash
# Using Homebrew
brew install openjdk@11
brew install maven
brew install node
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Java 11
sudo apt-get install openjdk-11-jdk

# Maven
sudo apt-get install maven

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Step 1: Start MongoDB

**Windows (Command Prompt)**:
```bash
# Make sure MongoDB is installed, then start it:
net start MongoDB
```

**Mac/Linux (Terminal)**:
```bash
mongod
```

Or using Docker:
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:5.0
```

### Step 2: Setup Database

Open a new terminal/command prompt:

**Windows**:
```bash
mongosh mongodb://admin:password@localhost:27017
```

**Mac/Linux**:
```bash
mongosh mongodb://admin:password@localhost:27017
```

Then run:
```bash
# In mongosh shell
mongosh mongodb://admin:password@localhost:27017 < mongodb-init.js
```

### Step 3: Start Backend

Open a new terminal/command prompt:

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

Wait for: `Started PetAdoptionPlatformApplication in X.XXX seconds`

Backend runs on: **http://localhost:8080/api**

### Step 4: Start Frontend

Open a new terminal/command prompt:

```bash
cd Frontend
npm install
npm start
```

Frontend automatically opens on: **http://localhost:3000**

### Step 5: All Services Running
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- MongoDB: http://localhost:27017

---

## Option 3: Individual Services (Advanced)

### Run Backend Only
```bash
cd Backend
mvn spring-boot:run
```

### Run Frontend Only
```bash
cd Frontend
npm start
```

### Connect to MongoDB
```bash
# Change connection string in Backend/src/main/resources/application.yml
# Or use Docker for MongoDB only:
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:5.0
```

---

## Verify Everything Works

### Test Backend
```bash
# In terminal/command prompt
curl http://localhost:8080/api/pets
```

Expected response: JSON array of pets

### Test Frontend
Go to: http://localhost:3000

You should see:
- Navigation bar with "PetAdopt" logo
- Hero section with "Find Your Perfect Companion"
- "Why Adopt?" section with features
- "Browse Pets" button

### Check MongoDB
Go to: http://localhost:8081 (if using Docker Compose)
- Login: admin / password
- Navigate to Pet_adoption_platform database
- Check pets, users, adoptions collections

---

## Troubleshooting

### Port Already in Use

**Port 3000 (Frontend)**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**Port 8080 (Backend)**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

**Port 27017 (MongoDB)**:
```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :27017
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh mongodb://admin:password@localhost:27017

# If fails, restart MongoDB
# Windows: net restart MongoDB
# Mac/Linux: sudo systemctl restart mongod
```

### Java Not Found
```bash
# Check Java version
java -version

# If error, set JAVA_HOME
# Windows: set JAVA_HOME=C:\Program Files\Java\jdk-11.0.xx
# Mac/Linux: export JAVA_HOME=/usr/libexec/java_home -v 11
```

### npm Install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf Frontend/node_modules

# Reinstall
cd Frontend
npm install
```

---

## Development Workflow

### Make Changes
1. Edit code in your IDE
2. Frontend: Changes auto-reload (npm start watches files)
3. Backend: Restart with `mvn spring-boot:run` or use auto-reload plugin

### View Logs

**Backend logs**:
```bash
# In Backend terminal - logs print automatically
```

**Frontend logs**:
```bash
# In Frontend terminal - logs print automatically
```

**Docker logs**:
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
docker-compose logs -f mongodb      # Database only
```

### Test APIs
```bash
# Get all pets
curl http://localhost:8080/api/pets

# Get available pets
curl http://localhost:8080/api/pets/available

# Get pet by species
curl http://localhost:8080/api/pets/species/Dog

# Create new pet
curl -X POST http://localhost:8080/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Buddy",
    "species":"Dog",
    "breed":"Beagle",
    "age":2,
    "adoptionStatus":"Available"
  }'
```

---

## Build for Production

### Build Backend JAR
```bash
cd Backend
mvn clean package -DskipTests
# JAR created at: Backend/target/pet-adoption-platform-1.0.0.jar
```

### Build Frontend
```bash
cd Frontend
npm run build
# Built files at: Frontend/build/
```

### Create Docker Images
```bash
# Build backend image
docker build -t pet-adoption-backend:1.0.0 ./Backend

# Build frontend image
docker build -t pet-adoption-frontend:1.0.0 ./Frontend

# Run images
docker run -p 8080:8080 pet-adoption-backend:1.0.0
docker run -p 3000:3000 pet-adoption-frontend:1.0.0
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| **Start everything** | `docker-compose up -d` |
| **Stop everything** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |
| **Backend build** | `cd Backend && mvn clean install` |
| **Backend run** | `mvn spring-boot:run` |
| **Backend test** | `mvn test` |
| **Frontend install** | `cd Frontend && npm install` |
| **Frontend run** | `npm start` |
| **Frontend test** | `npm test` |
| **Frontend build** | `npm run build` |
| **Create JAR** | `mvn clean package -DskipTests` |
| **Check Java** | `java -version` |
| **Check Node** | `node -v && npm -v` |
| **Check MongoDB** | `mongosh mongodb://admin:password@localhost:27017` |

---

## Quick Start Summary

**Fastest way to run** (Docker):
```bash
docker-compose up -d
# Open http://localhost:3000
```

**Local development** (if Docker not available):
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd Backend && mvn spring-boot:run

# Terminal 3: Frontend
cd Frontend && npm start
```

---

## Need Help?

Check these files for more info:
- `QUICK_START.md` - 5-minute quick start
- `SETUP_GUIDE.md` - Detailed setup
- `ARCHITECTURE.md` - System design
- `README.md` - Project overview

Happy coding! 🐾
