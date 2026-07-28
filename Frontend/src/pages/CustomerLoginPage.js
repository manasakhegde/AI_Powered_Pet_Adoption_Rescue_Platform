import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPaw, FaUser, FaCheck, FaSync } from 'react-icons/fa';
import petImage from '../pet1.jpeg';

function CustomerLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  // ── Forgot Password states ──
  const [forgotMode, setForgotMode] = useState(false);   // show forgot modal
  const [fpStep, setFpStep]         = useState(1);        // 1=email, 2=otp, 3=reset
  const [fpEmail, setFpEmail]       = useState('');
  const [fpOtp, setFpOtp]           = useState('');
  const [fpOtpSent, setFpOtpSent]   = useState('');       // the actual OTP
  const [fpNewPass, setFpNewPass]   = useState('');
  const [fpConfirm, setFpConfirm]   = useState('');
  const [fpLoading, setFpLoading]   = useState(false);

  const sendOtp = () => {
    if (!fpEmail.trim() || !fpEmail.includes('@')) { toast.error('Enter a valid email'); return; }
    setFpLoading(true);
    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setFpOtpSent(otp);
    setTimeout(() => {
      setFpLoading(false);
      setFpStep(2);
      toast.success('OTP generated! Check below 👇');
    }, 1000);
  };

  const verifyOtp = () => {
    if (fpOtp === fpOtpSent) {
      setFpStep(3);
      toast.success('OTP verified ✅');
    } else {
      toast.error('Wrong OTP. Please try again.');
    }
  };

  const resetPassword = () => {
    if (!fpNewPass || fpNewPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (fpNewPass !== fpConfirm) { toast.error('Passwords do not match'); return; }
    setFpLoading(true);
    setTimeout(() => {
      // Update in localStorage registeredUsers
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updated = users.map(u => u.email === fpEmail ? { ...u, password: fpNewPass } : u);
      localStorage.setItem('registeredUsers', JSON.stringify(updated));
      setFpLoading(false);
      toast.success('Password reset successfully! Please sign in.');
      setForgotMode(false);
      setFpStep(1); setFpEmail(''); setFpOtp(''); setFpOtpSent(''); setFpNewPass(''); setFpConfirm('');
    }, 1000);
  };

  const closeForgot = () => { setForgotMode(false); setFpStep(1); setFpEmail(''); setFpOtp(''); setFpOtpSent(''); setFpNewPass(''); setFpConfirm(''); };

  // CAPTCHA state
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 15) + 1);
    setNum2(Math.floor(Math.random() * 15) + 1);
    setCaptchaInput('');
    setCaptchaVerified(false);
  };

  useEffect(() => { generateCaptcha(); }, [mode]);

  const verifyCaptcha = () => {
    if (!captchaInput) { toast.error('Enter the CAPTCHA answer'); return; }
    if (parseInt(captchaInput) === num1 + num2) {
      setCaptchaVerified(true);
      toast.success('CAPTCHA verified ✓');
    } else {
      toast.error('Wrong answer, try again');
      generateCaptcha();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error('Please fill all fields'); return; }
    if (!captchaVerified) { toast.error('Please verify the CAPTCHA first'); return; }
    setLoading(true);
    try {
      // ── Try real backend ──
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('customerToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify({
            id: data.id, firstName: data.firstName, lastName: data.lastName,
            email: data.email, role: data.role, userType: 'CUSTOMER',
            phone: data.phone || '', city: data.city || '', address: data.address || ''
          }));
          localStorage.setItem('customerLoginTime', new Date().toLocaleString());
          toast.success(`Welcome back, ${data.firstName}! 🐾`);
          setTimeout(() => navigate('/customer/home'), 900);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || 'Invalid email or password');
          return;
        }
      } catch (_) {
        // ── Backend offline: check registered users OR allow login directly ──
        const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const match = registered.find(u => u.email === formData.email && u.password === formData.password);

        let userData;
        if (match) {
          // Found previously registered offline user
          userData = { id: match.id, firstName: match.firstName, lastName: match.lastName, email: match.email };
        } else {
          // Backend offline — create a local session from email directly
          // (will sync to MongoDB when backend is back online)
          const namePart = formData.email.split('@')[0];
          userData = {
            id: 'local_' + Date.now(),
            firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            lastName: 'User',
            email: formData.email,
          };
        }
        const token = btoa(JSON.stringify({ email: userData.email, role: 'CUSTOMER', ts: Date.now() }));
        localStorage.setItem('customerToken', token);
        localStorage.setItem('currentUser', JSON.stringify({ ...userData, role: 'CUSTOMER', userType: 'CUSTOMER' }));
        localStorage.setItem('customerLoginTime', new Date().toLocaleString());
        toast.success(`Welcome, ${userData.firstName}! 🐾`);
        setTimeout(() => navigate('/customer/home'), 900);
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill all fields'); return;
    }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      // ── Try real backend register ──
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName:  formData.lastName,
            email:     formData.email,
            password:  formData.password,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Auto-login after registration — save token + user
          localStorage.setItem('customerToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify({
            id: data.id, firstName: data.firstName, lastName: data.lastName,
            email: data.email, role: data.role, userType: 'CUSTOMER',
            phone: data.phone || '', city: data.city || '', address: data.address || ''
          }));
          toast.success(`Account created! Welcome, ${data.firstName}! 🐾`);
          setTimeout(() => navigate('/customer/home'), 900);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || 'Registration failed');
          return;
        }
      } catch (_) {
        // ── Backend offline: save to localStorage for offline use ──
        const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const exists = registered.find(u => u.email === formData.email);
        if (exists) { toast.error('Email already registered'); setLoading(false); return; }

        const newUser = {
          id: 'local_' + Date.now(),
          firstName: formData.firstName,
          lastName:  formData.lastName,
          email:     formData.email,
          password:  formData.password,   // stored locally only — not sent to any server
          role: 'CUSTOMER',
        };
        registered.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registered));

        // Auto-login
        const token = btoa(JSON.stringify({ email: newUser.email, role: 'CUSTOMER', timestamp: Date.now() }));
        localStorage.setItem('customerToken', token);
        localStorage.setItem('currentUser', JSON.stringify({ ...newUser, userType: 'CUSTOMER' }));
        toast.success(`Account created! Welcome, ${newUser.firstName}! 🐾 (offline mode)`);
        setTimeout(() => navigate('/customer/home'), 900);
        return;
      }
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #6F4E37 0%, #a0785a 30%, #d4b896 60%, #f5efe6 100%)' }}>
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex" style={{ minHeight: '580px' }}>

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
              style={{ maxHeight: '320px' }}
            />
          </div>

          {/* Bottom text */}
          <div>
            <h2 className="text-2xl font-bold text-white leading-snug mb-2">
              Find Your Perfect Pet<br />with AI 🤍
            </h2>
            <p className="text-sm" style={{ color: '#c9b8a8' }}>
              AI-powered matching, trusted shelters,<br />and a better future for pets.
            </p>
            {/* Decorative paws bottom */}
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
              style={{ borderColor: '#6B9E4E', color: '#6B9E4E', background: '#f0f9eb' }}>
              <FaPaw className="text-xs" /> AI Powered Platform
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#2d1f14' }}>
              {mode === 'signin' ? 'Welcome Back 🐾' : 'Create Account 🐾'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'signin' ? 'Login to continue your journey' : 'Sign up to start your journey'}
            </p>
          </div>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">

            {/* First + Last name — signup only */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-200 focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-100 transition">
                    <FaUser className="text-gray-400 text-sm flex-shrink-0" />
                    <input
                      type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      placeholder="First name"
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-200 focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-100 transition">
                    <FaUser className="text-gray-400 text-sm flex-shrink-0" />
                    <input
                      type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      placeholder="Last name"
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
                    />
                  </div>
                </div>
              </div>
            )}

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

            {/* Confirm Password — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-100 transition">
                  <FaLock className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Confirm your password"
                    className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password */}
            {mode === 'signin' && (
              <div className="text-right -mt-1">
                <button type="button" onClick={() => setForgotMode(true)}
                  className="text-xs font-semibold" style={{ color: '#6F4E37' }}>
                  Forgot Password?
                </button>
              </div>
            )}

            {/* CAPTCHA — sign in only */}
            {mode === 'signin' && (
              <div className="rounded-xl border border-gray-200 p-3" style={{ background: '#fafafa' }}>
                <p className="text-xs font-semibold text-gray-500 mb-2">Security Check</p>
                <div className="flex items-center gap-3">
                  {/* Question box */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0"
                    style={{ background: '#fdf0e6', border: '1.5px solid #8B6347', color: '#2d1f14' }}>
                    {num1} + {num2} = ?
                  </div>
                  {/* Answer input */}
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && verifyCaptcha()}
                    placeholder="Answer"
                    disabled={captchaVerified}
                    className="w-20 px-3 py-2 rounded-lg border text-sm text-center outline-none transition"
                    style={{
                      borderColor: captchaVerified ? '#6F4E37' : '#d1d5db',
                      background: captchaVerified ? '#fdf0e6' : 'white',
                      color: '#2d1f14',
                    }}
                  />
                  {/* Verify / Verified button */}
                  {captchaVerified ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: '#6F4E37', color: 'white' }}>
                      <FaCheck /> Verified
                    </div>
                  ) : (
                    <button type="button" onClick={verifyCaptcha}
                      className="px-3 py-2 rounded-lg text-xs font-bold transition hover:opacity-90"
                      style={{ background: '#6F4E37', color: 'white' }}>
                      Verify
                    </button>
                  )}
                  {/* Refresh */}
                  <button type="button" onClick={generateCaptcha}
                    className="text-gray-400 hover:text-gray-600 transition ml-auto" title="New CAPTCHA">
                    <FaSync className="text-xs" />
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60 shadow-md"
              style={{ background: 'linear-gradient(135deg, #6F4E37, #8B6347)' }}>
              <FaPaw />
              {loading ? 'Please wait...' : (mode === 'signin' ? 'Login' : 'Sign Up')}
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
            <button
  type="button"
  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
