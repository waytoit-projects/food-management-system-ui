import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MenuCard from '../components/MenuCard';
import CartPanel from '../components/CartPanel';
import { getMenuItems } from '../services/menuService';
import { Plus, ChevronsRight, ChevronsLeft } from 'lucide-react';

import Slider from '../components/Slider';

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const data = await getMenuItems();
      
      // Handle different possible backend response structures
      if (Array.isArray(data)) {
        setMenuItems(data);
      } else if (data.data && Array.isArray(data.data)) {
        setMenuItems(data.data);
      } else if (data.items && Array.isArray(data.items)) {
        setMenuItems(data.items);
      } else {
        setMenuItems([]); 
      }
    } catch (err) {
      console.error("Failed to load menu items", err);
      // Fallback dummy data if backend is not reachable to ensure UI still works for demo
      setMenuItems([
        { id: 1, itemName: 'Fish Burger', description: 'Fresh catch of the day with special tartar sauce.', sellingPrice: 5.59, isVeg: false, spicyLevel: 'Low', preparationTime: '15 mins', category: { mainCategory: 'Burger' }, gstPercentage: 5, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' },
        { id: 2, itemName: 'Vegan Pizza', description: 'Loaded with fresh bell peppers, olives, and vegan cheese.', sellingPrice: 8.50, isVeg: true, spicyLevel: 'Medium', preparationTime: '20 mins', category: { mainCategory: 'Dishes' }, gstPercentage: 5, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80' },
        { id: 3, itemName: 'Cheese Burger', description: 'Classic double cheese with pure beef patty.', sellingPrice: 6.00, isVeg: false, spicyLevel: 'None', preparationTime: '10 mins', category: { mainCategory: 'Burger' }, gstPercentage: 5, imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=300&q=80' },
        { id: 4, itemName: 'Mango Smoothie', description: 'Thick and creamy fresh mango smoothie.', sellingPrice: 4.00, isVeg: true, spicyLevel: 'None', preparationTime: '5 mins', category: { mainCategory: 'Drink & Ice' }, gstPercentage: 0, imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set();
    menuItems.forEach(item => {
      const cat = item.mainCategory || item.category?.mainCategory;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats), 'Veg', 'Non-Veg'];
  }, [menuItems]);

  // Filter logic based on search and active tab
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const itemMainCategory = item.category?.mainCategory || item.mainCategory || '';
      const itemSubCategory = item.category?.subCategory || item.subCategory || '';
      const matchesSearch = item.itemName?.toLowerCase().includes(searchLower) || 
                            itemMainCategory.toLowerCase().includes(searchLower) ||
                            itemSubCategory.toLowerCase().includes(searchLower);
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        if (activeCategory === 'Veg') matchesCategory = item.isVeg === true;
        else if (activeCategory === 'Non-Veg') matchesCategory = item.isVeg === false || item.isVeg === undefined;
        else matchesCategory = itemMainCategory === activeCategory;
      }
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const handleAdd = (item) => {
    setIsCartOpen(true);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleRemove = (item) => {
    setIsCartOpen(true);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing && existing.qty === 1) {
        return prev.filter(i => i.id !== item.id);
      }
      return prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '0', overflow: 'hidden' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1rem' }}>
        
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          showSlider={showSlider}
          setShowSlider={setShowSlider}
        />

        {/* Promo Slider */}
        {showSlider && <Slider />}

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: activeCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)', 
                  padding: '0.6rem 1.5rem', borderRadius: '2rem', 
                  fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  opacity: activeCategory === cat ? 1 : 0.7
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Menu Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Menu Items</h2>
          <button 
            onClick={() => navigate('/item-management', { state: { activeTab: 'add' } })}
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '1rem', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
            }}
          >
            <Plus size={16} /> Add New Food Item
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>Loading menu items...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>No items found for the selected category or search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', paddingBottom: '2rem' }}>
            {filteredItems.map(item => {
              const cartItem = cart.find(i => i.id === item.id);
              return (
                <MenuCard 
                  key={item.id} 
                  item={item} 
                  cartQty={cartItem ? cartItem.qty : 0} 
                  onAdd={handleAdd} 
                  onRemove={handleRemove} 
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar (Cart) */}
      <div style={{ 
        position: 'sticky', 
        top: '0',
        display: 'flex', 
        alignItems: 'flex-start',
        height: 'calc(100vh - 2rem)'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          style={{
            position: 'absolute',
            left: isCartOpen ? '-15px' : '-40px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            color: 'white'
          }}
        >
          {isCartOpen ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>

        <div style={{ 
          width: isCartOpen ? '320px' : '0', 
          opacity: isCartOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100vh',
          marginTop: '-1rem' // Offset parent padding
        }}>
          <div style={{ width: '320px', height: '100%' }}>
            <CartPanel cartItems={cart} onAdd={handleAdd} onRemove={handleRemove} onClearCart={handleClearCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
