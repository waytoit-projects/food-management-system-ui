import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Building, ArrowRight, Key, Home, MapPin, Flag, Hash, Phone, Mail, Tag, Star, Image, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../services/userService';
import hotelLogo from '../assets/images/logo.png';

const indianStateCityMap = {
  'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam', 'Tirupati', 'Guntur', 'Kurnool', 'Nellore', 'Srikakulam', 'Anantapur', 'Kakinada', 'Ongole'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Bomdila', 'Tezu', 'Ziro', 'Namsai', 'Roing'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Silchar', 'Tezpur', 'Nagaon', 'Barpeta', 'Bongaigaon', 'Goalpara', 'Golaghat'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Ara', 'Chapra', 'Munger', 'Katihar'],
  'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Bemetara', 'Dhamtari'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Ponda', 'Mapusa', 'Madgaon'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Jamnagar', 'Bhavnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Bhuj'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Karnal', 'Ambala', 'Sonipat', 'Yamunanagar', 'Hisar', 'Rohtak', 'Kurukshetra'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Manali', 'Kullu', 'Mandi', 'Una', 'Hamirpur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Dumka', 'Medininagar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangalore', 'Hubli', 'Belgaum', 'Ballari', 'Dharwad', 'Tumakuru', 'Davangere', 'Udupi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha', 'Kollam', 'Kannur', 'Palakkad', 'Kottayam', 'Malappuram'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Satna', 'Ratlam', 'Rewa', 'Dewas'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
  'Manipur': ['Imphal', 'Thoubal', 'Churachandpur', 'Bishnupur', 'Kakching', 'Ukhrul', 'Senapati'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongpoh', 'Jowai', 'Nongstoin', 'Williamnagar', 'Mawkyrwat'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Saiha', 'Kolasib', 'Serchhip', 'Mamit'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Berhampur', 'Sambalpur', 'Balasore', 'Bhadrak', 'Koraput', 'Baripada'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Sangrur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Sikar', 'Bharatpur', 'Alwar', 'Bhilwara'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Singtam', 'Pakyong'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Nagercoil', 'Thoothukudi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahbubnagar', 'Adilabad', 'Suryapet'],
  'Tripura': ['Agartala', 'Udaipur', 'Kailashahar', 'Dharmanagar', 'Belonia', 'Sonamura'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Noida', 'Ghaziabad', 'Gorakhpur', 'Prayagraj', 'Moradabad'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh', 'Haldwani', 'Kashipur', 'Roorkee', 'Rudrapur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Durgapur', 'Asansol', 'Siliguri', 'Kalyani', 'Bardhaman', 'Bally', 'Kharagpur'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa', 'Kandor'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Rajouri', 'Udhampur'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti', 'Minicoy', 'Agatti'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Yanam', 'Mahe']
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [error, setError] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerHotelId, setRegisterHotelId] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hotelType, setHotelType] = useState('Restaurant');
  const [rating, setRating] = useState(4.5);
  const [isActive, setIsActive] = useState(true);
  const [hotellogo, setHotellogo] = useState('');
  const [hotelImg1, setHotelImg1] = useState('');
  const [hotelImg2, setHotelImg2] = useState('');
  const [staffCount, setStaffCount] = useState(15);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  
  // Registration Step Management
  const [regStep, setRegStep] = useState(1); // 1: Hotel, 2: User
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUserPhone, setRegUserPhone] = useState('');
  const [regUserEmail, setRegUserEmail] = useState('');
  const [regUserImage, setRegUserImage] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !hotelId) {
      setError('Please fill in all fields.');
      return;
    }

    const result = await login(username, password, hotelId);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const resetRegisterForm = () => {
    setRegisterHotelId('');
    setHotelName('');
    setHotelAddress('');
    setCity('');
    setStateValue('');
    setPincode('');
    setPhone('');
    setEmail('');
    setHotelType('Restaurant');
    setRating(4.5);
    setIsActive(true);
    setHotellogo('');
    setHotelImg1('');
    setHotelImg2('');
    setStaffCount(15);
  };

  const cities = stateValue ? indianStateCityMap[stateValue] || [] : [];

  const handleStateChange = (e) => {
    setStateValue(e.target.value);
    setCity('');
  };

  const handleRegisterHotel = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    console.log('Register form submitted');

    if (!registerHotelId || !hotelName || !hotelAddress || !stateValue || !city || !pincode || !phone || !email) {
      setRegisterError('Please fill in all required fields.');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setRegisterError('Pincode must be a valid 6-digit number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setRegisterError('Phone must be a valid 10-digit number.');
      return;
    }

    setRegisterLoading(true);

    try {
      const payload = {
        hotelId: registerHotelId,
        hotelName,
        hotelAddress,
        city,
        state: stateValue,
        pincode,
        phone,
        email,
        hotelType,
        rating: Number(rating),
        isActive,
        hotellogo,
        hotelImg1,
        hotelImg2,
        staffCount: Number(staffCount)
      };

      console.log('Sending payload:', payload);

      const res = await fetch('/api/createHotel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        setRegisterError(data.message || `Server error: ${res.status}`);
        return;
      }

      if (!data.success) {
        setRegisterError(data.message || 'Failed to register hotel.');
        return;
      }

      setRegisterSuccess(data.message || 'Hotel created successfully! Now create your admin user.');
      setRegStep(2); // Move to user creation step
      
      // Pre-fill user data with hotel info if needed
      setRegUserPhone(phone);
      setRegUserEmail(email);
    } catch (err) {
      console.error('Error:', err);
      setRegisterError(err.message || 'Unable to connect to server. Check if backend is running on http://localhost:8080');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCreateFirstUser = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!regUsername || !regPassword || !regFullName) {
      setRegisterError('Please fill in username, password and full name.');
      return;
    }

    setRegisterLoading(true);

    try {
      const userData = {
        username: regUsername,
        password: regPassword,
        fullName: regFullName,
        phone: regUserPhone,
        email: regUserEmail,
        hotelName: hotelName,
        hotelId: registerHotelId,
        hotelType: hotelType,
        userImage: regUserImage,
        userType: 'ADMIN',
        createdBy: 'self-register'
      };

      const result = await createUser(userData);

      if (result.success) {
        setRegisterSuccess('Admin user created successfully! You can now log in.');
        setTimeout(() => {
          closeRegisterModal();
          // Auto-fill login fields
          setUsername(regUsername);
          setHotelId(registerHotelId);
        }, 2000);
      } else {
        setRegisterError(result.message || 'Failed to create admin user.');
      }
    } catch (err) {
      setRegisterError('Error creating user: ' + err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterError('');
    setRegisterSuccess('');
    setRegStep(1);
    resetRegisterForm();
    setRegUsername('');
    setRegPassword('');
    setRegFullName('');
    setRegUserPhone('');
    setRegUserEmail('');
    setRegUserImage('');
  };

  return (
    <>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: '1rem',
          margin: '1rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            className="animate-fade-in delay-100"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <img src={hotelLogo} alt="Hotel Logo" style={{ height: '80px', objectFit: 'contain' }} />
          </div>
          <h1 className="animate-fade-in delay-100" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Grand Palace
          </h1>
          <p className="animate-fade-in delay-100" style={{ color: 'var(--text-muted)' }}>
            Hotel Management System
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div className="input-wrapper animate-fade-in delay-200" style={{ position: 'relative' }}>
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-wrapper animate-fade-in delay-200" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-wrapper animate-fade-in delay-200" style={{ position: 'relative' }}>
            <Building className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Hotel ID"
              className="input-field"
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div 
            className="animate-fade-in delay-200"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '0.875rem'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} disabled={loading} />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(true);
                setRegisterError('');
                setRegisterSuccess('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: 0,
                fontSize: '0.875rem'
              }}
              disabled={loading}
            >
              Register hotel
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-primary animate-fade-in delay-300"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#a0aec0', margin: 0, fontWeight: 600 }}>
            Powered by <span style={{ color: 'var(--primary)', fontWeight: 800 }}>WayToIT</span>
          </p>
        </div>
      </div>

      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', background: 'rgba(8, 10, 20, 0.95)', borderRadius: '1.5rem', overflow: 'hidden', maxHeight: '92vh', boxShadow: '0 40px 90px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            <div style={{ position: 'sticky', top: 0, left: 0, right: 0, background: 'rgba(8, 10, 20, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 2, padding: '1.5rem 1.75rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>Register Hotel</h2>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create a hotel using the backend service.</p>
                </div>
                <button type="button" onClick={closeRegisterModal} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '999px', width: '2.75rem', height: '2.75rem', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 'calc(92vh - 120px)', padding: '1rem 1.75rem 1.75rem' }}>
              {regStep === 1 ? (
                <form onSubmit={handleRegisterHotel} style={{ display: 'grid', gap: '1rem' }}>
                  <div className="input-wrapper">
                    <Key className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Hotel ID"
                      className="input-field"
                      value={registerHotelId}
                      onChange={(e) => setRegisterHotelId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <Building className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Hotel Name"
                      className="input-field"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-wrapper">
                      <Flag className="input-icon" size={18} />
                      <select
                        value={stateValue}
                        onChange={handleStateChange}
                        className="input-field select-field"
                        required
                      >
                        <option value="">Select State</option>
                        {Object.keys(indianStateCityMap).map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={18} />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-field select-field"
                        required
                        disabled={!stateValue}
                      >
                        <option value="">Select City</option>
                        {cities.map((cityName) => (
                          <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="input-wrapper">
                    <Home className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Hotel Address"
                      className="input-field"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={18} />
                      <input
                        type="text"
                        placeholder="Pincode"
                        className="input-field"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="input-field"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      placeholder="Email"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-wrapper">
                      <Tag className="input-icon" size={18} />
                      <input
                        type="text"
                        placeholder="Hotel Type"
                        className="input-field"
                        value={hotelType}
                        onChange={(e) => setHotelType(e.target.value)}
                      />
                    </div>
                    <div className="input-wrapper">
                      <Star className="input-icon" size={18} />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Rating"
                        className="input-field"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-wrapper">
                      {hotellogo ? (
                        <img
                          src={hotellogo}
                          alt="Logo Preview"
                          className="input-icon-image"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Image className="input-icon" size={18} />
                      )}
                      <input
                        type="url"
                        placeholder="Hotel Logo URL"
                        className="input-field"
                        value={hotellogo}
                        onChange={(e) => setHotellogo(e.target.value)}
                      />
                    </div>
                    <div className="input-wrapper">
                      {hotelImg1 ? (
                        <img
                          src={hotelImg1}
                          alt="Preview 1"
                          className="input-icon-image"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Image className="input-icon" size={18} />
                      )}
                      <input
                        type="url"
                        placeholder="Hotel Image 1 URL"
                        className="input-field"
                        value={hotelImg1}
                        onChange={(e) => setHotelImg1(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="input-wrapper">
                    {hotelImg2 ? (
                      <img
                        src={hotelImg2}
                        alt="Preview 2"
                        className="input-icon-image"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Image className="input-icon" size={18} />
                    )}
                    <input
                      type="url"
                      placeholder="Hotel Image 2 URL"
                      className="input-field"
                      value={hotelImg2}
                      onChange={(e) => setHotelImg2(e.target.value)}
                    />
                  </div>
                  <div className="input-wrapper">
                    <Users className="input-icon" size={18} />
                    <input
                      type="number"
                      placeholder="Staff Count"
                      className="input-field"
                      value={staffCount}
                      onChange={(e) => setStaffCount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    Active hotel
                  </label>

                  {registerError && (
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', borderRadius: '0.75rem', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                      {registerError}
                    </div>
                  )}

                  {registerSuccess && (
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#86efac', borderRadius: '0.75rem', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                      {registerSuccess}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={closeRegisterModal}
                      style={{ padding: '0.95rem 1.25rem', borderRadius: '0.85rem', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={registerLoading}
                      style={{ padding: '0.95rem 1.25rem', borderRadius: '0.85rem', border: 'none', background: 'var(--primary)', color: '#fff', cursor: registerLoading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)' }}
                    >
                      {registerLoading ? 'Registering...' : 'Next: Create Admin'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateFirstUser} style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 117, 255, 0.05)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(0, 117, 255, 0.1)', marginBottom: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Creating Admin for:</p>
                    <h4 style={{ margin: '0.25rem 0 0', color: 'white' }}>{hotelName} (ID: {registerHotelId})</h4>
                  </div>

                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Admin Username *"
                      className="input-field"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      placeholder="Admin Password *"
                      className="input-field"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      className="input-field"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="input-field"
                        value={regUserPhone}
                        onChange={(e) => setRegUserPhone(e.target.value)}
                      />
                    </div>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        value={regUserEmail}
                        onChange={(e) => setRegUserEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="input-wrapper">
                    <Image className="input-icon" size={18} />
                    <input
                      type="url"
                      placeholder="Profile Image URL"
                      className="input-field"
                      value={regUserImage}
                      onChange={(e) => setRegUserImage(e.target.value)}
                    />
                  </div>

                  {registerError && (
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', borderRadius: '0.75rem', fontSize: '0.92rem' }}>
                      {registerError}
                    </div>
                  )}

                  {registerSuccess && (
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#86efac', borderRadius: '0.75rem', fontSize: '0.92rem' }}>
                      {registerSuccess}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      style={{ padding: '0.95rem 1.25rem', borderRadius: '0.85rem', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={registerLoading}
                      style={{ padding: '0.95rem 1.25rem', borderRadius: '0.85rem', border: 'none', background: 'var(--primary)', color: '#fff', cursor: registerLoading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)', flex: 1 }}
                    >
                      {registerLoading ? 'Creating...' : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
