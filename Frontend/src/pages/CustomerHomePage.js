import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import NearbySheltersPage from './NearbySheltersPage';

const NAV = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard' },
  { id: 'ai-recs',       icon: '🤖', label: 'AI Recommendations' },
  { id: 'browse',        icon: '🐾', label: 'Browse Pets' },
  { id: 'rescued',       icon: '🏥', label: 'Rescued Pets' },
  { id: 'favorites',     icon: '❤️', label: 'Favorites' },
  { id: 'requests',      icon: '📄', label: 'Adoption Requests' },
  { id: 'adoptions',     icon: '📋', label: 'My Adoptions' },
  { id: 'rescue',        icon: '🚑', label: 'Rescue Reports' },
  { id: 'shelters',      icon: '📍', label: 'Nearby Shelters' },
  { id: 'assistant',     icon: '💬', label: 'AI Assistant' },
  { id: 'petcare',       icon: '📅', label: 'Pet Care' },
  { id: 'reviews',       icon: '⭐', label: 'Reviews & Ratings' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', badge: null },
  { id: 'profile',       icon: '👤', label: 'My Profile' },
  { id: 'settings',      icon: '⚙️', label: 'Settings' },
];

/* ── Shared pet loader: backend first, then localStorage ── */
async function loadAllPets() {
  // Try backend first
  try {
    const res = await fetch('http://localhost:5000/api/pets');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem('adminPets', JSON.stringify(data));
        return data;
      }
    }
  } catch (_) {}

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem('adminPets');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({ ...p }));
      }
    }
  } catch (_) {}

  return [];
}

const emojiFor = s => s==='Dog'?'🐶':s==='Cat'?'🐱':s==='Rabbit'?'🐰':s==='Bird'?'🐦':'🐾';

