import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaUser, FaSignOutAlt, FaHome, FaSearch } from 'react-icons/fa';

function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Read customer session
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (u) setUser(u);
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #fdf6ee 0%, #ffffff 50%, #f5ece0 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #3d2b1f 0%, #6F4E37 60%, #8B6347 100%)',
        boxShadow: '0 4px 20px rgba(61,43,31,0.25)',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            🐾
          </div>
          <div>
            <span style={{ color: '#f5deb3', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>FurEver</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '18px' }}> Home</span>
          </div>
        </Link>

        {/* Center nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { to: '/',             icon: <FaHome />,   label: 'Home'        },
            { to: '/customer/home', icon: <FaSearch />, label: 'Browse Pets' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '10px',
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '12px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right — user or login buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              {/* Avatar pill */}
              <Link to="/customer/home" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 14px 5px 5px', borderRadius: '24px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none', cursor: 'pointer',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f5deb3, #e8c89a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6F4E37', fontWeight: 800, fontSize: '12px',
                }}>
                  {(user.firstName || 'U')[0].toUpperCase()}
                </div>
                <span style={{ color: '#f5deb3', fontSize: '13px', fontWeight: 600 }}>
                  {user.firstName || 'User'}
                </span>
              </Link>
              {/* Logout */}
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '10px',
                background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.25)',
                color: '#ffb3b3', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
              }}>
                <FaSignOutAlt style={{ fontSize: '12px' }} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/customer/login" style={{
                padding: '7px 18px', borderRadius: '10px',
                color: '#f5deb3', fontSize: '13px', fontWeight: 600,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}>
                Login
              </Link>
              <Link to="/customer/login" style={{
                padding: '7px 18px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f5deb3, #e8c89a)',
                color: '#3d2b1f', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'linear-gradient(135deg, #2d1f14 0%, #4a2c17 100%)',
        color: 'white',
        padding: '40px 32px 24px',
        marginTop: '40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '32px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🐾</span>
                <span style={{ color: '#f5deb3', fontWeight: 700, fontSize: '16px' }}>FurEver Home</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>
                Connecting loving families with perfect pet companions.
              </p>
            </div>
            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#f5deb3', fontWeight: 700, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[['/', 'Home'], ['/customer/home', 'Browse Pets'], ['/', 'About Us']].map(([to, label]) => (
                  <li key={label}><Link to={to} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#f5deb3'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                  >{label}</Link></li>
                ))}
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 style={{ color: '#f5deb3', fontWeight: 700, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Contact', 'FAQ', 'Privacy Policy'].map(label => (
                  <li key={label}><a href="#" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#f5deb3'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                  >{label}</a></li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 style={{ color: '#f5deb3', fontWeight: 700, marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>📍 Bangalore, Karnataka</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>📞 +91 7975568683</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>📧 manasapetadoption@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
              © 2026 FurEver Home · Pet Adoption Platform · All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>🐾</span>
              <span style={{ color: '#f5deb3', fontSize: '12px', fontWeight: 600 }}>Made with ❤️ for pets</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