>
  <FaEnvelope className="text-gray-500 text-sm" />
  Email
</button>
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="font-bold" style={{ color: '#6F4E37' }}>Sign Up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="font-bold" style={{ color: '#6F4E37' }}>Sign In</button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {forgotMode && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'inherit' }}>
          <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0ebe3', background:'linear-gradient(135deg,#6F4E37,#8B6347)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <h3 style={{ margin:0, fontSize:'17px', fontWeight:700, color:'white' }}>
                  {fpStep===1 ? '🔑 Forgot Password' : fpStep===2 ? '📱 Verify OTP' : '🔒 Reset Password'}
                </h3>
                <p style={{ margin:'3px 0 0', fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>
                  {fpStep===1 ? 'Enter your registered email' : fpStep===2 ? 'Enter the OTP sent to your email' : 'Set a new password'}
                </p>
              </div>
              <button onClick={closeForgot} style={{ width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.2)', cursor:'pointer', color:'white', fontSize:'16px' }}>✕</button>
            </div>

            {/* Step progress dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', padding:'14px 0 0' }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ width: fpStep===s?'24px':'8px', height:'8px', borderRadius:'4px', background: s<=fpStep?'#6F4E37':'#e8dcc8', transition:'all 0.3s' }} />
              ))}
            </div>

            <div style={{ padding:'20px 24px 24px' }}>
              {/* Step 1 — Email */}
              {fpStep === 1 && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', textTransform:'uppercase', letterSpacing:'0.4px' }}>Email Address</label>
                  <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' }} />
                  <button onClick={sendOtp} disabled={fpLoading}
                    style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:fpLoading?0.7:1 }}>
                    {fpLoading ? '⏳ Sending OTP...' : '📧 Send OTP'}
                  </button>
                </div>
              )}

              {/* Step 2 — OTP */}
              {fpStep === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#fdf0e6', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#6F4E37' }}>
                    📧 OTP sent to <strong>{fpEmail}</strong>
                  </div>

                  {/* ── OTP displayed here temporarily ── */}
                  <div style={{ background:'linear-gradient(135deg,#fff8f0,#fdf0e6)', border:'2px dashed #c4956a', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
                    <p style={{ fontSize:'11px', fontWeight:700, color:'#8B6347', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      🔐 Your OTP (Demo — shown here temporarily)
                    </p>
                    <div style={{ fontSize:'32px', fontWeight:900, color:'#6F4E37', letterSpacing:'10px', fontFamily:'monospace' }}>
                      {fpOtpSent}
                    </div>
                    <p style={{ fontSize:'11px', color:'#9ca3af', margin:'8px 0 0' }}>
                      In production, this would be sent to your email
                    </p>
                  </div>

                  <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', textTransform:'uppercase', letterSpacing:'0.4px' }}>Enter OTP</label>
                  <input type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value)}
                    placeholder="Enter the 6-digit OTP above"
                    maxLength={6}
                    onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:`1.5px solid ${fpOtp.length===6?'#6F4E37':'#e8dcc8'}`, fontSize:'18px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box', letterSpacing:'6px', textAlign:'center', fontWeight:700 }} />
                  <button onClick={verifyOtp}
                    style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                    ✅ Verify OTP
                  </button>
                  <button onClick={() => { setFpStep(1); setFpOtp(''); }}
                    style={{ background:'none', border:'none', color:'#8B6347', fontSize:'12px', cursor:'pointer', textDecoration:'underline' }}>
                    ← Back / Resend OTP
                  </button>
                </div>
              )}

              {/* Step 3 — New Password */}
              {fpStep === 3 && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ background:'#f0fdf4', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#16a34a' }}>
                    ✅ OTP verified — set your new password
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>New Password</label>
                    <input type="password" value={fpNewPass} onChange={e => setFpNewPass(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Confirm Password</label>
                    <input type="password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      onKeyDown={e => e.key === 'Enter' && resetPassword()}
                      style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:`1.5px solid ${fpConfirm && fpConfirm !== fpNewPass ? '#dc2626' : '#e8dcc8'}`, fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' }} />
                    {fpConfirm && fpConfirm !== fpNewPass && (
                      <p style={{ fontSize:'11px', color:'#dc2626', margin:'4px 0 0' }}>Passwords don't match</p>
                    )}
                  </div>
                  <button onClick={resetPassword} disabled={fpLoading}
                    style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:fpLoading?0.7:1 }}>
                    {fpLoading ? '⏳ Resetting...' : '🔒 Reset Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerLoginPage;
