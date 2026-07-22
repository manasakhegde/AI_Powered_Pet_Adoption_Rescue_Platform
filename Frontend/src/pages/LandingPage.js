import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaUsers, FaCog, FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa';
import petimage3 from '../petimage3.jpg';
import petimage4 from '../petimage4.jpg';
import petimage5 from '../petimage5.jpg';
import petimage6 from '../petimage6.jpg';

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      id: 1,
      title: 'Make ANIMAL WELFARE a global priority...',
      subtitle: 'to prevent the outbreak of future pandemics',
      leftImage: petimage3,
      rightImage: petimage4
    },
    {
      id: 2,
      title: 'EVERY PET DESERVES a loving home!',
      subtitle: 'Join us in making a difference in their lives',
      leftImage: petimage4,
      rightImage: petimage3
    },
    {
      id: 3,
      title: 'JOIN OUR MISSION to rescue and rehome pets!',
      subtitle: 'Together we can save more lives',
      leftImage: petimage5,
      rightImage: petimage6
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        setCurrentSlide((prev) => (prev + 1) % 3);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf6ee 0%, #ffffff 50%, #f5ece0 100%)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-8" style={{ borderBottom: '2px solid #e8d5c0' }}>
        <nav className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: '#6F4E37' }}>
            <FaPaw />
            <span>FurEver Home</span>
          </div>
          <p className="font-semibold" style={{ color: '#8B6347' }}>Pet Adoption & Rescue Platform</p>
          <div className="flex items-center gap-3">
            <Link to="/customer/login" className="text-white font-bold px-5 py-2 rounded-full text-sm transition shadow-md" style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
              Customer Login
            </Link>
            <Link to="/admin/login" className="text-white font-bold px-5 py-2 rounded-full text-sm transition shadow-md" style={{ background: 'linear-gradient(135deg, #3d2b1f, #5a3d2b)' }}>
              Admin Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Coffee Navigation Menu */}
      <nav className="text-white py-4 px-8 flex justify-center gap-12 font-bold text-lg sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #4a2c17 0%, #6F4E37 50%, #8B6347 100%)' }}>
        <a href="#home" className="transition cursor-pointer hover:opacity-75" style={{ color: '#f5deb3' }} onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>HOME</a>
        <a href="#how-it-works" className="transition cursor-pointer hover:opacity-75" style={{ color: '#f5deb3' }} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'}); }}>HOW IT WORKS</a>
        <a href="#why-choose-us" className="transition cursor-pointer hover:opacity-75" style={{ color: '#f5deb3' }} onClick={(e) => { e.preventDefault(); document.getElementById('why-choose-us').scrollIntoView({behavior: 'smooth'}); }}>WHY CHOOSE US</a>
        <Link to="/customer/login" className="transition hover:opacity-75" style={{ color: '#f5deb3' }}>PET ADOPTION</Link>
        <a href="#contact" className="transition cursor-pointer hover:opacity-75" style={{ color: '#f5deb3' }} onClick={(e) => { e.preventDefault(); document.getElementById('contact').scrollIntoView({behavior: 'smooth'}); }}>CONTACT US</a>
      </nav>

      {/* Carousel Hero Section */}
      <section
        id="home"
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100vh - 112px)', background: 'linear-gradient(135deg, #fdf6ee 0%, #ffffff 40%, #f0e4d4 100%)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute w-full h-full"
              style={{
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                zIndex: index === currentSlide ? 2 : 1,
              }}
            >
              <div className="w-full h-full flex items-center justify-between px-16 relative">

                {/* Left Pet Image */}
                <div className="flex-shrink-0 flex items-center justify-center h-full z-10">
                  <img
                    src={slide.leftImage}
                    alt="Pet"
                    className="object-cover rounded-full shadow-2xl"
                    style={{ width: '320px', height: '320px' }}
                  />
                </div>

                {/* Center Text */}
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 px-8">
                  <div className="text-5xl mb-4">🐾</div>
                  <h1 className="text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
                    {slide.title.split(' ').map((word, i) =>
                      ['ANIMAL', 'WELFARE', 'EVERY', 'PET', 'DESERVES', 'JOIN', 'MISSION'].includes(word) ? (
                        <span key={i} className="text-orange-500">{word} </span>
                      ) : (
                        <span key={i}>{word} </span>
                      )
                    )}
                  </h1>
                  <p className="text-2xl text-gray-500 mb-8">{slide.subtitle}</p>
                  <div className="flex gap-4">
                    <a href="/customer/login" className="text-white font-bold px-8 py-3 rounded-full shadow-lg transition text-lg" style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
                      Adopt Now
                    </a>
                    <a href="#how-it-works" className="font-bold px-8 py-3 rounded-full transition text-lg" style={{ border: '2px solid #6F4E37', color: '#6F4E37', background: 'rgba(111,78,55,0.05)' }}>
                      Learn More
                    </a>
                  </div>
                </div>

                {/* Right Pet Image */}
                <div className="flex-shrink-0 flex items-center justify-center h-full z-10">
                  <img
                    src={slide.rightImage}
                    alt="Pet"
                    className="object-cover rounded-full shadow-2xl"
                    style={{ width: '320px', height: '320px' }}
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-30 transition-all duration-200" style={{ color: '#6F4E37' }}>
          <FaChevronLeft className="text-xl" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-30 transition-all duration-200" style={{ color: '#6F4E37' }}>
          <FaChevronRight className="text-xl" />
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className="rounded-full transition-all duration-300"
              style={{ width: index === currentSlide ? '24px' : '8px', height: '8px', backgroundColor: index === currentSlide ? '#6F4E37' : '#c4a882' }} />
          ))}
        </div>

      </section>

      <section id="about" className="py-16 px-8" style={{ background: 'linear-gradient(135deg, #fdf6ee, #fff8f2)' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: '#6F4E37' }}>About Us</h2>
          <p className="text-center mb-12 max-w-3xl mx-auto text-lg" style={{ color: '#8B6347' }}>
            We are dedicated to connecting loving families with pets in need. Our mission is to provide a safe,
            transparent, and caring platform for pet adoption and rescue.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center bg-white p-8 rounded-2xl hover:shadow-lg transition" style={{ border: '2px solid #e8d5c0' }}>
              <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf0e6' }}>
                <FaPaw className="text-3xl" style={{ color: '#6F4E37' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#3d2b1f' }}>Thousands of Pets</h3>
              <p style={{ color: '#8B6347' }}>Browse and find your perfect companion from our verified listings</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl hover:shadow-lg transition" style={{ border: '2px solid #e8d5c0' }}>
              <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf0e6' }}>
                <FaUsers className="text-3xl" style={{ color: '#8B6347' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#3d2b1f' }}>Safe & Verified</h3>
              <p style={{ color: '#8B6347' }}>All pets are vetted, vaccinated and health-checked</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl hover:shadow-lg transition" style={{ border: '2px solid #e8d5c0' }}>
              <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf0e6' }}>
                <FaCog className="text-3xl" style={{ color: '#a07850' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#3d2b1f' }}>Easy Process</h3>
              <p style={{ color: '#8B6347' }}>Simple adoption process from start to finish</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-8" style={{ background: 'linear-gradient(135deg, #fff8f2 0%, #ffffff 50%, #fdf0e6 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">🐾</div>
            <h2 className="text-5xl font-extrabold mb-6" style={{ color: '#4a2c17' }}>How It Works</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#8B6347' }}>
              Our simple 4-step process makes pet adoption easy, transparent, and rewarding for everyone involved.
              From browsing to bringing your new companion home, we're with you every step of the way.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { num:'1', title:'Browse & Explore', desc:'Search our extensive database of adorable pets waiting for homes. Use advanced filters for breed, age, size, location, and vaccination status to find your perfect match.', tag:'🔍 Smart Search', bg:'#fdf0e6', border:'#e8c9a8', numBg:'linear-gradient(135deg,#6F4E37,#8B6347)' },
              { num:'2', title:'Connect & Learn', desc:'View comprehensive pet profiles with photos, medical history, personality traits, and special needs. Contact verified rescue centers and shelters directly for more information.', tag:'📋 Detailed Profiles', bg:'#fdf6ee', border:'#d4b896', numBg:'linear-gradient(135deg,#8B6347,#a07850)' },
              { num:'3', title:'Meet & Greet', desc:'Schedule in-person visits at rescue centers. Spend quality time with your potential new family member to ensure compatibility and a perfect fit for your home environment.', tag:'🤝 Safe Meetings', bg:'#fff8f2', border:'#e8d5c0', numBg:'linear-gradient(135deg,#a07850,#c4956a)' },
              { num:'4', title:'Adopt & Support', desc:'Complete the simple adoption process with our guidance. Receive lifetime support, training resources, veterinary recommendations, and join our caring community of pet parents.', tag:'❤️ Forever Support', bg:'#fdf0e6', border:'#e8c9a8', numBg:'linear-gradient(135deg,#4a2c17,#6F4E37)' },
            ].map(s => (
              <div key={s.num} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ border: `4px solid ${s.border}` }}>
                <div className="text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg" style={{ background: s.numBg }}>{s.num}</div>
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: '#3d2b1f' }}>{s.title}</h3>
                <p className="text-center leading-relaxed" style={{ color: '#8B6347' }}>{s.desc}</p>
                <div className="mt-6 text-center">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold" style={{ background: s.bg, color: '#6F4E37' }}>{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to="/customer/login" className="inline-block text-white font-bold px-12 py-4 rounded-full shadow-xl transition-all transform hover:scale-105 text-lg" style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
              Start Your Journey Today →
            </Link>
          </div>
        </div>
      </section>

      <section id="why-choose-us" className="py-20 px-8" style={{ background: '#ffffff' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-5xl font-extrabold mb-6" style={{ color: '#4a2c17' }}>Why Choose FurEver Home?</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#8B6347' }}>
              We're committed to making pet adoption safe, transparent, and rewarding for both pets and families.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-16">
            {[
              { icon: <FaCheckCircle className="text-4xl text-white" />, title:'Verified & Trusted', items:['Licensed & inspected shelters','Verified pet health records','Transparent adoption process'], bg:'linear-gradient(135deg,#fdf0e6,#f5dfc8)', border:'#e8c9a8', iconBg:'linear-gradient(135deg,#6F4E37,#8B6347)' },
              { icon: <FaUsers className="text-4xl text-white" />, title:'Health Guarantee', items:['Full veterinary examination','Up-to-date vaccinations','Spay/neuter services included'], bg:'linear-gradient(135deg,#fff8f2,#fdf0e6)', border:'#d4b896', iconBg:'linear-gradient(135deg,#8B6347,#a07850)' },
              { icon: <FaCog className="text-4xl text-white" />, title:'Lifetime Support', items:['24/7 support hotline','Training & behavior resources','Active pet parent community'], bg:'linear-gradient(135deg,#fdf6ee,#f5ece0)', border:'#e8d5c0', iconBg:'linear-gradient(135deg,#a07850,#c4956a)' },
            ].map(c => (
              <div key={c.title} className="group text-center p-10 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3" style={{ background: c.bg, border: `2px solid ${c.border}` }}>
                <div className="rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{ background: c.iconBg }}>{c.icon}</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#3d2b1f' }}>{c.title}</h3>
                <ul className="text-left space-y-2 mt-4">
                  {c.items.map(item => (
                    <li key={item} className="flex items-start">
                      <span className="mr-2" style={{ color: '#6F4E37' }}>✓</span>
                      <span style={{ color: '#8B6347' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-12 max-w-5xl mx-auto" style={{ background: 'linear-gradient(135deg, #fdf0e6, #fff8f2)', border: '2px solid #e8c9a8' }}>
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: '#4a2c17' }}>What Sets Us Apart</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { bg:'#f5dfc8', title:'AI-Powered Matching', desc:'Our smart algorithm helps match you with pets that fit your lifestyle, living situation, and preferences.' },
                { bg:'#e8d5c0', title:'Transparent Pricing', desc:'All adoption fees displayed in ₹ (rupees) with clear breakdowns. No hidden costs or surprise charges.' },
                { bg:'#d4c4b0', title:'Community Driven', desc:'Join thousands of happy pet parents. Share stories, tips, and support in our vibrant community.' },
                { bg:'#f0e4d4', title:'Ethical & Compassionate', desc:'We prioritize animal welfare above all. Every pet deserves love, care, and a forever home.' },
              ].map(item => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="rounded-full p-3 flex-shrink-0" style={{ background: item.bg }}>
                    <FaPaw style={{ color: '#6F4E37', width:'24px', height:'24px' }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2" style={{ color: '#3d2b1f' }}>{item.title}</h4>
                    <p style={{ color: '#8B6347' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 px-8" style={{ background: 'linear-gradient(135deg, #fdf6ee 0%, #fff8f2 50%, #f5ece0 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="text-5xl font-extrabold mb-6" style={{ color: '#4a2c17' }}>Get In Touch With Us</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#8B6347' }}>
              Have questions about pet adoption? Need guidance on finding the perfect companion?
              Our dedicated team is here to help you every step of the way. Reach out anytime!
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-12 rounded-3xl shadow-2xl" style={{ border: '2px solid #e8d5c0' }}>
              <h3 className="text-3xl font-bold mb-10 text-center" style={{ color: '#3d2b1f' }}>Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Address */}
                <div className="flex items-start space-x-5 p-6 rounded-2xl hover:shadow-lg transition" style={{ background: 'linear-gradient(135deg, #fdf6ee, #fdf0e6)', border: '2px solid #e8d5c0' }}>
                  <div className="p-4 rounded-full shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2" style={{ color: '#3d2b1f' }}>Office Location</h4>
                    <p className="text-lg" style={{ color: '#6F4E37' }}>Bangalore, Karnataka</p>
                    <p className="text-sm mt-2" style={{ color: '#a07850' }}>Visit us during business hours for in-person assistance</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-5 p-6 rounded-2xl hover:shadow-lg transition" style={{ background: 'linear-gradient(135deg, #fff8f2, #fdf0e6)', border: '2px solid #e8c9a8' }}>
                  <div className="p-4 rounded-full shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B6347, #a07850)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2" style={{ color: '#3d2b1f' }}>Phone Support</h4>
                    <p className="text-lg font-semibold" style={{ color: '#6F4E37' }}>+91 7975568683</p>
                    <p className="text-sm mt-2" style={{ color: '#a07850' }}>Call us for immediate assistance</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-5 p-6 rounded-2xl hover:shadow-lg transition" style={{ background: 'linear-gradient(135deg, #fdf0e6, #f5ece0)', border: '2px solid #d4b896' }}>
                  <div className="p-4 rounded-full shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a07850, #c4956a)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2" style={{ color: '#3d2b1f' }}>Email Address</h4>
                    <p className="text-lg break-all" style={{ color: '#6F4E37' }}>manasapetadoption@gmail.com</p>
                    <p className="text-sm mt-2" style={{ color: '#a07850' }}>We respond within 24 hours</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-5 p-6 rounded-2xl hover:shadow-lg transition" style={{ background: 'linear-gradient(135deg, #fdf6ee, #fdf0e6)', border: '2px solid #e8d5c0' }}>
                  <div className="p-4 rounded-full shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4a2c17, #6F4E37)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2" style={{ color: '#3d2b1f' }}>Business Hours</h4>
                    <p className="text-lg" style={{ color: '#6F4E37' }}>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-lg" style={{ color: '#6F4E37' }}>Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-sm mt-2" style={{ color: '#a07850' }}>Closed on Sundays & Public Holidays</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-8 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #fdf0e6, #f5ece0)', border: '2px solid #e8c9a8' }}>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#3d2b1f' }}>Ready to Adopt?</h4>
                <p className="mb-6 text-lg" style={{ color: '#8B6347' }}>
                  Start your adoption journey today! Browse our available pets, create an account,
                  and connect with rescue centers in your area.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/customer/register" className="text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all transform hover:scale-105 text-lg" style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
                    Create Account
                  </Link>
                  <Link to="/customer/login" className="font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 text-lg" style={{ border: '2px solid #6F4E37', color: '#6F4E37', background: 'white' }}>
                    Browse Pets
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 text-center max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-xl" style={{ border: '2px solid #e8d5c0' }}>
              <h3 className="text-3xl font-bold mb-8" style={{ color: '#3d2b1f' }}>Join Our Growing Community</h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-extrabold mb-2" style={{ color: '#6F4E37' }}>500+</div>
                  <p className="font-semibold" style={{ color: '#8B6347' }}>Happy Adoptions</p>
                </div>
                <div>
                  <div className="text-4xl font-extrabold mb-2" style={{ color: '#8B6347' }}>50+</div>
                  <p className="font-semibold" style={{ color: '#8B6347' }}>Rescue Partners</p>
                </div>
                <div>
                  <div className="text-4xl font-extrabold mb-2" style={{ color: '#a07850' }}>1000+</div>
                  <p className="font-semibold" style={{ color: '#8B6347' }}>Pets Rescued</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8" style={{ background: 'linear-gradient(135deg, #2d1a0e 0%, #4a2c17 100%)' }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#f5deb3' }}>
                <FaPaw style={{ color: '#c4956a' }} /> FurEver Home
              </h3>
              <p style={{ color: '#c4a882' }}>Connecting loving families with perfect pet companions.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ color: '#f5deb3' }}>Quick Links</h4>
              <ul className="space-y-2" style={{ color: '#c4a882' }}>
                <li><a href="#home" className="hover:opacity-100 transition" style={{ color: '#c4a882' }}>Home</a></li>
                <li><a href="#how-it-works" className="hover:opacity-100 transition" style={{ color: '#c4a882' }}>How It Works</a></li>
                <li><a href="#why-choose-us" className="hover:opacity-100 transition" style={{ color: '#c4a882' }}>Why Choose Us</a></li>
                <li><a href="#contact" className="hover:opacity-100 transition" style={{ color: '#c4a882' }}>Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ color: '#f5deb3' }}>Resources</h4>
              <ul className="space-y-2">
                <li><a href="#services" style={{ color: '#c4a882' }}>Services</a></li>
                <li><a href="#contact" style={{ color: '#c4a882' }}>Contact</a></li>
                <li><a href="#faq" style={{ color: '#c4a882' }}>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ color: '#f5deb3' }}>Support</h4>
              <ul className="space-y-2">
                <li><a href="#privacy" style={{ color: '#c4a882' }}>Privacy Policy</a></li>
                <li><a href="#terms" style={{ color: '#c4a882' }}>Terms of Service</a></li>
                <li><a href="#legal" style={{ color: '#c4a882' }}>Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#c4a882' }}>&copy; 2026 FurEver Home · Pet Adoption Platform · All rights reserved. 🐾</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;