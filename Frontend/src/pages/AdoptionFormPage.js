import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ── Coffee palette ── */
const C = {
  dark:    '#3d2b1f',
  main:    '#6F4E37',
  mid:     '#8B6347',
  light:   '#A0826D',
  cream:   '#f5deb3',
  bg:      'linear-gradient(135deg, #fdf6ee 0%, #ffffff 50%, #f5ece0 100%)',
  card:    '#ffffff',
  border:  '#e8d5c0',
  inputBg: '#fdf9f5',
};

const steps = [
  { num: 1, label: 'Personal Info',  icon: '👤' },
  { num: 2, label: 'Address',        icon: '📍' },
  { num: 3, label: 'Home Details',   icon: '🏠' },
  { num: 4, label: 'Why Adopt?',     icon: '❤️' },
];

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: `1.5px solid ${C.border}`,
  fontSize: '14px',
  outline: 'none',
  background: C.inputBg,
  color: C.dark,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: C.mid,
  display: 'block',
  marginBottom: '7px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

export default function AdoptionFormPage() {
  const { petId } = useParams();
  const navigate  = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [pet, setPet] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '',
    homeType: '', homeOwnership: '',
    adoptionReason: '', experience: '',
  });

  useEffect(() => {
    // Pre-fill from logged-in user
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.firstName) setFormData(p => ({ ...p, firstName: user.firstName, lastName: user.lastName || '', email: user.email || '' }));

    // Load pet details
    const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
    const found = allPets.find(p => p.id === petId);
    if (found) setPet(found);
  }, [petId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    const required = ['firstName','lastName','email','phone','address','city','state','homeType','homeOwnership','adoptionReason'];
    if (!required.every(f => formData[f]?.trim())) {
      toast.error('Please fill all required fields');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const request = {
      id: 'req_' + Date.now(),
      petId,
      petName:    pet?.name    || 'Unknown Pet',
      petSpecies: pet?.species || '',
      petBreed:   pet?.breed   || '',
      petImage:   pet?.imageUrls?.[0] || '',
      customerName:    `${formData.firstName} ${formData.lastName}`,
      customerEmail:   formData.email,
      customerPhone:   formData.phone,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
      homeType:        formData.homeType,
      homeOwnership:   formData.homeOwnership,
      adoptionReason:  formData.adoptionReason,
      experience:      formData.experience || '',
      userId:          currentUser.id    || '',
      userEmail:       currentUser.email || '',
      status:          'Pending',
      adoptedAt:       new Date().toLocaleString(),
      createdAt:       new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
    existing.unshift(request);
    localStorage.setItem('adoptionRequests', JSON.stringify(existing));

    // ── Notify admin that a new adoption request was submitted ──
    const adminNotif = {
      id:        'areq_' + Date.now(),
      type:      'NEW_ADOPTION_REQUEST',
      title:     '🐾 New Adoption Request',
      message:   `${request.customerName} has applied to adopt ${request.petName}. Please review and approve or reject the request.`,
      petName:   request.petName,
      petImage:  request.petImage || '',
      petId:     petId,
      requestId: request.id,
      customerName:  request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      submittedAt:   new Date().toLocaleString(),
      read:      false,
    };
    const adminNotifs = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifs.unshift(adminNotif);
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifs));

    // ── Mark the pet as "Adopted" in adminPets so customers see updated status ──
    const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
    const updatedPets = allPets.map(p =>
      p.id === petId
        ? { ...p, adoptionStatus: 'Adopted', status: 'Adopted' }
        : p
    );
    localStorage.setItem('adminPets', JSON.stringify(updatedPets));

    try {
      await fetch('http://localhost:5000/api/adoption-requests', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${localStorage.getItem('customerToken')}` },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(3000),
      });
    } catch (_) {}

    setSubmitted(true);
    toast.success('Application submitted! 🐾');
    setTimeout(() => navigate('/customer/home'), 3000);
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', background: C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div style={{ background:'white', borderRadius:'24px', padding:'48px', textAlign:'center', maxWidth:'480px', width:'100%', boxShadow:'0 8px 40px rgba(111,78,55,0.15)', border:`2px solid ${C.border}` }}>
          <div style={{ fontSize:'72px', marginBottom:'16px' }}>🎉</div>
          <h2 style={{ fontSize:'26px', fontWeight:800, color: C.dark, marginBottom:'12px' }}>Application Submitted!</h2>
          <p style={{ color: C.mid, fontSize:'15px', lineHeight:1.6, marginBottom:'24px' }}>
            Your adoption request for <strong>{pet?.name || 'this pet'}</strong> has been received. 
            Our team will review it and get back to you soon.
          </p>
          <div style={{ background:`linear-gradient(135deg, #fdf0e6, #f5ece0)`, borderRadius:'14px', padding:'16px', border:`1px solid ${C.border}` }}>
            <p style={{ color: C.main, fontSize:'13px', fontWeight:600, margin:0 }}>📧 Confirmation sent to {formData.email}</p>
          </div>
          <p style={{ color:'#9ca3af', fontSize:'12px', marginTop:'20px' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  /* ── Step content ── */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Manasa" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Hegde" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. you@gmail.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" style={inputStyle} />
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={labelStyle}>Street Address *</label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 123 MG Road" style={inputStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Bangalore" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Karnataka" style={inputStyle} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={labelStyle}>Home Type *</label>
              <select name="homeType" value={formData.homeType} onChange={handleChange} style={inputStyle}>
                <option value="">Select your home type</option>
                <option value="House">🏡 House</option>
                <option value="Apartment">🏢 Apartment</option>
                <option value="Villa">🏰 Villa</option>
                <option value="Other">🏠 Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ownership *</label>
              <select name="homeOwnership" value={formData.homeOwnership} onChange={handleChange} style={inputStyle}>
                <option value="">Select ownership status</option>
                <option value="Own">Own my home</option>
                <option value="Rent">Renting</option>
              </select>
            </div>
            {formData.homeOwnership === 'Rent' && (
              <div style={{ background:'#fff8f2', borderRadius:'12px', padding:'14px', border:`1px dashed ${C.border}` }}>
                <p style={{ color: C.mid, fontSize:'13px', margin:0 }}>💡 If renting, you may need landlord permission to keep a pet.</p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={labelStyle}>Why do you want to adopt? *</label>
              <textarea name="adoptionReason" value={formData.adoptionReason} onChange={handleChange} rows={4}
                placeholder="Tell us why you'd like to adopt this pet and how you'll care for them..."
                style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} />
            </div>
            <div>
              <label style={labelStyle}>Previous pet experience</label>
              <textarea name="experience" value={formData.experience} onChange={handleChange} rows={3}
                placeholder="Describe your experience with pets (optional)..."
                style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div style={{ minHeight:'100vh', background: C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'640px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'48px', marginBottom:'10px' }}>🐾</div>
          <h1 style={{ fontSize:'28px', fontWeight:800, color: C.dark, margin:'0 0 8px' }}>Adoption Application</h1>
          {pet && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'white', padding:'8px 18px', borderRadius:'50px', border:`1.5px solid ${C.border}`, boxShadow:'0 2px 8px rgba(111,78,55,0.10)' }}>
              {pet.imageUrls?.[0]
                ? <img src={pet.imageUrls[0]} alt={pet.name} style={{ width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover' }} />
                : <span style={{ fontSize:'20px' }}>{pet.species==='Dog'?'🐶':pet.species==='Cat'?'🐱':'🐾'}</span>
              }
              <span style={{ fontSize:'14px', fontWeight:600, color: C.main }}>Applying for: <strong>{pet.name}</strong></span>
              <span style={{ fontSize:'11px', color: C.light, background:'#fdf0e6', padding:'2px 8px', borderRadius:'20px' }}>{pet.breed}</span>
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:'28px', gap:'0' }}>
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                <div
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  style={{
                    width:'48px', height:'48px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: currentStep === s.num ? '20px' : '16px',
                    fontWeight:700,
                    cursor: s.num < currentStep ? 'pointer' : 'default',
                    background: currentStep === s.num
                      ? `linear-gradient(135deg, ${C.main}, ${C.light})`
                      : currentStep > s.num
                      ? 'linear-gradient(135deg, #6F4E37, #8B6347)'
                      : 'white',
                    color: currentStep >= s.num ? 'white' : C.light,
                    border: currentStep === s.num ? 'none' : `2px solid ${currentStep > s.num ? C.main : C.border}`,
                    boxShadow: currentStep === s.num ? '0 4px 14px rgba(111,78,55,0.35)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  {currentStep > s.num ? '✓' : s.icon}
                </div>
                <span style={{ fontSize:'11px', fontWeight:600, color: currentStep === s.num ? C.main : '#9ca3af', marginTop:'6px', whiteSpace:'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ flex:1, height:'3px', background: currentStep > s.num ? `linear-gradient(90deg, ${C.main}, ${C.light})` : C.border, borderRadius:'2px', margin:'0 4px', marginBottom:'24px', transition:'background 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height:'6px', background: C.border, borderRadius:'3px', marginBottom:'24px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress + 33}%`, background:`linear-gradient(90deg, ${C.main}, ${C.light})`, borderRadius:'3px', transition:'width 0.4s ease' }} />
        </div>

        {/* Form card */}
        <div style={{ background:'white', borderRadius:'24px', boxShadow:'0 8px 40px rgba(111,78,55,0.12)', border:`1.5px solid ${C.border}`, overflow:'hidden' }}>
          
          {/* Card header */}
          <div style={{ background:`linear-gradient(135deg, ${C.main}, ${C.light})`, padding:'20px 28px', display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'28px' }}>{steps[currentStep-1].icon}</span>
            <div>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:600, margin:0, textTransform:'uppercase', letterSpacing:'1px' }}>
                Step {currentStep} of 4
              </p>
              <h2 style={{ color:'white', fontSize:'18px', fontWeight:700, margin:0 }}>{steps[currentStep-1].label}</h2>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding:'28px' }}>
            {renderStep()}
          </div>

          {/* Card footer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 28px', borderTop:`1px solid ${C.border}`, background:'#fdf9f5' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              style={{
                padding:'11px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:600, cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                border:`1.5px solid ${C.border}`, background:'white', color: currentStep === 1 ? '#d1c4b8' : C.main,
                opacity: currentStep === 1 ? 0.5 : 1, transition:'all 0.2s',
              }}
            >
              ← Previous
            </button>

            <div style={{ display:'flex', gap:'6px' }}>
              {steps.map(s => (
                <div key={s.num} style={{ width: currentStep === s.num ? '20px' : '8px', height:'8px', borderRadius:'4px', background: currentStep === s.num ? C.main : C.border, transition:'all 0.3s' }} />
              ))}
            </div>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s + 1)}
                style={{ padding:'11px 28px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', border:'none', background:`linear-gradient(135deg, ${C.main}, ${C.light})`, color:'white', boxShadow:'0 4px 14px rgba(111,78,55,0.3)', transition:'all 0.2s' }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                style={{ padding:'11px 28px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', border:'none', background:'linear-gradient(135deg, #16a34a, #15803d)', color:'white', boxShadow:'0 4px 14px rgba(22,163,74,0.3)', transition:'all 0.2s' }}
              >
                🐾 Submit Application
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign:'center', color:'#9ca3af', fontSize:'12px', marginTop:'20px' }}>
          🔒 Your information is safe with us · Review takes 1–2 business days
        </p>

      </div>
    </div>
  );
}
