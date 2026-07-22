import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function UserProfilePage() {
  const [user] = React.useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    city: 'New York',
    state: 'NY',
    bio: 'Pet lover and animal rescuer',
  });

  const adoptions = [
    {
      id: '1',
      petName: 'Max',
      petType: 'Dog',
      applicationDate: '2024-01-15',
      status: 'Approved',
    },
    {
      id: '2',
      petName: 'Luna',
      petType: 'Cat',
      applicationDate: '2024-01-20',
      status: 'Pending',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* User Info */}
      <div className="col-span-1">
        <div className="card">
          <div className="text-center mb-6">
            <div className="bg-blue-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4">
              <FaUser className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-600">{user.bio}</p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{user.city}, {user.state}</p>
              </div>
            </div>
          </div>

          <button className="w-full btn-primary mt-6">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Adoption History */}
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-3xl font-bold mb-6">My Adoptions</h2>
        
        <div className="space-y-4">
          {adoptions.map((adoption) => (
            <div key={adoption.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{adoption.petName}</h3>
                  <p className="text-gray-600">{adoption.petType}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Applied: {new Date(adoption.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-white font-semibold ${
                  adoption.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {adoption.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
