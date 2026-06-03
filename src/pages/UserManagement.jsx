import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { createUser, getUsers, updateUser, deleteUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus, User, Lock, Phone, Mail, Hotel, Image as ImageIcon,
  ShieldCheck, CheckCircle, AlertCircle, Save, RotateCcw, List,
  Search, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown, Edit3, Trash2, X
} from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

  // Create Form State
  const initialFormState = {
    username: '',
    password: '',
    phone: '',
    email: '',
    hotelName: '',
    hotelId: '',
    hotelType: 'Restaurant',
    userImage: '',
    userType: 'ADMIN',
    createdBy: 'system'
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'list') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setListLoading(true);
    try {
      const response = await getUsers({ hotelId: user?.hotelId || "" });
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    } finally {
      setListLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await createUser(formData);
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'User created successfully!' });
        setFormData(initialFormState);
        setTimeout(() => setActiveTab('list'), 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleEditClick = (user) => {
    setEditFormData({
      ...user,
      userType: user.userType || 'ADMIN',
      password: '',
      updatedBy: 'system'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const updateData = {
      username: editFormData.username,
      password: editFormData.password || "",
      phone: editFormData.phone,
      email: editFormData.email,
      hotelName: editFormData.hotelName,
      hotelId: editFormData.hotelId,
      hotelType: editFormData.hotelType,
      userImage: editFormData.userImage,
      userType: editFormData.userType,
      updatedBy: "system"
    };

    try {
      const response = await updateUser(updateData);
      if (response.success) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        fetchUsers();
        setIsEditModalOpen(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setEditLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteUser({
        username: userToDelete.username,
        phone: userToDelete.phone
      });
      if (response.success) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
        setIsDeleteModalOpen(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Deletion failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.hotelId?.includes(searchTerm)
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, sortConfig]);

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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>User Management</h2>

        <div className="glass-panel" style={{ display: 'flex', padding: '0.25rem', borderRadius: '0.875rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent',
              color: 'white',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              opacity: activeTab === 'list' ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <List size={18} /> User List
            </div>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              backgroundColor: activeTab === 'add' ? 'var(--primary)' : 'transparent',
              color: 'white',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              opacity: activeTab === 'add' ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Create User
            </div>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {activeTab === 'list' ? (
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                <input
                  type="text"
                  placeholder="Search code, name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem',
                    borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none', fontSize: '0.875rem', backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'white'
                  }}
                />
              </div>
              <button onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={18} className={listLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    {[
                      { label: 'SL No', key: null },
                      { label: 'User Name', key: 'username' },
                      { label: 'Email', key: 'email' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Hotel Name', key: 'hotelName' },
                      { label: 'Hotel ID', key: 'hotelId' },
                      { label: 'Hotel Type', key: 'hotelType' },
                      { label: 'User Type', key: 'userType' },
                      { label: 'Created At', key: 'insertedTime' },
                      { label: 'Updated At', key: 'updatedTime' },
                      { label: 'Updated By', key: 'updatedBy' },
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
                          {col.key && getSortIcon(col.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ color: 'white' }}>
                  {listLoading ? (
                    <tr><td colSpan="12" style={{ padding: '4rem', textAlign: 'center' }}>Loading users...</td></tr>
                  ) : sortedAndFilteredUsers.length === 0 ? (
                    <tr><td colSpan="12" style={{ padding: '4rem', textAlign: 'center' }}>No users found.</td></tr>
                  ) : (
                    sortedAndFilteredUsers.map((user, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 700 }}>{index + 1}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {user.userImage ? <img src={user.userImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="#a0aec0" />}
                            </div>
                            <span style={{ fontWeight: 700 }}>{user.username}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{user.email}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{user.phone}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{user.hotelName}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ backgroundColor: 'rgba(0, 117, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{user.hotelId}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{user.hotelType}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800,
                            backgroundColor: 'rgba(0, 117, 255, 0.1)', color: 'var(--primary)'
                          }}>
                            {user.userType || 'ADMIN'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.75rem' }}>{user.insertedTime || '-'}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.75rem' }}>{user.updatedTime || '-'}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{user.updatedBy || '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              onClick={() => handleEditClick(user)}
                              style={{
                                padding: '0.6rem', borderRadius: '0.75rem',
                                color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)',
                                background: 'rgba(99, 102, 241, 0.1)', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              style={{
                                padding: '0.6rem', borderRadius: '0.75rem',
                                color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                                background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{
            padding: '2rem', borderRadius: '2rem',
            maxWidth: '1200px', margin: '0 auto'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Account Authentication */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--primary)', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <UserPlus size={18} />
                  </div>
                  Account Identity
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Username *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="john_doe"
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••"
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Email Address *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com"
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210"
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Hotel & Organization */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#10b981', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Hotel size={18} />
                  </div>
                  Hotel & Organization
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Name</label>
                    <input type="text" name="hotelName" value={formData.hotelName} onChange={handleChange} placeholder="ABC Hotel"
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel ID</label>
                    <input type="text" name="hotelId" value={formData.hotelId} onChange={handleChange} placeholder="H1001"
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Type</label>
                    <select name="hotelType" value={formData.hotelType} onChange={handleChange}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}>
                      <option value="Restaurant" style={{ backgroundColor: '#060b26' }}>Restaurant</option>
                      <option value="Cafe" style={{ backgroundColor: '#060b26' }}>Cafe</option>
                      <option value="Hotel" style={{ backgroundColor: '#060b26' }}>Hotel</option>
                      <option value="Fast Food" style={{ backgroundColor: '#060b26' }}>Fast Food</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Profile & Permissions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#6366f1', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <ShieldCheck size={18} />
                  </div>
                  Profile & Permissions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>User Type *</label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <select name="userType" value={formData.userType} onChange={handleChange} required
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}>
                        <option value="ADMIN" style={{ backgroundColor: '#060b26' }}>Administrator</option>
                        <option value="MANAGER" style={{ backgroundColor: '#060b26' }}>Manager</option>
                        <option value="STAFF" style={{ backgroundColor: '#060b26' }}>Staff</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Profile Image URL</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <ImageIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="text" name="userImage" value={formData.userImage} onChange={handleChange} placeholder="https://image-url.com/profile.jpg"
                          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                      <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        <img src={formData.userImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '1rem', borderRadius: '1.25rem', backgroundColor: 'var(--primary)',
                    color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    boxShadow: '0 10px 20px rgba(0, 117, 255, 0.3)'
                  }}
                >
                  {loading ? 'Creating...' : <><Save size={20} /> Create User Account</>}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(initialFormState)}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)', color: '#a0aec0', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>Edit User Details</h2>
                  <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: '0.2rem 0 0' }}>Update account information and permissions</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Account Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} /> Account Details
                  </h4>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Username <span style={{ color: '#718096', fontWeight: 400 }}>(Read Only)</span></label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                      <input type="text" name="username" value={editFormData.username} readOnly style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#718096', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="password" name="password" value={editFormData.password} onChange={handleEditChange} placeholder="••••••••" style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Email Address *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>
                </div>

                {/* Hotel & Profile Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hotel size={18} /> Hotel & Profile
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Name</label>
                      <input type="text" name="hotelName" value={editFormData.hotelName} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel ID</label>
                      <input type="text" name="hotelId" value={editFormData.hotelId} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Hotel Type</label>
                    <select name="hotelType" value={editFormData.hotelType} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}>
                      <option value="Restaurant" style={{ backgroundColor: '#060b26' }}>Restaurant</option>
                      <option value="Cafe" style={{ backgroundColor: '#060b26' }}>Cafe</option>
                      <option value="Hotel" style={{ backgroundColor: '#060b26' }}>Hotel</option>
                      <option value="Fast Food" style={{ backgroundColor: '#060b26' }}>Fast Food</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>User Type *</label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                      <select name="userType" value={editFormData.userType} onChange={handleEditChange} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}>
                        <option value="ADMIN" style={{ backgroundColor: '#060b26' }}>Administrator</option>
                        <option value="MANAGER" style={{ backgroundColor: '#060b26' }}>Manager</option>
                        <option value="STAFF" style={{ backgroundColor: '#060b26' }}>Staff</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Profile Image URL</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <ImageIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input type="text" name="userImage" value={editFormData.userImage} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                      </div>
                      <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        <img src={editFormData.userImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
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
                  disabled={editLoading}
                  style={{
                    flex: 2, padding: '1.1rem', borderRadius: '1.25rem', backgroundColor: 'var(--primary)',
                    color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(0, 117, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                  }}
                >
                  {editLoading ? 'Updating...' : <><Save size={20} /> Update User Account</>}
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

      {/* Delete User Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100vw - var(--sidebar-width))', height: '100vh', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '2rem',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}></div>

            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', width: '64px', height: '64px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', border: '3px solid rgba(255,255,255,0.1)'
            }}>
              <Trash2 size={28} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>Delete User?</h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                {userToDelete?.userImage ? (
                  <img src={userToDelete.userImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#a0aec0" />
                  </div>
                )}
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{userToDelete?.username}</p>
                <p style={{ color: '#a0aec0', fontSize: '0.85rem', margin: '0.25rem 0' }}>{userToDelete?.phone}</p>
              </div>
              <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 1rem', borderRadius: '2rem' }}>This action cannot be undone.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '1rem',
                  backgroundColor: '#ef4444', color: 'white', border: 'none',
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                  fontSize: '0.9rem', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {deleteLoading ? 'Deleting...' : <><Trash2 size={18} /> Confirm Deletion</>}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
