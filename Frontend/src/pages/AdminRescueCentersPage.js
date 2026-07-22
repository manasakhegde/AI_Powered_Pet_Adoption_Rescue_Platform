import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function AdminRescueCentersPage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    openingHours: '',
    totalCapacity: '',
    currentAnimals: '',
    services: '',
    specializations: '',
    registrationType: 'NGO'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRescueCenters();
  }, []);

  const fetchRescueCenters = async () => {
    // 1. Load from localStorage immediately
    const stored = localStorage.getItem('adminRescueCenters');
    if (stored) {
      try {
        const local = JSON.parse(stored);
        if (Array.isArray(local) && local.length > 0) {
          setCenters(local);
          setLoading(false);
        }
      } catch (_) {}
    }

    // 2. Try backend
    try {
      const response = await fetch('http://localhost:5000/api/rescue-centers/admin/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
        localStorage.setItem('adminRescueCenters', JSON.stringify(data));
      }
    } catch (_) {
      // Backend offline — localStorage already loaded above
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({
      name: '', description: '', phone: '', email: '',
      address: '', city: '', state: '',
      openingHours: '', totalCapacity: '', currentAnimals: '', services: '',
      specializations: '', registrationType: 'NGO'
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (center) => {
    setForm(center);
    setEditId(center.id);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({});
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Center name is required';
    if (!form.description?.trim()) e.description = 'Description is required';
    if (!form.phone?.trim()) e.phone = 'Phone is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (!form.address?.trim()) e.address = 'Address is required';
    if (!form.city?.trim()) e.city = 'City is required';
    if (!form.services?.trim()) e.services = 'Services are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const tempId = 'local_rc_' + Date.now();
    const payload = { ...form, verificationStatus: 'PENDING' };
    let savedCenter = null;

    try {
      const url = editId
        ? `http://localhost:5000/api/rescue-centers/${editId}`
        : 'http://localhost:5000/api/rescue-centers';

      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        savedCenter = await response.json();
        const stored = localStorage.getItem('adminRescueCenters');
        let localCenters = [];
        try { localCenters = stored ? JSON.parse(stored) : []; } catch (_) { localCenters = []; }

        if (editId) {
          localCenters = localCenters.map(x => x.id === editId ? savedCenter : x);
          setCenters(c => c.map(x => x.id === editId ? savedCenter : x));
        } else {
          localCenters.push(savedCenter);
          setCenters(c => [...c, savedCenter]);
        }

        localStorage.setItem('adminRescueCenters', JSON.stringify(localCenters));
        toast.success(editId ? 'Rescue center updated & saved to MongoDB!' : 'Rescue center added to MongoDB!');
      } else {
        const errorText = await response.text().catch(() => 'Unable to save to MongoDB');
        toast.error(`Rescue center saved locally, but MongoDB save failed: ${errorText}`);
        saveCenterLocally(editId, tempId, payload);
      }
    } catch (error) {
      toast.error(editId ? 'Rescue center update could not reach MongoDB.' : 'Rescue center could not be saved to MongoDB. It was saved locally.');
      saveCenterLocally(editId, tempId, payload);
    }

    closeModal();
  };

  const saveCenterLocally = (editId, tempId, centerPayload) => {
    const stored = localStorage.getItem('adminRescueCenters');
    let localCenters = [];
    try { localCenters = stored ? JSON.parse(stored) : []; } catch (_) { localCenters = []; }

    const localCenter = { ...centerPayload, id: editId || tempId };

    if (editId) {
      localCenters = localCenters.map(x => x.id === editId ? localCenter : x);
      setCenters(c => c.map(x => x.id === editId ? localCenter : x));
    } else {
      localCenters.push(localCenter);
      setCenters(c => [...c, localCenter]);
    }

    localStorage.setItem('adminRescueCenters', JSON.stringify(localCenters));
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    // Remove from localStorage immediately
    const stored = localStorage.getItem('adminRescueCenters');
    if (stored) {
      try {
        const updated = JSON.parse(stored).filter(x => x.id !== id);
        localStorage.setItem('adminRescueCenters', JSON.stringify(updated));
      } catch (_) {}
    }
    setCenters(c => c.filter(x => x.id !== id));
    toast.success(`${name} deleted`);

    // Also try backend
    try {
      await fetch(`http://localhost:5000/api/rescue-centers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch (_) {}
  };

  const handleVerify = async (id) => {
    // Update locally first
    const updated = centers.map(x => x.id === id ? { ...x, verificationStatus: 'VERIFIED' } : x);
    setCenters(updated);
    localStorage.setItem('adminRescueCenters', JSON.stringify(updated));
    toast.success('Rescue center verified!');

    // Also try backend
    try {
      const response = await fetch(`http://localhost:5000/api/rescue-centers/${id}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        setCenters(c => c.map(x => x.id === id ? data : x));
      }
    } catch (_) {}
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
    border: errors[field] ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0',
    background: errors[field] ? '#fef2f2' : 'white',
  });
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' };
  const errStyle = { fontSize: '11px', color: '#dc2626', marginTop: '3px' };

  const statusColor = { VERIFIED: '#16a34a', PENDING: '#d97706', REJECTED: '#dc2626' };
  const statusBg = { VERIFIED: '#f0fdf4', PENDING: '#fffbeb', REJECTED: '#fef2f2' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Rescue Centers 🏥</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>Manage rescue centers and shelters.</p>
        </div>
        <button onClick={openAdd}
          style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#16a34a', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          + Add Center
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading rescue centers...</div>
        ) : centers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No rescue centers yet. Create one to get started.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'City', 'Phone', 'Services', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < centers.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{c.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{c.city}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{c.phone}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{c.services}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{c.currentAnimals}/{c.totalCapacity}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: statusBg[c.verificationStatus] || '#f1f5f9', color: statusColor[c.verificationStatus] || '#475569' }}>{c.verificationStatus}</span>
                  </td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: '6px' }}>
                    {c.verificationStatus === 'PENDING' && (
                      <button onClick={() => handleVerify(c.id)}
                        style={{ fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}>Verify</button>
                    )}
                    <button onClick={() => openEdit(c)}
                      style={{ fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(c.id, c.name)}
                      style={{ fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{editId ? '✏️ Edit Center' : '🏥 Add New Center'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{editId ? 'Update rescue center information' : 'Fill in the details to add a new rescue center'}</p>
              </div>
              <button onClick={closeModal}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Center Name *</label>
                  <input name="name" value={form.name || ''} onChange={handleChange} placeholder="e.g. Bangalore Dog Shelter" style={inputStyle('name')} />
                  {errors.name && <p style={errStyle}>{errors.name}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Registration Type</label>
                  <select name="registrationType" value={form.registrationType || 'NGO'} onChange={handleChange} style={inputStyle('registrationType')}>
                    <option value="GOVERNMENT">Government</option>
                    <option value="NGO">NGO</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Describe the rescue center..." rows={2}
                  style={{ ...inputStyle('description'), resize: 'vertical', fontFamily: 'inherit' }} />
                {errors.description && <p style={errStyle}>{errors.description}</p>}
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="e.g. +91 9876543210" style={inputStyle('phone')} />
                  {errors.phone && <p style={errStyle}>{errors.phone}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input name="email" value={form.email || ''} onChange={handleChange} placeholder="e.g. info@shelter.com" style={inputStyle('email')} />
                  {errors.email && <p style={errStyle}>{errors.email}</p>}
                </div>
              </div>

              {/* Website & Opening Hours — Opening Hours only */}
              <div>
                <label style={labelStyle}>Opening Hours</label>
                <input name="openingHours" value={form.openingHours || ''} onChange={handleChange} placeholder="e.g. Mon-Fri: 9AM-6PM" style={inputStyle('openingHours')} />
              </div>

              {/* Address */}
              <div>
                <label style={labelStyle}>Address *</label>
                <input name="address" value={form.address || ''} onChange={handleChange} placeholder="e.g. 123 Main Street" style={inputStyle('address')} />
                {errors.address && <p style={errStyle}>{errors.address}</p>}
              </div>

              {/* Location — City & State only */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input name="city" value={form.city || ''} onChange={handleChange} placeholder="e.g. Bangalore" style={inputStyle('city')} />
                  {errors.city && <p style={errStyle}>{errors.city}</p>}
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input name="state" value={form.state || ''} onChange={handleChange} placeholder="e.g. Karnataka" style={inputStyle('state')} />
                </div>
              </div>

              {/* Capacity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Total Capacity</label>
                  <input name="totalCapacity" type="number" value={form.totalCapacity || ''} onChange={handleChange} placeholder="e.g. 100" style={inputStyle('totalCapacity')} />
                </div>
                <div>
                  <label style={labelStyle}>Current Animals</label>
                  <input name="currentAnimals" type="number" value={form.currentAnimals || ''} onChange={handleChange} placeholder="e.g. 45" style={inputStyle('currentAnimals')} />
                </div>
              </div>

              {/* Services & Specializations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Services *</label>
                  <input name="services" value={form.services || ''} onChange={handleChange} placeholder="e.g. Shelter, Medical, Adoption" style={inputStyle('services')} />
                  {errors.services && <p style={errStyle}>{errors.services}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Specializations</label>
                  <input name="specializations" value={form.specializations || ''} onChange={handleChange} placeholder="e.g. Dogs, Cats" style={inputStyle('specializations')} />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={closeModal}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#16a34a', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {editId ? 'Save Changes' : 'Add Center'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRescueCentersPage;
