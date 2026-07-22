import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminRescueCentersPage from './AdminRescueCentersPage';

const NAV = [
  { id: 'dashboard',        icon: '🏠', label: 'Dashboard' },
  { id: 'users',            icon: '👥', label: 'Manage Users' },
  { id: 'pets',             icon: '🐾', label: 'Manage Pets' },
  { id: 'rescue-centers',   icon: '🏥', label: 'Rescue Centers' },
  { id: 'adoption-reqs',    icon: '📄', label: 'Adoption Requests', badge: null },
  { id: 'rescue-reqs',      icon: '🚑', label: 'Rescue Requests', badge: null },
  { id: 'payments',         icon: '💰', label: 'Payment History' },
  { id: 'analytics',        icon: '📊', label: 'Reports & Analytics' },
  { id: 'reviews',          icon: '⭐', label: 'Reviews & Feedback' },
  { id: 'notifications',    icon: '📢', label: 'Notifications', badge: null },
  { id: 'vaccination',      icon: '📅', label: 'Vaccination Management' },
  { id: 'settings',         icon: '⚙️', label: 'Settings' },
  { id: 'profile',          icon: '👤', label: 'Admin Profile' },
];

function AdminProfile({ admin }) {
  const loginTime = localStorage.getItem('adminLoginTime') || 'N/A';
  const fields = [
    { icon: '👤', label: 'Full Name',   value: (admin.firstName || 'Admin') + ' ' + (admin.lastName || 'User') },
    { icon: '📧', label: 'Email',       value: admin.email || 'admin@gmail.com' },
    { icon: '🛡️', label: 'Login Type',  value: 'Administrator' },
    { icon: '🕐', label: 'Login Time',  value: loginTime },
    { icon: '✅', label: 'Status',      value: 'Active' },
    { icon: '🔑', label: 'Role',        value: 'ADMIN' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'500px' }}>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', marginBottom:'4px', textAlign:'center' }}>Admin Profile 👤</h2>
      <p style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'24px', textAlign:'center' }}>Your account details and session information.</p>

      {/* Avatar card */}
      <div style={{ background:'white', borderRadius:'20px', padding:'32px', boxShadow:'0 1px 4px rgba(90,70,53,0.1)', border:'1px solid #f5f0e8', maxWidth:'600px', width:'100%', marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'28px', justifyContent:'center', flexDirection:'column', textAlign:'center' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:700, color:'white', flexShrink:0, boxShadow:'0 4px 14px rgba(139,115,85,0.35)' }}>A</div>
          <div>
            <p style={{ fontWeight:700, fontSize:'20px', color:'#5a4635', margin:'0 0 4px' }}>{admin.firstName || 'Admin'} {admin.lastName || 'User'}</p>
            <p style={{ color:'#8B7355', fontSize:'13px', margin:'0 0 8px' }}>{admin.email || 'admin@gmail.com'}</p>
            <span style={{ fontSize:'12px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', background:'#f5f0e8', color:'#8B7355', border:'1px solid #e8dcc8' }}>🛡️ Administrator</span>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {fields.map(f => (
            <div key={f.label} style={{ background:'#f5f0e8', borderRadius:'14px', padding:'16px', border:'1px solid #e8dcc8' }}>
              <p style={{ fontSize:'11px', color:'#8B7355', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{f.icon} {f.label}</p>
              <p style={{ fontSize:'14px', fontWeight:600, color:'#5a4635', margin:0, wordBreak:'break-all' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Session info banner */}
      <div style={{ maxWidth:'600px', width:'100%', background:'linear-gradient(135deg,#8B7355,#A0826D)', borderRadius:'16px', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:'16px' }}>
        <span style={{ fontSize:'32px' }}>🔐</span>
        <div>
          <p style={{ color:'white', fontWeight:700, fontSize:'14px', margin:'0 0 4px' }}>Secure Session Active</p>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', margin:0 }}>Logged in at: {loginTime}</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ admin }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { icon:'🐾', label:'Total Pets',         value:0, sub:'', color:'#2563eb', bg:'#eff6ff' },
    { icon:'✅', label:'Available Pets',      value:0, sub:'', color:'#16a34a', bg:'#f0fdf4' },
    { icon:'🏠', label:'Adopted Pets',        value:0, sub:'', color:'#7c3aed', bg:'#f5f3ff' },
    { icon:'📄', label:'Pending Requests',    value:0, sub:'', color:'#d97706', bg:'#fffbeb' },
    { icon:'🚑', label:'Rescue Reports',      value:0, sub:'', color:'#dc2626', bg:'#fef2f2' },
    { icon:'🏥', label:'Rescue Centers',      value:0, sub:'', color:'#0891b2', bg:'#ecfeff' },
  ]);

  const loadStats = () => {
    // ── Read all data from localStorage (always available) ──
    const allPets       = JSON.parse(localStorage.getItem('adminPets')           || '[]');
    const allRequests   = JSON.parse(localStorage.getItem('adoptionRequests')    || '[]');
    const allCenters    = JSON.parse(localStorage.getItem('adminRescueCenters')  || '[]');
    const allRescue     = JSON.parse(localStorage.getItem('rescueReports')       || '[]');

    const totalPets     = allPets.length;
    const availablePets = allPets.filter(p => (p.adoptionStatus || p.status || 'Available') === 'Available').length;
    const adoptedPets   = allPets.filter(p => (p.adoptionStatus || p.status) === 'Adopted').length;
    const pendingReqs   = allRequests.filter(r => r.status === 'Pending').length;
    const rescueCount   = allRescue.length;
    const centerCount   = allCenters.length;

    setStats([
      { icon:'🐾', label:'Total Pets',      value: totalPets,
        sub: `${availablePets} available · ${adoptedPets} adopted`,
        pct: totalPets > 0 ? Math.round((availablePets / totalPets) * 100) : 0,
        pctColor:'#16a34a', color:'#2563eb', bg:'#eff6ff' },
      { icon:'✅', label:'Available Pets',   value: availablePets,
        sub: totalPets > 0 ? `${Math.round((availablePets/totalPets)*100)}% of total` : 'No pets yet',
        pct: totalPets > 0 ? Math.round((availablePets / totalPets) * 100) : 0,
        pctColor:'#16a34a', color:'#16a34a', bg:'#f0fdf4' },
      { icon:'🏠', label:'Adopted Pets',    value: adoptedPets,
        sub: totalPets > 0 ? `${Math.round((adoptedPets/totalPets)*100)}% of total` : 'No pets yet',
        pct: totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0,
        pctColor:'#7c3aed', color:'#7c3aed', bg:'#f5f3ff' },
      { icon:'📄', label:'Pending Requests', value: pendingReqs,
        sub: `${allRequests.length} total requests`,
        color:'#d97706', bg:'#fffbeb' },
      { icon:'🚑', label:'Rescue Reports',   value: rescueCount,
        sub: `${allRescue.filter(r=>r.status==='Submitted').length} awaiting action`,
        color:'#dc2626', bg:'#fef2f2' },
      { icon:'🏥', label:'Rescue Centers',   value: centerCount,
        sub: `${allCenters.filter(c=>c.verificationStatus==='VERIFIED').length} verified`,
        color:'#0891b2', bg:'#ecfeff' },
    ]);

    // Also try backend in background
    const token = localStorage.getItem('adminToken');
    Promise.all([
      fetch('http://localhost:5000/api/pets', { headers:{'Authorization':`Bearer ${token}`}, signal: AbortSignal.timeout(3000) }).catch(()=>null),
      fetch('http://localhost:5000/api/rescue-centers/admin/all', { headers:{'Authorization':`Bearer ${token}`}, signal: AbortSignal.timeout(3000) }).catch(()=>null),
    ]).then(async ([petsRes, centersRes]) => {
      if (petsRes?.ok) {
        const pets = await petsRes.json();
        if (pets.length > 0) localStorage.setItem('adminPets', JSON.stringify(pets));
      }
      if (centersRes?.ok) {
        const centers = await centersRes.json();
        if (centers.length > 0) localStorage.setItem('adminRescueCenters', JSON.stringify(centers));
      }
    }).catch(()=>{});

    setLoading(false);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);
  const statusColor = { Pending:'#d97706', Approved:'#16a34a', Rejected:'#dc2626' };
  const statusBg    = { Pending:'#fffbeb', Approved:'#f0fdf4', Rejected:'#fef2f2' };

  // Calculate max value for chart scaling
  const maxValue = Math.max(...stats.map(s => s.value), 1);

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', marginBottom:'4px' }}>Welcome, {admin.firstName || 'Admin'} 👋</h2>
      <p style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'24px' }}>Here's your platform overview for today.</p>
      
      {/* Stats Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'28px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{s.icon}</div>
              <span style={{ fontSize:'28px', fontWeight:800, color:s.color }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'13px', color:'#1e293b', fontWeight:600, margin:'0 0 4px' }}>{s.label}</p>
            {s.sub && <p style={{ fontSize:'11px', color:'#94a3b8', margin:'0 0 8px' }}>{s.sub}</p>}
            {s.pct !== undefined && (
              <div>
                <div style={{ width:'100%', height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{ width:`${s.pct}%`, height:'100%', background:s.pctColor||s.color, borderRadius:'3px', transition:'width 0.5s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                  <span style={{ fontSize:'10px', color:'#94a3b8' }}>0</span>
                  <span style={{ fontSize:'10px', color:s.pctColor||s.color, fontWeight:700 }}>{s.pct}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart Visualization */}
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', marginBottom:'28px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1e293b', marginBottom:'20px' }}>Platform Statistics Overview</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'#64748b', fontWeight:500 }}>{s.icon} {s.label}</span>
                <span style={{ fontSize:'14px', fontWeight:700, color:s.color }}>{s.value}</span>
              </div>
              <div style={{ width:'100%', height:'10px', background:'#f1f5f9', borderRadius:'5px', overflow:'hidden' }}>
                <div style={{
                  width: `${maxValue > 0 ? (s.value / maxValue) * 100 : 0}%`,
                  height:'100%',
                  background: s.color,
                  borderRadius:'5px',
                  transition:'width 0.6s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function AdoptionRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null); // for detail modal

  useEffect(() => {
    // Load from localStorage
    const load = () => {
      const stored = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
      setRequests(stored);
    };
    load();
    // Also try backend
    fetch('http://localhost:5000/api/adoption-requests', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      signal: AbortSignal.timeout(3000),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('adoptionRequests', JSON.stringify(data));
          setRequests(data);
        }
      })
      .catch(() => {});
  }, []);

  const updateStatus = (id, newStatus) => {
    const req = requests.find(r => r.id === id);
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus, resolvedAt: new Date().toLocaleString() } : r);
    setRequests(updated);
    localStorage.setItem('adoptionRequests', JSON.stringify(updated));

    // When approved — mark pet as Adopted + create payment notification for customer
    if (newStatus === 'Approved' && req) {
      // Mark pet as adopted
      const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
      const pet = allPets.find(p => p.id === req.petId) || {};
      localStorage.setItem('adminPets', JSON.stringify(
        allPets.map(p => p.id === req.petId ? { ...p, adoptionStatus: 'Adopted', status: 'Adopted' } : p)
      ));

      // Write payment notification for the customer
      const paymentNotif = {
        id:            'pn_' + Date.now(),
        type:          'PAYMENT_DUE',
        title:         '🎉 Adoption Approved — Payment Required',
        message:       `Your adoption request for ${req.petName} has been approved! Please complete the payment of ₹${pet.adoptionFee ?? pet.fee ?? 0} to finalise the adoption.`,
        petId:         req.petId,
        petName:       req.petName,
        petImage:      req.petImage || '',
        amount:        pet.adoptionFee ?? pet.fee ?? 0,
        customerEmail: req.customerEmail,
        userEmail:     req.userEmail || req.customerEmail,
        requestId:     id,
        status:        'UNPAID',
        createdAt:     new Date().toLocaleString(),
        read:          false,
      };

      // Store keyed by userEmail so customer can find their own
      const key = `customerNotifications_${req.userEmail || req.customerEmail}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(paymentNotif);
      localStorage.setItem(key, JSON.stringify(existing));

      // Also store in global list for any user who is currently logged in
      const globalNotifs = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      globalNotifs.unshift(paymentNotif);
      localStorage.setItem('customerNotifications', JSON.stringify(globalNotifs));

      toast.success(`✅ Approved! Payment notification sent to ${req.customerName}`);
    }

    // When rejected — mark pet back to Available + notify customer
    if (newStatus === 'Rejected' && req?.petId) {
      const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
      localStorage.setItem('adminPets', JSON.stringify(
        allPets.map(p => p.id === req.petId ? { ...p, adoptionStatus: 'Available', status: 'Available' } : p)
      ));

      // Write rejection notification for the customer
      const rejectNotif = {
        id:       'rj_' + Date.now(),
        type:     'REQUEST_REJECTED',
        title:    '❌ Adoption Request Rejected',
        message:  `Unfortunately, your adoption request for ${req.petName} has been rejected. You may apply for another pet.`,
        petId:    req.petId,
        petName:  req.petName,
        petImage: req.petImage || '',
        customerEmail: req.customerEmail,
        userEmail:     req.userEmail || req.customerEmail,
        status:   'INFO',
        createdAt: new Date().toLocaleString(),
        read:     false,
      };
      const rKey = `customerNotifications_${req.userEmail || req.customerEmail}`;
      const rExisting = JSON.parse(localStorage.getItem(rKey) || '[]');
      rExisting.unshift(rejectNotif);
      localStorage.setItem(rKey, JSON.stringify(rExisting));
      const rGlobal = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      rGlobal.unshift(rejectNotif);
      localStorage.setItem('customerNotifications', JSON.stringify(rGlobal));

      toast.success('❌ Request rejected — customer notified');
    }

    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
    // Try backend
    fetch(`http://localhost:5000/api/adoption-requests/${id}/status?status=${newStatus}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
    if (selected?.id === id) setSelected({ ...selected, status: newStatus });
  };

  const deleteRequest = (id) => {
    if (!window.confirm('Remove this request from the list?')) return;
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem('adoptionRequests', JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
    toast.success('Request removed');
  };

  const resetPetToAvailable = (req) => {
    if (!req?.petId) return;
    const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
    localStorage.setItem('adminPets', JSON.stringify(
      allPets.map(p => p.id === req.petId ? { ...p, adoptionStatus: 'Available', status: 'Available' } : p)
    ));
    // Also remove from adoption requests
    const updatedReqs = requests.filter(r => r.id !== req.id);
    setRequests(updatedReqs);
    localStorage.setItem('adoptionRequests', JSON.stringify(updatedReqs));
    if (selected?.id === req.id) setSelected(null);
    toast.success(`${req.petName} is now Available again`);
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  const statusColor = { Pending:'#d97706', Approved:'#16a34a', Rejected:'#dc2626' };
  const statusBg    = { Pending:'#fffbeb', Approved:'#f0fdf4', Rejected:'#fef2f2' };
  const counts = {
    All:      requests.length,
    Pending:  requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Adoption Requests 📄</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Review and manage all customer adoption applications.</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
        {[['All','🗂️','#5a4635','#f5f0e8'],['Pending','⏳','#d97706','#fffbeb'],['Approved','✅','#16a34a','#f0fdf4'],['Rejected','❌','#dc2626','#fef2f2']].map(([s,ic,col,bg]) => (
          <div key={s} onClick={() => setFilter(s)} style={{ background: filter===s ? col : 'white', borderRadius:'14px', padding:'16px', border:`2px solid ${filter===s ? col : '#f1f5f9'}`, cursor:'pointer', transition:'all 0.15s' }}>
            <div style={{ fontSize:'22px', marginBottom:'6px' }}>{ic}</div>
            <div style={{ fontSize:'22px', fontWeight:700, color: filter===s ? 'white' : col }}>{counts[s]}</div>
            <div style={{ fontSize:'11px', color: filter===s ? 'rgba(255,255,255,0.85)' : '#64748b', fontWeight:600 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📄</div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'#5a4635', marginBottom:'6px' }}>No {filter !== 'All' ? filter.toLowerCase() : ''} adoption requests yet</p>
            <p style={{ fontSize:'13px' }}>When customers apply to adopt a pet, their requests will appear here.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Pet','Customer Name','Contact','Address','Applied On','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none' }}>
                  {/* Pet */}
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {r.petImage
                        ? <img src={r.petImage} alt={r.petName} style={{ width:'38px', height:'38px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
                            {r.petSpecies==='Dog'?'🐶':r.petSpecies==='Cat'?'🐱':r.petSpecies==='Rabbit'?'🐰':'🐾'}
                          </div>
                      }
                      <div>
                        <div style={{ fontWeight:700, fontSize:'13px', color:'#1e293b' }}>{r.petName || '—'}</div>
                        <div style={{ fontSize:'11px', color:'#94a3b8' }}>{r.petBreed || r.petSpecies || ''}</div>
                      </div>
                    </div>
                  </td>
                  {/* Customer Name */}
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:600, fontSize:'13px', color:'#1e293b' }}>{r.customerName}</div>
                    <div style={{ fontSize:'11px', color:'#94a3b8' }}>{r.customerEmail}</div>
                  </td>
                  {/* Contact */}
                  <td style={{ padding:'12px 14px', fontSize:'13px', color:'#475569' }}>
                    <div>📞 {r.customerPhone}</div>
                  </td>
                  {/* Address */}
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#475569', maxWidth:'180px' }}>
                    <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>📍 {r.customerAddress}</div>
                  </td>
                  {/* Date */}
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>
                    🗓 {r.adoptedAt}
                  </td>
                  {/* Status */}
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'20px', background: statusBg[r.status]||'#f1f5f9', color: statusColor[r.status]||'#475569' }}>
                      {r.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      <button onClick={() => setSelected(r)}
                        style={{ fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', color:'#475569', cursor:'pointer' }}>
                        👁 View
                      </button>
                      {r.status === 'Pending' && (
                        <>
                          <button onClick={() => updateStatus(r.id, 'Approved')}
                            style={{ fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #bbf7d0', background:'#f0fdf4', color:'#16a34a', cursor:'pointer' }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => updateStatus(r.id, 'Rejected')}
                            style={{ fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer' }}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <button onClick={() => resetPetToAvailable(r)}
                          style={{ fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #fed7aa', background:'#fff7ed', color:'#ea580c', cursor:'pointer' }}>
                          🔄 Make Available
                        </button>
                      )}
                      {(r.status === 'Approved' || r.status === 'Rejected') && (
                        <button onClick={() => deleteRequest(r.id)}
                          style={{ fontSize:'11px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer' }}>
                          🗑 Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'580px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#1e293b' }}>📋 Adoption Request Details</h3>
              <button onClick={() => setSelected(null)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:'16px', color:'#64748b' }}>✕</button>
            </div>

            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
              {/* Pet info */}
              <div style={{ background:'linear-gradient(135deg,#f5f0e8,#e8dcc8)', borderRadius:'14px', padding:'16px', display:'flex', gap:'14px', alignItems:'center' }}>
                {selected.petImage
                  ? <img src={selected.petImage} alt={selected.petName} style={{ width:'60px', height:'60px', borderRadius:'12px', objectFit:'cover', flexShrink:0 }} />
                  : <div style={{ width:'60px', height:'60px', borderRadius:'12px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', flexShrink:0 }}>
                      {selected.petSpecies==='Dog'?'🐶':selected.petSpecies==='Cat'?'🐱':'🐾'}
                    </div>
                }
                <div>
                  <p style={{ fontWeight:700, fontSize:'16px', color:'#2d1f14', margin:'0 0 4px' }}>{selected.petName}</p>
                  <p style={{ color:'#8B7355', fontSize:'13px', margin:0 }}>{selected.petSpecies} · {selected.petBreed}</p>
                </div>
                <span style={{ marginLeft:'auto', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px', background: statusBg[selected.status], color: statusColor[selected.status] }}>
                  {selected.status}
                </span>
              </div>

              {/* Customer details grid */}
              <h4 style={{ fontSize:'14px', fontWeight:700, color:'#1e293b', margin:'4px 0 0' }}>👤 Customer Information</h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  ['👤 Full Name',    selected.customerName],
                  ['📧 Email',        selected.customerEmail],
                  ['📞 Phone',        selected.customerPhone],
                  ['📍 Address',      selected.customerAddress],
                  ['🏠 Home Type',    selected.homeType],
                  ['🔑 Ownership',    selected.homeOwnership],
                  ['🗓 Applied On',   selected.adoptedAt],
                  ['✅ Resolved On',  selected.resolvedAt || '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ background:'#f8fafc', borderRadius:'10px', padding:'12px', border:'1px solid #f1f5f9' }}>
                    <p style={{ fontSize:'11px', color:'#64748b', fontWeight:600, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.4px' }}>{lbl}</p>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'#1e293b', margin:0, wordBreak:'break-all' }}>{val || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Reason */}
              {selected.adoptionReason && (
                <>
                  <h4 style={{ fontSize:'14px', fontWeight:700, color:'#1e293b', margin:'4px 0 0' }}>💬 Adoption Reason</h4>
                  <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'14px', border:'1px solid #f1f5f9', fontSize:'13px', color:'#475569', lineHeight:1.6 }}>
                    {selected.adoptionReason}
                  </div>
                </>
              )}
              {selected.experience && (
                <>
                  <h4 style={{ fontSize:'14px', fontWeight:700, color:'#1e293b', margin:'4px 0 0' }}>🐾 Pet Experience</h4>
                  <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'14px', border:'1px solid #f1f5f9', fontSize:'13px', color:'#475569', lineHeight:1.6 }}>
                    {selected.experience}
                  </div>
                </>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', padding:'16px 24px', borderTop:'1px solid #f1f5f9' }}>
              {selected.status === 'Pending' && (
                <>
                  <button onClick={() => updateStatus(selected.id, 'Rejected')}
                    style={{ padding:'10px 20px', borderRadius:'10px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    ❌ Reject
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'Approved')}
                    style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#16a34a', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    ✅ Approve
                  </button>
                </>
              )}
              {selected.status === 'Approved' && (
                <button onClick={() => resetPetToAvailable(selected)}
                  style={{ padding:'10px 20px', borderRadius:'10px', border:'1px solid #fed7aa', background:'#fff7ed', color:'#ea580c', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                  🔄 Make Available & Remove
                </button>
              )}
              {(selected.status === 'Approved' || selected.status === 'Rejected') && (
                <button onClick={() => deleteRequest(selected.id)}
                  style={{ padding:'10px 20px', borderRadius:'10px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                  🗑 Remove Request
                </button>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding:'10px 20px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'white', color:'#475569', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── REPORTS & ANALYTICS ── */
function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = () => {
      const pets       = JSON.parse(localStorage.getItem('adminPets')           || '[]');
      const requests   = JSON.parse(localStorage.getItem('adoptionRequests')    || '[]');
      const rescue     = JSON.parse(localStorage.getItem('rescueReports')       || '[]');
      const payments   = JSON.parse(localStorage.getItem('adminPayments')       || '[]');
      const customers  = JSON.parse(localStorage.getItem('registeredUsers')     || '[]');
      const notifs     = JSON.parse(localStorage.getItem('customerNotifications') || '[]');

      const available  = pets.filter(p => (p.adoptionStatus||p.status||'Available') === 'Available').length;
      const adopted    = pets.filter(p => (p.adoptionStatus||p.status) === 'Adopted').length;
      const dogs       = pets.filter(p => p.species === 'Dog').length;
      const cats       = pets.filter(p => p.species === 'Cat').length;
      const birds      = pets.filter(p => p.species === 'Bird').length;
      const other      = pets.length - dogs - cats - birds;

      const reqPending  = requests.filter(r => r.status === 'Pending').length;
      const reqApproved = requests.filter(r => r.status === 'Approved').length;
      const reqRejected = requests.filter(r => r.status === 'Rejected').length;

      const rescueSubmitted  = rescue.filter(r => r.status === 'Submitted').length;
      const rescueInProgress = rescue.filter(r => r.status === 'In Progress' || r.status === 'Acknowledged').length;
      const rescueRescued    = rescue.filter(r => r.status === 'Rescued').length;
      const rescueClosed     = rescue.filter(r => r.status === 'Closed').length;

      const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

      setData({ pets, available, adopted, dogs, cats, birds, other,
        requests, reqPending, reqApproved, reqRejected,
        rescue, rescueSubmitted, rescueInProgress, rescueRescued, rescueClosed,
        payments, totalRevenue,
        customers: customers.length,
        totalNotifs: notifs.length,
      });
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (!data) return <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>Loading analytics...</div>;

  // ── Mini bar chart (pure CSS, no library) ──
  const BarChart = ({ title, icon, color, bars, total }) => {
    const max = Math.max(...bars.map(b => b.value), 1);
    return (
      <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <span style={{ fontSize:'24px' }}>{icon}</span>
          <div>
            <h3 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#1e293b' }}>{title}</h3>
            <p style={{ margin:0, fontSize:'12px', color:'#94a3b8' }}>Total: <strong style={{ color:'#1e293b' }}>{total}</strong></p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'10px', height:'140px' }}>
          {bars.map((b, i) => (
            <div key={b.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
              <span style={{ fontSize:'12px', fontWeight:700, color: b.color || color }}>{b.value}</span>
              <div style={{ width:'100%', borderRadius:'6px 6px 0 0', transition:'height 0.6s ease',
                height: `${Math.round((b.value / max) * 100)}%`,
                minHeight: b.value > 0 ? '8px' : '3px',
                background: b.color
                  ? b.color
                  : `linear-gradient(180deg, ${color}dd, ${color}88)`,
                boxShadow: b.value > 0 ? `0 -2px 8px ${b.color||color}44` : 'none',
              }} />
              <span style={{ fontSize:'10px', color:'#64748b', fontWeight:600, textAlign:'center', lineHeight:1.2, whiteSpace:'nowrap' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Donut / Pie (pure CSS rings) ──
  const DonutChart = ({ title, icon, segments, total }) => {
    let offset = 0;
    const r = 54, circ = 2 * Math.PI * r;
    return (
      <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <span style={{ fontSize:'24px' }}>{icon}</span>
          <div>
            <h3 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#1e293b' }}>{title}</h3>
            <p style={{ margin:0, fontSize:'12px', color:'#94a3b8' }}>Total: <strong style={{ color:'#1e293b' }}>{total}</strong></p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          {/* SVG donut */}
          <div style={{ flexShrink:0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {total === 0
                ? <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeDasharray={`${circ} ${circ}`} />
                : segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const dash = pct * circ;
                    const el = (
                      <circle key={i} cx="65" cy="65" r={r} fill="none"
                        stroke={seg.color} strokeWidth="14"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-offset * circ}
                        transform="rotate(-90 65 65)" />
                    );
                    offset += pct;
                    return el;
                  })
              }
              <text x="65" y="60" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1e293b">{total}</text>
              <text x="65" y="76" textAnchor="middle" fontSize="10" fill="#94a3b8">total</text>
            </svg>
          </div>
          {/* Legend */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', flex:1 }}>
            {segments.map(seg => (
              <div key={seg.label} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:seg.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'12px', color:'#475569', fontWeight:500 }}>{seg.label}</span>
                </div>
                <span style={{ fontSize:'12px', fontWeight:700, color:'#1e293b' }}>{seg.value}</span>
                <span style={{ fontSize:'10px', color:'#94a3b8' }}>({total > 0 ? Math.round(seg.value/total*100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Stat card ──
  const StatCard = ({ icon, label, value, sub, color, bg }) => (
    <div style={{ background:'white', borderRadius:'16px', padding:'18px 20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:'14px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:'24px', fontWeight:800, color, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'12px', fontWeight:600, color:'#1e293b', marginTop:'3px' }}>{label}</div>
        {sub && <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Reports & Analytics 📊</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Real-time platform statistics from live data.</p>
      </div>

      {/* Summary stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'28px' }}>
        <StatCard icon="🐾" label="Total Pets"       value={data.pets.length}   sub={`${data.available} available`} color="#2563eb" bg="#eff6ff" />
        <StatCard icon="👥" label="Registered Users"  value={data.customers||0}  sub="customers"                    color="#16a34a" bg="#f0fdf4" />
        <StatCard icon="📄" label="Total Requests"    value={data.requests.length} sub={`${data.reqApproved} approved`} color="#d97706" bg="#fffbeb" />
        <StatCard icon="💰" label="Total Revenue"     value={`₹${data.totalRevenue.toLocaleString()}`} sub={`${data.payments.length} payments`} color="#7c3aed" bg="#f5f3ff" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>

        {/* Pets availability bar chart */}
        <BarChart
          title="Pets Overview"
          icon="🐾"
          color="#2563eb"
          total={data.pets.length}
          bars={[
            { label:'Available', value: data.available, color:'#16a34a' },
            { label:'Adopted',   value: data.adopted,   color:'#7c3aed' },
            { label:'Dogs',      value: data.dogs,      color:'#f59e0b' },
            { label:'Cats',      value: data.cats,      color:'#ec4899' },
            { label:'Birds',     value: data.birds,     color:'#06b6d4' },
            { label:'Other',     value: data.other,     color:'#94a3b8' },
          ]}
        />

        {/* Adoption requests donut */}
        <DonutChart
          title="Adoption Requests"
          icon="📄"
          total={data.requests.length}
          segments={[
            { label:'Pending',  value: data.reqPending,  color:'#f59e0b' },
            { label:'Approved', value: data.reqApproved, color:'#16a34a' },
            { label:'Rejected', value: data.reqRejected, color:'#dc2626' },
          ]}
        />
      </div>

      {/* Charts row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>

        {/* Rescue reports bar chart */}
        <BarChart
          title="Rescue Reports"
          icon="🚑"
          color="#dc2626"
          total={data.rescue.length}
          bars={[
            { label:'Submitted',   value: data.rescueSubmitted,   color:'#f59e0b' },
            { label:'In Progress', value: data.rescueInProgress,  color:'#2563eb' },
            { label:'Rescued',     value: data.rescueRescued,     color:'#16a34a' },
            { label:'Closed',      value: data.rescueClosed,      color:'#6b7280' },
          ]}
        />

        {/* Pets by species donut */}
        <DonutChart
          title="Pets by Species"
          icon="🐾"
          total={data.pets.length}
          segments={[
            { label:'Dogs',   value: data.dogs,  color:'#f59e0b' },
            { label:'Cats',   value: data.cats,  color:'#ec4899' },
            { label:'Birds',  value: data.birds, color:'#06b6d4' },
            { label:'Others', value: data.other, color:'#94a3b8' },
          ]}
        />
      </div>

      {/* Charts row 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Adoptions vs Rescue horizontal progress bars */}
        <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <span style={{ fontSize:'24px' }}>📈</span>
            <h3 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#1e293b' }}>Platform Overview</h3>
          </div>
          {[
            { label:'Pets Available',   value: data.available,      max: Math.max(data.pets.length,1), color:'#16a34a' },
            { label:'Pets Adopted',     value: data.adopted,        max: Math.max(data.pets.length,1), color:'#7c3aed' },
            { label:'Adoption Approved',value: data.reqApproved,    max: Math.max(data.requests.length,1), color:'#2563eb' },
            { label:'Animals Rescued',  value: data.rescueRescued,  max: Math.max(data.rescue.length,1), color:'#dc2626' },
            { label:'Payments Done',    value: data.payments.length, max: Math.max(data.requests.length,1), color:'#f59e0b' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', color:'#475569', fontWeight:500 }}>{item.label}</span>
                <span style={{ fontSize:'12px', fontWeight:700, color: item.color }}>{item.value}</span>
              </div>
              <div style={{ height:'8px', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.round((item.value / item.max) * 100)}%`, background: item.color, borderRadius:'4px', transition:'width 0.6s ease', minWidth: item.value > 0 ? '8px' : '0' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Rescue status donut */}
        <DonutChart
          title="Rescue Status Breakdown"
          icon="🚑"
          total={data.rescue.length}
          segments={[
            { label:'Submitted',   value: data.rescueSubmitted,   color:'#f59e0b' },
            { label:'In Progress', value: data.rescueInProgress,  color:'#2563eb' },
            { label:'Rescued',     value: data.rescueRescued,     color:'#16a34a' },
            { label:'Closed',      value: data.rescueClosed,      color:'#6b7280' },
          ]}
        />
      </div>
    </div>
  );
}

function AdminPaymentHistory() {
  const [payments, setPayments] = useState([]);

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('adminPayments') || '[]');
    setPayments(stored);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Payment History 💰</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>All completed adoption payments.</p>
      </div>

      {/* Summary card */}
      {payments.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#6F4E37,#8B6347)', borderRadius:'18px', padding:'24px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'white' }}>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:'13px', opacity:0.8 }}>Total Revenue Collected</p>
            <p style={{ margin:0, fontSize:'32px', fontWeight:800 }}>₹{total.toLocaleString()}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:'0 0 4px', fontSize:'13px', opacity:0.8 }}>Transactions</p>
            <p style={{ margin:0, fontSize:'32px', fontWeight:800 }}>{payments.length}</p>
          </div>
          <span style={{ fontSize:'48px', opacity:0.4 }}>💰</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        {payments.length === 0 ? (
          <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>💰</div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'#1e293b', marginBottom:'6px' }}>No payments yet</p>
            <p style={{ fontSize:'13px' }}>Completed payments will appear here once customers pay their adoption fees.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['#','Pet','Customer','Email','Amount','Method','Paid At','Status'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < payments.length-1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding:'12px 14px', fontSize:'13px', color:'#94a3b8', fontWeight:600 }}>#{i+1}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {p.petImage
                        ? <img src={p.petImage} alt={p.petName} style={{ width:'36px', height:'36px', borderRadius:'8px', objectFit:'cover' }} />
                        : <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🐾</div>
                      }
                      <span style={{ fontWeight:600, fontSize:'13px', color:'#1e293b' }}>{p.petName}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{p.customerName || '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b' }}>{p.customerEmail || '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:'14px', fontWeight:800, color:'#16a34a' }}>₹{Number(p.amount).toLocaleString()}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', background:'#f1f5f9', color:'#475569', textTransform:'uppercase' }}>
                      {p.payMethod || '—'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>{p.paidAt}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:'#dcfce7', color:'#16a34a' }}>
                      ✅ {p.status || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('requests'); // 'requests' | 'payments'

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    setNotifications(stored);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const markRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const requests = notifications.filter(n => n.type === 'NEW_ADOPTION_REQUEST');
  const payments  = notifications.filter(n => n.type === 'PAYMENT_SUCCESS');
  const unreadReqs  = requests.filter(n => !n.read).length;
  const unreadPays  = payments.filter(n => !n.read).length;
  const totalUnread = notifications.filter(n => !n.read).length;

  const active = tab === 'requests' ? requests : payments;

  /* ── notification card ── */
  const Card = ({ n }) => (
    <div onClick={() => markRead(n.id)}
      style={{
        background: n.read ? 'white'
          : n.type === 'PAYMENT_SUCCESS'
            ? 'linear-gradient(135deg,#f0fdf4,#ffffff)'
            : 'linear-gradient(135deg,#fff8f0,#ffffff)',
        borderRadius:'16px', padding:'18px 20px', cursor:'pointer',
        border: n.read ? '1px solid #f1f5f9'
          : n.type === 'PAYMENT_SUCCESS' ? '2px solid #bbf7d0' : '2px solid #fde8cc',
        boxShadow: n.read ? 'none'
          : n.type === 'PAYMENT_SUCCESS'
            ? '0 2px 12px rgba(22,163,74,0.10)'
            : '0 2px 12px rgba(111,78,55,0.10)',
        display:'flex', alignItems:'center', gap:'16px', transition:'all 0.15s',
      }}>
      {/* Pet image */}
      <div style={{ width:'52px', height:'52px', borderRadius:'12px', overflow:'hidden', flexShrink:0,
        background: n.type==='PAYMENT_SUCCESS' ? '#dcfce7' : '#fdf0e6',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>
        {n.petImage
          ? <img src={n.petImage} alt={n.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : n.type==='PAYMENT_SUCCESS' ? '💰' : '🐾'
        }
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
          <p style={{ fontWeight:700, fontSize:'14px', color:'#1e293b', margin:0 }}>{n.title}</p>
          {!n.read && <span style={{ width:'8px', height:'8px', borderRadius:'50%', background: n.type==='PAYMENT_SUCCESS' ? '#16a34a' : '#f59e0b', flexShrink:0, display:'inline-block' }} />}
        </div>
        <p style={{ color:'#475569', fontSize:'13px', margin:'0 0 8px', lineHeight:1.5 }}>{n.message}</p>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'11px', color:'#94a3b8' }}>🗓 {n.paidAt || n.submittedAt || n.createdAt}</span>
          {n.type === 'PAYMENT_SUCCESS' && (
            <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#dcfce7', color:'#16a34a' }}>
              💰 ₹{n.amount} Received
            </span>
          )}
          {n.payMethod && (
            <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#f8fafc', color:'#64748b', textTransform:'uppercase' }}>
              {n.payMethod}
            </span>
          )}
          {n.type === 'NEW_ADOPTION_REQUEST' && (
            <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color:'#6F4E37' }}>
              🐾 New Request
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ flexShrink:0, textAlign:'right' }}>
        {n.type === 'PAYMENT_SUCCESS' && (
          <>
            <div style={{ fontSize:'22px' }}>✅</div>
            <div style={{ fontWeight:800, fontSize:'16px', color:'#16a34a' }}>₹{n.amount}</div>
          </>
        )}
        {n.type === 'NEW_ADOPTION_REQUEST' && (
          <div style={{ fontSize:'22px' }}>🐾</div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>
            Notifications 📢
            {totalUnread > 0 && (
              <span style={{ marginLeft:'10px', fontSize:'13px', fontWeight:700, padding:'2px 10px', borderRadius:'20px', background:'#dc2626', color:'white' }}>
                {totalUnread} new
              </span>
            )}
          </h2>
          <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Adoption requests and payment confirmations.</p>
        </div>
        {totalUnread > 0 && (
          <button onClick={markAllRead}
            style={{ padding:'8px 16px', borderRadius:'10px', border:'1px solid #e2e8f0', background:'white', color:'#475569', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', background:'white', borderRadius:'16px', padding:'6px', border:'1px solid #f0ebe3', width:'fit-content' }}>
        {[
          { id:'requests', label:'Adoption Requests', icon:'🐾', count: unreadReqs },
          { id:'payments', label:'Payments',          icon:'💰', count: unreadPays },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding:'10px 20px', borderRadius:'12px', border:'none', cursor:'pointer',
              background: tab===t.id ? 'linear-gradient(135deg,#6F4E37,#8B6347)' : 'transparent',
              color: tab===t.id ? 'white' : '#8B6347',
              fontSize:'13px', fontWeight:700,
              display:'flex', alignItems:'center', gap:'8px',
              transition:'all 0.15s',
            }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count > 0 && (
              <span style={{ background: tab===t.id ? 'rgba(255,255,255,0.3)' : '#e05c5c', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px', minWidth:'18px', textAlign:'center' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {active.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f1f5f9' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>{tab === 'requests' ? '🐾' : '💰'}</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#1e293b', marginBottom:'6px' }}>
            No {tab === 'requests' ? 'adoption requests' : 'payment notifications'} yet
          </p>
          <p style={{ fontSize:'13px', color:'#94a3b8' }}>
            {tab === 'requests'
              ? 'New adoption requests from customers will appear here.'
              : 'Payment confirmations will appear here when customers pay.'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {active.map(n => <Card key={n.id} n={n} />)}
        </div>
      )}
    </div>
  );
}

function AdminRescueRequests() {
  const [reports, setReports]   = useState([]);
  const [filter, setFilter]     = useState('All');
  const [selected, setSelected] = useState(null);

  const load = () => {
    const all = JSON.parse(localStorage.getItem('rescueReports') || '[]');
    setReports([...all].reverse()); // newest first
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const STEPS = ['Submitted','Acknowledged','In Progress','Rescued','Closed'];

  const updateStatus = (id, newStatus) => {
    const all = JSON.parse(localStorage.getItem('rescueReports') || '[]');
    const report = all.find(r => r.id === id);
    const updated = all.map(r => r.id === id
      ? { ...r, status: newStatus, updatedAt: new Date().toLocaleString(),
          timeline: [...(r.timeline||[]), { status: newStatus, time: new Date().toLocaleString(), note: `Status updated to ${newStatus} by admin` }] }
      : r
    );
    localStorage.setItem('rescueReports', JSON.stringify(updated));
    setReports([...updated].reverse());
    if (selected?.id === id) setSelected(updated.find(r => r.id === id));

    // ── Notify the customer who submitted this report ──
    if (report?.userEmail) {
      const msgMap = {
        Acknowledged: `✅ Your rescue report for a ${report.animalType||'animal'} near ${report.location||'your location'} has been acknowledged. Our team is reviewing it.`,
        'In Progress': `🚑 Rescue is now IN PROGRESS for the ${report.animalType||'animal'} you reported near ${report.location||'your location'}. Help is on the way!`,
        Rescued:       `🎉 Great news! The ${report.animalType||'animal'} you reported near ${report.location||'your location'} has been RESCUED safely. Thank you for caring! 🐾`,
        Closed:        `🔒 Your rescue report (${report.animalType||'animal'} near ${report.location||'your location'}) has been closed. Thank you for your contribution to animal welfare.`,
      };
      const titleMap = {
        Acknowledged: '👁 Rescue Report Acknowledged',
        'In Progress': '🚑 Rescue In Progress',
        Rescued:       '🎉 Animal Successfully Rescued!',
        Closed:        '🔒 Rescue Report Closed',
      };
      if (msgMap[newStatus]) {
        const notif = {
          id:         'rescue_upd_' + Date.now(),
          type:       'RESCUE_UPDATE',
          title:      titleMap[newStatus],
          message:    msgMap[newStatus],
          rescueId:   id,
          animalType: report.animalType || 'Animal',
          location:   report.location || '',
          status:     newStatus,
          petImage:   report.imagePreview || '',
          createdAt:  new Date().toLocaleString(),
          read:       false,
        };
        // Write to user-specific key
        const key = `customerNotifications_${report.userEmail}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift(notif);
        localStorage.setItem(key, JSON.stringify(existing));
        // Also write to global customerNotifications
        const global = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
        global.unshift(notif);
        localStorage.setItem('customerNotifications', JSON.stringify(global));
      }
    }

    toast.success(`Status updated to "${newStatus}" ✅`);
  };

  const urgencyColor = { Critical:'#dc2626', High:'#ea580c', Moderate:'#d97706', Medium:'#d97706', Low:'#16a34a' };
  const urgencyBg    = { Critical:'#fef2f2', High:'#fff7ed', Moderate:'#fffbeb', Medium:'#fffbeb', Low:'#f0fdf4' };
  const statusColor  = { Submitted:'#d97706', Acknowledged:'#2563eb', 'In Progress':'#7c3aed', Rescued:'#16a34a', Closed:'#6b7280' };
  const statusBg     = { Submitted:'#fffbeb', Acknowledged:'#eff6ff', 'In Progress':'#f5f3ff', Rescued:'#f0fdf4', Closed:'#f9fafb' };

  const filtered = filter === 'All' ? reports : reports.filter(r => r.status === filter);

  const counts = {
    All:          reports.length,
    Submitted:    reports.filter(r => r.status === 'Submitted').length,
    'In Progress':reports.filter(r => r.status === 'In Progress' || r.status === 'Acknowledged').length,
    Rescued:      reports.filter(r => r.status === 'Rescued').length,
    Closed:       reports.filter(r => r.status === 'Closed').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Rescue Requests 🚑</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>
          Manage incoming rescue reports submitted by customers.
        </p>
      </div>

      {/* Stats tabs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'20px' }}>
        {[
          ['All','🗂️','#5a4635','#f5f0e8'],
          ['Submitted','⏳','#d97706','#fffbeb'],
          ['In Progress','🔄','#7c3aed','#f5f3ff'],
          ['Rescued','✅','#16a34a','#f0fdf4'],
          ['Closed','🔒','#6b7280','#f9fafb'],
        ].map(([s,ic,col,bg]) => (
          <div key={s} onClick={() => setFilter(s)}
            style={{ background: filter===s ? col : 'white', borderRadius:'14px', padding:'14px 12px', border:`2px solid ${filter===s ? col : '#f1f5f9'}`, cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
            <div style={{ fontSize:'20px', marginBottom:'4px' }}>{ic}</div>
            <div style={{ fontSize:'20px', fontWeight:700, color: filter===s ? 'white' : col }}>{counts[s]||0}</div>
            <div style={{ fontSize:'10px', color: filter===s ? 'rgba(255,255,255,0.85)' : '#64748b', fontWeight:600 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🚑</div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'#1e293b', marginBottom:'6px' }}>
              No {filter !== 'All' ? filter.toLowerCase() : ''} rescue requests yet
            </p>
            <p style={{ fontSize:'13px' }}>Rescue reports submitted by customers will appear here.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Animal','Reporter','Location','Rescue Center','Urgency','Submitted','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none' }}>
                  {/* Animal */}
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
                        {r.imagePreview ? <img src={r.imagePreview} alt={r.animalType} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} /> : '🐾'}
                      </div>
                      <div>
                        <p style={{ margin:'0 0 2px', fontWeight:700, fontSize:'13px', color:'#1e293b' }}>{r.animalType||'Unknown'}</p>
                        <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>{r.description?.slice(0,30)}{r.description?.length>30?'...':''}</p>
                      </div>
                    </div>
                  </td>
                  {/* Reporter */}
                  <td style={{ padding:'12px 14px' }}>
                    <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{r.reporterName||'—'}</p>
                    <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>{r.reporterPhone||r.userEmail||''}</p>
                  </td>
                  {/* Location */}
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#475569', maxWidth:'140px' }}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      📍 {r.location||'—'}
                    </span>
                  </td>
                  {/* Rescue Center */}
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#475569' }}>
                    <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color:'#6F4E37' }}>
                      🏥 {r.rescueCenterName||'Not assigned'}
                    </span>
                  </td>
                  {/* Urgency */}
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 8px', borderRadius:'20px', background:urgencyBg[r.urgency]||'#fffbeb', color:urgencyColor[r.urgency]||'#d97706' }}>
                      {r.urgency==='Critical'?'🔴':r.urgency==='High'?'🟠':'🟡'} {r.urgency}
                    </span>
                    {r.aiSeverity && <p style={{ margin:'3px 0 0', fontSize:'10px', color:'#6F4E37' }}>🤖 {r.aiSeverity} {r.aiConfidence}%</p>}
                  </td>
                  {/* Date */}
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>{r.submittedAt}</td>
                  {/* Status */}
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 8px', borderRadius:'20px', background:statusBg[r.status]||'#fffbeb', color:statusColor[r.status]||'#d97706' }}>
                      {r.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      <button onClick={() => setSelected(selected?.id===r.id ? null : r)}
                        style={{ fontSize:'11px', fontWeight:600, padding:'4px 8px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', color:'#475569', cursor:'pointer' }}>
                        👁 View
                      </button>
                      {/* Next status button */}
                      {r.status === 'Submitted' && (
                        <button onClick={() => updateStatus(r.id,'Acknowledged')}
                          style={{ fontSize:'11px', fontWeight:600, padding:'4px 8px', borderRadius:'8px', border:'1px solid #bfdbfe', background:'#eff6ff', color:'#2563eb', cursor:'pointer' }}>
                          Acknowledge
                        </button>
                      )}
                      {r.status === 'Acknowledged' && (
                        <button onClick={() => updateStatus(r.id,'In Progress')}
                          style={{ fontSize:'11px', fontWeight:600, padding:'4px 8px', borderRadius:'8px', border:'1px solid #ddd6fe', background:'#f5f3ff', color:'#7c3aed', cursor:'pointer' }}>
                          Start Rescue
                        </button>
                      )}
                      {r.status === 'In Progress' && (
                        <button onClick={() => updateStatus(r.id,'Rescued')}
                          style={{ fontSize:'11px', fontWeight:600, padding:'4px 8px', borderRadius:'8px', border:'1px solid #bbf7d0', background:'#f0fdf4', color:'#16a34a', cursor:'pointer' }}>
                          ✅ Rescued
                        </button>
                      )}
                      {r.status === 'Rescued' && (
                        <button onClick={() => updateStatus(r.id,'Closed')}
                          style={{ fontSize:'11px', fontWeight:600, padding:'4px 8px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#f9fafb', color:'#6b7280', cursor:'pointer' }}>
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'600px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#fdf9f5,#f5f0e8)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'28px' }}>🚑</span>
                <div>
                  <h3 style={{ margin:0, fontSize:'17px', fontWeight:700, color:'#1e293b' }}>{selected.animalType||'Animal'} Rescue Report</h3>
                  <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#94a3b8' }}>ID: {selected.id?.slice(-8)?.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:'16px' }}>✕</button>
            </div>

            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
              {/* Image */}
              {selected.imagePreview && (
                <img src={selected.imagePreview} alt="animal" style={{ width:'100%', height:'220px', objectFit:'cover', objectPosition:'top', borderRadius:'14px' }} />
              )}

              {/* Info grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  ['🐾 Animal',     selected.animalType||'Unknown'],
                  ['⚡ Urgency',    selected.urgency],
                  ['👤 Reporter',   selected.reporterName||'—'],
                  ['📞 Phone',      selected.reporterPhone||'—'],
                  ['📍 Location',   selected.location||'—'],
                  ['🏥 Center',     selected.rescueCenterName||'Not assigned'],
                  ['🗓 Submitted',  selected.submittedAt],
                  ['🤖 AI Severity',selected.aiSeverity ? `${selected.aiSeverity} (${selected.aiConfidence}%)` : 'N/A'],
                ].map(([lbl,val]) => (
                  <div key={lbl} style={{ background:'#f8fafc', borderRadius:'10px', padding:'10px 12px', border:'1px solid #f1f5f9' }}>
                    <p style={{ margin:'0 0 3px', fontSize:'11px', color:'#64748b', fontWeight:600 }}>{lbl}</p>
                    <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:'#1e293b', wordBreak:'break-word' }}>{val||'—'}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selected.description && (
                <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'14px', border:'1px solid #f1f5f9' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#1e293b', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Description</p>
                  <p style={{ margin:0, fontSize:'13px', color:'#475569', lineHeight:1.6 }}>{selected.description}</p>
                </div>
              )}

              {/* AI Actions */}
              {selected.aiActions?.length > 0 && (
                <div style={{ background:'#fff8f0', borderRadius:'12px', padding:'14px', border:'1px solid #e8dcc8' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#6F4E37', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.4px' }}>🤖 AI Recommended Actions</p>
                  {selected.aiActions.map((a,i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', fontSize:'13px', color:'#475569', marginBottom:'6px' }}>
                      <span style={{ fontWeight:700, color:'#6F4E37', minWidth:'18px' }}>{i+1}.</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'#1e293b', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📋 Status Timeline</p>
                <div style={{ display:'flex', gap:'4px', alignItems:'center', overflowX:'auto', paddingBottom:'4px' }}>
                  {STEPS.map((s,i) => {
                    const done = STEPS.indexOf(selected.status) >= i;
                    return (
                      <div key={s} style={{ display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'50%', background: done ? 'linear-gradient(135deg,#6F4E37,#8B6347)' : '#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color: done?'white':'#9ca3af', fontWeight:700 }}>
                            {done ? '✓' : i+1}
                          </div>
                          <span style={{ fontSize:'9px', color: done?'#6F4E37':'#9ca3af', fontWeight:600, whiteSpace:'nowrap' }}>{s}</span>
                        </div>
                        {i < STEPS.length-1 && <div style={{ width:'22px', height:'2px', background: STEPS.indexOf(selected.status) > i ? '#8B7355' : '#e8dcc8', borderRadius:'1px', marginBottom:'14px' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer — status action buttons */}
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {selected.status === 'Submitted' && (
                <button onClick={() => updateStatus(selected.id,'Acknowledged')}
                  style={{ flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'#2563eb', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  👁 Acknowledge
                </button>
              )}
              {selected.status === 'Acknowledged' && (
                <button onClick={() => updateStatus(selected.id,'In Progress')}
                  style={{ flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'#7c3aed', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  🚑 Start Rescue
                </button>
              )}
              {selected.status === 'In Progress' && (
                <button onClick={() => updateStatus(selected.id,'Rescued')}
                  style={{ flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'#16a34a', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  ✅ Mark as Rescued
                </button>
              )}
              {selected.status === 'Rescued' && (
                <button onClick={() => updateStatus(selected.id,'Closed')}
                  style={{ flex:1, padding:'11px', borderRadius:'10px', border:'none', background:'#6b7280', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  🔒 Close Report
                </button>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding:'11px 20px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'white', color:'#475569', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ADMIN REVIEWS & FEEDBACK ── */
function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter]   = useState('All');

  useEffect(() => {
    const load = () => {
      const all = JSON.parse(localStorage.getItem('platformReviews') || '[]');
      setReviews(all);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : 0;
  const filtered  = filter==='All' ? reviews : reviews.filter(r=>r.rating===Number(filter));
  const ratingCounts = [5,4,3,2,1].map(n=>({ star:n, count:reviews.filter(r=>r.rating===n).length }));

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Reviews & Feedback ⭐</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Customer ratings and feedback submitted for the platform.</p>
      </div>

      {/* Summary */}
      <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f1f5f9', marginBottom:'20px', display:'flex', gap:'28px', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ textAlign:'center', minWidth:'90px' }}>
          <div style={{ fontSize:'52px', fontWeight:900, color:'#f59e0b', lineHeight:1 }}>{avgRating}</div>
          <div style={{ display:'flex', gap:'2px', justifyContent:'center', marginTop:'4px' }}>
            {[1,2,3,4,5].map(n=><span key={n} style={{ fontSize:'16px', color:n<=Math.round(avgRating)?'#f59e0b':'#e2e8f0' }}>★</span>)}
          </div>
          <p style={{ fontSize:'12px', color:'#94a3b8', margin:'6px 0 0' }}>{reviews.length} reviews</p>
        </div>
        <div style={{ flex:1, minWidth:'200px' }}>
          {ratingCounts.map(({star,count})=>(
            <div key={star} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'5px' }}>
              <span style={{ fontSize:'12px', color:'#f59e0b', fontWeight:700, minWidth:'26px' }}>{star} ★</span>
              <div style={{ flex:1, height:'8px', background:'#f5f0e8', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${reviews.length>0?(count/reviews.length)*100:0}%`, background:'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius:'4px' }} />
              </div>
              <span style={{ fontSize:'11px', color:'#94a3b8', minWidth:'20px', textAlign:'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
        {['All','5','4','3','2','1'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:'7px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
              background:filter===f?'linear-gradient(135deg,#6F4E37,#8B6347)':'#f5f0e8',
              color:filter===f?'white':'#8B7355' }}>
            {f==='All'?'⭐ All':f+' ★'}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f1f5f9' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>⭐</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#1e293b', marginBottom:'6px' }}>No reviews yet</p>
          <p style={{ fontSize:'13px', color:'#94a3b8' }}>Customer reviews will appear here once submitted.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'40px 20px', textAlign:'center', border:'1px solid #f1f5f9', color:'#94a3b8' }}>
          No reviews with {filter} stars
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background:'white', borderRadius:'16px', padding:'18px 20px', border:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'14px', flexShrink:0 }}>
                    {(r.userName||'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'14px', color:'#1e293b', margin:'0 0 2px' }}>{r.userName}</p>
                    <div style={{ display:'flex', gap:'2px' }}>
                      {[1,2,3,4,5].map(n=><span key={n} style={{ fontSize:'13px', color:n<=r.rating?'#f59e0b':'#e2e8f0' }}>★</span>)}
                      <span style={{ fontSize:'11px', fontWeight:600, padding:'1px 7px', borderRadius:'20px', background:'#fdf0e6', color:'#6F4E37', marginLeft:'6px' }}>{r.category}</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize:'11px', color:'#94a3b8' }}>{r.createdAt}</span>
              </div>
              {r.title && <p style={{ fontWeight:700, fontSize:'13px', color:'#1e293b', margin:'0 0 5px' }}>{r.title}</p>}
              <p style={{ fontSize:'13px', color:'#475569', margin:'0 0 8px', lineHeight:1.5 }}>{r.comment}</p>
              <div style={{ display:'flex', gap:'8px' }}>
                <span style={{ fontSize:'11px', color:'#94a3b8' }}>👍 {r.helpful||0} found helpful</span>
                <span style={{ fontSize:'11px', color:'#94a3b8' }}>·</span>
                <span style={{ fontSize:'11px', color:'#475569' }}>{r.userEmail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ADMIN VACCINATION MANAGEMENT ── */
function AdminVaccination() {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('adminPets') || '[]');
    setPets(all);
  }, []);

  const today = new Date();
  const mk = (pet, label, offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return { label, date: d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }), due: offsetDays <= 7 && offsetDays >= 0, overdue: offsetDays < 0 };
  };

  const getSchedule = (pet) => [
    mk(pet, 'Core Vaccine (DHPP/FVRCP)', 0),
    mk(pet, 'Deworming', 14),
    mk(pet, 'Rabies Vaccine', 30),
    mk(pet, 'Flea & Tick Prevention', 21),
    mk(pet, 'Booster Shot', 90),
    mk(pet, 'Annual Health Check', 365),
  ];

  const filtered = pets.filter(p =>
    (filter==='All' || (p.species||'').toLowerCase()===filter.toLowerCase()) &&
    (!search || (p.name||'').toLowerCase().includes(search.toLowerCase()) || (p.breed||'').toLowerCase().includes(search.toLowerCase()))
  );

  const vaccinatedCount = pets.filter(p=>p.vaccinated===true||p.vaccinated==='Yes').length;
  const unvaccinatedCount = pets.length - vaccinatedCount;

  const iStyle = { padding:'9px 14px', borderRadius:'10px', border:'1.5px solid #e2e8f0', fontSize:'13px', outline:'none', background:'white', color:'#1e293b' };

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Vaccination Management 📅</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Track and manage vaccination schedules for all pets.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'18px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>💉</div>
          <div>
            <div style={{ fontSize:'24px', fontWeight:800, color:'#16a34a' }}>{vaccinatedCount}</div>
            <div style={{ fontSize:'12px', color:'#64748b' }}>Vaccinated Pets</div>
          </div>
        </div>
        <div style={{ background:'white', borderRadius:'16px', padding:'18px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>⚠️</div>
          <div>
            <div style={{ fontSize:'24px', fontWeight:800, color:'#dc2626' }}>{unvaccinatedCount}</div>
            <div style={{ fontSize:'12px', color:'#64748b' }}>Unvaccinated Pets</div>
          </div>
        </div>
        <div style={{ background:'white', borderRadius:'16px', padding:'18px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>🐾</div>
          <div>
            <div style={{ fontSize:'24px', fontWeight:800, color:'#2563eb' }}>{pets.length}</div>
            <div style={{ fontSize:'12px', color:'#64748b' }}>Total Pets</div>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px', background:'white', borderRadius:'16px', padding:'14px 18px', border:'1px solid #f1f5f9' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pet name or breed..."
          style={{ ...iStyle, flex:1, minWidth:'180px' }} />
        {['All','Dog','Cat','Bird','Rabbit'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ padding:'8px 14px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600,
              background:filter===s?'linear-gradient(135deg,#6F4E37,#8B6347)':'#f5f0e8',
              color:filter===s?'white':'#8B7355' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Pets vaccination table */}
      {filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f1f5f9', color:'#94a3b8' }}>
          <div style={{ fontSize:'40px', marginBottom:'10px' }}>💉</div>
          <p style={{ fontWeight:600 }}>No pets found</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {filtered.map(pet => {
            const img = pet.imageUrls?.[0] || pet.imagePreview || null;
            const isVacc = pet.vaccinated===true || pet.vaccinated==='Yes';
            const schedule = getSchedule(pet);
            return (
              <div key={pet.id} style={{ background:'white', borderRadius:'16px', border:`1px solid ${isVacc?'#bbf7d0':'#fecaca'}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Pet header */}
                <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px', background: isVacc?'linear-gradient(135deg,#f0fdf4,#ffffff)':'linear-gradient(135deg,#fef2f2,#ffffff)' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'12px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>
                    {img ? <img src={img} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} /> : (pet.species==='Dog'?'🐶':pet.species==='Cat'?'🐱':pet.species==='Bird'?'🐦':'🐾')}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                      <span style={{ fontWeight:700, fontSize:'15px', color:'#1e293b' }}>{pet.name}</span>
                      <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#f5f0e8', color:'#8B7355' }}>{pet.species}</span>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:isVacc?'#dcfce7':'#fef2f2', color:isVacc?'#16a34a':'#dc2626' }}>
                        {isVacc?'✅ Vaccinated':'❌ Not Vaccinated'}
                      </span>
                    </div>
                    <p style={{ fontSize:'12px', color:'#94a3b8', margin:0 }}>{pet.breed} · {pet.age} {pet.ageUnit||'years'} · 📍 {pet.location}</p>
                  </div>
                </div>
                {/* Vaccination schedule */}
                <div style={{ padding:'14px 20px 18px' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#1e293b', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📅 Vaccination Schedule</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'8px' }}>
                    {schedule.map((s,i) => (
                      <div key={i} style={{ padding:'8px 12px', borderRadius:'10px', background: s.overdue?'#fef2f2':s.due?'#fefce8':'#f8fafc', border:`1px solid ${s.overdue?'#fecaca':s.due?'#fde047':'#e2e8f0'}` }}>
                        <p style={{ margin:'0 0 3px', fontSize:'11px', fontWeight:700, color:s.overdue?'#dc2626':s.due?'#854d0e':'#475569' }}>
                          {s.overdue?'🔴 OVERDUE':s.due?'⚠️ DUE SOON':'💉'} {s.label}
                        </p>
                        <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>{s.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── ADMIN SETTINGS ── */
function AdminSettings({ admin }) {
  const [theme, setTheme]     = useState(() => localStorage.getItem('adminTheme')    || 'coffee');
  const [language, setLanguage] = useState(() => localStorage.getItem('adminLang')   || 'English');
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem('adminEmailNotifs') !== 'false');
  const [autoApprove, setAutoApprove] = useState(() => localStorage.getItem('adminAutoApprove') === 'true');
  const [saved, setSaved]     = useState(false);

  const themes = [
    { id:'coffee', label:'Coffee & White', icon:'☕', bg:'linear-gradient(135deg,#6F4E37,#f5deb3)' },
    { id:'slate',  label:'Slate Gray',     icon:'🌑', bg:'linear-gradient(135deg,#334155,#e2e8f0)' },
    { id:'dark',   label:'Dark Mode',      icon:'🌙', bg:'linear-gradient(135deg,#0f172a,#334155)' },
    { id:'forest', label:'Forest Green',   icon:'🌿', bg:'linear-gradient(135deg,#14532d,#86efac)' },
  ];
  const languages = ['English','हिंदी (Hindi)','ಕನ್ನಡ (Kannada)','தமிழ் (Tamil)','తెలుగు (Telugu)'];

  const handleSave = () => {
    localStorage.setItem('adminTheme', theme);
    localStorage.setItem('adminLang', language);
    localStorage.setItem('adminEmailNotifs', String(emailNotifs));
    localStorage.setItem('adminAutoApprove', String(autoApprove));
    setSaved(true);
    toast.success('Settings saved! ✅');
    setTimeout(() => setSaved(false), 2000);
  };

  const iStyle = { padding:'10px 14px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'13px', outline:'none', background:'white', color:'#1e293b', boxSizing:'border-box', cursor:'pointer' };

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Settings ⚙️</h2>
        <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Customize your admin experience.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'640px' }}>
        {/* Theme */}
        <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#1e293b', margin:'0 0 14px' }}>🎨 Theme</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {themes.map(t => (
              <div key={t.id} onClick={() => setTheme(t.id)}
                style={{ padding:'12px 14px', borderRadius:'12px', border:`2px solid ${theme===t.id?'#6F4E37':'#f1f5f9'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', background:theme===t.id?'#fdf9f5':'white', transition:'all 0.15s' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:t.bg, flexShrink:0 }} />
                <div>
                  <p style={{ margin:'0 0 2px', fontSize:'12px', fontWeight:700, color:theme===t.id?'#6F4E37':'#1e293b' }}>{t.icon} {t.label}</p>
                  {theme===t.id && <p style={{ margin:0, fontSize:'10px', color:'#16a34a', fontWeight:600 }}>✓ Active</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#1e293b', margin:'0 0 14px' }}>🌐 Language</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {languages.map(l => (
              <div key={l} onClick={() => setLanguage(l)}
                style={{ padding:'10px 14px', borderRadius:'10px', border:`1.5px solid ${language===l?'#6F4E37':'#f1f5f9'}`, cursor:'pointer', display:'flex', justifyContent:'space-between', background:language===l?'#fdf9f5':'white', transition:'all 0.15s' }}>
                <span style={{ fontSize:'13px', fontWeight:language===l?700:400, color:language===l?'#6F4E37':'#1e293b' }}>{l}</span>
                {language===l && <span style={{ fontSize:'14px' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div style={{ background:'white', borderRadius:'18px', padding:'22px', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'16px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#1e293b', margin:0 }}>🔔 Preferences</h3>
          {[
            { label:'Email Notifications', sub:'Receive email alerts for new requests', val:emailNotifs, set:setEmailNotifs },
            { label:'Auto-approve Rescue', sub:'Automatically acknowledge rescue reports', val:autoApprove, set:setAutoApprove },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>{item.sub}</p>
              </div>
              <div onClick={() => item.set(v => !v)}
                style={{ width:'46px', height:'24px', borderRadius:'12px', background:item.val?'#6F4E37':'#e2e8f0', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:'2px', left:item.val?'24px':'2px', width:'20px', height:'20px', borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave}
          style={{ padding:'13px', borderRadius:'12px', border:'none', background:saved?'#16a34a':'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(111,78,55,0.25)' }}>
          {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function Placeholder({ icon, title, desc }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>{icon}</div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', marginBottom:'8px' }}>{title}</h2>
      <p style={{ color:'#94a3b8', fontSize:'14px', maxWidth:'360px', margin:'0 auto 24px' }}>{desc}</p>
      <div style={{ display:'inline-block', background:'#1e40af', color:'white', padding:'10px 24px', borderRadius:'12px', fontSize:'13px', fontWeight:600 }}>Coming Soon</div>
    </div>
  );
}

function ManagePets() {
  const INITIAL = { name:'', species:'Dog', breed:'', age:'', ageUnit:'years', description:'', fee:'', location:'', vaccinated:'No', status:'Available', image:null, imagePreview:'', ownerName:'', ownerPhone:'', ownerEmail:'', ownerAddress:'' };
  const [pets, setPets]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(INITIAL);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  // ── fetch pets (localStorage first, then backend) ──
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      // 1. Load from localStorage first for instant display
      const stored = localStorage.getItem('adminPets');
      if (stored) {
        try {
          const localPets = JSON.parse(stored);
          // Deduplicate by name+species+breed combination (remove duplicates)
          const seen = new Set();
          const deduped = localPets.filter(p => {
            const key = `${p.name}_${p.species}_${p.breed}_${p.age}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          // Save deduped back if changed
          if (deduped.length !== localPets.length) {
            localStorage.setItem('adminPets', JSON.stringify(deduped));
          }
          setPets(deduped.map(p => ({
            ...p,
            fee:         p.adoptionFee ?? p.fee ?? '',
            status:      p.adoptionStatus ?? p.status ?? 'Available',
            vaccinated:  (p.vaccinated === true || p.vaccinated === 'Yes') ? 'Yes' : 'No',
            imagePreview:(p.imageUrls && p.imageUrls[0]) || '',
          })));
          setLoading(false);
        } catch (_) {}
      }

      // 2. Try backend
      const res = await fetch('http://localhost:5000/api/pets');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          localStorage.setItem('adminPets', JSON.stringify(data));
          setPets(data.map(p => ({
            ...p,
            fee:         p.adoptionFee ?? p.fee ?? '',
            status:      p.adoptionStatus ?? p.status ?? 'Available',
            vaccinated:  (p.vaccinated === true || p.vaccinated === 'Yes') ? 'Yes' : 'No',
            imagePreview:(p.imageUrls && p.imageUrls[0]) || '',
          })));
        }
      }
    } catch (err) {
      console.log('Backend unavailable, using local data');
    } finally {
      setLoading(false);
    }
  };

  const openAdd  = () => { setForm(INITIAL); setEditId(null); setErrors({}); setShowModal(true); };
  const openEdit = (pet) => { setForm({...pet}); setEditId(pet.id); setErrors({}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(INITIAL); setErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload a valid image file'); return; }

    // Compress image to keep MongoDB document size reasonable (max ~800px wide)
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.75); // 75% quality JPEG
        setForm(p => ({ ...p, image: file, imagePreview: compressed }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim())        e.name        = 'Name is required';
    if (!form.breed?.trim())       e.breed       = 'Breed is required';
    if (!form.age || form.age<=0)  e.age         = 'Valid age is required';
    if (!form.description?.trim()) e.description = 'Description is required';
    if (!form.fee || form.fee<=0)  e.fee         = 'Valid fee is required';
    if (!form.location?.trim())    e.location    = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── save pet (backend first, localStorage fallback) ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name:           form.name,
      species:        form.species,
      breed:          form.breed,
      age:            Number(form.age),
      ageUnit:        form.ageUnit || 'years',
      description:    form.description,
      adoptionFee:    Number(form.fee),
      location:       form.location,
      vaccinated:     form.vaccinated === 'Yes',
      adoptionStatus: form.status || 'Available',
      ownerName:      form.ownerName  || '',
      ownerPhone:     form.ownerPhone || '',
      ownerEmail:     form.ownerEmail || '',
      ownerAddress:   form.ownerAddress || '',
      imageUrls:      form.imagePreview ? [form.imagePreview] : [],
    };

    let savedPet = null;
    let backendAvailable = false;
    const tempId = 'local_' + Date.now();

    try {
      const url    = editId ? `http://localhost:5000/api/pets/${editId}` : 'http://localhost:5000/api/pets';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        savedPet = await res.json();
        backendAvailable = true;

        if (form.imagePreview && form.image) {
          try {
            await fetch(`http://localhost:5000/api/pets/${savedPet.id}/image-base64`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              },
              body: JSON.stringify({ imageData: form.imagePreview }),
            });
            const refreshed = await fetch(`http://localhost:5000/api/pets/${savedPet.id}`);
            if (refreshed.ok) savedPet = await refreshed.json();
          } catch (_) {
            // Image endpoint failed — pet was still created
          }
        }
      } else {
        const errorText = await res.text().catch(() => 'Unable to save pet to MongoDB');
        toast.error(`Pet save failed on backend: ${errorText}`);
      }
    } catch (error) {
      toast.error('Unable to reach backend. Saving locally.');
    }

    const stored = localStorage.getItem('adminPets');
    let localPets = [];
    try { localPets = stored ? JSON.parse(stored) : []; } catch (_) { localPets = []; }

    if (savedPet) {
      if (editId) {
        localPets = localPets.map(p => p.id === editId ? savedPet : p);
      } else {
        localPets.push(savedPet);
      }
      localStorage.setItem('adminPets', JSON.stringify(localPets));
      toast.success(editId ? `${form.name} updated & saved to MongoDB!` : `${form.name} added to MongoDB!`);
    } else {
      const fallbackPet = { ...payload, id: editId || tempId };
      if (editId) {
        localPets = localPets.map(p => p.id === editId ? fallbackPet : p);
      } else {
        localPets.push(fallbackPet);
      }
      localStorage.setItem('adminPets', JSON.stringify(localPets));
      toast.success(editId ? `${form.name} updated locally!` : `${form.name} saved locally (backend offline)`);
    }

    closeModal();
    fetchPets();
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    
    // Remove from localStorage immediately
    const stored = localStorage.getItem('adminPets');
    if (stored) {
      try {
        const localPets = JSON.parse(stored).filter(p => p.id !== id);
        localStorage.setItem('adminPets', JSON.stringify(localPets));
      } catch (_) {}
    }
    setPets(p => p.filter(x => x.id !== id));
    toast.success(`${name} removed`);

    // Also try to delete from backend
    try {
      await fetch(`http://localhost:5000/api/pets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
    } catch (_) {
      // Backend not available — already removed from localStorage above
    }
  };

  const statusColor = { Available:'#16a34a', Adopted:'#2563eb', Pending:'#d97706' };
  const statusBg    = { Available:'#f0fdf4', Adopted:'#eff6ff', Pending:'#fffbeb' };

  const inputStyle = (field) => ({
    width:'100%', padding:'10px 12px', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box',
    border: errors[field] ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0',
    background: errors[field] ? '#fef2f2' : 'white',
  });
  const labelStyle = { fontSize:'12px', fontWeight:600, color:'#475569', display:'block', marginBottom:'6px' };
  const errStyle   = { fontSize:'11px', color:'#dc2626', marginTop:'3px' };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Manage Pets 🐾</h2>
          <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Add, edit, or remove pets from the platform.</p>
        </div>
        <button onClick={openAdd}
          style={{ padding:'10px 20px', borderRadius:'12px', border:'none', background:'#1e40af', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
          + Add Pet
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'36px', marginBottom:'10px' }}>🔄</div>
            Loading pets from database...
          </div>
        ) : pets.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'48px', marginBottom:'10px' }}>🐾</div>
            <p style={{ fontWeight:600, color:'#5a4635', fontSize:'15px', margin:'0 0 6px' }}>No pets yet</p>
            <p style={{ fontSize:'13px', margin:0 }}>Click "+ Add Pet" to add the first pet to the platform.</p>
          </div>
        ) : (
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {['Image','ID','Name','Species','Breed','Age','Fee','Owner','Contact','Vaccinated','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pets.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i<pets.length-1 ? '1px solid #f8fafc' : 'none' }}>
                <td style={{ padding:'10px 14px' }}>
                  {p.imagePreview
                    ? <img src={p.imagePreview} alt={p.name} style={{ width:'40px', height:'40px', borderRadius:'10px', objectFit:'cover' }} />
                    : <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🐾</div>
                  }
                </td>
                <td style={{ padding:'10px 14px', fontSize:'13px', color:'#94a3b8' }}>{p.id ? p.id.substring(0,8) : '—'}…</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{p.name}</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', color:'#475569' }}>{p.species}</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', color:'#475569' }}>{p.breed}</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', color:'#475569' }}>{p.age} {p.ageUnit || 'years'}</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:600, color:'#1e40af' }}>₹{p.fee ?? p.adoptionFee}</td>
                <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1e293b', fontWeight:500 }}>{p.ownerName || <span style={{ color:'#cbd5e1' }}>—</span>}</td>
                <td style={{ padding:'10px 14px', fontSize:'12px', color:'#475569' }}>
                  {p.ownerPhone ? (
                    <div>
                      <div>📞 {p.ownerPhone}</div>
                      {p.ownerEmail && <div style={{ marginTop:'2px' }}>📧 {p.ownerEmail}</div>}
                    </div>
                  ) : <span style={{ color:'#cbd5e1' }}>—</span>}
                </td>
                <td style={{ padding:'10px 14px' }}>
                  <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 8px', borderRadius:'20px', background: p.vaccinated==='Yes' ? '#f0fdf4' : '#fef2f2', color: p.vaccinated==='Yes' ? '#16a34a' : '#dc2626' }}>
                    {p.vaccinated==='Yes' ? '✅ Yes' : '❌ No'}
                  </span>
                </td>
                <td style={{ padding:'10px 14px' }}>
                  <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 8px', borderRadius:'20px', background:statusBg[p.status]||'#f1f5f9', color:statusColor[p.status]||'#475569' }}>{p.status}</span>
                </td>
                <td style={{ padding:'10px 14px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  <button onClick={() => openEdit(p)}
                    style={{ fontSize:'12px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #bfdbfe', background:'#eff6ff', color:'#2563eb', cursor:'pointer' }}>Edit</button>
                  {(p.status === 'Adopted' || p.adoptionStatus === 'Adopted') && (
                    <button onClick={() => {
                      const stored = localStorage.getItem('adminPets');
                      if (stored) {
                        const pets = JSON.parse(stored).map(pet =>
                          pet.id === p.id ? { ...pet, adoptionStatus: 'Available', status: 'Available' } : pet
                        );
                        localStorage.setItem('adminPets', JSON.stringify(pets));
                      }
                      setPets(prev => prev.map(pet =>
                        pet.id === p.id ? { ...pet, status: 'Available', adoptionStatus: 'Available' } : pet
                      ));
                      toast.success(`${p.name} reset to Available ✅`);
                    }}
                      style={{ fontSize:'12px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #fed7aa', background:'#fff7ed', color:'#ea580c', cursor:'pointer' }}>
                      🔄 Available
                    </button>
                  )}
                  <button onClick={() => handleDelete(p.id, p.name)}
                    style={{ fontSize:'12px', fontWeight:600, padding:'5px 10px', borderRadius:'8px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>

            {/* Modal header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#1e293b' }}>{editId ? '✏️ Edit Pet' : '🐾 Add New Pet'}</h3>
                <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#94a3b8' }}>{editId ? 'Update pet information' : 'Fill in the details to add a new pet'}</p>
              </div>
              <button onClick={closeModal}
                style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:'16px', color:'#64748b' }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>

              {/* Image upload */}
              <div>
                <label style={labelStyle}>
                  Pet Image
                  {form.imagePreview && !form.image && (
                    <span style={{ marginLeft:'8px', fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#dcfce7', color:'#16a34a' }}>
                      ✓ Saved in MongoDB
                    </span>
                  )}
                  {form.imagePreview && form.image && (
                    <span style={{ marginLeft:'8px', fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#fef9c3', color:'#854d0e' }}>
                      ⏳ New — will save on submit
                    </span>
                  )}
                </label>
                <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:`2px dashed ${form.imagePreview ? '#16a34a' : '#e2e8f0'}`, borderRadius:'14px', padding:'20px', cursor:'pointer', background: form.imagePreview ? '#f0fdf4' : '#f8fafc', transition:'all 0.2s' }}>
                  {form.imagePreview
                    ? <div style={{ position:'relative' }}>
                        <img src={form.imagePreview} alt="preview" style={{ width:'140px', height:'140px', objectFit:'cover', borderRadius:'12px', marginBottom:'8px', display:'block' }} />
                        <div style={{ position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.5)', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>✏️</div>
                      </div>
                    : <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'40px', marginBottom:'8px' }}>📷</div>
                        <p style={{ fontSize:'13px', color:'#64748b', margin:0, fontWeight:600 }}>Click to upload pet image</p>
                        <p style={{ fontSize:'11px', color:'#94a3b8', margin:'6px 0 0' }}>PNG, JPG, JPEG — auto-compressed, stored in MongoDB</p>
                      </div>
                  }
                  <input type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
                </label>
                {form.imagePreview && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'8px' }}>
                    <button onClick={() => setForm(p => ({...p, image:null, imagePreview:''}))}
                      style={{ fontSize:'11px', color:'#dc2626', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                      🗑 Remove image
                    </button>
                    <span style={{ fontSize:'11px', color:'#94a3b8' }}>|</span>
                    <span style={{ fontSize:'11px', color:'#64748b' }}>Image will be stored as base64 in MongoDB</span>
                  </div>
                )}
              </div>

              {/* Name + Species */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Pet Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Max" style={inputStyle('name')} />
                  {errors.name && <p style={errStyle}>{errors.name}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Species *</label>
                  <select name="species" value={form.species} onChange={handleChange} style={inputStyle('species')}>
                    {['Dog','Cat','Rabbit','Bird','Hamster','Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Breed + Age */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Breed *</label>
                  <input name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" style={inputStyle('breed')} />
                  {errors.breed && <p style={errStyle}>{errors.breed}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Age *</label>
                  <input name="age" type="number" min="0" max="30" value={form.age} onChange={handleChange} placeholder="e.g. 3" style={inputStyle('age')} />
                  {errors.age && <p style={errStyle}>{errors.age}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Age Unit *</label>
                  <select name="ageUnit" value={form.ageUnit || 'years'} onChange={handleChange} style={inputStyle('ageUnit')}>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the pet's personality, behaviour, and special needs..." rows={3}
                  style={{ ...inputStyle('description'), resize:'vertical', fontFamily:'inherit' }} />
                {errors.description && <p style={errStyle}>{errors.description}</p>}
              </div>

              {/* Fee + Location */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Adoption Fee (₹) *</label>
                  <input name="fee" type="number" min="0" value={form.fee} onChange={handleChange} placeholder="e.g. 5000" style={inputStyle('fee')} />
                  {errors.fee && <p style={errStyle}>{errors.fee}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Location *</label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. New York" style={inputStyle('location')} />
                  {errors.location && <p style={errStyle}>{errors.location}</p>}
                </div>
              </div>

              {/* Vaccinated + Status */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Vaccinated *</label>
                  <select name="vaccinated" value={form.vaccinated} onChange={handleChange} style={inputStyle('vaccinated')}>
                    <option value="Yes">✅ Yes</option>
                    <option value="No">❌ No</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} style={inputStyle('status')}>
                    <option value="Available">Available</option>
                    <option value="Adopted">Adopted</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Owner Details Section */}
              <div style={{ borderTop:'1.5px dashed #e2e8f0', paddingTop:'16px', marginTop:'4px' }}>
                <p style={{ fontSize:'13px', fontWeight:700, color:'#5a4635', marginBottom:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
                  👤 Owner / Contact Details
                </p>

                {/* Owner Name + Phone */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                  <div>
                    <label style={labelStyle}>Owner Name</label>
                    <input name="ownerName" value={form.ownerName || ''} onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      style={inputStyle('ownerName')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Phone</label>
                    <input name="ownerPhone" value={form.ownerPhone || ''} onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      style={inputStyle('ownerPhone')} />
                  </div>
                </div>

                {/* Owner Email + Address */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Owner Email</label>
                    <input name="ownerEmail" value={form.ownerEmail || ''} onChange={handleChange}
                      placeholder="e.g. owner@gmail.com"
                      style={inputStyle('ownerEmail')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Owner Address</label>
                    <input name="ownerAddress" value={form.ownerAddress || ''} onChange={handleChange}
                      placeholder="e.g. 12 MG Road, Bangalore"
                      style={inputStyle('ownerAddress')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', padding:'16px 24px', borderTop:'1px solid #f1f5f9' }}>
              <button onClick={closeModal}
                style={{ padding:'10px 20px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'white', color:'#475569', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                style={{ padding:'10px 24px', borderRadius:'10px', border:'none', background: saving ? '#94a3b8' : '#8B7355', color:'white', fontSize:'13px', fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : editId ? 'Save Changes' : 'Add Pet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from all localStorage sources
    const load = () => {
      const registered  = JSON.parse(localStorage.getItem('registeredUsers')  || '[]');
      const requests    = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
      const payments    = JSON.parse(localStorage.getItem('adminPayments')    || '[]');

      // Build user list from registered + adoption request reporters (deduplicated by email)
      const emailMap = {};

      registered.forEach(u => {
        emailMap[u.email] = {
          id:        u.id || 'u_' + u.email,
          name:      `${u.firstName||''} ${u.lastName||''}`.trim() || u.email.split('@')[0],
          email:     u.email,
          loginTime: localStorage.getItem('customerLoginTime') || 'N/A',
          source:    'Registered',
        };
      });

      // Also pick up from adoption requests
      requests.forEach(r => {
        if (r.customerEmail && !emailMap[r.customerEmail]) {
          emailMap[r.customerEmail] = {
            id:        r.userId || 'u_' + r.customerEmail,
            name:      r.customerName || r.customerEmail.split('@')[0],
            email:     r.customerEmail,
            loginTime: 'N/A',
            source:    'Via Adoption',
          };
        }
      });

      // Enrich each user with activity data
      const enriched = Object.values(emailMap).map(u => {
        const userReqs    = requests.filter(r => r.userEmail === u.email || r.customerEmail === u.email);
        const userPays    = payments.filter(p => p.customerEmail === u.email);
        const adopted     = userReqs.filter(r => r.status === 'Approved').length;
        const pending     = userReqs.filter(r => r.status === 'Pending').length;
        const totalPaid   = userPays.reduce((s, p) => s + Number(p.amount||0), 0);

        // Login time from localStorage (only available for current session user)
        const lsLoginTime = localStorage.getItem('customerLoginTime');
        const curUser     = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const loginTime   = curUser.email === u.email && lsLoginTime ? lsLoginTime : u.loginTime || 'N/A';

        // Time on platform — rough estimate from first request date
        const firstReq = userReqs[userReqs.length - 1];
        let memberSince = 'N/A';
        if (firstReq?.createdAt) {
          try {
            const d = new Date(firstReq.createdAt);
            memberSince = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
          } catch (_) {}
        }

        return { ...u, adopted, pending, totalPaid, loginTime, memberSince, totalRequests: userReqs.length };
      });

      setUsers(enriched);
      setLoading(false);

      // Also try backend in background
      fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        signal: AbortSignal.timeout(3000),
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const backendUsers = data.map(u => {
            const userReqs = requests.filter(r => r.userEmail === u.email || r.customerEmail === u.email);
            const userPays = payments.filter(p => p.customerEmail === u.email);
            return {
              id:           u.id,
              name:         `${u.firstName||''} ${u.lastName||''}`.trim() || u.email,
              email:        u.email,
              loginTime:    u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A',
              memberSince:  u.createdAt   ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A',
              adopted:      userReqs.filter(r => r.status === 'Approved').length,
              pending:      userReqs.filter(r => r.status === 'Pending').length,
              totalRequests:userReqs.length,
              totalPaid:    userPays.reduce((s, p) => s + Number(p.amount||0), 0),
              source:       'MongoDB',
            };
          });
          setUsers(backendUsers);
        }
      }).catch(() => {});
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#1e293b', margin:0 }}>Manage Users 👥</h2>
          <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>Registered customers, login history, and activity.</p>
        </div>
        <div style={{ fontSize:'13px', fontWeight:600, padding:'6px 14px', borderRadius:'10px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>
          {users.length} Total Users
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'32px', marginBottom:'10px' }}>⏳</div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>👥</div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'#1e293b' }}>No registered users yet</p>
            <p style={{ fontSize:'13px' }}>Customers who register or submit adoption requests will appear here.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['#','Name','Email','Last Login','Member Since','Requests','Adopted','Paid','Source'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length-1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#94a3b8', fontWeight:600 }}>#{i+1}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'13px', flexShrink:0 }}>
                        {(u.name||'U')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:'13px', color:'#1e293b' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'13px', color:'#475569' }}>{u.email}</td>
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>
                    🕐 {u.loginTime === 'N/A' ? <span style={{ color:'#cbd5e1' }}>Not recorded</span> : u.loginTime}
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b', whiteSpace:'nowrap' }}>
                    📅 {u.memberSince === 'N/A' ? <span style={{ color:'#cbd5e1' }}>—</span> : u.memberSince}
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:'13px', fontWeight:600, color:'#d97706', textAlign:'center' }}>{u.totalRequests}</td>
                  <td style={{ padding:'12px 14px', fontSize:'13px', fontWeight:700, color:'#16a34a', textAlign:'center' }}>{u.adopted}</td>
                  <td style={{ padding:'12px 14px', fontSize:'13px', fontWeight:700, color:'#7c3aed', whiteSpace:'nowrap' }}>
                    {u.totalPaid > 0 ? `₹${u.totalPaid.toLocaleString()}` : <span style={{ color:'#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#f1f5f9', color:'#475569' }}>
                      {u.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin] = useState(() => { try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); } catch { return {}; } });
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Count unread admin notifications from localStorage
  useEffect(() => {
    const updateNotifs = () => {
      const notifs = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      const unread = notifs.filter(n => !n.read).length;
      const notifNav = NAV.find(n => n.id === 'notifications');
      if (notifNav) notifNav.badge = unread > 0 ? unread : null;
      // Rescue requests badge — pending (Submitted) reports
      const rescueReports = JSON.parse(localStorage.getItem('rescueReports') || '[]');
      const pendingRescue = rescueReports.filter(r => r.status === 'Submitted' || r.status === 'Acknowledged').length;
      const rescueNav = NAV.find(n => n.id === 'rescue-reqs');
      if (rescueNav) rescueNav.badge = pendingRescue > 0 ? pendingRescue : null;
      // Payments badge
      const payments = JSON.parse(localStorage.getItem('adminPayments') || '[]');
      const paymentsNav = NAV.find(n => n.id === 'payments');
      if (paymentsNav) paymentsNav.badge = payments.length > 0 ? payments.length : null;
    };
    updateNotifs();
    const t1 = setInterval(updateNotifs, 3000);
    return () => clearInterval(t1);
  }, []);

  // Count pending adoption requests from localStorage
  useEffect(() => {
    const update = () => {
      const reqs = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
      setPendingCount(reqs.filter(r => r.status === 'Pending').length);
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const content = () => {
    switch(active) {
      case 'dashboard':     return <Dashboard admin={admin} />;
      case 'pets':          return <ManagePets />;
      case 'users':         return <ManageUsers />;
      case 'rescue-centers': return <AdminRescueCentersPage />;
      case 'adoption-reqs': return <AdoptionRequests />;
      case 'payments':      return <AdminPaymentHistory />;
      case 'rescue-reqs':   return <AdminRescueRequests />;
      case 'rescue-centers':return <Placeholder icon="🏥" title="Rescue Centers" desc="View and manage registered rescue centers." />;
      case 'ai-recs':       return <Placeholder icon="🤖" title="AI Recommendations" desc="AI-powered pet-to-adopter matching insights." />;
      case 'ai-chatbot':    return <Placeholder icon="💬" title="AI Chatbot" desc="Configure and monitor the AI assistant chatbot." />;
      case 'analytics':     return <AdminAnalytics />;
      case 'reviews':       return <AdminReviews />;
      case 'notifications': return <AdminNotifications />;
      case 'vaccination':   return <AdminVaccination />;
      case 'settings':      return <AdminSettings admin={admin} />;
      case 'profile':       return <AdminProfile admin={admin} />;
      default:              return <Dashboard admin={admin} />;
    }
  };

  const W = collapsed ? 64 : 240;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Inter,system-ui,sans-serif', background:'linear-gradient(135deg, #f5f0e8 0%, #ffffff 50%, #e8dcc8 100%)' }}>

      {/* SIDEBAR */}
      <div style={{ width:`${W}px`, minWidth:`${W}px`, height:'100vh', background:'linear-gradient(180deg,#5a4635 0%,#8B7355 100%)', display:'flex', flexDirection:'column', transition:'width 0.2s,min-width 0.2s', overflow:'hidden', flexShrink:0, boxShadow:'4px 0 20px rgba(90,70,53,0.25)' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'16px 12px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          <div style={{ width:'36px', height:'36px', minWidth:'36px', borderRadius:'10px', background:'#8B7355', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🐾</div>
          {!collapsed && <div><p style={{ color:'white', fontWeight:700, fontSize:'13px', margin:0, whiteSpace:'nowrap' }}>FurEver Home Admin</p><p style={{ color:'#d4c5b8', fontSize:'11px', margin:0, whiteSpace:'nowrap' }}>Control Center</p></div>}
        </div>

        {/* Admin info */}
        {!collapsed && (
          <div style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'32px', height:'32px', minWidth:'32px', borderRadius:'50%', background:'#8B7355', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'13px' }}>A</div>
              <div style={{ overflow:'hidden' }}>
                <p style={{ color:'white', fontSize:'13px', fontWeight:600, margin:0, whiteSpace:'nowrap' }}>Administrator</p>
                <p style={{ color:'#d4c5b8', fontSize:'11px', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>admin@gmail.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'8px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(item => {
              const badge = item.id === 'adoption-reqs' ? (pendingCount > 0 ? pendingCount : null) : item.badge;
              return (
            <button key={item.id} onClick={() => setActive(item.id)} title={collapsed ? item.label : ''}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', border:'none', cursor:'pointer', width:'100%', textAlign:'left', background: active===item.id ? 'rgba(139,115,85,0.5)' : 'transparent', borderLeft: active===item.id ? '3px solid #f5deb3' : '3px solid transparent', position:'relative', transition:'background 0.1s' }}>
              <span style={{ fontSize:'17px', lineHeight:1, flexShrink:0, minWidth:'20px', textAlign:'center' }}>{item.icon}</span>
              {!collapsed && <span style={{ color: active===item.id ? '#f5deb3' : '#d4c5b8', fontSize:'13px', fontWeight:500, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
              {badge && !collapsed && <span style={{ background:'#dc2626', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px' }}>{badge}</span>}
              {badge && collapsed && <span style={{ position:'absolute', top:'4px', right:'4px', background:'#dc2626', color:'white', fontSize:'9px', width:'13px', height:'13px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span>}
            </button>
              );
            })}
        </nav>

        {/* Logout */}
        <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          <button onClick={handleLogout} title={collapsed ? 'Logout' : ''}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', border:'none', cursor:'pointer', width:'100%', background:'transparent', color:'#ffb3b3' }}>
            <span style={{ fontSize:'17px', flexShrink:0, minWidth:'20px', textAlign:'center' }}>🚪</span>
            {!collapsed && <span style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:'56px', background:'white', borderBottom:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button onClick={() => setCollapsed(!collapsed)}
              style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:'12px', color:'#1e293b' }}>
              {collapsed ? '▶' : '◀'}
            </button>
            <div>
              <p style={{ fontSize:'11px', color:'#94a3b8', margin:0 }}>PetCare Admin</p>
              <p style={{ fontSize:'14px', fontWeight:600, color:'#1e293b', margin:0 }}>{NAV.find(n => n.id===active)?.label || 'Dashboard'}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => setActive('notifications')} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:'15px', position:'relative' }}>
              📢
              {(() => { const c = JSON.parse(localStorage.getItem('adminNotifications')||'[]').filter(n=>!n.read).length; return c > 0 ? <span style={{ position:'absolute', top:'3px', right:'3px', background:'#dc2626', color:'white', fontSize:'8px', fontWeight:700, width:'12px', height:'12px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{c}</span> : null; })()}
            </button>
            <button onClick={() => setActive('profile')} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'3px 10px 3px 3px', borderRadius:'20px', border:'none', background:'linear-gradient(135deg, #f5f0e8, #ffffff)', cursor:'pointer', boxShadow:'0 1px 3px rgba(90,70,53,0.15)' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'12px' }}>A</div>
              <span style={{ fontSize:'13px', fontWeight:500, color:'#5a4635' }}>Admin</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          {content()}
        </div>
      </div>
    </div>
  );
}
