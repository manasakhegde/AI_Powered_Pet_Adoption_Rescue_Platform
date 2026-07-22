import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaUsers, FaCog, FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa';

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'HELP US CREATE A',
      highlight: 'BETTER WORLD FOR ANIMALS!',
      leftPet: '🐕',
      rightPet: '🐈'
    },
    {
      id: 2,
      title: 'EVERY PET DESERVES',
      highlight: 'A LOVING HOME!',
      leftPet: '�',
      rightPet: '🐕'
    },
    {
      id: 3,
      title: 'JOIN OUR MISSION TO',
      highlight: 'RESCUE AND REHOME PETS!',
      leftPet: '�',
      rightPet: '🐰'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaPaw className="text-2xl text-blue-600" />
          <span className="text-3xl font-bold text-blue-600">PetAdopt</span>
        </div>
        <span className="text-gray-600 font-semibold">Pet Adoption & Rescue Platform</span>
      </header>

      {/* Main Hero Section with Role Selection */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-8">
        <div className="container mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Find Your Perfect Companion</h1>
          <p className="text-xl text-gray-600 mb-12">
            Connect loving homes with animals in need. Choose your role to get started.
          </p>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Customer Card */}
            <Link to="/customer/login" className="group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white rounded-t-2xl shadow-lg group-hover:shadow-xl transition">
                <FaUsers className="text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Customer</h2>
              </div>
              <div className="bg-white p-8 rounded-b-2xl shadow-lg group-hover:shadow-xl transition border-2 border-blue-100">
                <ul className="space-y-3 mb-8 text-gray-700 text-left">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Browse available pets
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Apply for adoption
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Track applications
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Manage your profile
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Customer Login
                </button>
              </div>
            </Link>

            {/* Admin Card */}
            <Link to="/admin/login" className="group">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 text-white rounded-t-2xl shadow-lg group-hover:shadow-xl transition">
                <FaCog className="text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Admin</h2>
              </div>
              <div className="bg-white p-8 rounded-b-2xl shadow-lg group-hover:shadow-xl transition border-2 border-purple-100">
                <ul className="space-y-3 mb-8 text-gray-700 text-left">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Manage pet listings
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Review applications
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> Manage users
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> View statistics
                  </li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                  Admin Login
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Green Navigation Menu */}
      <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 flex justify-center gap-12 font-bold text-lg">
        <a href="#home" className="hover:text-yellow-300 transition">HOME</a>
        <a href="#about" className="hover:text-yellow-300 transition">ABOUT US</a>
        <a href="#services" className="hover:text-yellow-300 transition">SERVICES</a>
        <a href="#adoption" className="hover:text-yellow-300 transition">PET ADOPTION</a>
        <a href="#contact" className="hover:text-yellow-300 transition">CONTACT US</a>
      </nav>

      {/* Carousel Hero Section */}
      <section className="relative w-full h-96 bg-gradient-to-r from-blue-300 to-blue-400 overflow-hidden">
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-r from-blue-300 to-blue-200 flex items-center justify-center relative">
                {/* Left Pet */}
                <div className="absolute left-12 text-8xl opacity-90 animate-pulse">{slide.leftPet}</div>

                {/* Center Text */}
                <div className="flex flex-col items-center justify-center text-center z-10 px-16">
                  <h2 className="text-5xl font-bold text-gray-800 mb-2">{slide.title}</h2>
                  <p className="text-4xl font-bold text-red-600">{slide.highlight}</p>
                </div>

                {/* Right Pet */}
                <div className="absolute right-12 text-8xl opacity-90 animate-pulse">{slide.rightPet}</div>

                {/* Decorative elements */}
                <div className="absolute top-8 left-1/4 text-4xl opacity-20">🐾</div>
                <div className="absolute bottom-8 right-1/4 text-4xl opacity-20">🦴</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg z-20 transition"
        >
          <FaChevronLeft className="text-2xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg z-20 transition"
        >
          <FaChevronRight className="text-2xl" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 text-green-700">Why Adopt?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition border-t-4 border-green-600">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Save a Life</h3>
              <p className="text-gray-600">
                Every adoption helps make room for another animal in need of rescue and care.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition border-t-4 border-green-600">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Find Your Match</h3>
              <p className="text-gray-600">
                Browse through thousands of adoptable pets and find the perfect match for your family.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition border-t-4 border-green-600">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Vetted & Healthy</h3>
              <p className="text-gray-600">
                All our pets are vaccinated, examined, and ready for their new homes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16 px-8 text-center text-white">
        <h2 className="text-5xl font-bold mb-4">Ready to Adopt?</h2>
        <p className="text-2xl mb-8 text-green-100">
          Browse our available pets and start your adoption journey today.
        </p>
        <Link to="/customer/login" className="bg-white text-green-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg inline-block">
          Start Browsing
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaPaw className="text-green-500" /> PetAdopt
              </h3>
              <p className="text-gray-400">Connecting loving families with perfect pet companions.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-green-400">Quick Links</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#adoption" className="hover:text-white transition">Browse Pets</a></li>
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-green-400">Resources</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="#services" className="hover:text-white transition">Services</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-green-400">Support</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#legal" className="hover:text-white transition">Legal</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pet Adoption Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
