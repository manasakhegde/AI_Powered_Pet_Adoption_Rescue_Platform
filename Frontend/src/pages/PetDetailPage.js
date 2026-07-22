import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPaw, FaArrowLeft } from 'react-icons/fa';

function PetDetailPage() {
  const { id } = useParams();

  // Mock pet data - replace with API call
  const pet = {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    size: 'Large',
    color: 'Golden',
    description: 'Friendly and energetic Golden Retriever',
    healthStatus: 'Healthy',
    vaccinated: true,
    neutered: true,
    adoptionStatus: 'Available',
    adoptionFee: 150,
    location: 'New York',
  };

  return (
    <div>
      <Link to="/pets" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <FaArrowLeft />
        Back to Pets
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pet Image */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96 flex items-center justify-center">
          <FaPaw className="text-8xl text-gray-400" />
        </div>

        {/* Pet Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{pet.name}</h1>
          
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Species:</span>
                <span>{pet.species}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Breed:</span>
                <span>{pet.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Age:</span>
                <span>{pet.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Gender:</span>
                <span>{pet.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Size:</span>
                <span>{pet.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Color:</span>
                <span>{pet.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Location:</span>
                <span>{pet.location}</span>
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Health</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                <span className="text-green-600">{pet.healthStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Vaccinated:</span>
                <span>{pet.vaccinated ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Neutered:</span>
                <span>{pet.neutered ? '✓ Yes' : '✗ No'}</span>
              </div>
            </div>
          </div>

          {/* Adoption */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Adoption Fee</h2>
              <span className="text-3xl font-bold text-blue-600">${pet.adoptionFee}</span>
            </div>
            <button className="w-full btn-primary">
              Apply to Adopt
            </button>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">About {pet.name}</h2>
            <p className="text-gray-600 text-lg">{pet.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetailPage;
