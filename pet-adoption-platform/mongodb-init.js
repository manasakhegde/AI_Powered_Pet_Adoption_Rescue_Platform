// Initialize MongoDB database with collections and indexes

db = db.getSiblingDB('Pet_adoption_platform');

// Create collections
db.createCollection('pets');
db.createCollection('users');
db.createCollection('adoptions');
db.createCollection('rescues');

// Create indexes for pets collection
db.pets.createIndex({ "adoptionStatus": 1 });
db.pets.createIndex({ "species": 1 });
db.pets.createIndex({ "rescueCenter": 1 });
db.pets.createIndex({ "location": 1 });
db.pets.createIndex({ "microchipId": 1 }, { unique: true, sparse: true });
db.pets.createIndex({ "registrationDate": -1 });

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { sparse: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "userType": 1 });
db.users.createIndex({ "active": 1 });

// Create indexes for adoptions collection
db.adoptions.createIndex({ "petId": 1 });
db.adoptions.createIndex({ "adopterId": 1 });
db.adoptions.createIndex({ "rescueCenterId": 1 });
db.adoptions.createIndex({ "applicationStatus": 1 });
db.adoptions.createIndex({ "applicationDate": -1 });
db.adoptions.createIndex({ "paymentStatus": 1 });

// Create sample pet data (optional)
db.pets.insertMany([
  {
    "name": "Max",
    "species": "Dog",
    "breed": "Golden Retriever",
    "age": 3,
    "gender": "Male",
    "size": "Large",
    "color": "Golden",
    "description": "Friendly and energetic Golden Retriever",
    "healthStatus": "Healthy",
    "vaccinated": true,
    "neutered": true,
    "adoptionStatus": "Available",
    "rescueCenter": "Happy Paws Rescue",
    "location": "New York",
    "adoptionFee": 150,
    "registrationDate": new Date(),
    "lastUpdated": new Date(),
    "viewCount": 0
  },
  {
    "name": "Luna",
    "species": "Cat",
    "breed": "Siamese",
    "age": 2,
    "gender": "Female",
    "size": "Small",
    "color": "Cream and Brown",
    "description": "Playful and affectionate Siamese cat",
    "healthStatus": "Healthy",
    "vaccinated": true,
    "neutered": true,
    "adoptionStatus": "Available",
    "rescueCenter": "Feline Friends",
    "location": "Los Angeles",
    "adoptionFee": 100,
    "registrationDate": new Date(),
    "lastUpdated": new Date(),
    "viewCount": 0
  }
]);

// Create admin user
db.users.insertOne({
  "email": "admin@petadoption.com",
  "password": "$2a$10$dXJ3SW6G7P50eS/6A2btjOmsVQSHR9L9Oi0GEjjjRm3vc3p0H/p2e",  // hashed 'admin'
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN",
  "userType": "ADMIN",
  "emailVerified": true,
  "active": true,
  "createdAt": new Date(),
  "status": "ACTIVE"
});

print("Pet Adoption Platform database initialized successfully!");
