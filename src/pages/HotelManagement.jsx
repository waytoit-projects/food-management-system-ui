import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { getHotels, updateHotel, deleteHotel, createHotel } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import {
  Building2, MapPin, Phone, Mail, Star, Users, Edit3, Trash2, X, Search,
  RefreshCw, ArrowUp, ArrowDown, ArrowUpDown, Plus, Save, RotateCcw,
  CheckCircle, AlertCircle, Globe, Hash, Flag
} from 'lucide-react';

const HotelManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'hotelName', direction: 'asc' });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const initialFormState = {
    hotelId: '',
    hotelName: '',
    hotelAddress: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    hotelType: 'Restaurant',
    rating: 4.5,
    staffCount: 15,
    isActive: true,
    hotellogo: '',
    hotelImg1: '',
    hotelImg2: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    const response = await getHotels();
    if (response.success) {
      setHotels(response.data);
    } else {
      setMessage({ type: 'error', text: response.message });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await createHotel(formData);
    if (response.success) {
      setMessage({ type: 'success', text: 'Hotel created successfully!' });
      setFormData(initialFormState);
      fetchHotels();
      setActiveTab('list');
    } else {
      setMessage({ type: 'error', text: response.message });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await updateHotel(editFormData);
    if (response.success) {
      setMessage({ type: 'success', text: 'Hotel updated successfully!' });
      setIsEditModalOpen(false);
      fetchHotels();
    } else {
      setMessage({ type: 'error', text: response.message });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHotels = useMemo(() => {
    let sortableHotels = [...hotels];
    if (searchTerm) {
      sortableHotels = sortableHotels.filter(h =>
        h.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.hotelId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      sortableHotels.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableHotels;
  }, [hotels, sortConfig, searchTerm]);

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Toast Notification */}
      {message.text && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '1rem',
          backgroundColor: message.type === 'success' ? '#059669' : '#dc2626',
          color: 'white', fontWeight: 600, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontSize: '0.9rem' }}>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Hotel Management</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                <input
                  type="text"
                  placeholder="Search hotel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
              </div>
              <button onClick={fetchHotels} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    {[
                      { label: 'SL', key: null },
                      { label: 'Logo', key: 'hotellogo' },
                      { label: 'Hotel Name', key: 'hotelName' },
                      { label: 'Hotel ID', key: 'hotelId' },
                      { label: 'Type', key: 'hotelType' },
                      { label: 'Img 1', key: 'hotelImg1' },
                      { label: 'Img 2', key: 'hotelImg2' },
                      { label: 'Address', key: 'hotelAddress' },
                      { label: 'City', key: 'city' },
                      { label: 'State', key: 'state' },
                      { label: 'Pincode', key: 'pincode' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Email', key: 'email' },
                      { label: 'Rating', key: 'rating' },
                      { label: 'Staff', key: 'staffCount' },
                      { label: 'Status', key: 'isActive' },
                      { label: 'Created At', key: 'createdAt' },
                      { label: 'Actions', key: null }
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => col.key && requestSort(col.key)}
                        style={{
                          padding: '1.25rem 1rem', color: sortConfig.key === col.key ? 'var(--primary)' : '#a0aec0',
                          fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem',
                          borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: col.key ? 'pointer' : 'default',
                          backgroundColor: sortConfig.key === col.key ? 'rgba(255,255,255,0.05)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {col.label}
                          {col.key && (sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ color: 'white' }}>
                  {loading ? (
                    <tr><td colSpan="18" style={{ padding: '4rem', textAlign: 'center' }}>Loading hotels...</td></tr>
                  ) : sortedHotels.length === 0 ? (
                    <tr><td colSpan="18" style={{ padding: '4rem', textAlign: 'center' }}>No hotels found.</td></tr>
                  ) : (
                    sortedHotels.map((h, i) => (
                      <tr key={h.hotelId} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: '1rem' }}>
                          <div
                            onClick={() => setSelectedImage(h.hotellogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800')}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
                          >
                            <img src={h.hotellogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 700 }}>{h.hotelName}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ backgroundColor: 'rgba(0, 117, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{h.hotelId}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.hotelType}</td>
                        <td style={{ padding: '1rem' }}>
                          <div
                            onClick={() => setSelectedImage(h.hotelImg1 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800')}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
                          >
                            <img src={h.hotelImg1 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Img 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div
                            onClick={() => setSelectedImage(h.hotelImg2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800')}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
                          >
                            <img src={h.hotelImg2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Img 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.hotelAddress}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.city}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.state}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.pincode}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.phone}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{h.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 700 }}>
                            <Star size={14} fill="#fbbf24" /> {h.rating}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 700 }}>{h.staffCount}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800,
                            backgroundColor: h.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: h.isActive ? '#4ade80' : '#f87171'
                          }}>
                            {h.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.75rem' }}>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => { setEditFormData(h); setIsEditModalOpen(true); }} style={{ padding: '0.6rem', borderRadius: '0.75rem', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(99, 102, 241, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }}><Edit3 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Edit Hotel Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100vw - var(--sidebar-width))', height: '100vh', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '900px', maxHeight: '92vh', overflowY: 'auto',
            borderRadius: '2rem', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.75rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-panel)',
              backdropFilter: 'blur(10px)',
              position: 'sticky', top: 0, zIndex: 10, borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '1rem', display: 'flex', boxShadow: '0 4px 12px rgba(0, 117, 255, 0.3)' }}>
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>Edit Hotel Details</h2>
                  <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: '0.2rem 0 0' }}>Update property information and status</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Section 1: Hotel Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} /> Hotel Identity
                  </h4>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Name *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="text" name="hotelName" value={editFormData.hotelName} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel ID <span style={{ color: '#718096', fontWeight: 400 }}>(Read Only)</span></label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                      <input type="text" value={editFormData.hotelId} readOnly style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#718096', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Type</label>
                    <select name="hotelType" value={editFormData.hotelType} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}>
                      <option value="Restaurant" style={{ backgroundColor: '#060b26' }}>Restaurant</option>
                      <option value="Cafe" style={{ backgroundColor: '#060b26' }}>Cafe</option>
                      <option value="Hotel" style={{ backgroundColor: '#060b26' }}>Hotel</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Rating</label>
                      <div style={{ position: 'relative' }}>
                        <Star size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="number" step="0.1" name="rating" value={editFormData.rating} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Staff Count</label>
                      <div style={{ position: 'relative' }}>
                        <Users size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="number" name="staffCount" value={editFormData.staffCount} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location & Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} /> Location & Contact
                  </h4>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Address *</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="text" name="hotelAddress" value={editFormData.hotelAddress} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>City *</label>
                      <input type="text" name="city" value={editFormData.city} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>State *</label>
                      <input type="text" name="state" value={editFormData.state} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Phone *</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Pincode *</label>
                      <div style={{ position: 'relative' }}>
                        <Flag size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="text" name="pincode" value={editFormData.pincode} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Email Address *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Media & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Media & Status
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Logo URL</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
                          <img src={editFormData.hotellogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                        </div>
                        <input type="text" name="hotellogo" value={editFormData.hotellogo || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Image 1 URL</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
                          <img src={editFormData.hotelImg1 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Img1 Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                        </div>
                        <input type="text" name="hotelImg1" value={editFormData.hotelImg1 || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Image 2 URL</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
                          <img src={editFormData.hotelImg2 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt="Img2 Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} />
                        </div>
                        <input type="text" name="hotelImg2" value={editFormData.hotelImg2 || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <input type="checkbox" name="isActive" checked={editFormData.isActive} onChange={handleEditChange} id="edit-active" style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    <label htmlFor="edit-active" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>Hotel is Active and Visible to Customers</label>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', gap: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '2rem', marginTop: '1rem', position: 'sticky', bottom: '-2.5rem',
                background: 'var(--bg-panel)', paddingBottom: '0.5rem', backdropFilter: 'blur(10px)'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '1.1rem', borderRadius: '1.25rem', backgroundColor: 'var(--primary)',
                    color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(0, 117, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                  }}
                >
                  {loading ? 'Updating...' : <><Save size={20} /> Update Hotel Record</>}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    flex: 1, padding: '1.1rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Large Image Preview Modal */}
      {selectedImage && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
          >
            <X size={32} />
          </button>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img
              src={selectedImage}
              alt="Preview"
              style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '1.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'contain', animation: 'scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
              onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;
