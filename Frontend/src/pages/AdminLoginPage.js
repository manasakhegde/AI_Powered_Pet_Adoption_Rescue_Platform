import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPaw, FaShieldAlt } from 'react-icons/fa';
import petImage from '../pet1.jpeg';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      // ── Step 1: Try real backend admin login → saves to MongoDB ──
      try {
        const res = await fetch('http://localhost:5000/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const data = await res.json();
          // Save real JWT token and MongoDB user data
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify({
            id:        data.id,
            firstName: data.firstName,
            lastName:  data.lastName,
            email:     data.email,
            role:      data.role,
            userType:  'ADMIN',
          }));
          localStorage.setItem('adminLoginTime', new Date().toLocaleString());
          toast.success(`Welcome, ${data.firstName}! 🐾`);
          setTimeout(() => navigate('/admin/dashboard'), 900);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || 'Invalid admin credentials');
          return;
        }
      } catch (_) {
        // ── Step 2: Backend offline — fallback to hardcoded credentials ──
        if (formData.email === 'admin@gmail.com' && formData.password === 'Admin@123') {
          const adminUser = {
            id: 'admin-1', firstName: 'Admin', lastName: 'User',
            email: formData.email, role: 'ADMIN', userType: 'ADMIN',
          };
          const token = btoa(JSON.stringify({ email: formData.email, role: 'ADMIN', timestamp: Date.now() }));
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
          localStorage.setItem('adminLoginTime', new Date().toLocaleString());
          toast.success('Welcome, Admin! 🐾 (offline mode)');
          setTimeout(() => navigate('/admin/dashboard'), 900);
          return;
        }
        toast.error('Invalid admin credentials');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #fdf6ee 0%, #ffffff 50%, #f5ece0 100%)' }}>
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex" style={{ minHeight: '540px' }}>

        {/* LEFT — Pet illustration panel */}
        <div className="relative w-5/12 flex-shrink-0 flex flex-col justify-between p-8"
          style={{ background: '#6B5344' }}>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#5A4635' }}>
              <FaPaw className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">FurEver Home</p>
              <p className="text-xs" style={{ color: '#c9b8a8' }}>Adopt. Rescue. Love.</p>
            </div>
          </div>

          {/* Decorative paw prints */}
          <div className="absolute top-16 right-10 text-4xl opacity-20">🐾</div>
          <div className="absolute top-32 right-6 text-2xl opacity-15">🐾</div>

          {/* Pet image */}
          <div className="flex-1 flex items-center justify-center py-4">
            <img
              src={petImage}
              alt="Pets"
              className="w-full object-cover rounded-2xl shadow-xl"
              style={{ maxHeight: '280px' }}
            />
          </div>

          {/* Bottom text */}
          <div>
            <h2 className="text-2xl font-bold text-white leading-snug mb-2">
              Admin Control<br />Center 🛡️
            </h2>
            <p className="text-sm" style={{ color: '#c9b8a8' }}>
              Manage pets, users, adoptions,<br />and platform settings.
            </p>
            <div className="flex gap-2 mt-4 opacity-30">
              <span className="text-2xl">🐾</span>
              <span className="text-xl">🐾</span>
              <span className="text-lg">🐾</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-10 py-8 relative">

          {/* AI Powered badge */}
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{ borderColor: '#8B6347', color: '#6F4E37', background: '#fdf0e6' }}>
              <FaShieldAlt className="text-xs" /> Admin Portal
            </div>
          </div>

          {/* Back link */}
          <div className="absolute top-6 left-6">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition">← Back to Home</Link>
          </div>

          {/* Title */}
          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#2d1f14' }}>Welcome Back 🐾</h1>
            <p className="text-sm text-gray-500">Login to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email or Username</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-100 transition">
                <FaEnvelope className="text-gray-400 text-sm flex-shrink-0" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="Enter your email or username"
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-100 transition">
                <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right -mt-1">
              <button type="button" className="text-xs font-semibold" style={{ color: '#6B9E4E' }}>
                Forgot Password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60 shadow-md"
              style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
              <FaPaw />
              {loading ? 'Please wait...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>🐾</span> or continue with <span>🐾</span>
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" /> Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <span className="text-blue-600 font-bold text-base">f</span> Facebook
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <span className="font-bold">🍎</span> Apple
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: '#fdf0e6', border: '1px dashed #8B6347' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#6F4E37' }}>Default Admin Credentials</p>
            <p className="text-xs" style={{ color: '#5A4635' }}>admin@gmail.com · Admin@123</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Saved in MongoDB · Offline fallback supported</p>
          </div>

          {/* Customer login link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Not an admin?{' '}
            <Link to="/customer/login" className="font-bold" style={{ color: '#6F4E37' }}>Customer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
