import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Loader2, Calendar as CalendarIcon, DollarSign, Package, ShoppingCart, 
  TrendingUp, Utensils, ShoppingBag, Truck, Globe, ChevronUp, ChevronDown, CheckCircle,
  FileText, ArrowLeftRight, Award, Lightbulb, Filter, RefreshCcw, Download, HelpCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { getOrderBills } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const AwesomeDatePicker = ({ selectedDate, onSelect, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handleSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const tzOffset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(newDate - tzOffset)).toISOString().split('T')[0];
    
    if (maxDate && localISOTime > maxDate) return;
    
    onSelect(localISOTime);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <div 
        onClick={() => { setIsOpen(!isOpen); setViewDate(new Date(selectedDate)); }}
        className="flex items-center bg-slate-900/80 border border-white/10 rounded-full px-4 py-2 text-indigo-400 font-bold hover:bg-slate-900 transition cursor-pointer select-none"
      >
        <CalendarIcon size={16} className="mr-2" />
        <span className="text-sm">{new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
      
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-[90]" />
          <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-[100] w-[280px] text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-white">{monthNames[currentMonth]} {currentYear}</span>
              <div className="flex gap-1">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(currentYear, currentMonth, day);
                const tzOffset = d.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(d - tzOffset)).toISOString().split('T')[0];
                const isSelected = localISOTime === selectedDate;
                const isFuture = maxDate && localISOTime > maxDate;
                
                return (
                  <button 
                    key={day}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleSelect(day)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition mx-auto
                      ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-200 hover:bg-white/10'}
                      ${isFuture ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
              <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">Cancel</button>
              <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20">Done</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TotalBills = () => {
  const { user } = useAuth();
  
  // Date states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today - tzOffset)).toISOString().split('T')[0];
  });
  
  const maxDate = useMemo(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today - tzOffset)).toISOString().split('T')[0];
  }, []);

  // Filter states
  const [selectedHotel, setSelectedHotel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [ordersItems, setOrdersItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchDailyBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderBills(selectedDate, selectedDate);
      if (res && res.success) {
        const normalized = Array.isArray(res.data) ? res.data.map(item => ({
          ...item,
          orderDate: item.orderDate ?? item.order_date,
          orderTime: item.orderTime ?? item.order_time,
          orderId: item.orderId ?? item.order_id,
        })) : [];
        setOrdersItems(normalized);
      } else {
        setOrdersItems([]);
        setError(res?.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Please verify API is running.');
      setOrdersItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyBills();
  }, [selectedDate]);

  // Unique lists for filters
  const hotelsList = useMemo(() => {
    const hotels = new Set(ordersItems.map(item => item.hotelName).filter(Boolean));
    return ['ALL', ...Array.from(hotels)];
  }, [ordersItems]);

  const categoriesList = useMemo(() => {
    const cats = new Set(ordersItems.map(item => item.itemCategory).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [ordersItems]);

  // Apply UI Filters to flat ordersItems list
  const filteredItems = useMemo(() => {
    return ordersItems.filter(item => {
      const matchSearch = !searchTerm || 
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.order_id || item.orderId)?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchHotel = selectedHotel === 'ALL' || item.hotelName === selectedHotel;
      const matchCategory = selectedCategory === 'ALL' || item.itemCategory === selectedCategory;
      const matchOrderType = selectedOrderType === 'ALL' || 
        item.givenType?.toUpperCase() === selectedOrderType.toUpperCase();

      return matchSearch && matchHotel && matchCategory && matchOrderType;
    });
  }, [ordersItems, searchTerm, selectedHotel, selectedCategory, selectedOrderType]);

  // Group items back to unique orders for Order-level statistics
  const orders = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const oid = item.order_id || `ORD-${item.orderDate}-${item.orderTime || ''}-${item.customerName || 'Walk-in'}`;
      if (!groups[oid]) {
        groups[oid] = {
          orderId: oid,
          customerName: item.customerName || 'Walk-in',
          customerMobile: item.customerMobile || '',
          tableNo: item.tableNo || 'N/A',
          orderDate: item.orderDate,
          orderTime: item.orderTime || '00:00:00',
          paymentMode: item.paymentMode || 'CASH',
          paymentStatus: item.paymentStatus || 'PAID',
          orderStatus: item.orderStatus || 'COMPLETED',
          givenType: item.givenType || 'DINE_IN',
          items: [],
          totalAmount: 0,
          discountAmount: item.discountAmount || 0,
          gstAmount: 0,
          sellingAmount: 0
        };
      }
      groups[oid].items.push(item);
      groups[oid].totalAmount += item.totalAmount || item.sellingAmount || 0;
      groups[oid].gstAmount += item.gstAmount || 0;
      groups[oid].sellingAmount += item.sellingAmount || 0;
    });
    return Object.values(groups);
  }, [filteredItems]);

  // Dashboard Stats (KPIs)
  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalBills = completedOrders.length;
    const totalItems = completedOrders.reduce((sum, o) => {
      return sum + o.items.reduce((s, item) => s + (item.quantity || 0), 0);
    }, 0);
    const avgBill = totalBills ? totalRevenue / totalBills : 0;

    // Dine-In vs Takeaway vs Delivery/Online revenue
    let dineInRevenue = 0;
    let takeawayRevenue = 0;
    let onlineRevenue = 0;
    completedOrders.forEach(o => {
      const type = o.givenType?.toUpperCase() || '';
      if (type === 'DINE_IN' || type === 'DINE IN') dineInRevenue += o.totalAmount;
      else if (type === 'TAKEAWAY' || type === 'TAKE AWAY') takeawayRevenue += o.totalAmount;
      else onlineRevenue += o.totalAmount;
    });

    // Item sales sorting to find highest/lowest selling
    const itemSales = {};
    filteredItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        itemSales[item.itemName] = (itemSales[item.itemName] || 0) + (item.quantity || 0);
      }
    });

    const salesEntries = Object.entries(itemSales);
    let highestItem = 'N/A';
    let lowestItem = 'N/A';

    if (salesEntries.length > 0) {
      salesEntries.sort((a, b) => b[1] - a[1]);
      highestItem = `${salesEntries[0][0]} (${salesEntries[0][1]} sold)`;
      lowestItem = `${salesEntries[salesEntries.length - 1][0]} (${salesEntries[salesEntries.length - 1][1]} sold)`;
    }

    return {
      totalBills,
      totalRevenue,
      totalItems,
      avgBill,
      dineInRevenue,
      takeawayRevenue,
      onlineRevenue,
      highestItem,
      lowestItem
    };
  }, [orders, filteredItems]);

  // Hourly Revenue Trend Chart Data
  const hourlyData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      return {
        name: displayHour,
        hour: hour,
        revenue: 0,
        orders: 0
      };
    });

    orders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const timeParts = o.orderTime?.split(':');
        const hour = timeParts ? parseInt(timeParts[0]) : 0;
        if (hour >= 0 && hour < 24) {
          data[hour].revenue += o.totalAmount;
          data[hour].orders += 1;
        }
      }
    });

    // Filter to active hours range (e.g. from earliest sale hour to latest sale hour)
    const activeData = data.filter((h, idx) => {
      // Keep if there's revenue, or if it falls within restaurant working hours (e.g. 8 AM to 11 PM)
      return h.hour >= 8 && h.hour <= 23;
    });

    return activeData;
  }, [orders]);

  // Category Revenue Chart Data
  const categoryData = useMemo(() => {
    const cats = {};
    filteredItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        const cat = item.itemCategory || 'Others';
        cats[cat] = (cats[cat] || 0) + (item.totalAmount || item.sellingAmount || 0);
      }
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [filteredItems]);

  // Order Type Analytics Chart Data
  const orderTypeData = useMemo(() => {
    const types = { 'Dine-In': 0, 'Takeaway': 0, 'Delivery/Online': 0 };
    let totalRev = 0;
    orders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const type = o.givenType?.toUpperCase() || '';
        let mappedType = 'Delivery/Online';
        if (type === 'DINE_IN' || type === 'DINE IN') mappedType = 'Dine-In';
        else if (type === 'TAKEAWAY' || type === 'TAKE AWAY') mappedType = 'Takeaway';
        
        types[mappedType] = (types[mappedType] || 0) + o.totalAmount;
        totalRev += o.totalAmount;
      }
    });

    return Object.entries(types).map(([name, value]) => {
      const percentage = totalRev ? ((value / totalRev) * 100).toFixed(1) : 0;
      return { name, value, percentage };
    });
  }, [orders]);

  // Top Selling Items Horizontal Bar Chart Data
  const topSellingData = useMemo(() => {
    const items = {};
    const totalQty = filteredItems.reduce((sum, i) => sum + (i.orderStatus === 'COMPLETED' ? i.quantity : 0), 0);
    
    filteredItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        if (!items[item.itemName]) {
          items[item.itemName] = { name: item.itemName, qty: 0, revenue: 0 };
        }
        items[item.itemName].qty += item.quantity || 0;
        items[item.itemName].revenue += item.totalAmount || item.sellingAmount || 0;
      }
    });

    return Object.values(items)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map(item => ({
        ...item,
        percentage: totalQty ? ((item.qty / totalQty) * 100).toFixed(1) : 0
      }));
  }, [filteredItems]);

  // Least Selling Items Data
  const leastSellingData = useMemo(() => {
    const items = {};
    filteredItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        if (!items[item.itemName]) {
          items[item.itemName] = { name: item.itemName, qty: 0, revenue: 0 };
        }
        items[item.itemName].qty += item.quantity || 0;
        items[item.itemName].revenue += item.totalAmount || item.sellingAmount || 0;
      }
    });

    return Object.values(items)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);
  }, [filteredItems]);

  // Bill Collection Insights & Histogram Data
  const billCollectionInsights = useMemo(() => {
    const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');
    const amounts = completedOrders.map(o => o.totalAmount);
    
    const maxBill = amounts.length ? Math.max(...amounts) : 0;
    const minBill = amounts.length ? Math.min(...amounts) : 0;
    const avgBill = amounts.length ? stats.totalRevenue / amounts.length : 0;

    // Price range counts for histogram
    const ranges = [
      { name: '₹0-100', count: 0 },
      { name: '₹101-250', count: 0 },
      { name: '₹251-500', count: 0 },
      { name: '₹501-1000', count: 0 },
      { name: '₹1000+', count: 0 }
    ];

    amounts.forEach(amt => {
      if (amt <= 100) ranges[0].count++;
      else if (amt <= 250) ranges[1].count++;
      else if (amt <= 500) ranges[2].count++;
      else if (amt <= 1000) ranges[3].count++;
      else ranges[4].count++;
    });

    return { maxBill, minBill, avgBill, ranges };
  }, [orders, stats]);

  // Item Performance Leaderboard (all unique items with badges and sales ranks)
  const itemPerformanceData = useMemo(() => {
    const items = {};
    filteredItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        if (!items[item.itemName]) {
          items[item.itemName] = { name: item.itemName, qty: 0, revenue: 0, category: item.itemCategory };
        }
        items[item.itemName].qty += item.quantity || 0;
        items[item.itemName].revenue += item.totalAmount || item.sellingAmount || 0;
      }
    });

    const list = Object.values(items).sort((a, b) => b.revenue - a.revenue);
    
    // Assign Rank and Badges based on performance
    return list.map((item, index) => {
      const rank = index + 1;
      let badge = 'Slow Moving';
      let badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      let badgeIcon = '⚠';
      
      if (rank <= 3) {
        badge = 'Best Seller';
        badgeColor = 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        badgeIcon = '🔥';
      } else if (item.qty >= 10) {
        badge = 'Popular';
        badgeColor = 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        badgeIcon = '⭐';
      } else if (item.qty <= 2) {
        badge = 'Low Demand';
        badgeColor = 'text-red-400 bg-red-400/10 border-red-400/20';
        badgeIcon = '❌';
      }

      return {
        ...item,
        rank,
        badge,
        badgeColor,
        badgeIcon
      };
    });
  }, [filteredItems]);

  // Smart Insights Generation
  const smartInsights = useMemo(() => {
    const insights = [];
    const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');
    
    if (completedOrders.length === 0) {
      return ['No sales recorded for this date.'];
    }

    // 1. Highest selling item
    if (topSellingData.length > 0) {
      const top = topSellingData[0];
      insights.push(`${top.name} was the best-seller today with ${top.qty} items sold, generating ₹${top.revenue.toFixed(2)}.`);
    }

    // 2. Dine-in Contribution
    const dineInContr = stats.totalRevenue ? (stats.dineInRevenue / stats.totalRevenue) * 100 : 0;
    if (dineInContr > 0) {
      insights.push(`Dine-in orders contributed ${dineInContr.toFixed(0)}% of today's total revenue (₹${stats.dineInRevenue.toFixed(2)}).`);
    }

    // 3. Category concentration
    if (categoryData.length > 0) {
      const sortedCats = [...categoryData].sort((a, b) => b.value - a.value);
      const topCat = sortedCats[0];
      const catContr = stats.totalRevenue ? (topCat.value / stats.totalRevenue) * 100 : 0;
      insights.push(`The ${topCat.name} category dominated sales, contributing ${catContr.toFixed(0)}% to the daily collection.`);
    }

    // 4. Concentration of top 3 items
    if (topSellingData.length >= 3) {
      const top3Revenue = topSellingData.slice(0, 3).reduce((sum, i) => sum + i.revenue, 0);
      const top3Contr = stats.totalRevenue ? (top3Revenue / stats.totalRevenue) * 100 : 0;
      if (top3Contr > 50) {
        insights.push(`High product concentration: Top 3 items accounted for ${top3Contr.toFixed(0)}% of overall revenue (₹${top3Revenue.toFixed(2)}).`);
      }
    }

    // 5. Low selling items promo opportunity
    if (leastSellingData.length > 0) {
      const lowSellers = leastSellingData.slice(0, 2).map(i => i.name).join(' and ');
      insights.push(`Inventory Tip: Low-selling items like ${lowSellers} could benefit from target promotions or combos.`);
    }

    return insights;
  }, [orders, topSellingData, stats, categoryData, leastSellingData]);

  // Export Daily Summary CSV
  const handleExportCSV = () => {
    if (ordersItems.length === 0) return;
    const headers = ["OrderID", "Date", "ItemName", "Category", "Quantity", "SellingPrice", "GST", "TotalAmount", "OrderType", "PaymentMode", "PaymentStatus"];
    const csvRows = [
      headers.join(','),
      ...ordersItems.map(item => [
        item.order_id || item.orderId,
        item.orderDate,
        `"${item.itemName}"`,
        `"${item.itemCategory}"`,
        item.quantity,
        item.itemPrice || item.sellingAmount / item.quantity,
        item.gstAmount,
        item.totalAmount,
        item.givenType,
        item.paymentMode,
        item.paymentStatus
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Order_Bills_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 text-slate-100 flex flex-col gap-6 max-h-[100vh] overflow-y-auto w-full">
      {/* Header and Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Order Bills Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time daily POS sales, category, and items performance reporting.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Awesome Date Picker input wrapper */}
          <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-full px-4 py-2 text-indigo-400 font-bold hover:bg-slate-900 transition cursor-pointer">
            <AwesomeDatePicker selectedDate={selectedDate} onSelect={setSelectedDate} maxDate={maxDate} />
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={ordersItems.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/20"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: DollarSign, gradient: 'from-blue-600 to-indigo-600 shadow-blue-500/10' },
          { label: 'Bills Generated', value: stats.totalBills, icon: FileText, gradient: 'from-emerald-600 to-teal-600 shadow-emerald-500/10' },
          { label: 'Items Sold', value: stats.totalItems, icon: Package, gradient: 'from-amber-600 to-orange-600 shadow-amber-500/10' },
          { label: 'Avg Bill Value', value: `₹${stats.avgBill.toFixed(2)}`, icon: TrendingUp, gradient: 'from-indigo-600 to-purple-600 shadow-indigo-500/10' },
          { label: 'Dine-In Revenue', value: `₹${stats.dineInRevenue.toLocaleString('en-IN')}`, icon: Utensils, gradient: 'from-cyan-600 to-blue-600 shadow-cyan-500/10' },
          { label: 'Takeaway Revenue', value: `₹${stats.takeawayRevenue.toLocaleString('en-IN')}`, icon: ShoppingBag, gradient: 'from-fuchsia-600 to-pink-600 shadow-fuchsia-500/10' },
          { label: 'Delivery/Online Revenue', value: `₹${stats.onlineRevenue.toLocaleString('en-IN')}`, icon: Globe, gradient: 'from-violet-600 to-indigo-700 shadow-violet-500/10' },
          { label: 'Highest Selling Item', value: stats.highestItem, icon: Award, gradient: 'from-rose-600 to-red-600 shadow-rose-500/10', subtext: true },
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 border border-white/10 flex items-center gap-4 shadow-xl hover:shadow-2xl transition`}
          >
            <div className="bg-white/10 p-3 rounded-xl">
              <card.icon size={24} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">{card.label}</p>
              <h3 className={`font-extrabold text-white mt-1 ${card.subtext ? 'text-sm truncate' : 'text-xl'}`}>
                {card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Options Panel */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Filter size={16} /> Filters:
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search items, bill IDs, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-400 text-sm outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Hotel Selector (Future Ready) */}
        <div>
          <select 
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-sm outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="ALL">All Hotels</option>
            {hotelsList.filter(h => h !== 'ALL').map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-sm outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categoriesList.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Order Type Filter */}
        <div>
          <select 
            value={selectedOrderType}
            onChange={(e) => setSelectedOrderType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-sm outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="ALL">All Order Types</option>
            <option value="DINE_IN">Dine In</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400">Analyzing POS collection bills...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchDailyBills} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full font-bold text-sm hover:bg-red-600 transition">
            Retry Connection
          </button>
        </div>
      ) : ordersItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/10 p-12 rounded-2xl text-center text-slate-400">
          <Utensils size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="font-semibold text-lg">No bills generated for this date.</p>
          <p className="text-sm mt-1">Select another date or add bills using the checkout counter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* First row: Daily Revenue Trend Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Revenue Progression</h3>
                  <p className="text-xs text-slate-400">Area mapping of sales revenue collected per hour.</p>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">Active Hours</span>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart Insights Panel */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-400" size={20} />
                <h3 className="text-lg font-bold text-white">Smart Insights</h3>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                {smartInsights.map((insight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex gap-3 items-start"
                  >
                    <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-400 mt-0.5 text-xs font-bold">
                      💡
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 font-medium">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Row: Product Leaderboard (Top 10) & Category Wise Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Selling Chart */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Top Selling Items</h3>
              <p className="text-xs text-slate-400 mb-6">Comparison of high velocity menu items by quantity sold.</p>
              
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [value, 'Qty Sold']}
                    />
                    <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {topSellingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Donut & Order Type Donut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category Donut */}
              <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Category Share</h3>
                <div className="flex-1 min-h-[160px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                        formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 mt-4">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        {cat.name}
                      </span>
                      <span className="font-bold text-white">₹{cat.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Type Share */}
              <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Order Types</h3>
                <div className="flex-1 min-h-[160px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypeData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                        formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 mt-4">
                  {orderTypeData.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }}></span>
                        {t.name}
                      </span>
                      <span className="font-bold text-white">{t.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Third Row: Bill Insights, Histogram & Least Selling */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bill Value Statistics Card */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Bill Collection Insights</h3>
              <p className="text-xs text-slate-400 mb-6">Summary of single ticket bill values and ranges.</p>
              
              <div className="flex flex-col gap-4 mb-6">
                {[
                  { label: 'Highest Bill Amount', value: `₹${billCollectionInsights.maxBill.toFixed(2)}`, color: 'text-indigo-400' },
                  { label: 'Lowest Bill Amount', value: `₹${billCollectionInsights.minBill.toFixed(2)}`, color: 'text-emerald-400' },
                  { label: 'Average Bill Value', value: `₹${billCollectionInsights.avgBill.toFixed(2)}`, color: 'text-amber-400' },
                  { label: 'Total Revenue Generated', value: `₹${stats.totalRevenue.toFixed(2)}`, color: 'text-white font-black' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 font-semibold">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Mini Histogram Chart */}
              <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={billCollectionInsights.ranges}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [value, 'Bills']}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Least Selling Items Grid Card */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-1">Inventory Alert: Least Selling Items</h3>
              <p className="text-xs text-slate-400 mb-6">Identifying items with low customer velocity (slow-moving items).</p>
              
              <div className="w-full h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leastSellingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [value, 'Qty Sold']}
                    />
                    <Bar dataKey="qty" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {leastSellingData.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-300 truncate">{item.name}</span>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-[10px] text-red-400 font-bold uppercase">Qty: {item.qty}</span>
                      <span className="text-xs text-slate-400 font-semibold">₹{item.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Table / Item Performance Analysis */}
          <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">Item Performance Analytics</h3>
            <p className="text-xs text-slate-400 mb-6">Complete inventory velocity matrix with automatic performance indicators.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Qty Sold</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Performance Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {itemPerformanceData.map((item) => (
                    <tr key={item.name} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-slate-300">#{item.rank}</td>
                      <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                      <td className="py-3 px-4 text-slate-400">{item.category}</td>
                      <td className="py-3 px-4 font-bold text-indigo-400">{item.qty}</td>
                      <td className="py-3 px-4 font-bold text-white">₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.badgeColor} flex items-center gap-1 w-fit`}>
                          <span>{item.badgeIcon}</span> {item.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalBills;
