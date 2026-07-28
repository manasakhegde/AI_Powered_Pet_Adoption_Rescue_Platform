**🏡🐾 FurEver Home**

FurEver Home is a pet adoption and rescue platform designed to connect rescued animals with loving forever families. Our mission is to make pet adoption simple, accessible, and impactful while supporting rescue organizations and promoting responsible pet ownership. A full-stack web application for managing pet adoptions and rescue operations.

**🌟 About the Project**

Every year, thousands of pets are abandoned or left without a home. FurEver Home bridges the gap between rescue shelters and compassionate adopters by providing a secure and user-friendly platform where users can:

🐶 Browse pets available for adoption

🐱 View detailed pet profiles with photos and health information

❤️ Submit adoption requests.

🏥 Connect with verified rescue organizations and shelters

📍 Find pets based on location and preferences

🔔 Receive updates on adoption requests and rescued pets

**✨ Features**

🐶 Browse pets available for adoption

🐱 Detailed pet profiles with images and health information

❤️ Submit adoption requests

🏥 Rescue organization registration and management

📍 Search pets by breed, age, and location

🔐 Secure user authentication

👤 User profile management

📱 Responsive design for desktop and mobile

🔔 Adoption request tracking

📧 Contact shelters directly

## 🛠Tech Stack

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


