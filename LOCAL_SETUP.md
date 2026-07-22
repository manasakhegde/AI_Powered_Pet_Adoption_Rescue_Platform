# Local Setup Without Docker (For Jenkins Users)

## Prerequisites Installation

### 1. Install Java 11 (JDK)

**Windows**:
- Download from [adoptopenjdk.net](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
- Install and remember the path (e.g., `C:\Program Files\Java\jdk-11.0.xx`)
- Set `JAVA_HOME` environment variable:
  - Right-click Computer → Properties → Advanced → Environment Variables
  - New → `JAVA_HOME` = `C:\Program Files\Java\jdk-11.0.xx`
  - Add to PATH: `%JAVA_HOME%\bin`
- Verify: `java -version`

**Mac**:
```bash
brew install openjdk@11
# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
# Add to ~/.zshrc or ~/.bash_profile if you want it permanent
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install openjdk-11-jdk
# Verify
java -version
```

---

### 2. Install Maven

**Windows**:
- Download from [maven.apache.org](https://maven.apache.org/download.cgi)
- Extract to folder (e.g., `C:\maven`)
- Add to PATH: `C:\maven\bin`
- Verify: `mvn -version`

**Mac**:
```bash
brew install maven
# Verify
mvn -version
```

**Linux**:
```bash
sudo apt-get install maven
# Verify
mvn -version
```

---

### 3. Install Node.js 14+

**Windows**:
- Download from [nodejs.org](https://nodejs.org/)
- Install (includes npm)
- Verify: `node -v` and `npm -v`

**Mac**:
```bash
brew install node
# Verify
node -v && npm -v
```

**Linux**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
# Verify
node -v && npm -v
```

---

### 4. Install MongoDB Community

**Windows**:
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Run installer
- Choose "Install MongoDB as a Service"
- It will auto-start
- Verify: Open PowerShell and run `mongosh`

**Mac**:
```bash
brew install mongodb-community
# Start MongoDB
brew services start mongodb-community
# Verify
mongosh
```

**Linux (Ubuntu)**:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
# Start MongoDB
sudo systemctl start mongod
# Verify
mongosh
```

---

## Step 1: Initialize MongoDB Database

Open terminal/command prompt and run:

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Create admin user and collections
mongosh mongodb://localhost:27017 < mongodb-init.js
```

---

## Step 2: Start Backend (Java Spring Boot)

**Open Terminal/Command Prompt #1**:

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

Wait for this message:
```
Started PetAdoptionPlatformApplication in X.XXX seconds
```

Backend will run on: **http://localhost:8080/api**

---

## Step 3: Start Frontend (React)

**Open Terminal/Command Prompt #2**:

```bash
cd Frontend
npm install
npm start
```

Frontend will automatically open: **http://localhost:3000**

---

## Verify Everything Works

### Test 1: Open Frontend
Go to: http://localhost:3000

You should see:
- Navigation bar with "PetAdopt"
- Hero section
- "Why Adopt?" section

### Test 2: Test Backend API
```bash
curl http://localhost:8080/api/pets
```

Response should be JSON array of pets.

### Test 3: Create a Pet
```bash
curl -X POST http://localhost:8080/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestPet",
    "species": "Dog",
    "breed": "Labrador",
    "age": 3,
    "adoptionStatus": "Available"
  }'
```

---

## MongoDB Management (GUI)

**Option 1: MongoDB Compass** (Recommended)
- Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- Connect to: `mongodb://admin:password@localhost:27017`
- Browse your Pet_adoption_platform database

**Option 2: Command Line**
```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017/Pet_adoption_platform

# List all pets
db.pets.find().pretty()

# List all users
db.users.find().pretty()

# Delete a pet
db.pets.deleteOne({ _id: ObjectId("...") })
```

---

## Common Tasks

### Rebuild Backend
```bash
cd Backend
mvn clean install
```

### Test Backend
```bash
cd Backend
mvn test
```

### Build Backend JAR (for Jenkins)
```bash
cd Backend
mvn clean package -DskipTests
# JAR: Backend/target/pet-adoption-platform-1.0.0.jar
```

### Stop Frontend
```
Press Ctrl+C in Frontend terminal
```

### Stop Backend
```
Press Ctrl+C in Backend terminal
```

### Stop MongoDB

**Windows**:
```bash
net stop MongoDB
```

**Mac**:
```bash
brew services stop mongodb-community
```

**Linux**:
```bash
sudo systemctl stop mongod
```

---

## Jenkins Integration (Your Case)

### 1. Add Git Repository to Jenkins
```
New Item → Pipeline → Configure
Repository URL: <your-repo-url>
Branch: */main
```

### 2. Jenkins will use the Jenkinsfile
The `Jenkinsfile` in root directory contains:
- Build Backend (Maven)
- Build Frontend (npm)
- Run Tests
- Build Docker Images (if you add Docker to Jenkins)
- Deploy

### 3. Enable Jenkins Pipeline
```
Manage Jenkins → Configure System
Pipeline → Pipeline libraries
Add your repo as pipeline library
```

---

## Troubleshooting

### "Java not found"
```bash
# Check Java
java -version

# If error, set JAVA_HOME
# Windows: set JAVA_HOME=C:\Program Files\Java\jdk-11.0.xx
# Mac: export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### "mvn not found"
```bash
# Check Maven
mvn -version

# If error, add Maven to PATH
# Windows: Add C:\maven\bin to PATH
# Mac/Linux: brew install maven
```

### "npm not found"
```bash
# Check Node/npm
node -v
npm -v

# If error, reinstall Node from nodejs.org
```

### "MongoDB connection refused"
```bash
# Check if MongoDB is running
mongosh

# If error, start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### "Port 8080 already in use"
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

---

## Development Workflow

### Make Backend Changes
1. Edit Java files in `Backend/src`
2. Restart backend: `mvn spring-boot:run`
3. Test with: `curl http://localhost:8080/api/pets`

### Make Frontend Changes
1. Edit React files in `Frontend/src`
2. Frontend auto-reloads (npm start watches files)
3. See changes at: http://localhost:3000

### Push to Git for Jenkins
```bash
git add .
git commit -m "Your message"
git push origin main
# Jenkins automatically triggers build
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Start Backend | `cd Backend && mvn spring-boot:run` |
| Start Frontend | `cd Frontend && npm start` |
| Build Backend JAR | `cd Backend && mvn clean package -DskipTests` |
| Build Frontend | `cd Frontend && npm run build` |
| Test Backend | `cd Backend && mvn test` |
| Test Frontend | `cd Frontend && npm test` |
| Connect MongoDB | `mongosh mongodb://localhost:27017` |
| Initialize DB | `mongosh mongodb://localhost:27017 < mongodb-init.js` |
| Check Java | `java -version` |
| Check Maven | `mvn -version` |
| Check Node | `node -v && npm -v` |
| Check MongoDB | `mongosh` |

---

## Summary

**3 Things to Run Locally**:

1. **MongoDB** (database)
   - Windows: `net start MongoDB`
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

2. **Backend** (Java API)
   ```bash
   cd Backend && mvn spring-boot:run
   ```

3. **Frontend** (React)
   ```bash
   cd Frontend && npm start
   ```

Then access: http://localhost:3000

**For Jenkins**: Push to main branch, Jenkins automatically builds, tests, and creates Docker images using the Jenkinsfile!

---

## Next Steps

1. ✅ Install prerequisites (Java, Maven, Node, MongoDB)
2. ✅ Initialize database: `mongosh < mongodb-init.js`
3. ✅ Start Backend: `mvn spring-boot:run`
4. ✅ Start Frontend: `npm start`
5. ✅ Test at http://localhost:3000
6. ✅ Push to git → Jenkins handles CI/CD

No Docker needed for local development! 🎉
