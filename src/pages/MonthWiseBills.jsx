import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Loader2, Calendar as CalendarIcon, DollarSign, Package, ShoppingCart, 
  TrendingUp, Utensils, ShoppingBag, Truck, Globe, ChevronUp, ChevronDown, CheckCircle,
  FileText, ArrowLeftRight, Award, Lightbulb, Filter, RefreshCcw, Download, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { getOrderBills } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const monthsList = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];

const yearsList = [2024, 2025, 2026, 2027];

const MonthWiseBills = () => {
  const { user } = useAuth();
  
  // Date selection states
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Filter states
  const [selectedHotel, setSelectedHotel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState('ALL');
  
  // Data states
  const [currentItems, setCurrentItems] = useState([]);
  const [prevItems, setPrevItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch monthly data
  const normalizeOrderItems = (items) => {
    return Array.isArray(items) ? items.map(item => ({
      ...item,
      orderId: item.orderId ?? item.order_id,
      orderDate: item.orderDate ?? item.order_date,
      orderTime: item.orderTime ?? item.order_time,
      totalAmount: item.totalAmount ?? item.totalAamount ?? item.sellingAmount,
    })) : [];
  };

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);
    
    // Calculate current month date strings
    const firstDay = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const lastDayNum = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const lastDay = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

    // Calculate previous month date strings
    let prevMonthNum = selectedMonth - 1;
    let prevYearNum = selectedYear;
    if (prevMonthNum < 0) {
      prevMonthNum = 11;
      prevYearNum = selectedYear - 1;
    }
    const prevFirstDay = `${prevYearNum}-${String(prevMonthNum + 1).padStart(2, '0')}-01`;
    const prevLastDayNum = new Date(prevYearNum, prevMonthNum + 1, 0).getDate();
    const prevLastDay = `${prevYearNum}-${String(prevMonthNum + 1).padStart(2, '0')}-${String(prevLastDayNum).padStart(2, '0')}`;

    try {
      const [currentRes, prevRes] = await Promise.all([
        getOrderBills(firstDay, lastDay),
        getOrderBills(prevFirstDay, prevLastDay)
      ]);

      if (currentRes && currentRes.success) {
        setCurrentItems(normalizeOrderItems(currentRes.data));
      } else {
        setCurrentItems([]);
      }

      if (prevRes && prevRes.success) {
        setPrevItems(normalizeOrderItems(prevRes.data));
      } else {
        setPrevItems([]);
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Please verify API is running.');
      setCurrentItems([]);
      setPrevItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth, selectedYear]);

  // Unique filters lists
  const hotelsList = useMemo(() => {
    const hotels = new Set(currentItems.map(item => item.hotelName).filter(Boolean));
    return ['ALL', ...Array.from(hotels)];
  }, [currentItems]);

  const categoriesList = useMemo(() => {
    const cats = new Set(currentItems.map(item => item.itemCategory).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [currentItems]);

  // Apply filters
  const filteredCurrentItems = useMemo(() => {
    return currentItems.filter(item => {
      const matchHotel = selectedHotel === 'ALL' || item.hotelName === selectedHotel;
      const matchCategory = selectedCategory === 'ALL' || item.itemCategory === selectedCategory;
      const matchOrderType = selectedOrderType === 'ALL' || item.givenType?.toUpperCase() === selectedOrderType.toUpperCase();
      return matchHotel && matchCategory && matchOrderType;
    });
  }, [currentItems, selectedHotel, selectedCategory, selectedOrderType]);

  const filteredPrevItems = useMemo(() => {
    return prevItems.filter(item => {
      const matchHotel = selectedHotel === 'ALL' || item.hotelName === selectedHotel;
      const matchCategory = selectedCategory === 'ALL' || item.itemCategory === selectedCategory;
      const matchOrderType = selectedOrderType === 'ALL' || item.givenType?.toUpperCase() === selectedOrderType.toUpperCase();
      return matchHotel && matchCategory && matchOrderType;
    });
  }, [prevItems, selectedHotel, selectedCategory, selectedOrderType]);

  // Unique orders mapping helper
  const mapToOrders = (itemsList) => {
    const groups = {};
    itemsList.forEach(item => {
      const oid = item.orderId ?? item.order_id ?? `ORD-${item.orderDate}-${item.orderTime || ''}-${item.customerName || 'Walk-in'}`;
      if (!groups[oid]) {
        groups[oid] = {
          orderId: oid,
          orderDate: item.orderDate,
          orderStatus: item.orderStatus || 'COMPLETED',
          givenType: item.givenType || 'DINE_IN',
          totalAmount: 0,
          items: []
        };
      }
      groups[oid].items.push(item);
      groups[oid].totalAmount += item.totalAmount || item.sellingAmount || 0;
      groups[oid].gstAmount = (groups[oid].gstAmount || 0) + (item.gstAmount || 0);
      groups[oid].ngstAmount = (groups[oid].ngstAmount || 0) + (item.ngstAmount || 0);
      groups[oid].sgstAmount = (groups[oid].sgstAmount || 0) + (item.sgstAmount || 0);
    });
    return Object.values(groups);
  };

  const currentOrders = useMemo(() => mapToOrders(filteredCurrentItems), [filteredCurrentItems]);
  const prevOrders = useMemo(() => mapToOrders(filteredPrevItems), [filteredPrevItems]);

  // Monthly stats calculations
  const stats = useMemo(() => {
    const completedCurrent = currentOrders.filter(o => o.orderStatus === 'COMPLETED');
    const completedPrev = prevOrders.filter(o => o.orderStatus === 'COMPLETED');

    const totalRevenue = completedCurrent.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevRevenue = completedPrev.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalBills = completedCurrent.length;
    const totalItems = filteredCurrentItems.filter(i => i.orderStatus === 'COMPLETED').reduce((sum, i) => sum + (i.quantity || 0), 0);

    const totalGst = completedCurrent.reduce((sum, o) => sum + (o.gstAmount || 0), 0);
    const totalNgst = completedCurrent.reduce((sum, o) => sum + (o.ngstAmount || 0), 0);
    const totalSgst = completedCurrent.reduce((sum, o) => sum + (o.sgstAmount || 0), 0);

    // Days with active sales
    const activeDates = new Set(completedCurrent.map(o => o.orderDate));
    const avgDailyRevenue = activeDates.size ? totalRevenue / activeDates.size : 0;

    // Daily revenue calculation to find Best and Lowest sales days
    const dailySales = {};
    completedCurrent.forEach(o => {
      dailySales[o.orderDate] = (dailySales[o.orderDate] || 0) + o.totalAmount;
    });

    const dailyEntries = Object.entries(dailySales);
    let bestDay = 'N/A';
    let lowestDay = 'N/A';
    if (dailyEntries.length > 0) {
      dailyEntries.sort((a, b) => b[1] - a[1]);
      bestDay = `${new Date(dailyEntries[0][0]).getDate()} ${monthsList[selectedMonth].label} (₹${dailyEntries[0][1].toFixed(0)})`;
      lowestDay = `${new Date(dailyEntries[dailyEntries.length - 1][0]).getDate()} ${monthsList[selectedMonth].label} (₹${dailyEntries[dailyEntries.length - 1][1].toFixed(0)})`;
    }

    // Best selling item & category
    const itemSalesQty = {};
    const catSalesRev = {};
    filteredCurrentItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        itemSalesQty[item.itemName] = (itemSalesQty[item.itemName] || 0) + (item.quantity || 0);
        catSalesRev[item.itemCategory] = (catSalesRev[item.itemCategory] || 0) + (item.totalAmount || item.sellingAmount || 0);
      }
    });

    const itemEntries = Object.entries(itemSalesQty).sort((a, b) => b[1] - a[1]);
    const catEntries = Object.entries(catSalesRev).sort((a, b) => b[1] - a[1]);

    const bestSellingItem = itemEntries.length > 0 ? itemEntries[0][0] : 'N/A';
    const bestSellingCategory = catEntries.length > 0 ? catEntries[0][0] : 'N/A';

    // Difference and Growth
    const revenueDiff = totalRevenue - prevRevenue;
    const growthPercent = prevRevenue ? ((revenueDiff / prevRevenue) * 100).toFixed(1) : totalRevenue ? '100' : '0';

    return {
      totalRevenue,
      prevRevenue,
      totalBills,
      totalItems,
      avgDailyRevenue,
      bestDay,
      lowestDay,
      bestSellingItem,
      bestSellingCategory,
      revenueDiff,
      growthPercent,
      totalGst,
      totalNgst,
      totalSgst
    };
  }, [currentOrders, prevOrders, filteredCurrentItems, selectedMonth]);

  // Area Chart Daily Revenue Trend Data
  const dailyTrendData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        date: dateStr,
        dayNum: day,
        revenue: 0,
        orders: 0
      };
    });

    currentOrders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const dateObj = new Date(o.orderDate);
        const day = dateObj.getDate();
        if (day >= 1 && day <= daysInMonth) {
          data[day - 1].revenue += o.totalAmount;
          data[day - 1].orders += 1;
        }
      }
    });

    return data;
  }, [currentOrders, selectedMonth, selectedYear]);

  // Weekly Revenue Bar Chart Data
  const weeklyData = useMemo(() => {
    const weeks = [
      { name: 'Week 1', revenue: 0 },
      { name: 'Week 2', revenue: 0 },
      { name: 'Week 3', revenue: 0 },
      { name: 'Week 4', revenue: 0 }
    ];

    currentOrders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const day = new Date(o.orderDate).getDate();
        if (day <= 7) weeks[0].revenue += o.totalAmount;
        else if (day <= 14) weeks[1].revenue += o.totalAmount;
        else if (day <= 21) weeks[2].revenue += o.totalAmount;
        else weeks[3].revenue += o.totalAmount;
      }
    });

    return weeks;
  }, [currentOrders]);

  // Weekly Comparison Dual Bar Chart
  const weeklyComparisonData = useMemo(() => {
    const data = [
      { name: 'Week 1', current: 0, previous: 0 },
      { name: 'Week 2', current: 0, previous: 0 },
      { name: 'Week 3', current: 0, previous: 0 },
      { name: 'Week 4', current: 0, previous: 0 }
    ];

    currentOrders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const day = new Date(o.orderDate).getDate();
        if (day <= 7) data[0].current += o.totalAmount;
        else if (day <= 14) data[1].current += o.totalAmount;
        else if (day <= 21) data[2].current += o.totalAmount;
        else data[3].current += o.totalAmount;
      }
    });

    prevOrders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        const day = new Date(o.orderDate).getDate();
        if (day <= 7) data[0].previous += o.totalAmount;
        else if (day <= 14) data[1].previous += o.totalAmount;
        else if (day <= 21) data[2].previous += o.totalAmount;
        else data[3].previous += o.totalAmount;
      }
    });

    return data;
  }, [currentOrders, prevOrders]);

  // Daily Collection Report table items
  const dailyReportTable = useMemo(() => {
    const report = {};
    currentOrders.forEach(o => {
      if (o.orderStatus === 'COMPLETED') {
        if (!report[o.orderDate]) {
          report[o.orderDate] = { date: o.orderDate, orders: 0, revenue: 0 };
        }
        report[o.orderDate].orders += 1;
        report[o.orderDate].revenue += o.totalAmount;
      }
    });
    return Object.values(report).sort((a, b) => b.date.localeCompare(a.date));
  }, [currentOrders]);

  // Category Contribution Donut Data
  const categoryData = useMemo(() => {
    const cats = {};
    filteredCurrentItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        const cat = item.itemCategory || 'Others';
        if (!cats[cat]) {
          cats[cat] = { name: cat, value: 0, qty: 0 };
        }
        cats[cat].value += item.totalAmount || item.sellingAmount || 0;
        cats[cat].qty += item.quantity || 0;
      }
    });
    return Object.values(cats);
  }, [filteredCurrentItems]);

  // Top 10 Selling Items (Horizontal Bar Chart)
  const top10Data = useMemo(() => {
    const items = {};
    filteredCurrentItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        if (!items[item.itemName]) {
          items[item.itemName] = { name: item.itemName, qty: 0, revenue: 0 };
        }
        items[item.itemName].qty += item.quantity || 0;
        items[item.itemName].revenue += item.totalAmount || item.sellingAmount || 0;
      }
    });
    return Object.values(items).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [filteredCurrentItems]);

  // Bottom 10 Selling Items (Horizontal Bar Chart)
  const bottom10Data = useMemo(() => {
    const items = {};
    filteredCurrentItems.forEach(item => {
      if (item.orderStatus === 'COMPLETED') {
        if (!items[item.itemName]) {
          items[item.itemName] = { name: item.itemName, qty: 0, revenue: 0 };
        }
        items[item.itemName].qty += item.quantity || 0;
        items[item.itemName].revenue += item.totalAmount || item.sellingAmount || 0;
      }
    });
    return Object.values(items).sort((a, b) => a.qty - b.qty).slice(0, 10);
  }, [filteredCurrentItems]);

  // Monthly Business Insights
  const monthlyInsights = useMemo(() => {
    const insights = [];
    const completedCurrent = currentOrders.filter(o => o.orderStatus === 'COMPLETED');
    
    if (completedCurrent.length === 0) {
      return ['No sales recorded for this month.'];
    }

    // 1. Growth percentage
    const isGrowth = stats.revenueDiff >= 0;
    insights.push(`Revenue ${isGrowth ? 'increased' : 'decreased'} by ${Math.abs(stats.growthPercent)}% compared to the previous month (difference of ₹${Math.abs(stats.revenueDiff).toFixed(2)}).`);

    // 2. High performing day of week
    const weekdaySales = {};
    completedCurrent.forEach(o => {
      const dayIndex = new Date(o.orderDate).getDay();
      const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
      const dayName = dayNames[dayIndex];
      weekdaySales[dayName] = (weekdaySales[dayName] || 0) + o.totalAmount;
    });
    const bestWeekday = Object.entries(weekdaySales).sort((a, b) => b[1] - a[1]);
    if (bestWeekday.length > 0) {
      insights.push(`${bestWeekday[0][0]} generated the highest cumulative sales this month.`);
    }

    // 3. Best selling item
    if (stats.bestSellingItem !== 'N/A') {
      insights.push(`${stats.bestSellingItem} remained the best-selling menu item of the month.`);
    }

    // 4. Best category contribution
    if (stats.bestSellingCategory !== 'N/A') {
      const topCat = categoryData.find(c => c.name === stats.bestSellingCategory);
      const catContr = stats.totalRevenue ? (topCat.value / stats.totalRevenue) * 100 : 0;
      insights.push(`The ${stats.bestSellingCategory} category contributed ${catContr.toFixed(0)}% of total monthly collections.`);
    }

    // 5. Daily average
    insights.push(`Average daily collection throughout the month was ₹${stats.avgDailyRevenue.toFixed(0)}.`);

    return insights;
  }, [currentOrders, stats, categoryData]);

  return (
    <div className="p-6 text-slate-100 flex flex-col gap-6 max-h-[100vh] overflow-y-auto w-full">
      {/* Header with Monthly selectors */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
            Monthly Bills Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">Multi-dimensional business analytics, weekly performance, and growth indexes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Dropdown */}
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-indigo-400 font-bold outline-none cursor-pointer text-sm focus:border-indigo-500"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value} style={{ background: '#0f172a' }}>{m.label}</option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-indigo-400 font-bold outline-none cursor-pointer text-sm focus:border-indigo-500"
          >
            {yearsList.map(y => (
              <option key={y} value={y} style={{ background: '#0f172a' }}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: DollarSign, gradient: 'from-blue-600 to-indigo-600 shadow-blue-500/10' },
          { label: 'Bills Completed', value: stats.totalBills, icon: FileText, gradient: 'from-emerald-600 to-teal-600 shadow-emerald-500/10' },
          { label: 'Total Items Sold', value: stats.totalItems, icon: Package, gradient: 'from-amber-600 to-orange-600 shadow-amber-500/10' },
          { label: 'Avg Daily Revenue', value: `₹${stats.avgDailyRevenue.toFixed(2)}`, icon: TrendingUp, gradient: 'from-indigo-600 to-purple-600 shadow-indigo-500/10' },
          { label: 'Best Sales Day', value: stats.bestDay, icon: CalendarIcon, gradient: 'from-cyan-600 to-blue-600 shadow-cyan-500/10', subtext: true },
          { label: 'Lowest Sales Day', value: stats.lowestDay, icon: CalendarIcon, gradient: 'from-fuchsia-600 to-pink-600 shadow-fuchsia-500/10', subtext: true },
          { label: 'Best Selling Item', value: stats.bestSellingItem, icon: Award, gradient: 'from-rose-600 to-red-600 shadow-rose-500/10', subtext: true },
          { label: 'Top Category', value: stats.bestSellingCategory, icon: Utensils, gradient: 'from-violet-600 to-indigo-700 shadow-violet-500/10', subtext: true },
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
              <h3 className={`font-extrabold text-white mt-1 ${card.subtext ? 'text-xs truncate' : 'text-xl'}`}>
                {card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters block */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Filter size={16} /> Filters:
        </div>

        {/* Hotel Selector */}
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
          <p className="text-slate-400">Loading monthly collection reports...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/10 p-12 rounded-2xl text-center text-slate-400">
          <CalendarIcon size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="font-semibold text-lg">No records found for this month.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Revenue progress area chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-400 mb-6">Daily sales revenue curve throughout the selected month.</p>
              
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMonthlyRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dayNum" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Daily Revenue']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorMonthlyRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart Monthly Insights */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-400" size={20} />
                <h3 className="text-lg font-bold text-white">Monthly Insights</h3>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                {monthlyInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex gap-3 items-start">
                    <div className="bg-teal-500/10 p-1.5 rounded-lg text-teal-400 mt-0.5 text-xs font-bold">
                      📊
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 font-medium">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly comparison & weekly bar charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth comparison cards */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Revenue Comparison</h3>
                <p className="text-xs text-slate-400 mb-6">Growth index compared to the previous calendar month.</p>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Total Revenue Collected</div>
                  <div className="text-2xl font-black text-white mt-1 mb-2">₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                {/* Distinct GST Information DIV */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-4 shadow-inner">
                  <div className="text-[10px] font-black text-amber-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign size={12} /> Tax & GST Breakdown
                  </div>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                    <span className="text-sm font-semibold text-slate-300">Total GST</span>
                    <span className="text-lg font-black text-white">₹{stats.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>NGST</span>
                    <span className="font-semibold text-slate-300">₹{stats.totalNgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>SGST</span>
                    <span className="font-semibold text-slate-300">₹{stats.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 opacity-70 mt-2">
                  <div className="text-xs text-slate-400">Previous Month</div>
                  <div className="text-xl font-bold text-slate-300 mt-1">₹{stats.prevRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">Difference / Growth:</span>
                  <span className={`text-sm font-extrabold px-3 py-1 rounded-full border ${stats.revenueDiff >= 0 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                    {stats.revenueDiff >= 0 ? '+' : ''}{stats.revenueDiff.toLocaleString('en-IN')} ({stats.growthPercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly performance side-by-side comparison bar chart */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Weekly Collections (Current vs Prev)</h3>
              <p className="text-xs text-slate-400 mb-6">Week by week comparison of current month vs previous month.</p>
              
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyComparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [`₹${Number(value).toFixed(0)}`, 'Revenue']}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="current" name="Selected Month" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous" name="Previous Month" fill="rgba(99, 102, 241, 0.3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly category and inventory lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Performance share */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Category Analysis</h3>
              <p className="text-xs text-slate-400 mb-6">Aggregate category contribution for the month.</p>
              <div className="flex-1 min-h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={55}
                      outerRadius={75}
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
                      {cat.name} ({cat.qty} items)
                    </span>
                    <span className="font-bold text-white">₹{cat.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Selling Items Horizontal Bar Chart */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Top 10 Selling Items</h3>
              <p className="text-xs text-slate-400 mb-6">High volume performers for the current month.</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [value, 'Qty Sold']}
                    />
                    <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {top10Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom 10 Selling Items (Inventory Optimization) */}
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Bottom 10 Items</h3>
              <p className="text-xs text-slate-400 mb-6">Slow-moving menu inventory alert list.</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bottom10Data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
                      formatter={(value) => [value, 'Qty Sold']}
                    />
                    <Bar dataKey="qty" fill="#ef4444" radius={[0, 4, 4, 0]}>
                      {bottom10Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily collection report list */}
          <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Daily Collection Report</h3>
                <p className="text-xs text-slate-400">Transaction summary ledger showing revenue collected per calendar day.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950 border-b border-white/10 z-10">
                  <tr className="text-slate-400 font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Revenue Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dailyReportTable.map((row) => (
                    <tr key={row.date} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-400">{row.orders}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">₹{row.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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

export default MonthWiseBills;
