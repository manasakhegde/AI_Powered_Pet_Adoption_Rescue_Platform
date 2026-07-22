import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const C = {
  main:   '#6F4E37',
  mid:    '#8B6347',
  light:  '#A0826D',
  cream:  '#f5deb3',
  bg:     'linear-gradient(135deg,#fdf6ee 0%,#ffffff 50%,#f5ece0 100%)',
  border: '#e8d5c0',
  cardBg: '#ffffff',
};

function NearbySheltersPage() {
  const [centers, setCenters]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterCity, setFilterCity]     = useState('');
  const [filterService, setFilterService] = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => { fetchCenters(); }, []);

  const fetchCenters = async () => {
    // 1. From localStorage (admin-added)
    try {
      const stored = localStorage.getItem('adminRescueCenters');
      if (stored) {
        const local = JSON.parse(stored);
        if (Array.isArray(local) && local.length > 0) { setCenters(local); setLoading(false); }
      }
    } catch (_) {}
    // 2. Backend
    try {
      const res = await fetch('http://localhost:5000/api/rescue-centers', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCenters(data);
          localStorage.setItem('adminRescueCenters', JSON.stringify(data));
        }
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filtered = centers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (c.name||'').toLowerCase().includes(q) ||
      (c.city||'').toLowerCase().includes(q) ||
      (c.services||'').toLowerCase().includes(q) ||
      (c.address||'').toLowerCase().includes(q);
    const matchCity    = !filterCity    || (c.city||'').toLowerCase() === filterCity.toLowerCase();
    const matchService = !filterService || (c.services||'').toLowerCase().includes(filterService.toLowerCase());
    return matchSearch && matchCity && matchService;
  });

  const cities = [...new Set(centers.map(c => c.city).filter(Boolean))].sort();

  const iStyle = { width:'100%', padding:'10px 14px', borderRadius:'12px', border:`1.5px solid ${C.border}`, fontSize:'13px', outline:'none', background:'#fdf9f5', color:'#2d1f14', boxSizing:'border-box' };

  const capacityPct = (c) => c.totalCapacity > 0 ? Math.round((c.currentAnimals / c.totalCapacity) * 100) : 0;
  const capColor    = (pct) => pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#16a34a';

  return (
    <div style={{ fontFamily:'Inter,system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:'#2d1f14', margin:0 }}>Nearby Shelters & Rescue Centers 📍</h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'4px 0 0' }}>
          Rescue centers added by admin — click any card to see full details and contact them directly.
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ background:'white', borderRadius:'18px', padding:'18px 20px', border:`1px solid ${C.border}`, marginBottom:'22px', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'flex-end' }}>
        <div style={{ flex:1, minWidth:'220px', position:'relative' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'15px', color:'#9ca3af' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, city, or service..."
            style={{ ...iStyle, paddingLeft:'36px' }} />
        </div>
        <div style={{ minWidth:'150px' }}>
          <label style={{ fontSize:'11px', fontWeight:700, color: C.mid, display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.4px' }}>City</label>
          <select value={filterCity} onChange={e=>setFilterCity(e.target.value)} style={iStyle}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ minWidth:'150px' }}>
          <label style={{ fontSize:'11px', fontWeight:700, color: C.mid, display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.4px' }}>Service</label>
          <select value={filterService} onChange={e=>setFilterService(e.target.value)} style={iStyle}>
            <option value="">All Services</option>
            {['Shelter','Medical','Adoption','Rescue','Vaccination','Training'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {(search||filterCity||filterService) && (
          <button onClick={()=>{setSearch('');setFilterCity('');setFilterService('');}}
            style={{ padding:'10px 16px', borderRadius:'12px', border:`1.5px solid ${C.border}`, background:'white', color:C.main, fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>⏳</div>
          <p style={{ color: C.main, fontWeight:600 }}>Loading rescue centers...</p>
        </div>
      ) : centers.length === 0 ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🏥</div>
          <p style={{ fontSize:'16px', fontWeight:700, color:'#2d1f14', marginBottom:'8px' }}>No rescue centers added yet</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>The admin needs to add rescue centers first. Once added, they'll appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'18px', padding:'60px 20px', textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔍</div>
          <p style={{ fontSize:'15px', fontWeight:600, color:'#2d1f14', marginBottom:'6px' }}>No results found</p>
          <p style={{ fontSize:'13px', color:'#9ca3af' }}>Try a different search or clear filters</p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'16px' }}>
            {filtered.length} rescue center{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'16px' }}>
            {filtered.map(c => {
              const pct  = capacityPct(c);
              const isOpen = selected?.id === c.id;
              return (
                <div key={c.id}
                  style={{ background:'white', borderRadius:'18px', border: isOpen ? `2px solid ${C.main}` : `1px solid ${C.border}`, boxShadow: isOpen ? `0 6px 24px rgba(111,78,55,0.18)` : '0 2px 8px rgba(90,70,53,0.08)', transition:'all 0.2s', overflow:'hidden' }}>

                  {/* Card header — always visible */}
                  <div style={{ padding:'18px 20px', cursor:'pointer' }} onClick={()=>setSelected(isOpen?null:c)}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
                      <div style={{ flex:1, minWidth:0, marginRight:'10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                          <h3 style={{ margin:0, fontSize:'15px', fontWeight:800, color:'#2d1f14' }}>{c.name}</h3>
                          {c.verificationStatus === 'VERIFIED' && (
                            <span title="Verified" style={{ fontSize:'13px' }}>✅</span>
                          )}
                        </div>
                        <p style={{ margin:0, fontSize:'12px', color:'#9ca3af' }}>
                          {c.registrationType && <span>{c.registrationType} · </span>}
                          {c.city}{c.state ? `, ${c.state}` : ''}
                        </p>
                      </div>
                      <div style={{ fontSize:'20px', flexShrink:0 }}>{isOpen ? '▲' : '▼'}</div>
                    </div>

                    {/* Services chips */}
                    {c.services && (
                      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
                        {c.services.split(',').map(s => (
                          <span key={s.trim()} style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'#fdf0e6', color: C.main, border:`1px solid ${C.border}` }}>
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick info row */}
                    <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'12px', color:'#475569' }}>📞 {c.phone||'—'}</span>
                      {c.openingHours && <span style={{ fontSize:'12px', color:'#9ca3af' }}>🕐 {c.openingHours}</span>}
                    </div>

                    {/* Capacity bar */}
                    {c.totalCapacity > 0 && (
                      <div style={{ marginTop:'12px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                          <span style={{ fontSize:'11px', color:'#9ca3af' }}>Capacity</span>
                          <span style={{ fontSize:'11px', fontWeight:700, color: capColor(pct) }}>{c.currentAnimals||0}/{c.totalCapacity} ({pct}%)</span>
                        </div>
                        <div style={{ height:'6px', background:'#f5f0e8', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${capColor(pct)},${capColor(pct)}cc)`, borderRadius:'3px', transition:'width 0.4s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded detail — shown on click */}
                  {isOpen && (
                    <div style={{ borderTop:`1px solid ${C.border}`, background:'#fdf9f5' }}>

                      {/* About */}
                      {c.description && (
                        <div style={{ padding:'16px 20px 0' }}>
                          <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>About</p>
                          <p style={{ fontSize:'13px', color:'#475569', margin:0, lineHeight:1.6 }}>{c.description}</p>
                        </div>
                      )}

                      {/* Location */}
                      <div style={{ padding:'14px 20px 0' }}>
                        <p style={{ fontSize:'12px', fontWeight:700, color:'#2d1f14', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.4px' }}>📍 Address</p>
                        <p style={{ fontSize:'13px', color:'#475569', margin:0 }}>
                          {[c.address, c.city, c.state].filter(Boolean).join(', ')}
                        </p>
                      </div>

                      {/* Contact details grid */}
                      <div style={{ padding:'14px 20px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                        {[
                          ['📞 Phone', c.phone],
                          ['📧 Email', c.email],
                          ['🕐 Hours', c.openingHours],
                          ['🐾 Specializations', c.specializations],
                        ].filter(([,v])=>v).map(([label,val])=>(
                          <div key={label} style={{ background:'white', borderRadius:'10px', padding:'10px 12px', border:`1px solid ${C.border}` }}>
                            <p style={{ margin:'0 0 3px', fontSize:'11px', color: C.mid, fontWeight:700 }}>{label}</p>
                            <p style={{ margin:0, fontSize:'12px', color:'#2d1f14', fontWeight:600, wordBreak:'break-all' }}>{val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding:'16px 20px', display:'flex', gap:'10px' }}>
                        <button
                          onClick={()=>{
                            if (c.phone) {
                              navigator.clipboard?.writeText(c.phone).catch(()=>{});
                              toast.success(`📞 ${c.phone} — copied to clipboard!`);
                            } else toast('No phone number available');
                          }}
                          style={{ flex:1, padding:'11px', borderRadius:'12px', border:'none', background:`linear-gradient(135deg,${C.main},${C.mid})`, color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', boxShadow:`0 3px 10px rgba(111,78,55,0.3)` }}>
                          📞 Call Now
                        </button>
                        {c.email && (
                          <button
                            onClick={()=>{ window.location.href=`mailto:${c.email}`; }}
                            style={{ flex:1, padding:'11px', borderRadius:'12px', border:`1.5px solid ${C.border}`, background:'white', color: C.main, fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                            📧 Email
                          </button>
                        )}
                        <button
                          onClick={()=>{
                            const addr = [c.address, c.city, c.state].filter(Boolean).join(', ');
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank');
                          }}
                          style={{ flex:1, padding:'11px', borderRadius:'12px', border:`1.5px solid ${C.border}`, background:'white', color: C.main, fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                          📍 Get Directions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbySheltersPage;