/* ── CUSTOMER NOTIFICATIONS ── */
function CustomerNotifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [payModal, setPayModal] = useState(null);
  const [payStep, setPayStep] = useState('details');
  const [payMethod, setPayMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');

  const userEmail = user?.email || '';

  const loadNotifs = () => {
    const key = `customerNotifications_${userEmail}`;
    const specific = JSON.parse(localStorage.getItem(key) || '[]');
    const global   = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    // Merge and deduplicate — show all, no email filter
    const seen = new Set();
    const all = [...specific, ...global].filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    setNotifications(all);
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 2000);
    return () => clearInterval(interval);
  }, []); // run once and keep polling — userEmail is stable after login

  const markRead = (id) => {
    const update = ns => ns.map(n => n.id === id ? { ...n, read: true } : n);
    const key = `customerNotifications_${userEmail}`;
    localStorage.setItem(key, JSON.stringify(update(JSON.parse(localStorage.getItem(key) || '[]'))));
    const global = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    localStorage.setItem('customerNotifications', JSON.stringify(update(global)));
    setNotifications(prev => update(prev));
  };

  const handlePay = (notif) => {
    markRead(notif.id);
    setPayModal(notif);
    setPayStep('details');
    setPayMethod('upi');
    setUpiId('');
    setCardNum('');
    setCardName('');
  };

  const confirmPayment = () => {
    if (payMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID'); return;
    }
    if (payMethod === 'card' && (!cardNum.trim() || !cardName.trim())) {
      toast.error('Please enter card details'); return;
    }
    setPayStep('confirm');
  };

  const downloadReceipt = (notif, payDetail = '') => {
    const receipt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        FUREVER HOME
    PET ADOPTION RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt No  : ${notif.id?.slice(-8)?.toUpperCase() || 'N/A'}
Date        : ${new Date().toLocaleString()}

CUSTOMER DETAILS
─────────────────
Name     : ${user?.firstName || ''} ${user?.lastName || ''}
Email    : ${userEmail}

PET DETAILS
─────────────────
Pet Name : ${notif.petName}

PAYMENT DETAILS
─────────────────
Amount   : ₹${notif.amount}
Method   : ${payMethod?.toUpperCase() || 'UPI'}
${payDetail ? `UPI / Ref : ${payDetail}` : ''}
Status   : PAID ✓
Paid On  : ${new Date().toLocaleString()}

ADOPTION STATUS : APPROVED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Thank you for adopting! 🐾
  FurEver Home | Bangalore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FurEverHome_Receipt_${notif.petName}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded! 📄');
  };

  const completePayment = () => {
    // Mark notification as PAID
    const updatePaid = ns => ns.map(n => n.id === payModal.id ? { ...n, status: 'PAID', read: true } : n);
    const key = `customerNotifications_${userEmail}`;
    localStorage.setItem(key, JSON.stringify(updatePaid(JSON.parse(localStorage.getItem(key) || '[]'))));
    const global = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    localStorage.setItem('customerNotifications', JSON.stringify(updatePaid(global)));
    setNotifications(prev => updatePaid(prev));

    // Write payment success notification for admin
    const paymentSuccessNotif = {
      id:           'admin_pn_' + Date.now(),
      type:         'PAYMENT_SUCCESS',
      title:        '💰 Payment Received',
      message:      `Payment of ₹${payModal.amount} received from ${user?.firstName} ${user?.lastName || ''} for adopting ${payModal.petName}.`,
      petName:      payModal.petName,
      petImage:     payModal.petImage || '',
      amount:       payModal.amount,
      customerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      customerEmail: userEmail,
      payMethod:    payMethod,
      payDetail:    payMethod === 'upi' ? upiId : payMethod === 'card' ? `****${cardNum.slice(-4)}` : '',
      paidAt:       new Date().toLocaleString(),
      read:         false,
    };
    const adminNotifs = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifs.unshift(paymentSuccessNotif);
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifs));

    // Also save to adminPayments for Payment History page
    const payment = {
      id:            paymentSuccessNotif.id,
      petName:       payModal.petName,
      petImage:      payModal.petImage || '',
      customerName:  `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      customerEmail: userEmail,
      amount:        payModal.amount,
      payMethod,
      paidAt:        new Date().toLocaleString(),
      status:        'Paid',
    };
    const adminPayments = JSON.parse(localStorage.getItem('adminPayments') || '[]');
    adminPayments.unshift(payment);
    localStorage.setItem('adminPayments', JSON.stringify(adminPayments));

    setPayStep('done');
    toast.success('Payment successful! 🎉');
    setTimeout(() => { setPayModal(null); setPayStep('details'); }, 2500);
  };

  const unread = notifications.filter(n => !n.read).length;
  const unpaid = notifications.filter(n => n.status === 'UNPAID').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>
          Notifications 🔔
          {unread > 0 && <span style={{ marginLeft:'10px', fontSize:'13px', fontWeight:700, padding:'2px 10px', borderRadius:'20px', background:'#e05c5c', color:'white' }}>{unread} new</span>}
        </h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>Your adoption updates and payment alerts.</p>
      </div>

      {/* Summary pills */}
      {unpaid > 0 && (
        <div style={{ background:'linear-gradient(135deg,#fff8f0,#ffeedd)', border:'2px solid #e8c99a', borderRadius:'16px', padding:'16px 20px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'32px' }}>💳</span>
          <div>
            <p style={{ fontWeight:700, fontSize:'14px', color:'#3d2b1f', margin:'0 0 2px' }}>Payment Pending</p>
            <p style={{ color:'#8B6347', fontSize:'13px', margin:0 }}>You have {unpaid} pending payment{unpaid>1?'s':''}. Please complete to finalise your adoption.</p>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔔</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#5a4635', marginBottom:'6px' }}>No notifications yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>When your adoption is approved, you'll receive a payment notification here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: n.read ? 'white' : 'linear-gradient(135deg,#fff8f0,#ffffff)',
              borderRadius:'16px', padding:'18px 20px',
              border: n.status==='UNPAID' ? '2px solid #e8c99a' : n.status==='PAID' ? '2px solid #bbf7d0' : n.type==='REQUEST_REJECTED' ? '2px solid #fecaca' : n.type==='RESCUE_UPDATE' ? '2px solid #bfdbfe' : '1px solid #f0ebe3',
              boxShadow: n.read ? 'none' : '0 2px 12px rgba(111,78,55,0.12)',
              display:'flex', alignItems:'center', gap:'16px',
            }}>
              {/* Pet image */}
              <div style={{ width:'52px', height:'52px', borderRadius:'12px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>
                {n.petImage
                  ? <img src={n.petImage} alt={n.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : '🐾'}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <p style={{ fontWeight:700, fontSize:'14px', color:'#2d1f14', margin:0 }}>{n.title}</p>
                  {!n.read && <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#e05c5c', flexShrink:0, display:'inline-block' }} />}
                </div>
                <p style={{ color:'#8B6347', fontSize:'13px', margin:'0 0 8px', lineHeight:1.5 }}>{n.message}</p>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', color:'#9ca3af' }}>🗓 {n.createdAt}</span>
                  {n.status === 'UNPAID' && (
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#fff3cd', color:'#856404' }}>⏳ Payment Pending</span>
                  )}
                  {n.status === 'PAID' && (
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#d1fae5', color:'#065f46' }}>✅ Paid</span>
                  )}
                  {n.type === 'REQUEST_REJECTED' && (
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#fef2f2', color:'#dc2626' }}>❌ Rejected</span>
                  )}
                </div>
              </div>

              {/* Action button */}
              <div style={{ flexShrink:0 }}>
                {n.status === 'UNPAID' && (
                  <button onClick={() => handlePay(n)}
                    style={{ padding:'10px 20px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', boxShadow:'0 3px 10px rgba(111,78,55,0.3)', whiteSpace:'nowrap' }}>
                    💳 Pay Now
                  </button>
                )}
                {n.status === 'PAID' && (
                  <span style={{ fontSize:'24px' }}>✅</span>
                )}
                {n.type === 'REQUEST_REJECTED' && (
                  <span style={{ fontSize:'24px' }}>❌</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'24px', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden' }}>

            {/* Modal header */}
            <div style={{ background:'linear-gradient(135deg,#6F4E37,#8B6347)', padding:'20px 24px', display:'flex', alignItems:'center', gap:'14px' }}>
              <span style={{ fontSize:'32px' }}>{payStep==='done'?'🎉':'💳'}</span>
              <div>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:600, margin:0, textTransform:'uppercase', letterSpacing:'1px' }}>
                  {payStep==='done' ? 'Payment Complete' : payStep==='confirm' ? 'Confirm Payment' : 'Complete Payment'}
                </p>
                <h3 style={{ color:'white', fontSize:'18px', fontWeight:700, margin:0 }}>
                  {payStep==='done' ? 'Payment Successful!' : `₹${payModal.amount} Due`}
                </h3>
              </div>
              {payStep !== 'done' && (
                <button onClick={() => setPayModal(null)} style={{ marginLeft:'auto', width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.15)', cursor:'pointer', color:'white', fontSize:'18px' }}>✕</button>
              )}
            </div>

            <div style={{ padding:'24px' }}>
              {payStep === 'done' ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
                  <h3 style={{ fontSize:'20px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>Payment Successful!</h3>
                  <p style={{ color:'#8B6347', fontSize:'14px', lineHeight:1.6 }}>
                    Your adoption of <strong>{payModal.petName}</strong> is complete.<br/>
                    Welcome to the family! 🐾
                  </p>
                </div>
              ) : payStep === 'confirm' ? (
                <div>
                  {/* Summary */}
                  <div style={{ background:'#fdf9f5', borderRadius:'14px', padding:'16px', border:'1px solid #e8dcc8', marginBottom:'20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ color:'#8B6347', fontSize:'13px' }}>Pet</span>
                      <span style={{ fontWeight:700, color:'#2d1f14', fontSize:'13px' }}>{payModal.petName}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ color:'#8B6347', fontSize:'13px' }}>Payment Method</span>
                      <span style={{ fontWeight:700, color:'#2d1f14', fontSize:'13px', textTransform:'uppercase' }}>{payMethod}</span>
                    </div>
                    <div style={{ borderTop:'1px solid #e8dcc8', paddingTop:'10px', display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'#8B6347', fontSize:'14px', fontWeight:700 }}>Total Amount</span>
                      <span style={{ fontWeight:800, color:'#6F4E37', fontSize:'18px' }}>₹{payModal.amount}</span>
                    </div>
                  </div>
                  <p style={{ color:'#9ca3af', fontSize:'12px', textAlign:'center', marginBottom:'20px' }}>
                    🔒 Secure payment · Your details are protected
                  </p>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button onClick={() => setPayStep('details')}
                      style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1.5px solid #e8dcc8', background:'white', color:'#6F4E37', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                      ← Back
                    </button>
                    <button onClick={completePayment}
                      style={{ flex:2, padding:'12px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(22,163,74,0.3)' }}>
                      ✅ Confirm Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Pet info */}
                  <div style={{ display:'flex', alignItems:'center', gap:'14px', background:'#fdf9f5', borderRadius:'14px', padding:'14px', border:'1px solid #e8dcc8', marginBottom:'20px' }}>
                    <div style={{ width:'50px', height:'50px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>
                      {payModal.petImage ? <img src={payModal.petImage} alt={payModal.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🐾'}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'15px', color:'#2d1f14', margin:'0 0 2px' }}>{payModal.petName}</p>
                      <p style={{ color:'#8B6347', fontSize:'13px', margin:0 }}>Adoption fee: <strong>₹{payModal.amount}</strong></p>
                    </div>
                  </div>

                  {/* Payment method */}
                  <p style={{ fontSize:'13px', fontWeight:700, color:'#5a4635', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Select Payment Method</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                    {[
                      { id:'upi',   icon:'📱', label:'UPI' },
                      { id:'card',  icon:'💳', label:'Card' },
                      { id:'netbanking', icon:'🏦', label:'Net Banking' },
                    ].map(m => (
                      <div key={m.id} onClick={() => setPayMethod(m.id)}
                        style={{ padding:'14px 10px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
                          border: payMethod===m.id ? '2px solid #6F4E37' : '1.5px solid #e8dcc8',
                          background: payMethod===m.id ? 'linear-gradient(135deg,#fdf0e6,#f5ece0)' : 'white',
                          boxShadow: payMethod===m.id ? '0 2px 8px rgba(111,78,55,0.15)' : 'none',
                          transition:'all 0.15s',
                        }}>
                        <div style={{ fontSize:'24px', marginBottom:'4px' }}>{m.icon}</div>
                        <div style={{ fontSize:'12px', fontWeight:700, color: payMethod===m.id ? '#6F4E37' : '#8B6347' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <button onClick={confirmPayment}
                    style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(111,78,55,0.3)' }}>
                    Continue to Pay ₹{payModal.amount} →
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

/* ── CUSTOMER ADOPTION REQUESTS ── */
function CustomerAdoptionRequests({ user }) {
  const userEmail = user?.email || '';
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = () => {
      const all = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
      // Show only this customer's requests
      const mine = all.filter(r =>
        r.userEmail === userEmail || r.customerEmail === userEmail || !userEmail
      );
      setRequests(mine);
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [userEmail]);

  // Get payment status for a request
  const getPayment = (reqId) => {
    const notifs = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    return notifs.find(n => n.requestId === reqId);
  };

  const statusColor = { Pending:'#d97706', Approved:'#16a34a', Rejected:'#dc2626' };
  const statusBg    = { Pending:'#fffbeb', Approved:'#f0fdf4', Rejected:'#fef2f2' };

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>Adoption Requests 📄</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>Track all your adoption applications and their status.</p>

      {requests.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>📄</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#5a4635', marginBottom:'6px' }}>No requests yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>Browse pets and click Adopt to submit your first application.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {requests.map((r, i) => {
            const payment = getPayment(r.id);
            return (
              <div key={r.id} style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3', boxShadow:'0 2px 8px rgba(90,70,53,0.08)' }}>
                <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  {/* Pet image */}
                  <div style={{ width:'64px', height:'64px', borderRadius:'14px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>
                    {r.petImage ? <img src={r.petImage} alt={r.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🐾'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:'16px', color:'#2d1f14' }}>{r.petName}</span>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background: statusBg[r.status]||'#f1f5f9', color: statusColor[r.status]||'#475569' }}>
                        {r.status === 'Pending' ? '⏳' : r.status === 'Approved' ? '✅' : '❌'} {r.status}
                      </span>
                      {payment && (
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background: payment.status==='PAID'?'#dcfce7':'#fff3cd', color: payment.status==='PAID'?'#16a34a':'#856404' }}>
                          {payment.status==='PAID' ? '💰 Paid' : '⏳ Payment Pending'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize:'12px', color:'#9ca3af', margin:'0 0 4px' }}>
                      {r.petSpecies} · {r.petBreed} &nbsp;|&nbsp; Applied: {r.adoptedAt}
                    </p>
                    <p style={{ fontSize:'12px', color:'#9ca3af', margin:0 }}>
                      📍 {r.customerAddress}
                    </p>
                  </div>
                </div>

                {/* Status timeline */}
                <div style={{ marginTop:'16px', paddingTop:'14px', borderTop:'1px solid #f5f0e8', display:'flex', gap:'6px', alignItems:'center' }}>
                  {[['Submitted','🗂️',true],['Under Review','🔍', r.status !== 'Pending' || true],['Decision',r.status==='Approved'?'✅':r.status==='Rejected'?'❌':'⏳', r.status !== 'Pending'],['Payment','💳', payment?.status==='PAID']].map(([label, ic, done], idx) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      {idx > 0 && <div style={{ width:'24px', height:'2px', background: done ? '#8B7355' : '#e8dcc8', borderRadius:'1px' }} />}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: done ? 'linear-gradient(135deg,#8B7355,#A0826D)' : '#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px' }}>{ic}</div>
                        <span style={{ fontSize:'9px', color: done ? '#6F4E37' : '#9ca3af', fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── MY ADOPTIONS ── */
function MyAdoptions({ user }) {
  const userEmail = user?.email || '';
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
    const paid = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    const paidIds = new Set(paid.filter(n => n.status === 'PAID').map(n => n.requestId));
    const mine = all.filter(r =>
      r.status === 'Approved' &&
      (r.userEmail === userEmail || r.customerEmail === userEmail || !userEmail)
    );
    setAdoptions(mine);
  }, [userEmail]);

  const downloadReceipt = (adoption) => {
    const notifs = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    const payment = notifs.find(n => n.requestId === adoption.id);
    const amount = payment?.amount || 0;
    const paidAt = payment?.status === 'PAID' ? (notifs.find(n => n.requestId === adoption.id && n.status === 'PAID')?.createdAt || new Date().toLocaleString()) : 'Pending';
    const payMethod = JSON.parse(localStorage.getItem('adminPayments') || '[]').find(p => p.customerEmail === userEmail && p.petName === adoption.petName)?.payMethod || '—';

    const receipt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       FUREVER HOME
   PET ADOPTION RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt No  : ${adoption.id?.slice(-8)?.toUpperCase()}
Date        : ${new Date().toLocaleDateString()}

CUSTOMER DETAILS
─────────────────
Name     : ${adoption.customerName}
Email    : ${adoption.customerEmail}
Phone    : ${adoption.customerPhone}
Address  : ${adoption.customerAddress}

PET DETAILS
─────────────────
Pet Name : ${adoption.petName}
Species  : ${adoption.petSpecies}
Breed    : ${adoption.petBreed}

PAYMENT DETAILS
─────────────────
Amount   : ₹${amount}
Method   : ${payMethod}
Status   : ${payment?.status === 'PAID' ? 'PAID ✓' : 'Pending'}
Paid On  : ${paidAt}

ADOPTION STATUS : APPROVED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Thank you for adopting! 🐾
  FurEver Home | Bangalore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${adoption.petName}_${adoption.id?.slice(-6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded! 📄');
  };

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>My Adoptions 📋</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>Pets you have successfully adopted.</p>

      {adoptions.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>📋</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#5a4635', marginBottom:'6px' }}>No adoptions yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>Approved adoptions will appear here once your request is accepted.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'16px' }}>
          {adoptions.map(a => (
            <div key={a.id} style={{ background:'white', borderRadius:'18px', overflow:'hidden', boxShadow:'0 2px 12px rgba(90,70,53,0.10)', border:'1px solid #f0ebe3' }}>
              <div style={{ height:'140px', background:'linear-gradient(135deg,#f5f0e8,#e8dcc8)', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px' }}>
                {a.petImage ? <img src={a.petImage} alt={a.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🐾'}
                <div style={{ position:'absolute', top:'10px', right:'10px', background:'#16a34a', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>✅ Adopted</div>
              </div>
              <div style={{ padding:'16px' }}>
                <h3 style={{ fontWeight:700, fontSize:'16px', color:'#2d1f14', margin:'0 0 6px' }}>{a.petName}</h3>
                <p style={{ color:'#9ca3af', fontSize:'12px', margin:'0 0 4px' }}>{a.petSpecies} · {a.petBreed}</p>
                <p style={{ color:'#9ca3af', fontSize:'12px', margin:'0 0 14px' }}>🗓 Adopted on: {a.resolvedAt || a.adoptedAt}</p>
                <button onClick={() => downloadReceipt(a)}
                  style={{ width:'100%', padding:'10px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  📄 Download Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PET CARE ── */
function PetCare({ user }) {
  const userEmail = user?.email || '';
  const [adoptions, setAdoptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
    const mine = all.filter(r => r.status === 'Approved' && (r.userEmail === userEmail || r.customerEmail === userEmail || !userEmail));
    setAdoptions(mine);
    if (mine.length > 0 && !selected) setSelected(mine[0]);
  }, [userEmail]);

  // Generate vaccination schedule based on pet species & age
  const getSchedule = (pet) => {
    const today = new Date();
    const mk = (label, offsetDays, done = false, notes = '') => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return { label, date: d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }), done, notes };
    };
    const base = [
      mk('Initial Health Check', -7, true, 'Completed at shelter'),
      mk('Core Vaccination (DHPP/FVRCP)', 0, false, 'Due today — visit vet'),
      mk('Deworming', 14, false, 'Administer after 2 weeks'),
      mk('Flea & Tick Prevention', 21, false, 'Monthly treatment'),
      mk('Rabies Vaccine', 30, false, 'Required by law'),
      mk('Microchip Registration', 45, false, 'Optional but recommended'),
      mk('Follow-up Vaccination Booster', 90, false, '3-month booster'),
      mk('Annual Health Check', 365, false, 'Yearly vet visit'),
    ];
    return base;
  };

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>FuEver Home 📅</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>Vaccination schedule and care reminders for your adopted pets.</p>

      {adoptions.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>📅</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#5a4635', marginBottom:'6px' }}>No adopted pets yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>Your pet care schedules will appear here once you adopt a pet.</p>
        </div>
      ) : (
        <div>
          {/* Pet selector */}
          {adoptions.length > 1 && (
            <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
              {adoptions.map(a => (
                <button key={a.id} onClick={() => setSelected(a)}
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'20px', border:`2px solid ${selected?.id===a.id?'#6F4E37':'#e8dcc8'}`, background: selected?.id===a.id?'linear-gradient(135deg,#6F4E37,#8B6347)':'white', color: selected?.id===a.id?'white':'#6F4E37', cursor:'pointer', fontSize:'13px', fontWeight:600 }}>
                  🐾 {a.petName}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div>
              {/* Pet header card */}
              <div style={{ background:'linear-gradient(135deg,#6F4E37,#8B6347)', borderRadius:'18px', padding:'20px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px', color:'white' }}>
                <div style={{ width:'60px', height:'60px', borderRadius:'14px', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px' }}>
                  {selected.petImage ? <img src={selected.petImage} alt={selected.petName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🐾'}
                </div>
                <div>
                  <h3 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:700 }}>{selected.petName}</h3>
                  <p style={{ margin:0, opacity:0.8, fontSize:'13px' }}>{selected.petSpecies} · {selected.petBreed}</p>
                </div>
              </div>

              {/* Schedule */}
              <div style={{ background:'white', borderRadius:'18px', border:'1px solid #f0ebe3', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #f5f0e8', background:'#fdf9f5' }}>
                  <h3 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#2d1f14' }}>💉 Vaccination & Care Schedule</h3>
                </div>
                {getSchedule(selected).map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 20px', borderBottom: i < 7 ? '1px solid #fdf9f5' : 'none', background: item.done ? '#f0fdf4' : 'white' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: item.done ? '#dcfce7' : i === 1 ? '#fef9c3' : '#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                      {item.done ? '✅' : i === 1 ? '⚠️' : '💉'}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:'13px', color: item.done ? '#16a34a' : '#2d1f14', margin:'0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize:'11px', color:'#9ca3af', margin:0 }}>{item.notes}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:'12px', fontWeight:600, color: item.done ? '#16a34a' : '#8B6347', margin:'0 0 2px' }}>{item.date}</p>
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'20px', background: item.done ? '#dcfce7' : i === 1 ? '#fef9c3' : '#f5f0e8', color: item.done ? '#16a34a' : i === 1 ? '#854d0e' : '#8B6347' }}>
                        {item.done ? 'Done' : i === 1 ? 'Due Today' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── THEME DEFINITIONS ── */
const THEMES = {
  coffee: {
    sidebarBg:   'linear-gradient(180deg,#5a4635 0%,#8B7355 100%)',
    mainBg:      'linear-gradient(135deg,#f5f0e8 0%,#ffffff 50%,#e8dcc8 100%)',
    topbarBg:    'white',
    accent:      '#8B7355',
    accentDark:  '#5a4635',
    cardBg:      'white',
    cardBorder:  '#f0ebe3',
    text:        '#2d1f14',
    textSub:     '#9ca3af',
    activeNav:   'rgba(139,115,85,0.5)',
    activeBorder:'#f5deb3',
    activeText:  '#f5deb3',
    navText:     '#d4c5b8',
  },
  light: {
    sidebarBg:   'linear-gradient(180deg,#334155 0%,#475569 100%)',
    mainBg:      'linear-gradient(135deg,#f8fafc 0%,#ffffff 50%,#f1f5f9 100%)',
    topbarBg:    'white',
    accent:      '#3b82f6',
    accentDark:  '#1d4ed8',
    cardBg:      'white',
    cardBorder:  '#e2e8f0',
    text:        '#1e293b',
    textSub:     '#64748b',
    activeNav:   'rgba(59,130,246,0.2)',
    activeBorder:'#93c5fd',
    activeText:  '#bfdbfe',
    navText:     '#cbd5e1',
  },
  dark: {
    sidebarBg:   'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
    mainBg:      'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
    topbarBg:    '#1e293b',
    accent:      '#6366f1',
    accentDark:  '#4338ca',
    cardBg:      '#1e293b',
    cardBorder:  '#334155',
    text:        '#f1f5f9',
    textSub:     '#94a3b8',
    activeNav:   'rgba(99,102,241,0.3)',
    activeBorder:'#818cf8',
    activeText:  '#c7d2fe',
    navText:     '#94a3b8',
  },
  forest: {
    sidebarBg:   'linear-gradient(180deg,#14532d 0%,#166534 100%)',
    mainBg:      'linear-gradient(135deg,#f0fdf4 0%,#ffffff 50%,#dcfce7 100%)',
    topbarBg:    'white',
    accent:      '#16a34a',
    accentDark:  '#15803d',
    cardBg:      'white',
    cardBorder:  '#bbf7d0',
    text:        '#14532d',
    textSub:     '#6b7280',
    activeNav:   'rgba(22,163,74,0.3)',
    activeBorder:'#86efac',
    activeText:  '#bbf7d0',
    navText:     '#d1fae5',
  },
};

const LANG_LABELS = {
  'English':           { dashboard:'Dashboard', browse:'Browse Pets', favorites:'Favorites', requests:'Adoption Requests', adoptions:'My Adoptions', rescue:'Rescue Reports', shelters:'Nearby Shelters', assistant:'AI Assistant', petcare:'Pet Care', notifications:'Notifications', profile:'My Profile', settings:'Settings', logout:'Logout', welcome:'Welcome back', search:'Search by name, breed or location...' },
  'हिंदी (Hindi)':     { dashboard:'डैशबोर्ड', browse:'पालतू जानवर देखें', favorites:'पसंदीदा', requests:'गोद लेने के अनुरोध', adoptions:'मेरी गोद लेने', rescue:'बचाव रिपोर्ट', shelters:'नजदीकी आश्रय', assistant:'AI सहायक', petcare:'पालतू देखभाल', notifications:'सूचनाएं', profile:'मेरी प्रोफाइल', settings:'सेटिंग्स', logout:'लॉगआउट', welcome:'वापस स्वागत है', search:'नाम, नस्ल से खोजें...' },
  'ಕನ್ನಡ (Kannada)':   { dashboard:'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', browse:'ಸಾಕುಪ್ರಾಣಿಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ', favorites:'ನೆಚ್ಚಿನವು', requests:'ದತ್ತು ವಿನಂತಿಗಳು', adoptions:'ನನ್ನ ದತ್ತು', rescue:'ರಕ್ಷಣಾ ವರದಿಗಳು', shelters:'ಹತ್ತಿರದ ಆಶ್ರಯ', assistant:'AI ಸಹಾಯಕ', petcare:'ಪ್ರಾಣಿ ಆರೈಕೆ', notifications:'ಅಧಿಸೂಚನೆಗಳು', profile:'ನನ್ನ ಪ್ರೊಫೈಲ್', settings:'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', logout:'ಲಾಗ್‌ಔಟ್', welcome:'ಮರಳಿ ಸ್ವಾಗತ', search:'ಹೆಸರು ಅಥವಾ ತಳಿಯಿಂದ ಹುಡುಕಿ...' },
  'தமிழ் (Tamil)':     { dashboard:'டாஷ்போர்டு', browse:'செல்லப்பிராணிகளை உலாவுக', favorites:'பிடித்தவை', requests:'தத்தெடுப்பு கோரிக்கைகள்', adoptions:'என் தத்தெடுப்புகள்', rescue:'மீட்பு அறிக்கைகள்', shelters:'அருகிலுள்ள தங்குமிடம்', assistant:'AI உதவியாளர்', petcare:'செல்லப்பிராணி பராமரிப்பு', notifications:'அறிவிப்புகள்', profile:'என் சுயவிவரம்', settings:'அமைப்புகள்', logout:'வெளியேறு', welcome:'மீண்டும் வருக', search:'பெயர் அல்லது இனத்தால் தேடுக...' },
  'తెలుగు (Telugu)':   { dashboard:'డాష్‌బోర్డ్', browse:'పెంపుడు జంతువులు చూడండి', favorites:'ఇష్టమైనవి', requests:'దత్తత అభ్యర్థనలు', adoptions:'నా దత్తత', rescue:'రెస్క్యూ రిపోర్ట్లు', shelters:'సమీప ఆశ్రయాలు', assistant:'AI సహాయకుడు', petcare:'జంతు సంరక్షణ', notifications:'నోటిఫికేషన్లు', profile:'నా ప్రొఫైల్', settings:'సెట్టింగ్‌లు', logout:'లాగ్ అవుట్', welcome:'తిరిగి స్వాగతం', search:'పేరు లేదా జాతి ద్వారా వెతకండి...' },
  'বাংলা (Bengali)':   { dashboard:'ড্যাশবোর্ড', browse:'পোষা প্রাণী দেখুন', favorites:'প্রিয়', requests:'দত্তক অনুরোধ', adoptions:'আমার দত্তক', rescue:'উদ্ধার রিপোর্ট', shelters:'কাছের আশ্রয়', assistant:'AI সহকারী', petcare:'পোষা যত্ন', notifications:'বিজ্ঞপ্তি', profile:'আমার প্রোফাইল', settings:'সেটিংস', logout:'লগআউট', welcome:'ফিরে আসতে স্বাগতম', search:'নাম বা জাত দিয়ে খুঁজুন...' },
};

/* ── SETTINGS PAGE ── */
function SettingsPage({ user, onSave }) {
  const [theme, setTheme]             = useState(() => localStorage.getItem('appTheme')    || 'coffee');
  const [language, setLanguage]       = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('notifEnabled') !== 'false');
  const [saved, setSaved]             = useState(false);

  const themes = [
    { id:'coffee', label:'Coffee & White', preview: 'linear-gradient(135deg,#6F4E37,#f5deb3)',  icon:'☕' },
    { id:'light',  label:'Light Minimal',  preview: 'linear-gradient(135deg,#334155,#e2e8f0)',  icon:'🌤️' },
    { id:'dark',   label:'Dark Mode',      preview: 'linear-gradient(135deg,#0f172a,#334155)',  icon:'🌙' },
    { id:'forest', label:'Forest Green',   preview: 'linear-gradient(135deg,#14532d,#86efac)',  icon:'🌿' },
  ];

  const languages = ['English', 'हिंदी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'বাংলা (Bengali)'];

  const handleSave = () => {
    localStorage.setItem('appTheme',    theme);
    localStorage.setItem('appLanguage', language);
    localStorage.setItem('notifEnabled', String(notifications));
    setSaved(true);
    toast.success('Settings applied! ✅');
    if (onSave) onSave(theme, language);   // ← tells parent to re-apply immediately
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>Settings ⚙️</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'24px' }}>Customize your app experience.</p>

      <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'640px' }}>

        {/* Theme */}
        <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f0ebe3', boxShadow:'0 1px 6px rgba(90,70,53,0.06)' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#2d1f14', margin:'0 0 16px' }}>🎨 Theme</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {themes.map(t => (
              <div key={t.id} onClick={() => setTheme(t.id)}
                style={{ padding:'14px', borderRadius:'14px', border:`2px solid ${theme===t.id?'#6F4E37':'#f0ebe3'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', background: theme===t.id?'#fdf9f5':'white', transition:'all 0.15s' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background: t.preview, flexShrink:0 }} />
                <div>
                  <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:700, color: theme===t.id?'#6F4E37':'#2d1f14' }}>{t.icon} {t.label}</p>
                  {theme===t.id && <p style={{ margin:0, fontSize:'10px', color:'#16a34a', fontWeight:600 }}>✓ Active</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f0ebe3', boxShadow:'0 1px 6px rgba(90,70,53,0.06)' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#2d1f14', margin:'0 0 16px' }}>🌐 Language</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {languages.map(l => (
              <div key={l} onClick={() => setLanguage(l)}
                style={{ padding:'12px 16px', borderRadius:'12px', border:`1.5px solid ${language===l?'#6F4E37':'#f0ebe3'}`, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', background: language===l?'#fdf9f5':'white', transition:'all 0.15s' }}>
                <span style={{ fontSize:'13px', fontWeight: language===l?700:500, color: language===l?'#6F4E37':'#2d1f14' }}>{l}</span>
                {language===l && <span style={{ fontSize:'16px' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f0ebe3', boxShadow:'0 1px 6px rgba(90,70,53,0.06)' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#2d1f14', margin:'0 0 16px' }}>🔔 Notifications</h3>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:600, color:'#2d1f14' }}>Push Notifications</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9ca3af' }}>Receive alerts for adoption updates and payments</p>
            </div>
            <div onClick={() => setNotifications(n => !n)}
              style={{ width:'48px', height:'26px', borderRadius:'13px', background: notifications ? '#6F4E37' : '#e8dcc8', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:'3px', left: notifications ? '25px' : '3px', width:'20px', height:'20px', borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave}
          style={{ padding:'14px', borderRadius:'14px', border:'none', background: saved ? '#16a34a' : 'linear-gradient(135deg,#6F4E37,#8B6347)', color:'white', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(111,78,55,0.25)', transition:'all 0.2s' }}>
          {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

/* ── RESCUE REPORTS ── */
function RescueReports({ user }) {
  const [view, setView]           = useState('list');
  const [reports, setReports]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult]   = useState(null);
  const [rescueCenters, setRescueCenters] = useState([]);
  const [form, setForm] = useState({
    animalType:'', description:'', location:'', address:'',
    reporterName: user?.firstName ? `${user.firstName} ${user.lastName||''}`.trim() : '',
    reporterPhone:'', urgency:'Medium', imagePreview:'', imageFile:null,
    rescueCenterId:'', rescueCenterName:'',
  });
  const userEmail = user?.email || '';

  // Load rescue centers added by admin
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('adminRescueCenters') || '[]');
    setRescueCenters(stored);
    // Also try backend
    fetch('http://localhost:5000/api/rescue-centers', { signal: AbortSignal.timeout(3000) })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) { setRescueCenters(data); localStorage.setItem('adminRescueCenters', JSON.stringify(data)); }})
      .catch(() => {});
  }, []);

  const loadReports = () => {
    const all = JSON.parse(localStorage.getItem('rescueReports') || '[]');
    setReports(all.filter(r => !r.userEmail || r.userEmail === userEmail).reverse());
  };

  useEffect(() => { loadReports(); }, [view]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
        setForm(p => ({ ...p, imagePreview: canvas.toDataURL('image/jpeg', 0.8), imageFile: file }));
        setAiResult(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const analyzeWithAI = () => {
    if (!form.imagePreview && !form.description) { toast.error('Upload a photo or add description first'); return; }
    setAnalyzing(true);
    setTimeout(() => {
      const desc = (form.description + ' ' + form.animalType).toLowerCase();
      let severity, color, icon, actions, confidence;
      if (desc.match(/blood|bleed|fracture|broken|critical|attack|hit|accident|severe/)) {
        severity='Critical'; color='#dc2626'; icon='🔴'; confidence=94;
        actions=['Call emergency vet immediately (📞 +91 1962)','Do NOT move the animal — risk of internal injury','Keep the animal warm and calm','Dispatch rescue team within 30 minutes'];
      } else if (desc.match(/limp|wound|cut|injury|sick|thin|malnourish|weak|hurt/)) {
        severity='Moderate'; color='#d97706'; icon='🟡'; confidence=87;
        actions=['Contact nearest rescue center','Offer water carefully — do not force feed','Keep away from traffic','Rescue team will arrive within 2 hours'];
      } else if (desc.match(/stray|abandon|lost|puppy|kitten|small|young|scared|hiding/)) {
        severity='Low'; color='#16a34a'; icon='🟢'; confidence=82;
        actions=['Place food and water nearby','Do not approach aggressively','Mark location clearly','Rescue team will visit within 24 hours'];
      } else {
        severity='Moderate'; color='#d97706'; icon='🟡'; confidence=75;
        actions=['Document with more photos','Notify local animal welfare organization','Monitor from safe distance','Submit report for assessment'];
      }
      const estimated = form.animalType || (desc.includes('dog')?'Dog':desc.includes('cat')?'Cat':desc.includes('bird')?'Bird':'Animal');
      setAiResult({ severity, color, icon, actions, confidence, estimated });
      setAnalyzing(false);
      toast.success('AI analysis complete! 🤖');
    }, 2200);
  };

  const handleSubmit = () => {
    if (!form.location || !form.description) { toast.error('Please add location and description'); return; }
    const report = {
      id:'rr_'+Date.now(), userEmail,
      reporterName:form.reporterName, reporterPhone:form.reporterPhone,
      animalType:form.animalType||(aiResult?.estimated||'Unknown'),
      description:form.description, location:form.location, address:form.address,
      urgency:aiResult?.severity||form.urgency, imagePreview:form.imagePreview||'',
      aiSeverity:aiResult?.severity||null, aiConfidence:aiResult?.confidence||null,
      aiActions:aiResult?.actions||[], status:'Submitted',
      rescueCenterId:   form.rescueCenterId || '',
      rescueCenterName: form.rescueCenterName || 'Not assigned',
      submittedAt:new Date().toLocaleString(),
      timeline:[{ status:'Submitted', time:new Date().toLocaleString(), note:'Report received and logged' }],
    };
    const all = JSON.parse(localStorage.getItem('rescueReports')||'[]');
    all.push(report);
    localStorage.setItem('rescueReports', JSON.stringify(all));
    const adminNotifs = JSON.parse(localStorage.getItem('adminNotifications')||'[]');
    adminNotifs.unshift({ id:'rescue_'+Date.now(), type:'RESCUE_REPORT', title:'🚑 New Rescue Report',
      message:`${form.reporterName||'A user'} reported a ${report.animalType} near ${form.location}. Severity: ${report.urgency}. Assigned to: ${report.rescueCenterName}.`,
      reportId:report.id, urgency:report.urgency, rescueCenterName:report.rescueCenterName, submittedAt:new Date().toLocaleString(), read:false });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifs));
    toast.success('Rescue report submitted! 🚑');
    setForm({ animalType:'', description:'', location:'', address:'', reporterName:user?.firstName||'', reporterPhone:'', urgency:'Medium', imagePreview:'', imageFile:null, rescueCenterId:'', rescueCenterName:'' });
    setAiResult(null); setView('list');
  };

  const urgencyColor = { Critical:'#dc2626', High:'#ea580c', Moderate:'#d97706', Medium:'#d97706', Low:'#16a34a' };
  const urgencyBg    = { Critical:'#fef2f2', High:'#fff7ed', Moderate:'#fffbeb', Medium:'#fffbeb', Low:'#f0fdf4' };
  const statusColor  = { Submitted:'#d97706', Acknowledged:'#2563eb', 'In Progress':'#7c3aed', Rescued:'#16a34a', Closed:'#6b7280' };
  const statusBg     = { Submitted:'#fffbeb', Acknowledged:'#eff6ff', 'In Progress':'#f5f3ff', Rescued:'#f0fdf4', Closed:'#f9fafb' };
  const STEPS = ['Submitted','Acknowledged','In Progress','Rescued','Closed'];
  const iStyle = { width:'100%', padding:'10px 14px', borderRadius:'12px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box', fontFamily:'inherit' };
  const lStyle = { fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.4px' };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>Rescue Reports 🚑</h2>
          <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>Report injured or stray animals. AI analyzes severity and recommends actions.</p>
        </div>
        <button onClick={() => { setView(view==='new'?'list':'new'); setAiResult(null); }}
          style={{ padding:'10px 20px', borderRadius:'12px', border:'none', background:view==='new'?'#f5f0e8':'linear-gradient(135deg,#dc2626,#b91c1c)', color:view==='new'?'#6F4E37':'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          {view==='new' ? '← My Reports' : '+ New Report'}
        </button>
      </div>

      {view === 'new' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>

          {/* Left — Rescue Center Selector + Photo + Reporter */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* 🏥 Select Nearest Rescue Center */}
            <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3' }}>
              <label style={lStyle}>🏥 Select Nearest Rescue Center</label>
              {rescueCenters.length === 0 ? (
                <div style={{ padding:'14px', borderRadius:'12px', border:'1.5px dashed #e8dcc8', textAlign:'center', color:'#9ca3af', fontSize:'13px' }}>
                  No rescue centers available yet
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {rescueCenters.map(rc => {
                    const isSelected = form.rescueCenterId === rc.id;
                    return (
                      <div key={rc.id} onClick={() => setForm(p => ({ ...p, rescueCenterId: rc.id, rescueCenterName: rc.name, location: p.location || (rc.city || '') }))}
                        style={{
                          padding:'12px 14px', borderRadius:'12px', cursor:'pointer', transition:'all 0.15s',
                          border: isSelected ? '2px solid #6F4E37' : '1.5px solid #e8dcc8',
                          background: isSelected ? 'linear-gradient(135deg,#fdf0e6,#f5ece0)' : 'white',
                          display:'flex', alignItems:'center', gap:'12px',
                        }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background: isSelected ? 'linear-gradient(135deg,#6F4E37,#8B6347)' : '#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                          🏥
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:'0 0 2px', fontWeight:700, fontSize:'13px', color: isSelected ? '#3d2b1f' : '#2d1f14', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rc.name}</p>
                          <p style={{ margin:0, fontSize:'11px', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            📍 {rc.city}{rc.state ? `, ${rc.state}` : ''}{rc.phone ? ` · 📞 ${rc.phone}` : ''}
                          </p>
                        </div>
                        {isSelected && <span style={{ fontSize:'18px', flexShrink:0 }}>✅</span>}
                      </div>
                    );
                  })}
                </div>
              )}
              {form.rescueCenterId && (
                <button onClick={() => setForm(p => ({ ...p, rescueCenterId:'', rescueCenterName:'' }))}
                  style={{ marginTop:'8px', background:'none', border:'none', color:'#dc2626', fontSize:'12px', cursor:'pointer', padding:0 }}>
                  ✕ Deselect center
                </button>
              )}
            </div>
            <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3' }}>
              <label style={lStyle}>📷 Upload Photo</label>
              <label style={{ display:'block', cursor:'pointer' }}>
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="preview" style={{ width:'100%', height:'200px', objectFit:'cover', borderRadius:'12px' }} />
                ) : (
                  <div style={{ height:'160px', border:'2px dashed #e8dcc8', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fdf9f5', gap:'8px' }}>
                    <span style={{ fontSize:'40px' }}>📷</span>
                    <p style={{ margin:0, fontSize:'13px', color:'#8B6347', fontWeight:600 }}>Click to upload photo</p>
                    <p style={{ margin:0, fontSize:'11px', color:'#9ca3af' }}>Helps AI assess injury severity</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
              </label>
              {form.imagePreview && (
                <button onClick={analyzeWithAI} disabled={analyzing}
                  style={{ marginTop:'12px', width:'100%', padding:'11px', borderRadius:'12px', border:'none', background:analyzing?'#e8dcc8':'linear-gradient(135deg,#6F4E37,#8B6347)', color:analyzing?'#8B6347':'white', fontSize:'13px', fontWeight:700, cursor:analyzing?'not-allowed':'pointer' }}>
                  {analyzing ? '🤖 Analyzing...' : '🤖 Analyze with AI'}
                </button>
              )}
            </div>
            <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3', display:'flex', flexDirection:'column', gap:'12px' }}>
              <label style={lStyle}>👤 Your Details</label>
              <input placeholder="Your name" value={form.reporterName} onChange={e=>setForm(p=>({...p,reporterName:e.target.value}))} style={iStyle} />
              <input placeholder="Your phone" value={form.reporterPhone} onChange={e=>setForm(p=>({...p,reporterPhone:e.target.value}))} style={iStyle} />
            </div>
          </div>

          {/* Right — Animal details + AI + Location */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3', display:'flex', flexDirection:'column', gap:'12px' }}>
              <label style={lStyle}>🐾 Animal Details</label>
              <select value={form.animalType} onChange={e=>setForm(p=>({...p,animalType:e.target.value}))} style={iStyle}>
                <option value="">Select animal type</option>
                {['Dog','Cat','Bird','Cow','Goat','Rabbit','Horse','Monkey','Other'].map(a=><option key={a}>{a}</option>)}
              </select>
              <textarea placeholder="Describe condition — wounds, behavior, age estimate..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={4} style={{ ...iStyle, resize:'vertical', lineHeight:1.6 }} />
              {!form.imagePreview && (
                <button onClick={analyzeWithAI} disabled={analyzing||!form.description}
                  style={{ padding:'10px', borderRadius:'10px', border:'none', background:(!form.description||analyzing)?'#e8dcc8':'linear-gradient(135deg,#6F4E37,#8B6347)', color:(!form.description||analyzing)?'#8B6347':'white', fontSize:'13px', fontWeight:700, cursor:(!form.description||analyzing)?'not-allowed':'pointer' }}>
                  {analyzing?'🤖 Analyzing...':'🤖 Analyze with AI'}
                </button>
              )}
            </div>

            {analyzing && (
              <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'2px solid #e8dcc8', textAlign:'center' }}>
                <div style={{ fontSize:'40px', marginBottom:'10px' }}>🤖</div>
                <p style={{ fontWeight:700, color:'#6F4E37', margin:'0 0 4px' }}>AI is analyzing...</p>
                <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>Assessing injury severity and recommending actions</p>
              </div>
            )}

            {aiResult && !analyzing && (
              <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:`2px solid ${aiResult.color}40` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px', paddingBottom:'12px', borderBottom:'1px solid #f5f0e8' }}>
                  <span style={{ fontSize:'32px' }}>{aiResult.icon}</span>
                  <div>
                    <p style={{ margin:'0 0 2px', fontWeight:800, fontSize:'16px', color:aiResult.color }}>{aiResult.severity} Severity</p>
                    <p style={{ margin:0, fontSize:'12px', color:'#9ca3af' }}>Confidence: {aiResult.confidence}% · Detected: {aiResult.estimated}</p>
                  </div>
                </div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.4px' }}>AI Recommended Actions:</p>
                {aiResult.actions.map((a,i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', background:'#fdf9f5', padding:'9px 12px', borderRadius:'10px', marginBottom:'6px' }}>
                    <span style={{ fontWeight:700, color:aiResult.color, minWidth:'18px', fontSize:'12px' }}>{i+1}.</span>
                    <span style={{ fontSize:'12px', color:'#475569', lineHeight:1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #f0ebe3', display:'flex', flexDirection:'column', gap:'12px' }}>
              <label style={lStyle}>📍 Location</label>
              <input placeholder="Area / Landmark (e.g. Near Metro Station)" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} style={iStyle} />
              <input placeholder="Full address (optional)" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} style={iStyle} />
              <div>
                <label style={lStyle}>Urgency Level</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                  {['Low','Medium','High','Critical'].map(u => (
                    <div key={u} onClick={()=>setForm(p=>({...p,urgency:u}))}
                      style={{ padding:'8px 4px', borderRadius:'10px', textAlign:'center', cursor:'pointer', border:`1.5px solid ${form.urgency===u?urgencyColor[u]:'#e8dcc8'}`, background:form.urgency===u?urgencyBg[u]:'white', transition:'all 0.15s' }}>
                      <p style={{ margin:0, fontSize:'11px', fontWeight:700, color:form.urgency===u?urgencyColor[u]:'#8B6347' }}>{u}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSubmit}
              style={{ padding:'14px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'white', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(220,38,38,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              🚑 Submit Rescue Report
            </button>
          </div>
        </div>

      ) : (
        /* ── REPORTS LIST ── */
        reports.length === 0 ? (
          <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>🚑</div>
            <p style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>No rescue reports yet</p>
            <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'20px' }}>Spotted an injured or stray animal? Report it now.</p>
            <button onClick={()=>setView('new')} style={{ padding:'11px 28px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              + Submit First Report
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {reports.map(r => (
              <div key={r.id} style={{ background:'white', borderRadius:'18px', border:'1px solid #f0ebe3', boxShadow:'0 2px 8px rgba(90,70,53,0.06)', overflow:'hidden' }}>
                <div style={{ display:'flex', gap:'16px', padding:'18px 20px', alignItems:'center' }}>
                  <div style={{ width:'72px', height:'72px', borderRadius:'14px', overflow:'hidden', flexShrink:0, background:'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>
                    {r.imagePreview ? <img src={r.imagePreview} alt="rescue" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} /> : '🐾'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:'15px', color:'#2d1f14' }}>{r.animalType||'Animal'} Report</span>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:urgencyBg[r.urgency]||'#fffbeb', color:urgencyColor[r.urgency]||'#d97706' }}>
                        {r.urgency==='Critical'?'🔴':r.urgency==='High'?'🟠':'🟡'} {r.urgency}
                      </span>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:statusBg[r.status]||'#fffbeb', color:statusColor[r.status]||'#d97706' }}>
                        {r.status}
                      </span>
                    </div>
                    <p style={{ color:'#475569', fontSize:'12px', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.description}</p>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'11px', color:'#9ca3af' }}>📍 {r.location}</span>
                      <span style={{ fontSize:'11px', color:'#9ca3af' }}>🗓 {r.submittedAt}</span>
                      {r.aiSeverity && <span style={{ fontSize:'11px', color:'#6F4E37', fontWeight:600 }}>🤖 {r.aiSeverity} ({r.aiConfidence}%)</span>}
                      {r.rescueCenterName && r.rescueCenterName !== 'Not assigned' && (
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'1px 8px', borderRadius:'20px', background:'#fdf0e6', color:'#6F4E37', border:'1px solid #e8dcc8' }}>
                          🏥 {r.rescueCenterName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={()=>setSelected(selected?.id===r.id?null:r)}
                    style={{ padding:'7px 14px', borderRadius:'10px', border:'1px solid #e8dcc8', background:'white', color:'#6F4E37', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                    {selected?.id===r.id?'Close':'👁 View'}
                  </button>
                </div>

                {selected?.id === r.id && (
                  <div style={{ borderTop:'1px solid #f5f0e8', padding:'18px 20px', background:'#fdf9f5' }}>
                    {/* Timeline */}
                    <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📋 Rescue Status Timeline</p>
                    <div style={{ display:'flex', gap:'4px', alignItems:'center', marginBottom:'16px', overflowX:'auto', paddingBottom:'4px' }}>
                      {STEPS.map((s,i) => {
                        const done = STEPS.indexOf(r.status) >= i;
                        return (
                          <div key={s} style={{ display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:done?'linear-gradient(135deg,#6F4E37,#8B6347)':'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:done?'white':'#9ca3af', fontWeight:700 }}>
                                {done?'✓':i+1}
                              </div>
                              <span style={{ fontSize:'9px', color:done?'#6F4E37':'#9ca3af', fontWeight:600, whiteSpace:'nowrap' }}>{s}</span>
                            </div>
                            {i<STEPS.length-1 && <div style={{ width:'24px', height:'2px', background:STEPS.indexOf(r.status)>i?'#8B7355':'#e8dcc8', borderRadius:'1px', marginBottom:'14px' }} />}
                          </div>
                        );
                      })}
                    </div>
                    {r.aiActions?.length > 0 && (
                      <div style={{ background:'white', borderRadius:'12px', padding:'14px', border:'1px solid #e8dcc8' }}>
                        <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 8px' }}>🤖 AI Recommended Actions</p>
                        {r.aiActions.map((a,i) => (
                          <div key={i} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'#475569', marginBottom:'5px' }}>
                            <span style={{ fontWeight:700, color:'#6F4E37', minWidth:'16px' }}>{i+1}.</span>
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ── FAVOURITES PAGE ── */
function FavouritesPage({ user, navigate }) {
  const userEmail = user?.email || '';
  const favKey    = `favourites_${userEmail || 'guest'}`;
  const [favs, setFavs]     = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const load = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(favKey) || '[]');
      setFavs(stored);
    } catch (_) { setFavs([]); }
  };

  useEffect(() => { load(); }, [favKey]);

  const removeFav = (id) => {
    const updated = favs.filter(f => f.id !== id);
    setFavs(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));
    toast.success('Removed from favourites');
  };

  const filtered = favs.filter(p => {
    const matchFilter = filter === 'All' || (p.species||'').toLowerCase() === filter.toLowerCase();
    const matchSearch = !search ||
      (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.breed||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.location||'').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const emojiFor = s => s==='Dog'?'🐶':s==='Cat'?'🐱':s==='Rabbit'?'🐰':s==='Bird'?'🐦':'🐾';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>
          My Favourites ❤️
          {favs.length > 0 && <span style={{ marginLeft:'10px', fontSize:'14px', fontWeight:600, padding:'3px 12px', borderRadius:'20px', background:'#fef2f2', color:'#dc2626' }}>{favs.length} saved</span>}
        </h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>Pets you've hearted — click Adopt to start the adoption process.</p>
      </div>

      {favs.length === 0 ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'70px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'64px', marginBottom:'16px' }}>🤍</div>
          <p style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>No favourites yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'24px' }}>Tap the ❤️ on any pet card to save them here for later.</p>
          <button onClick={() => window.dispatchEvent && navigate && navigate('/customer/home')}
            style={{ padding:'11px 28px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
            Browse Pets
          </button>
        </div>
      ) : (
        <>
          {/* Search + filter */}
          <div style={{ background:'white', borderRadius:'16px', padding:'14px 18px', border:'1px solid #f0ebe3', marginBottom:'18px', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ flex:1, minWidth:'180px', position:'relative' }}>
              <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'14px' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search favourites..."
                style={{ width:'100%', padding:'9px 14px 9px 34px', borderRadius:'10px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {['All','Dog','Cat','Rabbit','Bird'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding:'7px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600,
                    background: filter===s ? 'linear-gradient(135deg,#dc2626,#ef4444)' : '#f5f0e8',
                    color: filter===s ? 'white' : '#8B7355',
                    boxShadow: filter===s ? '0 2px 8px rgba(220,38,38,0.25)' : 'none' }}>
                  {s==='All'?'❤️ All':s==='Dog'?'🐶 Dogs':s==='Cat'?'🐱 Cats':s==='Rabbit'?'🐰 Rabbits':'🐦 Birds'}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ background:'white', borderRadius:'16px', padding:'50px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>🔍</div>
              <p style={{ fontSize:'14px', color:'#9ca3af' }}>No favourites match your search</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'14px' }}>
                {filtered.length} favourite{filtered.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'16px' }}>
                {filtered.map(p => {
                  const img = p.imageUrls?.[0] || p.imagePreview || null;
                  const fee = p.adoptionFee ?? p.fee ?? 0;
                  const isAdopted = (p.adoptionStatus||p.status||'Available') === 'Adopted';
                  const vaccinated = p.vaccinated === true || p.vaccinated === 'Yes';

                  return (
                    <div key={p.id} style={{ background:'white', borderRadius:'18px', overflow:'hidden', boxShadow:'0 2px 10px rgba(90,70,53,0.10)', border:'2px solid #fecaca', position:'relative', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(220,38,38,0.15)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 10px rgba(90,70,53,0.10)'; e.currentTarget.style.transform='translateY(0)'; }}>

                      {/* Image */}
                      <div style={{ height:'180px', background:'linear-gradient(135deg,#f5f0e8,#e8dcc8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px', position:'relative', overflow:'hidden' }}>
                        {img
                          ? <img src={img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                          : emojiFor(p.species)
                        }
                        {/* Status */}
                        <span style={{ position:'absolute', top:'10px', right:'10px', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background: isAdopted?'rgba(220,38,38,0.9)':'rgba(255,255,255,0.95)', color: isAdopted?'white':'#16a34a' }}>
                          {isAdopted ? '🏠 Adopted' : '✅ Available'}
                        </span>
                        {/* Remove heart */}
                        <button onClick={() => removeFav(p.id)}
                          title="Remove from favourites"
                          style={{ position:'absolute', bottom:'10px', left:'10px', width:'32px', height:'32px', borderRadius:'50%', border:'none', background:'#dc2626', color:'white', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(220,38,38,0.5)', transition:'transform 0.2s' }}
                          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15)'}
                          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                          ❤️
                        </button>
                      </div>

                      {/* Info */}
                      <div style={{ padding:'14px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                          <span style={{ fontWeight:700, color:'#2d1f14', fontSize:'15px' }}>{p.name}</span>
                          <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#f5f0e8', color:'#8B7355' }}>{p.species}</span>
                        </div>
                        <p style={{ color:'#9ca3af', fontSize:'12px', margin:'0 0 4px' }}>{p.breed||'—'} · {p.age} {p.ageUnit||'years'}</p>
                        {p.location && <p style={{ color:'#b5a898', fontSize:'12px', margin:'0 0 8px' }}>📍 {p.location}</p>}
                        <div style={{ display:'flex', gap:'5px', marginBottom:'12px' }}>
                          <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 7px', borderRadius:'20px', background:vaccinated?'#f0fdf4':'#fef2f2', color:vaccinated?'#16a34a':'#dc2626' }}>
                            {vaccinated ? '✅ Vaccinated' : '❌ Not Vaccinated'}
                          </span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontWeight:700, fontSize:'15px', color:'#8B7355' }}>₹{fee}</span>
                          {isAdopted ? (
                            <span style={{ padding:'7px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700, background:'#f5f0e8', color:'#8B7355' }}>🏠 Adopted</span>
                          ) : (
                            <button onClick={() => navigate(`/adopt/${p.id}`)}
                              style={{ padding:'8px 16px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                              Adopt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── REVIEWS & RATINGS ── */
function ReviewsRatings({ user }) {
  const userEmail  = user?.email || '';
  const userName   = user?.firstName ? `${user.firstName} ${user.lastName||''}`.trim() : 'Anonymous';
  const storageKey = 'platformReviews';

  const [reviews, setReviews]   = useState([]);
  const [tab, setTab]           = useState('all');   // 'all' | 'mine' | 'write'
  const [form, setForm]         = useState({ rating: 0, category: 'Overall', title: '', comment: '' });
  const [hover, setHover]       = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = () => {
    const all = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setReviews(all);
  };

  useEffect(() => { loadReviews(); }, []);

  // Check if user already left a review for selected category
  const myReviews = reviews.filter(r => r.userEmail === userEmail);
  const alreadyReviewed = myReviews.some(r => r.category === form.category);

  const handleSubmit = () => {
    if (!form.rating)   { toast.error('Please select a star rating'); return; }
    if (!form.comment.trim()) { toast.error('Please write a comment'); return; }

    const review = {
      id:         'rev_' + Date.now(),
      userEmail,
      userName,
      rating:     form.rating,
      category:   form.category,
      title:      form.title.trim() || `${form.rating}-star review`,
      comment:    form.comment.trim(),
      createdAt:  new Date().toLocaleString(),
      helpful:    0,
    };

    const all = JSON.parse(localStorage.getItem(storageKey) || '[]');
    all.unshift(review);
    localStorage.setItem(storageKey, JSON.stringify(all));

    // Also notify admin
    const adminNotifs = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifs.unshift({
      id: 'review_' + Date.now(), type: 'NEW_REVIEW',
      title: `⭐ New ${form.rating}-Star Review`,
      message: `${userName} left a ${form.rating}-star review for "${form.category}": "${form.comment.slice(0,60)}..."`,
      read: false, createdAt: new Date().toLocaleString(),
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifs));

    setReviews(all);
    setForm({ rating: 0, category: 'Overall', title: '', comment: '' });
    setSubmitted(true);
    toast.success('Review submitted! ⭐ Thank you');
    setTimeout(() => { setSubmitted(false); setTab('mine'); }, 1500);
  };

  const markHelpful = (id) => {
    const all = reviews.map(r => r.id === id ? { ...r, helpful: (r.helpful||0) + 1 } : r);
    setReviews(all);
    localStorage.setItem(storageKey, JSON.stringify(all));
    toast.success('Marked as helpful 👍');
  };

  // Stats
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  const CATEGORIES = ['Overall', 'Adoption Process', 'Pet Care', 'Rescue Service', 'App Experience'];

  const displayed = tab === 'mine'
    ? myReviews
    : reviews;

  const Stars = ({ value, size = 20, interactive = false, onHover, onClick }) => (
    <div style={{ display:'flex', gap:'3px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => interactive && onClick && onClick(n)}
          onMouseEnter={() => interactive && onHover && onHover(n)}
          onMouseLeave={() => interactive && onHover && onHover(0)}
          style={{ fontSize:`${size}px`, cursor: interactive ? 'pointer' : 'default',
            color: n <= value ? '#f59e0b' : '#e2e8f0',
            transition:'color 0.1s', userSelect:'none' }}>
          ★
        </span>
      ))}
    </div>
  );

  const iStyle = { width:'100%', padding:'10px 14px', borderRadius:'12px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box', fontFamily:'inherit' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>Reviews & Ratings ⭐</h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>Share your experience and read what others say about us.</p>
      </div>

      {/* Overall rating summary */}
      <div style={{ background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f0ebe3', marginBottom:'20px', display:'flex', gap:'32px', alignItems:'center', flexWrap:'wrap' }}>
        {/* Big avg */}
        <div style={{ textAlign:'center', minWidth:'100px' }}>
          <div style={{ fontSize:'56px', fontWeight:900, color:'#f59e0b', lineHeight:1 }}>{avgRating}</div>
          <Stars value={Math.round(Number(avgRating))} size={18} />
          <p style={{ fontSize:'12px', color:'#9ca3af', margin:'6px 0 0' }}>{reviews.length} review{reviews.length!==1?'s':''}</p>
        </div>
        {/* Bar breakdown */}
        <div style={{ flex:1, minWidth:'220px', display:'flex', flexDirection:'column', gap:'6px' }}>
          {ratingCounts.map(({ star, count }) => {
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'12px', color:'#f59e0b', fontWeight:700, minWidth:'28px' }}>{star} ★</span>
                <div style={{ flex:1, height:'8px', background:'#f5f0e8', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius:'4px', transition:'width 0.5s' }} />
                </div>
                <span style={{ fontSize:'11px', color:'#9ca3af', minWidth:'24px', textAlign:'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', background:'white', borderRadius:'14px', padding:'5px', border:'1px solid #f0ebe3', width:'fit-content' }}>
        {[
          { id:'all',   label:`All Reviews (${reviews.length})` },
          { id:'mine',  label:`My Reviews (${myReviews.length})` },
          { id:'write', label:'✍️ Write a Review' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:700, transition:'all 0.15s',
              background: tab===t.id ? 'linear-gradient(135deg,#8B7355,#A0826D)' : 'transparent',
              color: tab===t.id ? 'white' : '#8B7355' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── WRITE REVIEW ── */}
      {tab === 'write' && (
        <div style={{ background:'white', borderRadius:'18px', padding:'28px', border:'1px solid #f0ebe3', maxWidth:'580px' }}>
          {submitted ? (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ fontSize:'56px', marginBottom:'14px' }}>🎉</div>
              <h3 style={{ color:'#2d1f14', fontSize:'18px', fontWeight:700, marginBottom:'8px' }}>Thank you for your review!</h3>
              <p style={{ color:'#9ca3af', fontSize:'13px' }}>Your feedback helps us improve.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <h3 style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', margin:0 }}>Share Your Experience</h3>

              {/* Star selector */}
              <div>
                <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Your Rating *</label>
                <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  <Stars value={hover || form.rating} size={36} interactive
                    onHover={setHover}
                    onClick={n => setForm(p => ({ ...p, rating: n }))} />
                  {form.rating > 0 && (
                    <span style={{ fontSize:'13px', color:'#f59e0b', fontWeight:700, marginLeft:'8px' }}>
                      {['','Poor','Fair','Good','Very Good','Excellent'][form.rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Category *</label>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))}
                      style={{ padding:'7px 14px', borderRadius:'20px', border:`1.5px solid ${form.category===c?'#8B7355':'#e8dcc8'}`, cursor:'pointer', fontSize:'12px', fontWeight:600,
                        background: form.category===c ? 'linear-gradient(135deg,#8B7355,#A0826D)' : 'white',
                        color: form.category===c ? 'white' : '#8B7355' }}>
                      {c}
                    </button>
                  ))}
                </div>
                {alreadyReviewed && (
                  <p style={{ fontSize:'11px', color:'#d97706', margin:'6px 0 0' }}>⚠️ You've already reviewed this category. Submit another to add more feedback.</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Review Title (optional)</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Summarize your experience..." style={iStyle} maxLength={80} />
              </div>

              {/* Comment */}
              <div>
                <label style={{ fontSize:'12px', fontWeight:700, color:'#8B6347', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Your Review *</label>
                <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Tell us about your experience with the adoption process, rescue center, or platform..."
                  rows={4} style={{ ...iStyle, resize:'vertical', lineHeight:1.6 }} maxLength={500} />
                <p style={{ fontSize:'11px', color:'#9ca3af', margin:'4px 0 0', textAlign:'right' }}>{form.comment.length}/500</p>
              </div>

              <button onClick={handleSubmit}
                style={{ padding:'13px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(139,115,85,0.3)' }}>
                ⭐ Submit Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS LIST ── */}
      {tab !== 'write' && (
        displayed.length === 0 ? (
          <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>⭐</div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'#2d1f14', marginBottom:'6px' }}>
              {tab === 'mine' ? 'You haven\'t written any reviews yet' : 'No reviews yet'}
            </p>
            <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'20px' }}>
              {tab === 'mine' ? 'Share your experience with others!' : 'Be the first to leave a review!'}
            </p>
            <button onClick={() => setTab('write')}
              style={{ padding:'10px 24px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
              ✍️ Write First Review
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {displayed.map(r => (
              <div key={r.id} style={{ background:'white', borderRadius:'18px', padding:'20px 22px', border:'1px solid #f0ebe3', boxShadow:'0 2px 8px rgba(90,70,53,0.06)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    {/* Avatar */}
                    <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'16px', flexShrink:0 }}>
                      {(r.userName||'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'14px', color:'#2d1f14', margin:'0 0 2px' }}>
                        {r.userName}
                        {r.userEmail === userEmail && <span style={{ marginLeft:'8px', fontSize:'10px', fontWeight:600, padding:'1px 6px', borderRadius:'10px', background:'#fdf0e6', color:'#6F4E37' }}>You</span>}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <Stars value={r.rating} size={14} />
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color:'#8B7355' }}>{r.category}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize:'11px', color:'#9ca3af', flexShrink:0 }}>{r.createdAt}</span>
                </div>

                {r.title && <p style={{ fontWeight:700, fontSize:'14px', color:'#2d1f14', margin:'0 0 6px' }}>{r.title}</p>}
                <p style={{ fontSize:'13px', color:'#475569', margin:'0 0 12px', lineHeight:1.6 }}>{r.comment}</p>

                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <button onClick={() => markHelpful(r.id)}
                    style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'20px', border:'1px solid #e8dcc8', background:'white', color:'#8B7355', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                    👍 Helpful ({r.helpful||0})
                  </button>
                  <div style={{ display:'flex', gap:'2px' }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ fontSize:'14px', color: n <= r.rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ── RESCUED PETS ── */
function RescuedPets() {
  const [reports, setReports] = useState([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = () => {
      const all = JSON.parse(localStorage.getItem('rescueReports') || '[]');
      // Show only rescued (and closed) animals — these are the success stories
      const rescued = all.filter(r => r.status === 'Rescued' || r.status === 'Closed' || r.status === 'In Progress' || r.status === 'Submitted' || r.status === 'Acknowledged');
      setReports(rescued.reverse());
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const ANIMAL_TYPES = ['All', 'Dog', 'Cat', 'Bird', 'Cow', 'Rabbit', 'Other'];

  const filtered = reports.filter(r => {
    const matchType   = filter === 'All' || (r.animalType||'').toLowerCase().includes(filter.toLowerCase());
    const matchSearch = !search ||
      (r.animalType||'').toLowerCase().includes(search.toLowerCase()) ||
      (r.location||'').toLowerCase().includes(search.toLowerCase()) ||
      (r.description||'').toLowerCase().includes(search.toLowerCase()) ||
      (r.rescueCenterName||'').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const statusColor = { Submitted:'#d97706', Acknowledged:'#2563eb', 'In Progress':'#7c3aed', Rescued:'#16a34a', Closed:'#6b7280' };
  const statusBg    = { Submitted:'#fffbeb', Acknowledged:'#eff6ff', 'In Progress':'#f5f3ff', Rescued:'#f0fdf4', Closed:'#f9fafb' };
  const statusIcon  = { Submitted:'⏳', Acknowledged:'👁', 'In Progress':'🚑', Rescued:'✅', Closed:'🔒' };

  const emojiFor = type => {
    const t = (type||'').toLowerCase();
    if (t.includes('dog')) return '🐶';
    if (t.includes('cat')) return '🐱';
    if (t.includes('bird')) return '🐦';
    if (t.includes('cow')) return '🐄';
    if (t.includes('rabbit')) return '🐰';
    return '🐾';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>Rescued Pets 🏥</h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>
          Animals rescued from streets and shelters — different from adoption pets. Track their recovery status.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Reported',  value: reports.length,                                          color:'#8B7355', bg:'#fdf0e6', icon:'📋' },
          { label:'Being Rescued',   value: reports.filter(r=>r.status==='In Progress'||r.status==='Acknowledged').length, color:'#7c3aed', bg:'#f5f3ff', icon:'🚑' },
          { label:'Successfully Rescued', value: reports.filter(r=>r.status==='Rescued').length,    color:'#16a34a', bg:'#f0fdf4', icon:'✅' },
          { label:'Cases Closed',    value: reports.filter(r=>r.status==='Closed').length,           color:'#6b7280', bg:'#f9fafb', icon:'🔒' },
        ].map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:'14px', padding:'14px 16px', border:'1px solid #f0ebe3', boxShadow:'0 1px 4px rgba(90,70,53,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
              <span style={{ fontSize:'20px' }}>{s.icon}</span>
              <span style={{ fontSize:'22px', fontWeight:800, color:s.color }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'11px', color:'#9ca3af', margin:0, fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ background:'white', borderRadius:'16px', padding:'14px 18px', border:'1px solid #f0ebe3', marginBottom:'18px', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:'200px', position:'relative' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by animal, location, rescue center..."
            style={{ width:'100%', padding:'9px 14px 9px 34px', borderRadius:'10px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {ANIMAL_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding:'7px 12px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:700,
                background: filter===t ? 'linear-gradient(135deg,#8B7355,#A0826D)' : '#f5f0e8',
                color: filter===t ? 'white' : '#8B7355' }}>
              {t==='Dog'?'🐶':t==='Cat'?'🐱':t==='Bird'?'🐦':t==='Cow'?'🐄':t==='Rabbit'?'🐰':t==='All'?'🐾':'🐾'} {t}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {reports.length === 0 ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🏥</div>
          <p style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>No rescued animals yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>When animals are rescued, their stories will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'50px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'40px', marginBottom:'10px' }}>🔍</div>
          <p style={{ fontSize:'14px', color:'#9ca3af' }}>No results match your search</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'14px' }}>{filtered.length} rescue case{filtered.length!==1?'s':''}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'16px' }}>
            {filtered.map(r => (
              <div key={r.id}
                style={{ background:'white', borderRadius:'18px', overflow:'hidden', boxShadow:'0 2px 10px rgba(90,70,53,0.08)', border:'1px solid #f0ebe3', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(90,70,53,0.16)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 10px rgba(90,70,53,0.08)'; e.currentTarget.style.transform='translateY(0)'; }}
                onClick={() => setSelected(selected?.id===r.id ? null : r)}>

                {/* Image */}
                <div style={{ height:'180px', background:'linear-gradient(135deg,#fdf0e6,#f5ece0)', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'72px' }}>
                  {r.imagePreview
                    ? <img src={r.imagePreview} alt={r.animalType} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                    : emojiFor(r.animalType)
                  }
                  {/* Status badge */}
                  <span style={{ position:'absolute', top:'10px', right:'10px', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:statusBg[r.status]||'#fffbeb', color:statusColor[r.status]||'#d97706', backdropFilter:'blur(4px)' }}>
                    {statusIcon[r.status]||'⏳'} {r.status}
                  </span>
                  {/* Urgency badge */}
                  <span style={{ position:'absolute', top:'10px', left:'10px', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'20px',
                    background: r.urgency==='Critical'?'rgba(220,38,38,0.9)':r.urgency==='High'?'rgba(234,88,12,0.9)':'rgba(0,0,0,0.5)',
                    color:'white' }}>
                    {r.urgency==='Critical'?'🔴':r.urgency==='High'?'🟠':'🟡'} {r.urgency}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontWeight:800, fontSize:'16px', color:'#2d1f14' }}>
                      {emojiFor(r.animalType)} {r.animalType || 'Animal'}
                    </span>
                    <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color:'#6F4E37' }}>
                      {r.rescueCenterName && r.rescueCenterName !== 'Not assigned' ? r.rescueCenterName.split(' ').slice(0,2).join(' ') : 'Community'}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ color:'#475569', fontSize:'12px', margin:'0 0 8px', lineHeight:1.5,
                    overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {r.description || 'Rescued animal awaiting care'}
                  </p>

                  {/* Details row */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginBottom:'10px' }}>
                    <span style={{ fontSize:'11px', color:'#9ca3af' }}>📍 {r.location || 'Location not specified'}</span>
                    {r.rescueCenterName && r.rescueCenterName !== 'Not assigned' && (
                      <span style={{ fontSize:'11px', color:'#6F4E37', fontWeight:600 }}>🏥 {r.rescueCenterName}</span>
                    )}
                    <span style={{ fontSize:'11px', color:'#9ca3af' }}>🗓 Rescued: {r.submittedAt}</span>
                  </div>

                  {/* AI severity if available */}
                  {r.aiSeverity && (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 10px', borderRadius:'8px', background:'#fdf9f5', border:'1px solid #e8dcc8' }}>
                      <span style={{ fontSize:'12px' }}>🤖</span>
                      <span style={{ fontSize:'11px', color:'#6F4E37', fontWeight:600 }}>AI Assessment: {r.aiSeverity} ({r.aiConfidence}% confidence)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f0ebe3', background:'linear-gradient(135deg,#fdf9f5,#f5f0e8)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'26px' }}>{emojiFor(selected.animalType)}</span>
                <div>
                  <h3 style={{ margin:0, fontSize:'17px', fontWeight:700, color:'#2d1f14' }}>{selected.animalType || 'Animal'} Rescue Story</h3>
                  <span style={{ fontSize:'12px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:statusBg[selected.status], color:statusColor[selected.status] }}>
                    {statusIcon[selected.status]} {selected.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f5f0e8', cursor:'pointer', fontSize:'16px', color:'#8B7355' }}>✕</button>
            </div>

            <div style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'14px' }}>
              {/* Photo */}
              {selected.imagePreview && (
                <img src={selected.imagePreview} alt="rescued animal"
                  style={{ width:'100%', height:'240px', objectFit:'cover', objectPosition:'top center', borderRadius:'14px' }} />
              )}

              {/* Detail grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  ['🐾 Animal Type', selected.animalType||'Unknown'],
                  ['⚡ Urgency',     selected.urgency||'—'],
                  ['📍 Location',    selected.location||'—'],
                  ['🏥 Rescue Center', selected.rescueCenterName||'Community'],
                  ['🗓 Reported',    selected.submittedAt],
                  ['🤖 AI Severity', selected.aiSeverity ? `${selected.aiSeverity} (${selected.aiConfidence}%)` : 'N/A'],
                ].map(([lbl,val]) => (
                  <div key={lbl} style={{ background:'#fdf9f5', borderRadius:'10px', padding:'10px 12px', border:'1px solid #f0ebe3' }}>
                    <p style={{ margin:'0 0 3px', fontSize:'11px', color:'#8B6347', fontWeight:700 }}>{lbl}</p>
                    <p style={{ margin:0, fontSize:'12px', fontWeight:600, color:'#2d1f14', wordBreak:'break-word' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Full description */}
              {selected.description && (
                <div style={{ background:'#fdf9f5', borderRadius:'12px', padding:'14px', border:'1px solid #f0ebe3' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📝 Animal Condition</p>
                  <p style={{ margin:0, fontSize:'13px', color:'#475569', lineHeight:1.6 }}>{selected.description}</p>
                </div>
              )}

              {/* AI recommendations */}
              {selected.aiActions?.length > 0 && (
                <div style={{ background:'#fff8f0', borderRadius:'12px', padding:'14px', border:'1px solid #e8dcc8' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#6F4E37', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.4px' }}>🤖 AI Recommended Care</p>
                  {selected.aiActions.map((a, i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'#475569', marginBottom:'5px' }}>
                      <span style={{ fontWeight:700, color:'#6F4E37', minWidth:'16px' }}>{i+1}.</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status timeline */}
              <div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📋 Rescue Progress</p>
                <div style={{ display:'flex', gap:'4px', alignItems:'center', overflowX:'auto', paddingBottom:'4px' }}>
                  {['Submitted','Acknowledged','In Progress','Rescued','Closed'].map((s, i, arr) => {
                    const done = arr.indexOf(selected.status) >= i;
                    return (
                      <div key={s} style={{ display:'flex', alignItems:'center', gap:'3px', flexShrink:0 }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: done ? 'linear-gradient(135deg,#6F4E37,#8B6347)' : '#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color: done?'white':'#9ca3af', fontWeight:700 }}>
                            {done ? '✓' : i+1}
                          </div>
                          <span style={{ fontSize:'9px', color: done?'#6F4E37':'#9ca3af', fontWeight:600, whiteSpace:'nowrap' }}>{s}</span>
                        </div>
                        {i < arr.length-1 && <div style={{ width:'18px', height:'2px', background: arr.indexOf(selected.status) > i ? '#8B7355' : '#e8dcc8', borderRadius:'1px', marginBottom:'14px' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding:'14px 22px', borderTop:'1px solid #f0ebe3' }}>
              <button onClick={() => setSelected(null)}
                style={{ width:'100%', padding:'11px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AI RECOMMENDATIONS ── */
function AIRecommendations({ user, navigate }) {
  const userEmail = user?.email || '';
  const [step, setStep]           = useState('quiz');   // 'quiz' | 'loading' | 'results'
  const [prefs, setPrefs]         = useState({
    petType:     '',
    size:        '',
    energy:      '',
    living:      '',
    experience:  '',
    allergies:   '',
    timeHome:    '',
    children:    '',
  });
  const [results, setResults]     = useState([]);
  const [scores,  setScores]      = useState({});
  const [saved,   setSaved]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(`aiRecs_${userEmail}`) || 'null'); } catch { return null; }
  });

  // ── AI scoring engine ──
  const computeScore = (pet, p) => {
    let score = 60; // base
    const species = (pet.species||'').toLowerCase();
    const breed   = (pet.breed||'').toLowerCase();
    const age     = Number(pet.age) || 0;
    const ageUnit = (pet.ageUnit||'years').toLowerCase();
    const ageYears = ageUnit === 'months' ? age / 12 : age;
    const vaccinated = pet.vaccinated === true || pet.vaccinated === 'Yes';

    // Pet type match
    if (p.petType) {
      if (p.petType === 'dog'    && species === 'dog')    score += 20;
      if (p.petType === 'cat'    && species === 'cat')    score += 20;
      if (p.petType === 'bird'   && species === 'bird')   score += 20;
      if (p.petType === 'small'  && (species === 'rabbit' || species === 'hamster')) score += 20;
      if (p.petType !== 'any' && !['dog','cat','bird','small'].includes(p.petType)) score -= 10;
    }

    // Energy match
    if (p.energy === 'high') {
      if (species === 'dog') score += 10;
      if (ageYears < 3) score += 8;
    }
    if (p.energy === 'low') {
      if (species === 'cat' || species === 'rabbit') score += 10;
      if (ageYears > 4) score += 8;
    }
    if (p.energy === 'medium') score += 5;

    // Living situation
    if (p.living === 'apartment') {
      if (species === 'cat') score += 12;
      if (species === 'dog' && breed.includes('small')) score += 8;
      if (species === 'dog' && (breed.includes('labrador') || breed.includes('husky'))) score -= 8;
    }
    if (p.living === 'house') {
      if (species === 'dog') score += 10;
    }

    // Experience
    if (p.experience === 'first') {
      if (ageYears > 2 && ageYears < 6) score += 8;
      if (vaccinated) score += 5;
    }
    if (p.experience === 'experienced') {
      score += 5; // any pet is fine
    }

    // Allergies
    if (p.allergies === 'yes') {
      if (species === 'cat') score -= 15;
      if (species === 'dog' && (breed.includes('poodle') || breed.includes('maltese'))) score += 10;
      if (species === 'bird' || species === 'rabbit') score += 8;
    }

    // Time at home
    if (p.timeHome === 'always') {
      if (species === 'dog') score += 12;
    }
    if (p.timeHome === 'rarely') {
      if (species === 'cat') score += 12;
      if (species === 'dog') score -= 10;
    }

    // Children
    if (p.children === 'yes') {
      if (ageYears > 1 && ageYears < 7) score += 8;
      if (vaccinated) score += 5;
      if (species === 'bird') score -= 5;
    }

    // Vaccination bonus
    if (vaccinated) score += 5;

    // Available only
    if ((pet.adoptionStatus || pet.status || 'Available') === 'Adopted') score -= 50;

    return Math.min(100, Math.max(0, score));
  };

  const runAI = () => {
    setStep('loading');
    setTimeout(() => {
      const allPets = JSON.parse(localStorage.getItem('adminPets') || '[]');
      const available = allPets.filter(p => (p.adoptionStatus||p.status||'Available') === 'Available');

      const scored = available.map(p => ({
        ...p,
        _score: computeScore(p, prefs),
        _reasons: buildReasons(p, prefs),
      })).sort((a, b) => b._score - a._score);

      const top = scored.slice(0, 6);
      const scoreMap = {};
      top.forEach(p => { scoreMap[p.id] = p._score; });

      setResults(top);
      setScores(scoreMap);

      // Save to localStorage
      const saved = { prefs, results: top, generatedAt: new Date().toLocaleString() };
      localStorage.setItem(`aiRecs_${userEmail}`, JSON.stringify(saved));
      setSaved(saved);

      setStep('results');
    }, 2200);
  };

  const buildReasons = (pet, p) => {
    const reasons = [];
    const species = (pet.species||'').toLowerCase();
    const ageYears = (pet.ageUnit||'years') === 'months' ? Number(pet.age)/12 : Number(pet.age)||0;
    const vaccinated = pet.vaccinated === true || pet.vaccinated === 'Yes';

    if (p.petType && p.petType !== 'any' && species.startsWith(p.petType)) reasons.push(`Matches your preference for a ${p.petType}`);
    if (p.living === 'apartment' && species === 'cat') reasons.push('Great for apartment living');
    if (p.living === 'house'     && species === 'dog') reasons.push('Perfect for a house with space');
    if (p.energy === 'high' && ageYears < 3) reasons.push('Young and full of energy');
    if (p.energy === 'low'  && ageYears > 4) reasons.push('Calm and low-maintenance');
    if (p.children === 'yes' && vaccinated)  reasons.push('Vaccinated — safe around children');
    if (p.experience === 'first' && ageYears >= 2 && ageYears <= 6) reasons.push('Great for first-time owners');
    if (p.allergies === 'yes' && (species === 'bird' || species === 'rabbit')) reasons.push('Hypoallergenic-friendly species');
    if (vaccinated) reasons.push('Fully vaccinated ✅');
    if (reasons.length === 0) reasons.push('Good overall match for your lifestyle');
    return reasons.slice(0, 3);
  };

  const loadSaved = () => {
    if (saved) { setResults(saved.results); const m={}; saved.results.forEach(p=>{m[p.id]=p._score;}); setScores(m); setStep('results'); }
  };

  const C = { main:'#6F4E37', mid:'#8B6347', cream:'#fdf0e6', border:'#e8dcc8' };
  const iStyle = { width:'100%', padding:'10px 14px', borderRadius:'12px', border:`1.5px solid ${C.border}`, fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' };

  const QUESTIONS = [
    { key:'petType',    label:'What type of pet are you looking for?', icon:'🐾',
      opts:[{v:'dog',l:'🐶 Dog'},{v:'cat',l:'🐱 Cat'},{v:'bird',l:'🐦 Bird'},{v:'small',l:'🐰 Small Pet'},{v:'any',l:'🐾 Any Pet'}] },
    { key:'energy',     label:'What energy level do you prefer?', icon:'⚡',
      opts:[{v:'high',l:'⚡ High — active & playful'},{v:'medium',l:'😊 Medium — balanced'},{v:'low',l:'🌿 Low — calm & quiet'}] },
    { key:'living',     label:'Where do you live?', icon:'🏠',
      opts:[{v:'apartment',l:'🏢 Apartment'},{v:'house',l:'🏡 House with yard'},{v:'farm',l:'🌾 Farm / Rural'}] },
    { key:'experience', label:'Your pet ownership experience?', icon:'📋',
      opts:[{v:'first',l:'🌱 First-time owner'},{v:'some',l:'😊 Some experience'},{v:'experienced',l:'⭐ Very experienced'}] },
    { key:'children',   label:'Do you have children at home?', icon:'👶',
      opts:[{v:'yes',l:'👶 Yes, young children'},{v:'older',l:'🧒 Older children'},{v:'no',l:'🚫 No children'}] },
    { key:'timeHome',   label:'How often are you home?', icon:'⏰',
      opts:[{v:'always',l:'🏠 Work from home / always'},{v:'sometimes',l:'🕐 8–10 hrs away/day'},{v:'rarely',l:'✈️ Travel frequently'}] },
    { key:'allergies',  label:'Any pet allergies?', icon:'🤧',
      opts:[{v:'yes',l:'🤧 Yes — need hypoallergenic'},{v:'no',l:'✅ No allergies'},{v:'unsure',l:'🤔 Not sure'}] },
  ];

  const allAnswered = QUESTIONS.every(q => prefs[q.key]);

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>AI Recommendations 🤖</h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>Answer a few questions and our AI will find your perfect pet match.</p>
      </div>

      {/* ── QUIZ ── */}
      {step === 'quiz' && (
        <div>
          {saved && (
            <div style={{ background:'white', borderRadius:'14px', padding:'14px 18px', border:`1px solid ${C.border}`, marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:'#2d1f14' }}>📋 You have saved recommendations</p>
                <p style={{ margin:'2px 0 0', fontSize:'11px', color:'#9ca3af' }}>Generated on {saved.generatedAt}</p>
              </div>
              <button onClick={loadSaved}
                style={{ padding:'8px 16px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${C.main},${C.mid})`, color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                View Saved
              </button>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {QUESTIONS.map((q, qi) => (
              <div key={q.key} style={{ background:'white', borderRadius:'16px', padding:'18px 20px', border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(90,70,53,0.06)' }}>
                <p style={{ margin:'0 0 12px', fontSize:'14px', fontWeight:700, color:'#2d1f14' }}>
                  {q.icon} Q{qi+1}. {q.label}
                </p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {q.opts.map(o => (
                    <button key={o.v} onClick={() => setPrefs(p => ({ ...p, [q.key]: o.v }))}
                      style={{ padding:'8px 16px', borderRadius:'20px', border:`1.5px solid ${prefs[q.key]===o.v ? C.main : C.border}`, cursor:'pointer', fontSize:'13px', fontWeight:600, transition:'all 0.15s',
                        background: prefs[q.key]===o.v ? `linear-gradient(135deg,${C.main},${C.mid})` : 'white',
                        color: prefs[q.key]===o.v ? 'white' : C.mid }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'24px', textAlign:'center' }}>
            <button onClick={runAI} disabled={!allAnswered}
              style={{ padding:'14px 40px', borderRadius:'14px', border:'none',
                background: allAnswered ? `linear-gradient(135deg,${C.main},${C.mid})` : '#e8dcc8',
                color: allAnswered ? 'white' : '#9ca3af',
                fontSize:'15px', fontWeight:700, cursor: allAnswered ? 'pointer' : 'not-allowed',
                boxShadow: allAnswered ? '0 4px 14px rgba(111,78,55,0.3)' : 'none',
                display:'inline-flex', alignItems:'center', gap:'10px' }}>
              🤖 {allAnswered ? 'Get AI Recommendations →' : `Answer ${QUESTIONS.filter(q=>!prefs[q.key]).length} more question(s)`}
            </button>
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {step === 'loading' && (
        <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🤖</div>
          <h3 style={{ fontSize:'18px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>AI is analyzing your preferences...</h3>
          <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'24px' }}>
            Matching your lifestyle with {JSON.parse(localStorage.getItem('adminPets')||'[]').length} available pets
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:'12px', height:'12px', borderRadius:'50%', background: C.main, animation:`pulse ${0.6+i*0.2}s ease-in-out infinite alternate`, opacity:0.7+i*0.15 }} />
            ))}
          </div>
          <style>{`@keyframes pulse { from{transform:scale(0.8);opacity:0.5} to{transform:scale(1.2);opacity:1} }`}</style>
        </div>
      )}

      {/* ── RESULTS ── */}
      {step === 'results' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div>
              <h3 style={{ margin:0, fontSize:'16px', fontWeight:700, color:'#2d1f14' }}>🎯 {results.length} Pets Matched For You</h3>
              <p style={{ margin:'3px 0 0', fontSize:'12px', color:'#9ca3af' }}>Sorted by compatibility score — highest match first</p>
            </div>
            <button onClick={() => { setStep('quiz'); setPrefs({ petType:'',size:'',energy:'',living:'',experience:'',allergies:'',timeHome:'',children:'' }); }}
              style={{ padding:'8px 16px', borderRadius:'10px', border:`1.5px solid ${C.border}`, background:'white', color:C.main, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              🔄 Retake Quiz
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>😔</div>
              <p style={{ fontSize:'15px', fontWeight:600, color:'#2d1f14', marginBottom:'6px' }}>No available pets match right now</p>
              <p style={{ fontSize:'13px', color:'#9ca3af' }}>Check back soon as new pets are added regularly!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'18px' }}>
              {results.map((p, i) => {
                const img = p.imageUrls?.[0] || p.imagePreview || null;
                const score = scores[p.id] || p._score || 0;
                const reasons = p._reasons || [];
                const fee = p.adoptionFee ?? p.fee ?? 0;
                const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? C.main : '#d97706';
                const scoreBg    = score >= 80 ? '#f0fdf4' : score >= 60 ? C.cream : '#fffbeb';

                return (
                  <div key={p.id} style={{ background:'white', borderRadius:'18px', overflow:'hidden', boxShadow:'0 2px 12px rgba(90,70,53,0.10)', border: i===0 ? `2px solid ${C.main}` : `1px solid ${C.border}`, position:'relative' }}>
                    {/* Best match badge */}
                    {i === 0 && (
                      <div style={{ position:'absolute', top:'12px', left:'12px', zIndex:5, background:`linear-gradient(135deg,${C.main},${C.mid})`, color:'white', fontSize:'11px', fontWeight:800, padding:'4px 10px', borderRadius:'20px' }}>
                        ⭐ Best Match
                      </div>
                    )}

                    {/* Image */}
                    <div style={{ height:'180px', background:`linear-gradient(135deg,#fdf0e6,#e8dcc8)`, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'72px' }}>
                      {img
                        ? <img src={img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                        : (p.species==='Dog'?'🐶':p.species==='Cat'?'🐱':p.species==='Bird'?'🐦':'🐾')
                      }
                      {/* Score badge */}
                      <div style={{ position:'absolute', top:'10px', right:'10px', background:scoreBg, color:scoreColor, fontSize:'12px', fontWeight:800, padding:'4px 10px', borderRadius:'20px', border:`1px solid ${scoreColor}33` }}>
                        {score}% match
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ height:'4px', background:'#f5f0e8' }}>
                      <div style={{ height:'100%', width:`${score}%`, background:`linear-gradient(90deg,${scoreColor},${scoreColor}cc)`, transition:'width 0.8s ease' }} />
                    </div>

                    {/* Info */}
                    <div style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                        <span style={{ fontWeight:800, fontSize:'16px', color:'#2d1f14' }}>{p.name}</span>
                        <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color:C.main }}>{p.species}</span>
                      </div>
                      <p style={{ color:'#9ca3af', fontSize:'12px', margin:'0 0 10px' }}>{p.breed||'—'} · {p.age} {p.ageUnit||'years'} · 📍 {p.location||'—'}</p>

                      {/* AI reasons */}
                      <div style={{ marginBottom:'12px' }}>
                        {reasons.map((r,ri) => (
                          <div key={ri} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                            <span style={{ fontSize:'10px', color:scoreColor }}>✓</span>
                            <span style={{ fontSize:'11px', color:'#475569' }}>{r}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontWeight:700, fontSize:'15px', color:C.main }}>₹{fee}</span>
                        <button onClick={() => navigate(`/adopt/${p.id}`)}
                          style={{ padding:'8px 18px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${C.main},${C.mid})`, color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                          Adopt Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Placeholder({ icon, title, desc }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>{icon}</div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>{title}</h2>
      <p style={{ color:'#9ca3af', fontSize:'14px', maxWidth:'360px', margin:'0 auto 24px' }}>{desc}</p>
      <div style={{ display:'inline-block', background:'#4a7c30', color:'white', padding:'10px 24px', borderRadius:'12px', fontSize:'13px', fontWeight:600 }}>Coming Soon</div>
    </div>
  );
}

/* ── PET CARD ── */
function PetCard({ p, navigate, userEmail }) {
  const img       = p.imageUrls?.[0] || p.imagePreview || null;
  const fee       = p.adoptionFee ?? p.fee ?? 0;
  const status    = p.adoptionStatus || p.status || 'Available';
  const isAdopted = status === 'Adopted';
  const vaccinated = p.vaccinated === true || p.vaccinated === 'Yes';

  // Favourites stored per user in localStorage
  const favKey = `favourites_${userEmail || 'guest'}`;
  const [isFav, setIsFav] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
      return favs.some(f => f.id === p.id);
    } catch { return false; }
  });

  const toggleFav = (e) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
    let updated;
    if (isFav) {
      updated = favs.filter(f => f.id !== p.id);
    } else {
      updated = [...favs, { id: p.id, name: p.name, species: p.species, breed: p.breed, age: p.age, ageUnit: p.ageUnit, imageUrls: p.imageUrls || [], adoptionFee: fee, location: p.location, vaccinated: p.vaccinated, adoptionStatus: status }];
    }
    localStorage.setItem(favKey, JSON.stringify(updated));
    setIsFav(!isFav);
  };

  return (
    <div
      style={{
        background: 'white', borderRadius: '18px', overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(90,70,53,0.10)', border: '1px solid #f0ebe3',
        transition: 'all 0.2s', cursor: isAdopted ? 'default' : 'pointer',
        opacity: isAdopted ? 0.85 : 1,
      }}
      onMouseEnter={e => { if (!isAdopted) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(90,70,53,0.18)'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(90,70,53,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image area */}
      <div style={{ height: '200px', background: 'linear-gradient(135deg,#f5f0e8,#e8dcc8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', position: 'relative', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          : emojiFor(p.species)
        }

        {/* Heart favourite button — bottom-right corner, never blocks face */}
        <button onClick={toggleFav}
          title={isFav ? 'Remove from favourites' : 'Add to favourites'}
          style={{
            position: 'absolute', bottom: '10px', left: '10px',
            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
            background: isFav ? '#dc2626' : 'rgba(255,255,255,0.92)',
            color: '#dc2626',
            fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isFav ? '0 2px 10px rgba(220,38,38,0.6)' : '0 2px 6px rgba(0,0,0,0.20)',
            transition: 'all 0.2s', zIndex: 10,
            transform: isFav ? 'scale(1.15)' : 'scale(1)',
          }}>
          ❤️
        </button>

        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
          background: isAdopted ? 'rgba(220,38,38,0.92)' : 'rgba(255,255,255,0.95)',
          color: isAdopted ? 'white' : '#16a34a',
          backdropFilter: 'blur(4px)',
          boxShadow: isAdopted ? '0 2px 8px rgba(220,38,38,0.4)' : 'none',
        }}>
          {isAdopted ? '🏠 Adopted' : '✅ Available'}
        </span>

        {/* Adopted overlay */}
        {isAdopted && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(61,43,31,0.55), rgba(111,78,55,0.45))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(1px)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏠</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '1px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                ADOPTED
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontWeight: 700, color: '#2d1f14', fontSize: '16px' }}>{p.name}</span>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#f5f0e8', color: '#8B7355' }}>{p.species}</span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 4px' }}>{p.breed || '—'} · {p.age} {p.ageUnit || 'years'}</p>
        {p.location && <p style={{ color: '#b5a898', fontSize: '12px', margin: '0 0 10px' }}>📍 {p.location}</p>}

        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: vaccinated ? '#f0fdf4' : '#fef2f2', color: vaccinated ? '#16a34a' : '#dc2626' }}>
            {vaccinated ? '✅ Vaccinated' : '❌ Not Vaccinated'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#8B7355' }}>₹{fee}</span>

          {isAdopted ? (
            <span style={{
              padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              background: 'linear-gradient(135deg, #f5f0e8, #e8dcc8)',
              color: '#8B7355', border: '1px solid #e8dcc8',
            }}>
              🏠 Adopted
            </span>
          ) : (
            <button
              onClick={() => navigate(`/adopt/${p.id}`)}
              style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#8B7355,#A0826D)', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Adopt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
function Dashboard({ user, navigate }) {
  const userEmail = user?.email || '';
  const favKey = `favourites_${userEmail || 'guest'}`;
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [favCount, setFavCount] = useState(0);

  const updateFavCount = () => {
    const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
    setFavCount(favs.length);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    const pets = await loadAllPets();
    setAllPets(pets);
    setLoading(false);
    updateFavCount();
  }, []);

  // Listen for localStorage changes from admin (cross-tab sync)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'adminPets') {
        loadAllPets().then(pets => setAllPets(pets));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll fav count every 1s so it updates immediately after heart click
  useEffect(() => {
    const t = setInterval(updateFavCount, 1000);
    return () => clearInterval(t);
  }, [favKey]);

  // Re-check every 5 seconds in case admin adds a pet while customer is watching
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllPets().then(pets => {
        // Compare by JSON to detect status changes (e.g., Adopted → Available)
        setAllPets(prev => {
          const prevJSON = JSON.stringify(prev.map(p => ({ id: p.id, adoptionStatus: p.adoptionStatus, status: p.status })));
          const nextJSON = JSON.stringify(pets.map(p => ({ id: p.id, adoptionStatus: p.adoptionStatus, status: p.status })));
          return prevJSON !== nextJSON ? pets : prev;
        });
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = allPets.filter(p =>
    (filterSpecies === 'All' || (p.species||'').toLowerCase() === filterSpecies.toLowerCase()) &&
    (!search ||
      (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.breed||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.location||'').toLowerCase().includes(search.toLowerCase())
    )
  );

  // Compute real stats from localStorage
  const allRequests = JSON.parse(localStorage.getItem('adoptionRequests') || '[]');
  const myRequests  = allRequests.filter(r => r.userEmail === userEmail || r.customerEmail === userEmail);
  const myAdopted   = myRequests.filter(r => r.status === 'Approved');

  const stats = [
    { icon:'🐾', label:'Pets Available', value: allPets.filter(p => (p.adoptionStatus||p.status||'Available') === 'Available').length, color:'#8B7355' },
    { icon:'❤️', label:'My Favorites',   value: favCount,          color:'#e05c5c' },
    { icon:'📄', label:'My Requests',    value: myRequests.length, color:'#e08c1a' },
    { icon:'📋', label:'Adopted Pets',   value: myAdopted.length,  color:'#5b6abf' },
  ];

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'2px' }}>
        Welcome back, {user.firstName || 'Friend'} 👋
      </h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>
        Find your perfect companion and start your adoption journey.
      </p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:'14px', padding:'16px 18px', boxShadow:'0 1px 4px rgba(90,70,53,0.08)', border:'1px solid #f0ebe3', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ fontSize:'26px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'22px', fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ background:'white', borderRadius:'16px', padding:'16px 20px', boxShadow:'0 1px 4px rgba(90,70,53,0.08)', border:'1px solid #f0ebe3', marginBottom:'20px', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:'220px', position:'relative' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'15px', color:'#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, breed or location..."
            style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:'10px', border:'1.5px solid #e8dcc8', fontSize:'13px', outline:'none', boxSizing:'border-box', background:'#fdf9f5', color:'#2d1f14' }} />
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {['All','Dog','Cat','Rabbit','Bird'].map(s => (
            <button key={s} onClick={() => setFilterSpecies(s)}
              style={{ padding:'8px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600,
                background: filterSpecies===s ? 'linear-gradient(135deg,#8B7355,#A0826D)' : '#f5f0e8',
                color: filterSpecies===s ? 'white' : '#8B7355',
                boxShadow: filterSpecies===s ? '0 2px 8px rgba(139,115,85,0.3)' : 'none' }}>
              {s==='All'?'🐾 All':s==='Dog'?'🐶 Dogs':s==='Cat'?'🐱 Cats':s==='Rabbit'?'🐰 Rabbits':'🐦 Birds'}
            </button>
          ))}
        </div>
        <button onClick={refresh} title="Refresh"
          style={{ padding:'8px 12px', borderRadius:'10px', border:'1.5px solid #e8dcc8', background:'white', cursor:'pointer', fontSize:'16px' }}>
          🔄
        </button>
        <button onClick={() => {
          // Reset ALL pets to Available status (undo any accidental adopted status)
          const raw = localStorage.getItem('adminPets');
          if (raw) {
            const pets = JSON.parse(raw).map(p => ({ ...p, adoptionStatus: 'Available', status: 'Available' }));
            localStorage.setItem('adminPets', JSON.stringify(pets));
          }
          // Also clear all adoption requests
          localStorage.removeItem('adoptionRequests');
          refresh();
          toast.success('All pets reset to Available ✅');
        }} title="Reset all pets to Available"
          style={{ padding:'8px 12px', borderRadius:'10px', border:'1.5px solid #e8c99a', background:'#fff8f0', cursor:'pointer', fontSize:'13px', fontWeight:600, color:'#8B6347' }}>
          ↺ Reset All
        </button>
      </div>

      {/* Pet Grid */}
      {loading ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>⏳</div>
          <p style={{ fontSize:'15px', color:'#8B7355', fontWeight:600 }}>Loading pets...</p>
        </div>
      ) : allPets.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', color:'#9ca3af', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'56px', marginBottom:'12px' }}>🐾</div>
          <p style={{ fontSize:'16px', fontWeight:600, marginBottom:'6px', color:'#5a4635' }}>No pets added yet</p>
          <p style={{ fontSize:'13px', marginBottom:'16px' }}>The admin needs to add pets first. Once added, they'll appear here instantly.</p>
          <button onClick={refresh} style={{ padding:'10px 24px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'60px 20px', textAlign:'center', color:'#9ca3af', border:'1px solid #f0ebe3' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔍</div>
          <p style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px', color:'#5a4635' }}>No results found</p>
          <p style={{ fontSize:'13px' }}>Try different keywords or clear filters</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'14px' }}>
            Showing {filtered.length} of {allPets.length} pet{allPets.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'18px' }}>
            {filtered.map(p => <PetCard key={p.id || p._id} p={p} navigate={navigate} userEmail={userEmail} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ── BROWSE PETS ── */
function BrowsePets({ navigate }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadAllPets().then(data => { setPets(data); setLoading(false); });
  }, []);

  const filtered = pets.filter(p =>
    (filter === 'All' || (p.species||'').toLowerCase() === filter.toLowerCase()) &&
    (!search ||
      (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.breed||'').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>Browse Pets 🐾</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>Search and filter available pets.</p>
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or breed..."
          style={{ flex:1, minWidth:'200px', padding:'10px 16px', borderRadius:'12px', border:'1px solid #e5e7eb', fontSize:'13px', outline:'none' }} />
        {['All','Dog','Cat','Rabbit','Bird'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600,
              background: filter===s ? 'linear-gradient(135deg,#8B7355,#A0826D)' : '#f3f4f6',
              color: filter===s ? 'white' : '#374151' }}>
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af' }}>Loading pets...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🐾</div>
          <p style={{ fontSize:'15px', fontWeight:600 }}>No pets found</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:'18px' }}>
          {filtered.map(p => <PetCard key={p.id || p._id} p={p} navigate={navigate} />)}
        </div>
      )}
    </div>
  );
}

/* ── AI ASSISTANT ── */
function AIAssistant() {
  const [msgs, setMsgs] = useState([{ from:'bot', text:"Hi! I'm your AI pet adoption assistant 🐾 How can I help?" }]);
  const [input, setInput] = useState('');
  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { from:'user', text:input }, { from:'bot', text:'Thanks! Try browsing pets or check AI Recommendations for personalized matches 🐾' }]);
    setInput('');
  };
  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>AI Assistant 💬</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'16px' }}>Get adoption guidance and pet care advice.</p>
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', display:'flex', flexDirection:'column', height:'420px' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.from==='user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth:'70%', padding:'10px 14px', borderRadius:'16px', fontSize:'13px', background: m.from==='user' ? '#8B7355' : '#f3f4f6', color: m.from==='user' ? 'white' : '#2d1f14' }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid #f3f4f6', padding:'12px', display:'flex', gap:'10px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()}
            placeholder="Ask anything about pet adoption..."
            style={{ flex:1, padding:'10px 14px', borderRadius:'10px', border:'1px solid #e5e7eb', fontSize:'13px', outline:'none' }} />
          <button onClick={send} style={{ padding:'10px 18px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ── PROFILE ── */
function ProfilePage({ user, setUser }) {
  const loginTime = localStorage.getItem('customerLoginTime') || 'N/A';
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName:  user.lastName  || '',
    email:     user.email     || '',
    phone:     user.phone     || '',
    city:      user.city      || '',
    address:   user.address   || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Update currentUser in localStorage with new profile data
    const updated = { ...user, ...form };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    if (setUser) setUser(updated);
    setSaved(true);
    toast.success('Profile updated! ✅');
    setTimeout(() => setSaved(false), 2000);
  };

  const infoCards = [
    { icon:'👤', label:'Full Name',   value: `${form.firstName} ${form.lastName}`.trim() || '—' },
    { icon:'📧', label:'Email',       value: form.email || '—' },
    { icon:'📱', label:'Phone',       value: form.phone || 'Not set' },
    { icon:'🏙️', label:'City',        value: form.city  || 'Not set' },
    { icon:'🕐', label:'Login Time',  value: loginTime },
    { icon:'✅', label:'Status',      value: 'Active' },
    { icon:'🔑', label:'Role',        value: 'Customer' },
    { icon:'🔒', label:'Account',     value: 'Verified' },
  ];

  return (
    <div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', marginBottom:'4px' }}>My Profile 👤</h2>
      <p style={{ color:'#9ca3af', fontSize:'13px', marginBottom:'20px' }}>View and edit your profile details.</p>

      {/* Avatar + info cards */}
      <div style={{ background:'white', borderRadius:'20px', padding:'28px', boxShadow:'0 1px 6px rgba(90,70,53,0.10)', border:'1px solid #f0ebe3', marginBottom:'20px' }}>

        {/* Avatar row */}
        <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid #f5f0e8' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700, color:'white', flexShrink:0, boxShadow:'0 4px 14px rgba(139,115,85,0.35)' }}>
            {(form.firstName||'U')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:'18px', color:'#2d1f14', margin:'0 0 4px' }}>{form.firstName} {form.lastName}</p>
            <p style={{ color:'#8B7355', fontSize:'13px', margin:'0 0 8px' }}>{form.email}</p>
            <span style={{ fontSize:'12px', fontWeight:600, padding:'3px 12px', borderRadius:'20px', background:'#f5f0e8', color:'#8B7355', border:'1px solid #e8dcc8' }}>
              👤 Customer
            </span>
          </div>
        </div>

        {/* Info cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
          {infoCards.map(f => (
            <div key={f.label} style={{ background:'linear-gradient(135deg,#fdf9f5,#f5f0e8)', borderRadius:'14px', padding:'14px 16px', border:'1px solid #e8dcc8' }}>
              <p style={{ fontSize:'11px', color:'#8B7355', fontWeight:600, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                {f.icon} {f.label}
              </p>
              <p style={{ fontSize:'14px', fontWeight:600, color:'#2d1f14', margin:0, wordBreak:'break-all' }}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* Login time banner */}
        <div style={{ background:'linear-gradient(135deg,#8B7355,#A0826D)', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'28px' }}>🕐</span>
          <div>
            <p style={{ color:'white', fontWeight:700, fontSize:'13px', margin:'0 0 3px' }}>Current Session</p>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px', margin:0 }}>Logged in at: {loginTime}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div style={{ background:'white', borderRadius:'20px', padding:'28px', boxShadow:'0 1px 6px rgba(90,70,53,0.10)', border:'1px solid #f0ebe3' }}>
        <h3 style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', margin:'0 0 20px' }}>Edit Details</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {[
            ['firstName','First Name','text'],
            ['lastName','Last Name','text'],
            ['email','Email','email'],
            ['phone','Phone Number','tel'],
            ['city','City','text'],
            ['address','Address','text'],
          ].map(([k, lbl, type]) => (
            <div key={k}>
              <label style={{ fontSize:'12px', fontWeight:600, color:'#6b7280', display:'block', marginBottom:'6px' }}>{lbl}</label>
              <input
                type={type}
                value={form[k]}
                onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #e8dcc8', fontSize:'13px', outline:'none', boxSizing:'border-box', background:'#fdf9f5', color:'#2d1f14' }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          style={{ marginTop:'20px', padding:'11px 28px', borderRadius:'12px', border:'none', background: saved ? '#16a34a' : 'linear-gradient(135deg,#8B7355,#A0826D)', color:'white', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch { return {}; } });
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Fetch user profile from DB to keep UI fresh
  useEffect(() => {
    if (user?.id && !user.id.startsWith('local_')) {
      fetch(`http://localhost:5000/api/users/${user.id}`)
        .then(res => {
          if (res.ok) return res.json();
        })
        .then(dbUser => {
          if (dbUser) {
            const merged = { ...user, ...dbUser, userType: 'CUSTOMER' };
            localStorage.setItem('currentUser', JSON.stringify(merged));
            setUser(merged);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Count unread customer notifications
  useEffect(() => {
    const update = () => {
      const email = user?.email || '';
      const key = `customerNotifications_${email}`;
      const specific = JSON.parse(localStorage.getItem(key) || '[]');
      const global   = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      const seen = new Set();
      const all = [...specific, ...global].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
      setUnreadNotifCount(all.filter(n => !n.read).length);
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const content = () => {
    switch(active) {
      case 'dashboard':    return <Dashboard user={user} navigate={navigate} />;
      case 'browse':       return <BrowsePets navigate={navigate} />;
      case 'rescued':      return <RescuedPets />;
      case 'assistant':    return <AIAssistant />;
      case 'profile':      return <ProfilePage user={user} setUser={setUser} />;
      case 'ai-recs':      return <AIRecommendations user={user} navigate={navigate} />;
      case 'favorites':    return <FavouritesPage user={user} navigate={navigate} />;
      case 'requests':     return <CustomerAdoptionRequests user={user} />;
      case 'adoptions':    return <MyAdoptions user={user} />;
      case 'rescue':       return <RescueReports user={user} />;
      case 'shelters':     return <NearbySheltersPage />;
      case 'petcare':      return <PetCare user={user} />;
      case 'reviews':      return <ReviewsRatings user={user} />;
      case 'notifications':return <CustomerNotifications user={user} />;
      case 'settings':     return <SettingsPage user={user} />;
      default:             return <Dashboard user={user} navigate={navigate} />;
    }
  };

  const W = collapsed ? 64 : 240;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Inter,system-ui,sans-serif', background:'linear-gradient(135deg,#f5f0e8 0%,#ffffff 50%,#e8dcc8 100%)' }}>

      {/* SIDEBAR */}
      <div style={{ width:`${W}px`, minWidth:`${W}px`, height:'100vh', background:'linear-gradient(180deg,#5a4635 0%,#8B7355 100%)', display:'flex', flexDirection:'column', transition:'width 0.2s,min-width 0.2s', overflow:'hidden', flexShrink:0, boxShadow:'4px 0 20px rgba(90,70,53,0.25)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'16px 12px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          <div style={{ width:'36px', height:'36px', minWidth:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🐾</div>
          {!collapsed && <div><p style={{ color:'white', fontWeight:700, fontSize:'13px', margin:0, whiteSpace:'nowrap' }}>FurEver Home</p><p style={{ color:'#d4c5b8', fontSize:'11px', margin:0, whiteSpace:'nowrap' }}>Adopt. Rescue. Love.</p></div>}
        </div>

        {!collapsed && (
          <div style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'32px', height:'32px', minWidth:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'13px' }}>{(user.firstName||'U')[0].toUpperCase()}</div>
              <div style={{ overflow:'hidden' }}>
                <p style={{ color:'white', fontSize:'13px', fontWeight:600, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.firstName} {user.lastName}</p>
                <p style={{ color:'#d4c5b8', fontSize:'11px', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav style={{ flex:1, overflowY:'auto', padding:'8px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} title={collapsed ? item.label : ''}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', border:'none', cursor:'pointer', width:'100%', textAlign:'left',
                background: active===item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: active===item.id ? '3px solid #f5deb3' : '3px solid transparent',
                position:'relative', transition:'background 0.1s' }}>
              <span style={{ fontSize:'18px', lineHeight:1, flexShrink:0, minWidth:'20px', textAlign:'center' }}>{item.icon}</span>
              {!collapsed && <span style={{ color: active===item.id ? '#f5deb3' : '#d4c5b8', fontSize:'13px', fontWeight:500, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
              {item.id==='notifications' && unreadNotifCount > 0 && !collapsed && <span style={{ background:'#e05c5c', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px' }}>{unreadNotifCount}</span>}
              {item.id==='notifications' && unreadNotifCount > 0 && collapsed && <span style={{ position:'absolute', top:'4px', right:'4px', background:'#e05c5c', color:'white', fontSize:'9px', width:'13px', height:'13px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadNotifCount}</span>}
              {item.id!=='notifications' && item.badge && !collapsed && <span style={{ background:'#e05c5c', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px' }}>{item.badge}</span>}
              {item.id!=='notifications' && item.badge && collapsed && <span style={{ position:'absolute', top:'4px', right:'4px', background:'#e05c5c', color:'white', fontSize:'9px', width:'13px', height:'13px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          <button onClick={handleLogout} title={collapsed ? 'Logout' : ''}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', border:'none', cursor:'pointer', width:'100%', background:'transparent', color:'#ffb3b3' }}>
            <span style={{ fontSize:'18px', flexShrink:0, minWidth:'20px', textAlign:'center' }}>🚪</span>
            {!collapsed && <span style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:'56px', background:'white', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f3f4f6', cursor:'pointer', fontSize:'12px', color:'#5a4635' }}>
              {collapsed ? '▶' : '◀'}
            </button>
            <div>
              <p style={{ fontSize:'11px', color:'#9ca3af', margin:0 }}>PetCare AI</p>
              <p style={{ fontSize:'14px', fontWeight:600, color:'#2d1f14', margin:0 }}>{NAV.find(n => n.id===active)?.label || 'Dashboard'}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => setActive('notifications')} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'#f3f4f6', cursor:'pointer', fontSize:'15px', position:'relative' }}>
              🔔
              {unreadNotifCount > 0 && <span style={{ position:'absolute', top:'3px', right:'3px', background:'#e05c5c', color:'white', fontSize:'8px', fontWeight:700, width:'12px', height:'12px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadNotifCount}</span>}
            </button>
            <button onClick={() => setActive('profile')} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'3px 10px 3px 3px', borderRadius:'20px', border:'none', background:'linear-gradient(135deg,#f5f0e8,#ffffff)', cursor:'pointer', boxShadow:'0 1px 3px rgba(90,70,53,0.15)' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'linear-gradient(135deg,#8B7355,#A0826D)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'12px' }}>{(user.firstName||'U')[0].toUpperCase()}</div>
              <span style={{ fontSize:'13px', fontWeight:500, color:'#5a4635' }}>{user.firstName||'User'}</span>
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          {content()}
        </div>
      </div>
    </div>
  );
}
