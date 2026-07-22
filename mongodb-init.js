// Initialize MongoDB database with collections and indexes

db = db.getSiblingDB('pet_adoption_platform');

// Create collections used by the Spring Boot backend
// The application models map to these names:
// - admins
// - customers
// - pets
// - rescue_centers
// - adoptions

db.createCollection('admins');
db.createCollection('customers');
db.createCollection('pets');
db.createCollection('rescue_centers');
db.createCollection('adoptions');

// Create indexes for admins collection
db.admins.createIndex({ "email": 1 }, { unique: true, sparse: true });
db.admins.createIndex({ "role": 1 });

// Create indexes for customers collection
db.customers.createIndex({ "email": 1 }, { unique: true, sparse: true });
db.customers.createIndex({ "phone": 1 }, { sparse: true });
db.customers.createIndex({ "role": 1 });

// Create indexes for pets collection
db.pets.createIndex({ "adoptionStatus": 1 });
db.pets.createIndex({ "species": 1 });
db.pets.createIndex({ "rescueCenter": 1 });
db.pets.createIndex({ "location": 1 });
db.pets.createIndex({ "microchipId": 1 }, { unique: true, sparse: true });
db.pets.createIndex({ "registrationDate": -1 });

// Create indexes for rescue centers collection
db.rescue_centers.createIndex({ "email": 1 }, { sparse: true });
db.rescue_centers.createIndex({ "city": 1 });
db.rescue_centers.createIndex({ "verificationStatus": 1 });
db.rescue_centers.createIndex({ "active": 1 });

// Create indexes for adoptions collection
db.adoptions.createIndex({ "petId": 1 });
db.adoptions.createIndex({ "adopterId": 1 });
db.adoptions.createIndex({ "rescueCenterId": 1 });
db.adoptions.createIndex({ "applicationStatus": 1 });
db.adoptions.createIndex({ "applicationDate": -1 });
db.adoptions.createIndex({ "paymentStatus": 1 });

// Seed a default admin account in the same collection the backend uses
const adminExists = db.admins.findOne({ email: 'admin@gmail.com' });
if (!adminExists) {
  db.admins.insertOne({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',
    password: '$2a$10$8K1p/a0dL0l3YyR9hY1zqeqHs3uVxvL8l.SiW3t3L1xJb3eQp1VdK',
    role: 'ADMIN',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null
  });
}

print('Pet Adoption Platform database initialized successfully!');
