import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaFilter } from 'react-icons/fa';

function PetsListPage() {
  const [filters, setFilters] = useState({
    species: '',
    size: '',
    location: '',
  });

  // Mock data - replace with API call
  const pets = [
    {
      id: '1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      size: 'Large',
      location: 'New York',
    },
    {
      id: '2',
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      age: 2,
      size: 'Small',
      location: 'Los Angeles',
    },
    {
      id: '3',
      name: 'Charlie',
      species: 'Dog',
      breed: 'Labrador',
      age: 4,
      size: 'Large',
      location: 'Chicago',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <div className="col-span-1">
        <div className="card sticky top-4">
          <div className="flex items-center gap-2 mb-6">
            <FaFilter />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Species</label>
              <select
                className="input-field text-sm"
                value={filters.species}
                onChange={(e) => setFilters({ ...filters, species: e.target.value })}
              >
                <option value="">All Species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
                <option value="bird">Bird</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Size</label>
              <select
                className="input-field text-sm"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              >
                <option value="">All Sizes</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Location</label>
              <select
                className="input-field text-sm"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="new-york">New York</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="chicago">Chicago</option>
              </select>
            </div>

            <button className="w-full btn-primary text-sm">Apply Filters</button>
          </div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="col-span-1 md:col-span-3">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Available Pets</h1>
          <p className="text-gray-600 mt-2">Found {pets.length} pets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="card hover:shadow-lg transition overflow-hidden">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-40 rounded-lg mb-4 flex items-center justify-center">
                <FaPaw className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-1">{pet.name}</h3>
              <p className="text-gray-600 text-sm">{pet.breed}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Species:</span>
                  <span className="font-semibold">{pet.species}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold">{pet.age} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold">{pet.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-semibold">{pet.location}</span>
                </div>
              </div>

              <button className="w-full btn-primary mt-4 text-sm">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PetsListPage;
