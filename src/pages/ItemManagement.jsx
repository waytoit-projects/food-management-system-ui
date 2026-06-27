import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { createFoodItem, updateFoodItem, deleteFoodItem } from '../services/foodService';
import { getMenuItems } from '../services/menuService';
import { Save, RotateCcw, CheckCircle, AlertCircle, List, PlusCircle, Edit3, Trash2, Search, Download, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, X, AlertTriangle } from 'lucide-react';

const ItemManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('list');
  const [foodItems, setFoodItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: 'itemName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const initialFormState = {
    itemCode: '',
    itemName: '',
    mainCategory: 'Food',
    subCategory: '',
    brandName: '',
    itemType: 'Fresh',
    isVeg: true,
    size: 'Regular',
    unit: 'Plate',
    costPrice: '',
    sellingPrice: '',
    ngstPercentage: 2.5,
    ngstAmount: '',
    sgstPercentage: 2.5,
    sgstAmount: '',
    gstPercentage: 5,
    gstAmount: '',
    totalAmount: '',
    hsnCode: '',
    stockQuantity: 0,
    minStockAlert: 0,
    preparationTime: '',
    spicyLevel: 'Medium',
    description: '',
    imageUrl: '',
    isAvailable: true,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchFoodItems();
    }
  }, [activeTab]);

  const fetchFoodItems = async () => {
    setListLoading(true);
    try {
      const data = await getMenuItems();
      if (Array.isArray(data)) setFoodItems(data);
      else if (data.data && Array.isArray(data.data)) setFoodItems(data.data);
      else setFoodItems([]);
    } catch (err) {
      console.error("Failed to load food items", err);
    } finally {
      setListLoading(false);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    // Selling Price
    const sellingPrice = parseFloat(data.sellingPrice);
    if (data.sellingPrice === '' || isNaN(sellingPrice)) {
      newErrors.sellingPrice = 'Selling Price is required';
    } else if (sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling Price must be greater than 0';
    }
    
    // CSGT %
    const ngstPercentage = parseFloat(data.ngstPercentage);
    if (data.ngstPercentage === '' || isNaN(ngstPercentage)) {
      newErrors.ngstPercentage = 'CSGT % is required';
    } else if (ngstPercentage < 0 || ngstPercentage > 100) {
      newErrors.ngstPercentage = 'CSGT % must be between 0 and 100';
    }
    
    // SGST %
    const sgstPercentage = parseFloat(data.sgstPercentage);
    if (data.sgstPercentage === '' || isNaN(sgstPercentage)) {
      newErrors.sgstPercentage = 'SGST % is required';
    } else if (sgstPercentage < 0 || sgstPercentage > 100) {
      newErrors.sgstPercentage = 'SGST % must be between 0 and 100';
    }
    
    // Total GST %
    if (!newErrors.ngstPercentage && !newErrors.sgstPercentage) {
      const totalGst = ngstPercentage + sgstPercentage;
      if (totalGst > 100) {
        newErrors.gstPercentage = 'Total GST % must not exceed 100';
      }
    }
    
    // Cost Price
    const costPrice = parseFloat(data.costPrice);
    if (data.costPrice !== '' && !isNaN(costPrice) && costPrice < 0) {
      newErrors.costPrice = 'Cost Price cannot be negative';
    }
    
    // Stock Quantity
    const stockQuantity = parseFloat(data.stockQuantity);
    if (data.stockQuantity !== '' && !isNaN(stockQuantity) && stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock Quantity cannot be negative';
    }
    
    return newErrors;
  };

  const handleFormChange = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const setter = isEdit ? setEditFormData : setFormData;
    const errorSetter = isEdit ? setEditErrors : setErrors;
    
    setter(prev => {
      const rawValue = type === 'checkbox' ? checked : value;
      const newData = {
        ...prev,
        [name]: rawValue
      };

      // Perform calculations based on the updated values
      const price = parseFloat(name === 'sellingPrice' ? rawValue : prev.sellingPrice);
      const ngstPercent = parseFloat(name === 'ngstPercentage' ? rawValue : prev.ngstPercentage);
      const sgstPercent = parseFloat(name === 'sgstPercentage' ? rawValue : prev.sgstPercentage);

      if (!isNaN(price) && price >= 0) {
        const nPercent = !isNaN(ngstPercent) ? ngstPercent : 0;
        const sPercent = !isNaN(sgstPercent) ? sgstPercent : 0;

        const ngstAmount = (price * nPercent) / 100;
        const sgstAmount = (price * sPercent) / 100;
        const totalGstPercent = nPercent + sPercent;
        const totalGstAmount = ngstAmount + sgstAmount;
        const totalAmount = price + totalGstAmount;

        newData.ngstAmount = isNaN(ngstAmount) ? '' : ngstAmount.toFixed(2);
        newData.sgstAmount = isNaN(sgstAmount) ? '' : sgstAmount.toFixed(2);
        newData.gstPercentage = isNaN(totalGstPercent) ? '' : totalGstPercent;
        newData.gstAmount = isNaN(totalGstAmount) ? '' : totalGstAmount.toFixed(2);
        newData.totalAmount = isNaN(totalAmount) ? '' : totalAmount.toFixed(2);
      } else {
        newData.ngstAmount = '';
        newData.sgstAmount = '';
        newData.gstPercentage = '';
        newData.gstAmount = '';
        newData.totalAmount = '';
      }

      // Run validation and update error state
      const validationErrors = validateForm(newData);
      errorSetter(validationErrors);

      return newData;
    });
  };

  // Build a clean numeric payload for the backend.
  // totalAmount = sellingPrice + gstAmount (NOT just sellingPrice).
  const buildItemPayload = (data) => {
    const sellingPrice   = parseFloat(data.sellingPrice)   || 0;
    const ngstAmount     = parseFloat(data.ngstAmount)     || 0;
    const sgstAmount     = parseFloat(data.sgstAmount)     || 0;
    const gstAmount      = parseFloat(data.gstAmount)      || (ngstAmount + sgstAmount);
    const totalAmount    = sellingPrice + gstAmount;         // selling + GST

    return {
      ...data,
      costPrice:        parseFloat(data.costPrice)        || 0,
      sellingPrice,
      ngstPercentage:   parseFloat(data.ngstPercentage)   || 0,
      ngstAmount,
      sgstPercentage:   parseFloat(data.sgstPercentage)   || 0,
      sgstAmount,
      gstPercentage:    parseFloat(data.gstPercentage)    || 0,
      gstAmount,
      totalAmount,                                          // sellingPrice + gstAmount
      stockQuantity:    parseFloat(data.stockQuantity)    || 0,
      minStockAlert:    parseFloat(data.minStockAlert)    || 0,
      preparationTime:  parseFloat(data.preparationTime)  || 0,
    };
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    
    const totalGst = parseFloat(item.gstPercentage || 0);
    const ngstPercent = item.ngstPercentage !== undefined && item.ngstPercentage !== null ? item.ngstPercentage : (totalGst / 2);
    const sgstPercent = item.sgstPercentage !== undefined && item.sgstPercentage !== null ? item.sgstPercentage : (totalGst / 2);
    const price = parseFloat(item.sellingPrice || 0);

    const ngstAmount = item.ngstAmount !== undefined && item.ngstAmount !== null ? item.ngstAmount : ((price * ngstPercent) / 100).toFixed(2);
    const sgstAmount = item.sgstAmount !== undefined && item.sgstAmount !== null ? item.sgstAmount : ((price * sgstPercent) / 100).toFixed(2);
    const totalGstAmount = item.gstAmount !== undefined && item.gstAmount !== null ? item.gstAmount : (parseFloat(ngstAmount) + parseFloat(sgstAmount)).toFixed(2);
    const totalAmount = item.totalAmount !== undefined && item.totalAmount !== null ? item.totalAmount : (price + parseFloat(totalGstAmount)).toFixed(2);

    const initialEditData = {
      ...item,
      mainCategory: item.category?.mainCategory || item.mainCategory,
      subCategory: item.category?.subCategory || item.subCategory,
      ngstPercentage: ngstPercent,
      ngstAmount: ngstAmount,
      sgstPercentage: sgstPercent,
      sgstAmount: sgstAmount,
      gstPercentage: totalGst,
      gstAmount: totalGstAmount,
      totalAmount: totalAmount
    };

    setEditFormData(initialEditData);
    setEditErrors(validateForm(initialEditData));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildItemPayload(editFormData);
      const response = await updateFoodItem(payload);
      if (response.success) {
        setMessage({ type: 'success', text: 'Food item updated successfully!' });
        fetchFoodItems();
        closeEditModal();
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update item' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteFoodItem({ itemCode: selectedItem.itemCode });
      if (response.success) {
        setMessage({ type: 'success', text: 'Item deleted successfully!' });
        fetchFoodItems();
        closeDeleteModal();
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete item' });
    } finally {
      setLoading(false);
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

  const exportToCSV = () => {
    const headers = ['SL No', 'Code', 'Name', 'Main Category', 'Sub Category', 'Brand', 'Type', 'Veg', 'Cost Price', 'Selling Price', 'CSGT %', 'CSGT Amount', 'SGST %', 'SGST Amount', 'Total GST %', 'Total GST Amount', 'Total Amount', 'HSN Code', 'Stock', 'Min Alert', 'Prep Time', 'Spicy Level', 'Available', 'Active', 'Description'];
    const csvContent = [
      headers.join(','),
      ...sortedAndFilteredItems.map((item, index) => [
        index + 1,
        item.itemCode,
        `"${item.itemName || ''}"`,
        item.mainCategory,
        item.subCategory,
        item.brandName || '',
        item.itemType,
        item.isVeg ? 'Veg' : 'Non-Veg',
        Number(item.costPrice || 0).toFixed(2),
        Number(item.sellingPrice || 0).toFixed(2),
        Number(item.ngstPercentage || 0).toFixed(2),
        Number(item.ngstAmount || 0).toFixed(2),
        Number(item.sgstPercentage || 0).toFixed(2),
        Number(item.sgstAmount || 0).toFixed(2),
        Number(item.gstPercentage || 0).toFixed(2),
        Number(item.gstAmount || 0).toFixed(2),
        Number(item.totalAmount || 0).toFixed(2),
        item.hsnCode || '',
        item.stockQuantity,
        item.minStockAlert,
        item.preparationTime,
        item.spicyLevel || '',
        item.isAvailable ? 'Yes' : 'No',
        item.isActive ? 'Active' : 'Inactive',
        `"${(item.description || '').replace(/"/g, "'")}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food_items_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const sortedAndFilteredItems = useMemo(() => {
    let items = foodItems.filter(item => 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [foodItems, searchTerm, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildItemPayload(formData);
      const response = await createFoodItem(payload);
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setFormData(initialFormState);
        setTimeout(() => setActiveTab('list'), 1500);
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding item' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const isAddFormInvalid = 
    !formData.itemCode ||
    !formData.itemName ||
    formData.sellingPrice === '' ||
    formData.ngstPercentage === '' ||
    formData.sgstPercentage === '' ||
    Object.keys(errors).length > 0;

  const isEditFormInvalid = 
    !editFormData.itemCode ||
    !editFormData.itemName ||
    editFormData.sellingPrice === '' ||
    editFormData.ngstPercentage === '' ||
    editFormData.sgstPercentage === '' ||
    Object.keys(editErrors).length > 0;

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Notification */}
      {message.text && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '1rem', 
          backgroundColor: message.type === 'success' ? '#059669' : '#dc2626',
          color: 'white', fontWeight: 600, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontSize: '0.9rem' }}>{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', 
              borderRadius: '50%', padding: '0.2rem', cursor: 'pointer', display: 'flex',
              marginLeft: '0.5rem'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
      <Header />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Item Management</h2>
        
        <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={() => setActiveTab('list')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'list' ? 'white' : '#a0aec0',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <List size={18} /> Food Item List
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              backgroundColor: activeTab === 'add' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'add' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <PlusCircle size={18} /> Add New Item
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {activeTab === 'add' ? (
          <div className="glass-panel" style={{ 
            padding: '2.5rem', borderRadius: '2rem'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Identity & Categorization */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--primary)', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <PlusCircle size={18} />
                  </div>
                  Basic Identity
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Item Code *</label>
                    <input type="text" name="itemCode" value={formData.itemCode} onChange={(e) => handleFormChange(e, false)} placeholder="e.g. NAF010" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', outlineColor: 'var(--primary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Food Item Name *</label>
                    <input type="text" name="itemName" value={formData.itemName} onChange={(e) => handleFormChange(e, false)} placeholder="e.g. Paneer Butter Masala" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', outlineColor: 'var(--primary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Main Category *</label>
                    <select name="mainCategory" value={formData.mainCategory} onChange={(e) => handleFormChange(e, false)} style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                      <option value="Food" style={{ backgroundColor: '#1a1f37' }}>Food</option>
                      <option value="Dishes" style={{ backgroundColor: '#1a1f37' }}>Dishes</option>
                      <option value="Curry" style={{ backgroundColor: '#1a1f37' }}>Curry</option>
                      <option value="Burger" style={{ backgroundColor: '#1a1f37' }}>Burger</option>
                      <option value="Snacks" style={{ backgroundColor: '#1a1f37' }}>Snacks</option>
                      <option value="Drink & Ice" style={{ backgroundColor: '#1a1f37' }}>Drink & Ice</option>
                      <option value="Desserts" style={{ backgroundColor: '#1a1f37' }}>Desserts</option>
                      <option value="Beverages" style={{ backgroundColor: '#1a1f37' }}>Beverages</option>
                      <option value="Biryani" style={{ backgroundColor: '#1a1f37' }}>Biryani</option>
                      <option value="Starters" style={{ backgroundColor: '#1a1f37' }}>Starters</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Sub Category</label>
                    <input type="text" name="subCategory" value={formData.subCategory} onChange={(e) => handleFormChange(e, false)} placeholder="e.g. Main Course" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Brand Name</label>
                    <input type="text" name="brandName" value={formData.brandName} onChange={(e) => handleFormChange(e, false)} placeholder="e.g. Kitchen Pride" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Item Type</label>
                    <select name="itemType" value={formData.itemType} onChange={(e) => handleFormChange(e, false)} style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                      <option value="Fresh" style={{ backgroundColor: '#1a1f37' }}>Fresh</option>
                      <option value="Frozen" style={{ backgroundColor: '#1a1f37' }}>Frozen</option>
                      <option value="Packaged" style={{ backgroundColor: '#1a1f37' }}>Packaged</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Food Preference</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem', borderRadius: '1.25rem', border: '1px solid', borderColor: formData.isVeg ? '#16a34a' : 'rgba(255, 255, 255, 0.1)', backgroundColor: formData.isVeg ? 'rgba(22, 163, 74, 0.1)' : 'rgba(0, 0, 0, 0.2)', transition: 'all 0.2s' }}>
                        <input type="radio" name="isVeg_add" checked={formData.isVeg} onChange={() => setFormData(p => ({...p, isVeg: true}))} style={{ accentColor: '#16a34a' }} /> 
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: formData.isVeg ? '#16a34a' : '#a0aec0' }}>Veg</span>
                      </label>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem', borderRadius: '1.25rem', border: '1px solid', borderColor: !formData.isVeg ? '#ef4444' : 'rgba(255, 255, 255, 0.1)', backgroundColor: !formData.isVeg ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.2)', transition: 'all 0.2s' }}>
                        <input type="radio" name="isVeg_add" checked={!formData.isVeg} onChange={() => setFormData(p => ({...p, isVeg: false}))} style={{ accentColor: '#ef4444' }} /> 
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: !formData.isVeg ? '#ef4444' : '#a0aec0' }}>Non-Veg</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Financials & Stock */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#10b981', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Download size={18} />
                  </div>
                  Financials & Stock
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.75rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Cost Price (₹)</label>
                    <input type="number" name="costPrice" value={formData.costPrice} onChange={(e) => handleFormChange(e, false)} placeholder="0.00" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.costPrice ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {errors.costPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.costPrice}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Selling Price *</label>
                    <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={(e) => handleFormChange(e, false)} placeholder="0.00" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.sellingPrice ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', outlineColor: 'var(--primary)' }} />
                    {errors.sellingPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.sellingPrice}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>CSGT Percentage (%) *</label>
                    <input type="number" name="ngstPercentage" value={formData.ngstPercentage} onChange={(e) => handleFormChange(e, false)} placeholder="0.00" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.ngstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {errors.ngstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.ngstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>SGST Percentage (%) *</label>
                    <input type="number" name="sgstPercentage" value={formData.sgstPercentage} onChange={(e) => handleFormChange(e, false)} placeholder="0.00" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.sgstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {errors.sgstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.sgstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#64748b' }}>CSGT Amount (₹)</label>
                    <input type="text" name="ngstAmount" value={formData.ngstAmount} readOnly style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#64748b' }}>SGST Amount (₹)</label>
                    <input type="text" name="sgstAmount" value={formData.sgstAmount} readOnly style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#64748b' }}>Total GST Percentage (%)</label>
                    <input type="text" name="gstPercentage" value={formData.gstPercentage} readOnly style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.gstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.05)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                    {errors.gstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.gstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#64748b' }}>Total GST Amount (₹)</label>
                    <input type="text" name="gstAmount" value={formData.gstAmount} readOnly style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#64748b' }}>Total Amount (₹)</label>
                    <input type="text" name="totalAmount" value={formData.totalAmount} readOnly style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(255, 255, 255, 0.03)', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Initial Stock</label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={(e) => handleFormChange(e, false)} style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${errors.stockQuantity ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {errors.stockQuantity && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.stockQuantity}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Alert at Stock</label>
                    <input type="number" name="minStockAlert" value={formData.minStockAlert} onChange={(e) => handleFormChange(e, false)} style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                  </div>
                </div>
              </div>

              {/* Section 3: Detailed Specifications */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#6366f1', width: '32px', height: '32px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Search size={18} />
                  </div>
                  Detailed Specs
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Portion & Unit</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" name="size" value={formData.size} onChange={(e) => handleFormChange(e, false)} placeholder="Regular" style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                      <input type="text" name="unit" value={formData.unit} onChange={(e) => handleFormChange(e, false)} placeholder="Plate" style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Logistics</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input type="number" name="preparationTime" value={formData.preparationTime} onChange={(e) => handleFormChange(e, false)} placeholder="Mins" style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                      </div>
                      <select name="spicyLevel" value={formData.spicyLevel} onChange={(e) => handleFormChange(e, false)} style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                        <option value="Low" style={{ backgroundColor: '#1a1f37' }}>Low</option>
                        <option value="Medium" style={{ backgroundColor: '#1a1f37' }}>Medium</option>
                        <option value="High" style={{ backgroundColor: '#1a1f37' }}>High</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Visuals (Image URL)</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" name="imageUrl" value={formData.imageUrl} onChange={(e) => handleFormChange(e, false)} placeholder="https://example.com/food.jpg" style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                      {formData.imageUrl && (
                        <div style={{ width: '48px', height: '48px', borderRadius: '1rem', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                          <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem', color: '#a0aec0' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={(e) => handleFormChange(e, false)} placeholder="Describe the flavors, ingredients..." style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', minHeight: '100px', fontSize: '0.9rem', fontFamily: 'inherit', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2.5rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={loading || isAddFormInvalid} 
                  style={{ 
                    flex: 2, padding: '1.1rem', borderRadius: '1.5rem', 
                    backgroundColor: (loading || isAddFormInvalid) ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary)', 
                    color: (loading || isAddFormInvalid) ? 'rgba(255, 255, 255, 0.3)' : 'white', 
                    border: 'none', fontWeight: 800, fontSize: '0.9rem', 
                    cursor: (loading || isAddFormInvalid) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', 
                    boxShadow: (loading || isAddFormInvalid) ? 'none' : '0 10px 25px rgba(245, 158, 11, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                  }}
                >
                  {loading ? 'Creating Item...' : <><Save size={22} /> Save Food Item</>}
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData(initialFormState)} 
                  style={{ 
                    flex: 1, padding: '1.1rem', borderRadius: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', fontWeight: 700, fontSize: '0.9rem', 
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search code, name..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ 
                    width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', 
                    borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', 
                    outline: 'none', fontSize: '0.875rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={exportToCSV} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.25rem', borderRadius: '2rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Download size={18} /> Export CSV
                </button>
                <button onClick={fetchFoodItems} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Refresh</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.25rem', backgroundColor: 'transparent' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    {[
                      { label: 'SL No', key: null },
                      { label: 'Item Code', key: 'itemCode' },
                      { label: 'Food Item Name', key: 'itemName' },
                      { label: 'Main Category', key: 'mainCategory' },
                      { label: 'Sub Category', key: 'subCategory' },
                      { label: 'Brand Name', key: 'brandName' },
                      { label: 'Item Type', key: 'itemType' },
                      { label: 'Veg/Non-Veg', key: 'isVeg' },
                      { label: 'Portion Size', key: 'size' },
                      { label: 'Unit Type', key: 'unit' },
                      { label: 'Cost Price', key: 'costPrice' },
                      { label: 'Selling Price', key: 'sellingPrice' },
                      { label: 'CSGT %', key: 'ngstPercentage' },
                      { label: 'CSGT Amt', key: 'ngstAmount' },
                      { label: 'SGST %', key: 'sgstPercentage' },
                      { label: 'SGST Amt', key: 'sgstAmount' },
                      { label: 'Total GST %', key: 'gstPercentage' },
                      { label: 'Total GST Amt', key: 'gstAmount' },
                      { label: 'Total Amount', key: 'totalAmount' },
                      { label: 'HSN Code', key: 'hsnCode' },
                      { label: 'Stock', key: 'stockQuantity' },
                      { label: 'Min Alert', key: 'minStockAlert' },
                      { label: 'Prep Time', key: 'preparationTime' },
                      { label: 'Spicy Level', key: 'spicyLevel' },
                      { label: 'Available', key: 'isAvailable' },
                      { label: 'Active Status', key: 'isActive' },
                      { label: 'Date Created', key: 'createdAt' },
                      { label: 'Description', key: 'description' },
                      { label: 'Actions', key: null }
                    ].map((col, idx) => (
                      <th 
                        key={idx} 
                        onClick={() => col.key && requestSort(col.key)}
                        style={{ 
                          padding: '1.25rem 1rem', color: sortConfig.key === col.key ? 'var(--primary)' : '#a0aec0', 
                          fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', cursor: col.key ? 'pointer' : 'default',
                          backgroundColor: sortConfig.key === col.key ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
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
                <tbody>
                  {listLoading ? (
                    <tr><td colSpan="24" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr><td colSpan="24" style={{ padding: '4rem', textAlign: 'center' }}>No items found.</td></tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)', transition: 'all 0.2s', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 700 }}>{indexOfFirstItem + index + 1}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                          <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>{item.itemCode}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: 'white' }}>{item.itemName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{item.mainCategory}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.subCategory}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.brandName || '-'}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.itemType}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800,
                            backgroundColor: item.isVeg ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: item.isVeg ? '#10b981' : '#ef4444'
                          }}>
                            {item.isVeg ? 'VEG' : 'NON-VEG'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.size}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.unit}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 500 }}>₹{Number(item.costPrice || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>₹{Number(item.sellingPrice || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{Number(item.ngstPercentage || 0).toFixed(2)}%</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>₹{Number(item.ngstAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{Number(item.sgstPercentage || 0).toFixed(2)}%</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>₹{Number(item.sgstAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontWeight: 600 }}>{Number(item.gstPercentage || 0).toFixed(2)}%</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>₹{Number(item.gstAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#10b981' }}>₹{Number(item.totalAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.7rem' }}>{item.hsnCode}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontWeight: 700,
                            backgroundColor: item.stockQuantity <= item.minStockAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: item.stockQuantity <= item.minStockAlert ? '#ef4444' : '#10b981'
                          }}>
                            {item.stockQuantity}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#ef4444', fontWeight: 600 }}>{item.minStockAlert}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⏱️ {item.preparationTime}m</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{item.spicyLevel}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: item.isAvailable ? '#10b981' : '#a0aec0', fontWeight: 600 }}>{item.isAvailable ? '✓ Yes' : '✗ No'}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800,
                            backgroundColor: item.isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                            color: item.isActive ? '#3b82f6' : '#a0aec0'
                          }}>
                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                        <td style={{ padding: '1rem', color: '#64748b', fontStyle: 'italic', minWidth: '250px', whiteSpace: 'normal', lineHeight: '1.4' }}>{item.description}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                              onClick={() => openEditModal(item)} 
                              title="Edit" 
                              style={{ 
                                padding: '0.6rem', borderRadius: '0.75rem', 
                                color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', 
                                background: 'rgba(99, 102, 241, 0.1)', cursor: 'pointer', transition: 'all 0.2s' 
                              }}
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(item)} 
                              title="Delete" 
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-secondary">Prev</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: currentPage === i + 1 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-secondary">Next</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100vw - var(--sidebar-width))', height: '100vh', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '950px', maxHeight: '92vh', overflowY: 'auto', 
            borderRadius: '2rem', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '1.75rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--bg-panel)',
              backdropFilter: 'blur(10px)',
              position: 'sticky', top: 0, zIndex: 10, borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '1rem', display: 'flex', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>Edit Food Item</h2>
                  <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: '0.2rem 0 0' }}>Update product details and inventory settings</p>
                </div>
              </div>
              <button onClick={closeEditModal} style={{ border: 'none', background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} style={{ padding: '2.5rem' }}>
              {/* Section 1: Basic Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Item Code <span style={{ color: '#64748b', fontWeight: 400 }}>(Read Only)</span></label>
                    <input type="text" value={editFormData.itemCode} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#64748b', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Food Item Name</label>
                    <input type="text" name="itemName" value={editFormData.itemName} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', outlineColor: 'var(--primary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Main Category</label>
                    <select name="mainCategory" value={editFormData.mainCategory} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                      <option value="Food" style={{ backgroundColor: '#1a1f37' }}>Food</option>
                      <option value="Dishes" style={{ backgroundColor: '#1a1f37' }}>Dishes</option>
                      <option value="Curry" style={{ backgroundColor: '#1a1f37' }}>Curry</option>
                      <option value="Burger" style={{ backgroundColor: '#1a1f37' }}>Burger</option>
                      <option value="Snacks" style={{ backgroundColor: '#1a1f37' }}>Snacks</option>
                      <option value="Drink & Ice" style={{ backgroundColor: '#1a1f37' }}>Drink & Ice</option>
                      <option value="Desserts" style={{ backgroundColor: '#1a1f37' }}>Desserts</option>
                      <option value="Beverages" style={{ backgroundColor: '#1a1f37' }}>Beverages</option>
                      <option value="Biryani" style={{ backgroundColor: '#1a1f37' }}>Biryani</option>
                      <option value="Starters" style={{ backgroundColor: '#1a1f37' }}>Starters</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Sub Category</label>
                    <input type="text" name="subCategory" value={editFormData.subCategory} onChange={(e) => handleFormChange(e, true)} placeholder="e.g. Main Course" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Brand Name</label>
                    <input type="text" name="brandName" value={editFormData.brandName} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Item Type</label>
                    <select name="itemType" value={editFormData.itemType} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                      <option value="Fresh" style={{ backgroundColor: '#1a1f37' }}>Fresh</option>
                      <option value="Frozen" style={{ backgroundColor: '#1a1f37' }}>Frozen</option>
                      <option value="Packaged" style={{ backgroundColor: '#1a1f37' }}>Packaged</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Veg / Non-Veg</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.7rem', borderRadius: '1rem', border: '1px solid', borderColor: editFormData.isVeg ? '#16a34a' : 'rgba(255, 255, 255, 0.1)', backgroundColor: editFormData.isVeg ? 'rgba(22, 163, 74, 0.1)' : 'rgba(0, 0, 0, 0.2)', transition: 'all 0.2s' }}>
                        <input type="radio" name="isVeg_edit" checked={editFormData.isVeg} onChange={() => setEditFormData(p => ({...p, isVeg: true}))} style={{ accentColor: '#16a34a' }} /> 
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: editFormData.isVeg ? '#16a34a' : '#a0aec0' }}>Veg</span>
                      </label>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.7rem', borderRadius: '1rem', border: '1px solid', borderColor: !editFormData.isVeg ? '#ef4444' : 'rgba(255, 255, 255, 0.1)', backgroundColor: !editFormData.isVeg ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.2)', transition: 'all 0.2s' }}>
                        <input type="radio" name="isVeg_edit" checked={!editFormData.isVeg} onChange={() => setEditFormData(p => ({...p, isVeg: false}))} style={{ accentColor: '#ef4444' }} /> 
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: !editFormData.isVeg ? '#ef4444' : '#a0aec0' }}>Non-Veg</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Inventory */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                  Pricing & Inventory
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Cost Price (₹)</label>
                    <input type="number" name="costPrice" value={editFormData.costPrice} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.costPrice ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {editErrors.costPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.costPrice}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Selling Price (₹) *</label>
                    <input type="number" name="sellingPrice" value={editFormData.sellingPrice} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.sellingPrice ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', outlineColor: 'var(--primary)' }} />
                    {editErrors.sellingPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.sellingPrice}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>CSGT Percentage (%) *</label>
                    <input type="number" name="ngstPercentage" value={editFormData.ngstPercentage} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.ngstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {editErrors.ngstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.ngstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>SGST Percentage (%) *</label>
                    <input type="number" name="sgstPercentage" value={editFormData.sgstPercentage} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.sgstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {editErrors.sgstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.sgstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>CSGT Amount (₹)</label>
                    <input type="text" name="ngstAmount" value={editFormData.ngstAmount} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>SGST Amount (₹)</label>
                    <input type="text" name="sgstAmount" value={editFormData.sgstAmount} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Total GST Percentage (%)</label>
                    <input type="text" name="gstPercentage" value={editFormData.gstPercentage} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.gstPercentage ? '#ef4444' : 'rgba(255, 255, 255, 0.05)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                    {editErrors.gstPercentage && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.gstPercentage}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Total GST Amount (₹)</label>
                    <input type="text" name="gstAmount" value={editFormData.gstAmount} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Total Amount (₹)</label>
                    <input type="text" name="totalAmount" value={editFormData.totalAmount} readOnly style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(255, 255, 255, 0.03)', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Stock Quantity</label>
                    <input type="number" name="stockQuantity" value={editFormData.stockQuantity} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: `1px solid ${editErrors.stockQuantity ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`, fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                    {editErrors.stockQuantity && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{editErrors.stockQuantity}</span>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Min Stock Alert</label>
                    <input type="number" name="minStockAlert" value={editFormData.minStockAlert} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>HSN Code</label>
                    <input type="text" name="hsnCode" value={editFormData.hsnCode} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', outlineColor: 'var(--primary)' }} />
                  </div>
                </div>
              </div>

              {/* Section 3: Product Details */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                  Product Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Portion Size</label>
                    <input type="text" name="size" value={editFormData.size} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Unit Type</label>
                    <input type="text" name="unit" value={editFormData.unit} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Prep Time (mins)</label>
                    <input type="number" name="preparationTime" value={editFormData.preparationTime} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Spicy Level</label>
                    <select name="spicyLevel" value={editFormData.spicyLevel} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.9rem' }}>
                      <option value="Low" style={{ backgroundColor: '#1a1f37' }}>Low</option>
                      <option value="Medium" style={{ backgroundColor: '#1a1f37' }}>Medium</option>
                      <option value="High" style={{ backgroundColor: '#1a1f37' }}>High</option>
                      <option value="Extra Spicy" style={{ backgroundColor: '#1a1f37' }}>Extra Spicy</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Image URL</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" name="imageUrl" value={editFormData.imageUrl} onChange={(e) => handleFormChange(e, true)} style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                      <div style={{ width: '45px', height: '45px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <img src={editFormData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#a0aec0' }}>Description</label>
                    <textarea name="description" value={editFormData.description} onChange={(e) => handleFormChange(e, true)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', minHeight: '100px', fontSize: '0.9rem', fontFamily: 'inherit', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', gap: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                paddingTop: '2rem', marginTop: '1rem', position: 'sticky', bottom: '-2.5rem', 
                backgroundColor: 'var(--bg-panel)', paddingBottom: '0.5rem' 
              }}>
                <button 
                  type="submit" 
                  disabled={loading || isEditFormInvalid} 
                  style={{ 
                    flex: 2, padding: '1.1rem', borderRadius: '1.25rem', 
                    backgroundColor: (loading || isEditFormInvalid) ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary)', 
                    color: (loading || isEditFormInvalid) ? 'rgba(255, 255, 255, 0.3)' : 'white', 
                    border: 'none', fontWeight: 800, fontSize: '0.9rem', 
                    cursor: (loading || isEditFormInvalid) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', 
                    boxShadow: (loading || isEditFormInvalid) ? 'none' : '0 10px 20px rgba(245, 158, 11, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                  }}
                >
                  {loading ? 'Updating...' : <><Save size={20} /> Update Changes</>}
                </button>
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  style={{ 
                    flex: 1, padding: '1.1rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', fontWeight: 700, fontSize: '0.9rem', 
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100vw - var(--sidebar-width))', height: '100vh', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '1.5rem', 
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative background element */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%' }}></div>
            
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '64px', height: '64px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.25rem', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Trash2 size={28} />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white', letterSpacing: '-0.02em' }}>Delete Item?</h2>
            <p style={{ color: '#a0aec0', lineHeight: '1.5', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Remove <strong style={{ color: '#ef4444', fontWeight: 800 }}>{selectedItem?.itemName}</strong>?
              <br/>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '0.4rem', marginTop: '0.4rem', display: 'inline-block', color: 'white' }}>
                Code: {selectedItem?.itemCode}
              </span>
              <br/>
              <span style={{ display: 'block', marginTop: '0.75rem', fontWeight: 600, fontSize: '0.85rem', color: '#f87171' }}>This cannot be undone.</span>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button 
                onClick={confirmDelete} 
                disabled={loading}
                style={{ 
                  width: '100%', padding: '0.9rem', borderRadius: '0.875rem', 
                  backgroundColor: '#ef4444', color: 'white', border: 'none', 
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                  fontSize: '0.9rem', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loading ? 'Processing...' : <><Trash2 size={16} /> Confirm Delete</>}
              </button>
              <button 
                onClick={closeDeleteModal} 
                style={{ 
                  width: '100%', padding: '0.9rem', borderRadius: '0.875rem', 
                  border: '1px solid #e2e8f0', backgroundColor: 'white', 
                  color: '#475569', fontWeight: 700, cursor: 'pointer', 
                  transition: 'all 0.2s', fontSize: '0.9rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
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

export default ItemManagement;
