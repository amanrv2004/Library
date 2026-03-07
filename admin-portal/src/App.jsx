import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Users, CreditCard, History, Settings, 
  QrCode, Bell, Search, TrendingUp, TrendingDown, ChevronRight, 
  Send, Plus, Filter, Clock, FileEdit, Trash2, Map, DollarSign, 
  ArrowUpRight, ArrowDownRight, X, Monitor, Download, CheckCircle2,
  LogOut, PieChart, BarChart3, AlertCircle, ShieldCheck, Mail, MessageCircle,
  FileSpreadsheet, MessageSquare, RefreshCw, Menu
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import QRCodePackage from 'react-qr-code';

const QRCode = QRCodePackage.default || QRCodePackage;

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement
);

const API_URL = import.meta.env.VITE_API_URL || 'https://library-ochre-delta.vercel.app';

const Card = ({ children, className = "", glow = false, noPadding = false }) => (
  <div className={`bg-[#111827]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 hover:border-white/10 ${glow ? 'ring-1 ring-emerald-500/30 shadow-emerald-500/10' : ''} ${className}`}>
    <div className={noPadding ? '' : 'p-6 md:p-8'}>{children}</div>
  </div>
);

const Badge = ({ children }) => {
  const styles = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    Inactive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    'Premium Access': "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${styles[children] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{children}</span>;
};

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [seats, setSeats] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({ monthly: {}, yearly: {} });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [paymentStudent, setPaymentStudent] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const fetchStudents = async () => { try { const r = await axios.get(`${API_URL}/students`); setStudents(r.data); } catch (e) { console.error('Students fetch failed', e); } };
      const fetchExpenses = async () => { try { const r = await axios.get(`${API_URL}/expenses`); setExpenses(r.data); } catch (e) { console.error('Expenses fetch failed', e); } };
      const fetchAttendance = async () => { try { const r = await axios.get(`${API_URL}/attendance`); setAttendance(r.data); } catch (e) { console.error('Attendance fetch failed', e); } };
      const fetchStats = async () => { try { const r = await axios.get(`${API_URL}/stats`); setStats(r.data); } catch (e) { console.error('Stats fetch failed', e); } };
      const fetchAnalytics = async () => { try { const r = await axios.get(`${API_URL}/analytics`); setAnalytics(r.data); } catch (e) { console.error('Analytics fetch failed', e); } };
      const fetchComplaints = async () => { try { const r = await axios.get(`${API_URL}/complaints`); setComplaints(r.data); } catch (e) { console.error('Complaints fetch failed', e); } };
      const fetchNotifications = async () => { try { const r = await axios.get(`${API_URL}/notifications`); setNotifications(r.data); } catch (e) { console.error('Notifications fetch failed', e); } };
      const fetchSeats = async () => { try { const r = await axios.get(`${API_URL}/seats`); setSeats(r.data); } catch (e) { console.error('Seats fetch failed', e); } };

      await Promise.all([
        fetchStudents(), fetchExpenses(), fetchAttendance(), fetchStats(),
        fetchAnalytics(), fetchComplaints(), fetchNotifications(), fetchSeats()
      ]);
    } catch (err) { console.error('Data sync error', err); } 
    finally { setLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => { 
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/auth/admin/login`, loginData);
      setUser(res.data.user);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login Failed');
    } finally { setIsLoggingIn(false); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'StudyPoint_Excel_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Excel Export failed'); }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`${API_URL}/export-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'StudyPoint_PDF_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('PDF Export failed'); }
  };

  if (!user) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <img src="" className="w-full h-full object-cover opacity-30 scale-125" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
      </div>
      <Card className="w-full max-w-md z-10 border-white/10 bg-slate-900/40 backdrop-blur-2xl p-8 md:p-16">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-600/40 transform -rotate-6">
          <ShieldCheck className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">STUDY HUB</h2>
        <p className="text-[10px] text-emerald-500 font-black text-center mb-10 uppercase tracking-[0.4em]">Admin Management Login</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
            <input required type="email" placeholder="admin@example.com" className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-black tracking-widest focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-800" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input required type="password" placeholder="••••••••" className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-black tracking-widest focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-800" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
          </div>
          {loginError && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-500 font-black uppercase tracking-widest text-center">{loginError}</div>}
          <button disabled={isLoggingIn} className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
            {isLoggingIn ? 'VERIFYING...' : 'Login to Dashboard'}
          </button>
        </form>
      </Card>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>;

  const Navigation = () => (
    <nav className="flex-1 space-y-10">
        <section>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6 pl-2">Management</p>
            <div className="space-y-2">
                {['Dashboard', 'Students', 'Seats', 'Expenses', 'Payments', 'News', 'Support'].map(id => (
                <button key={id} onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 font-bold group ${activeTab === id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                    <span className="text-sm">{id}</span>
                    {activeTab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0:10px_rgba(16,185,129,1)]"></div>}
                </button>
                ))}
            </div>
        </section>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex overflow-hidden antialiased selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 scale-125" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col z-20 bg-slate-950/60 backdrop-blur-3xl p-8 shrink-0">
        <div className="flex items-center gap-4 mb-16">
           <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 transform -rotate-6"><ShieldCheck className="text-white" size={26} strokeWidth={2.5} /></div>
           <div><h1 className="text-2xl font-black tracking-tighter text-white leading-none uppercase">STUDY HUB</h1><p className="text-[9px] uppercase tracking-[0.4em] text-emerald-500 font-black mt-2">Admin Dashboard</p></div>
        </div>
        <Navigation />
        
        <div className="mt-auto pt-10 border-t border-white/5 space-y-6">
            <div className="px-2">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">System Developer</p>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Aman Raj Verma</p>
                <a href="mailto:amanrv2004@gmail.com" className="text-[10px] font-bold text-emerald-500/60 hover:text-emerald-400 transition-colors">amanrv2004@gmail.com</a>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-500/10 rounded-2xl transition-all"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* Mobile Sidebar Slide-over */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
              <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950 border-r border-white/10 p-8 flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-center mb-12">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-500/20"><ShieldCheck className="text-white" size={20} /></div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} className="text-slate-500" /></button>
                </div>
                <Navigation />
                <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
                    <div className="px-2">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">System Developer</p>
                        <p className="text-[11px] font-black text-white uppercase">Aman Raj Verma</p>
                        <p className="text-[9px] font-bold text-emerald-500/60">amanrv2004@gmail.com</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 rounded-2xl transition-all"><LogOut size={16} /> Logout</button>
                </div>
              </aside>
          </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 bg-slate-950/30 backdrop-blur-3xl shrink-0">
           <div className="flex items-center gap-4 lg:gap-6">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400"><Menu size={24} /></button>
              <h2 className="text-lg lg:text-2xl font-black text-white tracking-tight uppercase truncate">{activeTab}</h2>
              <button onClick={fetchData} className={`p-2 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-emerald-400 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} title="Refresh Data">
                 <RefreshCw size={18} />
              </button>
           </div>
           
           <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto custom-scrollbar no-scrollbar py-2">
              <button onClick={downloadReport} className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border border-emerald-500/20 text-emerald-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] hover:bg-emerald-500/10 transition-all shrink-0"><FileSpreadsheet size={14} className="hidden sm:inline" /> <span className="sm:hidden">XLS</span><span className="hidden sm:inline">Excel</span></button>
              <button onClick={downloadPDF} className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border border-emerald-500/20 text-emerald-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] hover:bg-emerald-500/10 transition-all shrink-0"><Download size={14} className="hidden sm:inline" /> <span className="sm:hidden">PDF</span><span className="hidden sm:inline">PDF</span></button>
              <button onClick={() => { setEditingStudent(null); setShowForm(true); }} className="flex items-center gap-2 px-4 lg:px-8 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-emerald-600 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 shrink-0"><Plus size={14} className="hidden sm:inline" /> Add <span className="hidden sm:inline">Student</span></button>
              
              <div className="h-8 w-px bg-white/10 mx-1 lg:mx-2 hidden md:block"></div>
              
              <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
                 <div className="text-right leading-none hidden lg:block">
                    <p className="text-sm font-black text-white">{user.fullName}</p>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-1">Ashish</p>
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
           {activeTab === 'Dashboard' && <Dashboard stats={stats} attendance={attendance} analytics={analytics} />}
           {activeTab === 'Students' && <StudentsTable students={students} onRefresh={fetchData} onEdit={(s) => { setEditingStudent(s); setShowForm(true); }} />}
           {activeTab === 'Seats' && <SeatLayout students={students} seats={seats} onRefresh={fetchData} />}
           {activeTab === 'Expenses' && <ExpensesTable expenses={expenses} onRefresh={fetchData} onAdd={() => setShowExpenseForm(true)} />}
           {activeTab === 'Payments' && <PaymentsTable students={students} onCollect={(s) => { setPaymentStudent(s); setShowPaymentForm(true); }} />}
           {activeTab === 'News' && <NewsView notifications={notifications} onRefresh={fetchData} onAdd={() => setShowNotificationForm(true)} />}
           {activeTab === 'Support' && <ComplaintsView complaints={complaints} onRefresh={fetchData} />}
        </main>
      </div>

      {showForm && <StudentForm initialData={editingStudent} onClose={() => setShowForm(false)} onRefresh={fetchData} />}
      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} onRefresh={fetchData} />}
      {showPaymentForm && <PaymentForm student={paymentStudent} onClose={() => setShowPaymentForm(false)} onRefresh={fetchData} />}
      {showNotificationForm && <NotificationForm students={students} onClose={() => setShowNotificationForm(false)} onRefresh={fetchData} />}
    </div>
  );
}

function Dashboard({ stats, attendance, analytics }) {
  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [stats.totalIncome || 0, stats.totalExpenses || 0],
      backgroundColor: ['#10b981', '#f43f5e'],
      borderWidth: 0,
    }]
  };

  const monthlyLabelsRaw = analytics && analytics.monthly ? Object.keys(analytics.monthly).sort() : [];
  const monthlyIncome = monthlyLabelsRaw.map(k => analytics.monthly[k].income);
  const monthlyExpenses = monthlyLabelsRaw.map(k => analytics.monthly[k].expenses);
  
  const monthlyLabels = monthlyLabelsRaw.map(k => {
    const [year, month] = k.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  });

  const trendData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncome,
        borderColor: '#10b981',
        backgroundColor: '#10b98120',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e20',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700">
       <div className="flex justify-between items-center px-2">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">System Performance</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Real-time financial and occupancy metrics</p>
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8">
          <StatCard title="Active Students" value={stats.totalStudents} color="emerald" icon={Users} trend={+12.4} />
          <StatCard title="Occupied Seats" value={`${stats.occupiedSeats}/${stats.totalSeats}`} color="blue" icon={Monitor} />
          <StatCard title="Total Revenue" value={`₹${stats.totalIncome?.toLocaleString()}`} color="emerald" icon={TrendingUp} trend={+8.2} />
          <StatCard title="Total Investment" value={`₹${stats.totalExpenses?.toLocaleString()}`} color="purple" icon={TrendingDown} />
          <StatCard title="Total Due" value={`₹${stats.dueFees?.toLocaleString()}`} color="rose" icon={AlertCircle} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-8 space-y-8 lg:space-y-10">
             <Card noPadding className="border-emerald-500/10">
                <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20 flex items-center justify-between"><h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><BarChart3 className="text-emerald-500" size={18} /> Financial Analytics</h3></div>
                <div className="p-4 lg:p-8 h-[300px] lg:h-[400px]">
                   <Line data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { weight: 'bold' } } } }, scales: { y: { grid: { color: '#ffffff05' }, ticks: { color: '#64748b' } }, x: { grid: { display: false }, ticks: { color: '#64748b' } } } }} />
                </div>
             </Card>

             <Card noPadding className="border-emerald-500/10">
                <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20 flex items-center justify-between"><h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><Clock className="text-emerald-500" size={18} /> Recent Attendance</h3></div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {attendance.map((log, i) => (
                      <div key={i} className="p-4 lg:p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                         <div className="flex items-center gap-3 lg:gap-5">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${log.type === 'Check-In' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{log.type === 'Check-In' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}</div>
                            <div className="min-w-0"><p className="text-xs lg:text-sm font-black text-white uppercase truncate">{log.studentName}</p><p className="text-[8px] lg:text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest truncate">SEAT {log.seatNumber || 'N/A'}</p></div>
                         </div>
                         <div className="text-right font-mono text-[9px] lg:text-xs text-slate-400 shrink-0"><p>{log.time}</p><p className="text-[8px] text-slate-600 mt-1">{log.date}</p></div>
                      </div>
                   ))}
                   {attendance.length === 0 && <div className="p-10 lg:p-20 text-center text-slate-600 uppercase font-black tracking-widest text-xs">No records found</div>}
                </div>
             </Card>
          </div>
          <div className="lg:col-span-4 space-y-8 lg:space-y-10">
             <Card glow className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-emerald-500/20 text-center">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 lg:mb-10">Attendance QR Code</h4>
                <div className="aspect-square bg-white rounded-3xl p-6 lg:p-10 flex flex-col items-center justify-center gap-6 shadow-2xl group overflow-hidden">
                   <QRCode value="STUDY_HUB_AUTH_2026" size={180} />
                </div>
                <p className="text-[9px] lg:text-[10px] text-slate-500 mt-6 lg:mt-10 font-bold uppercase tracking-widest leading-loose">Display for students to mark attendance.</p>
             </Card>
             <Card>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 lg:mb-8 text-center">Revenue Share</h4>
                <div className="aspect-square flex items-center justify-center p-2">
                   <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 'bold', size: 10 } } } } }} />
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
}

function StatCard({ title, value, color, icon: Icon, trend }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5"
  };
  return (
    <Card className={`hover:-translate-y-1 border transition-all group ${colors[color].split(' ')[2]}`}>
       <div className="flex items-center justify-between mb-4 lg:mb-8">
          <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${colors[color].split(' ').slice(0,2).join(' ')} shadow-inner group-hover:scale-110 transition-transform`}><Icon size={20} lg:size={24} strokeWidth={2.5} /></div>
          {trend && <div className="text-[9px] lg:text-[10px] font-black text-emerald-400">+{trend}%</div>}
       </div>
       <p className="text-[9px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest truncate">{title}</p>
       <p className="text-2xl lg:text-4xl font-black text-white mt-1 lg:mt-2 tracking-tighter truncate">{value || 0}</p>
    </Card>
  );
}

function StudentsTable({ students, onRefresh, onEdit }) {
  return (
    <Card noPadding className="border-emerald-500/10 animate-in slide-in-from-bottom-5 duration-700">
       <div className="p-6 lg:p-10 bg-slate-950/20 border-b border-white/5 flex justify-between items-center"><h3 className="text-sm lg:text-xl font-black text-white uppercase tracking-widest">Student Management</h3></div>
       <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
             <thead className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-black bg-slate-950/30 border-b border-white/5">
                <tr>
                   <th className="px-6 lg:px-10 py-4 lg:py-6">Student</th>
                   <th className="px-6 lg:px-10 py-4 lg:py-6">Seat / ID</th>
                   <th className="px-6 lg:px-10 py-4 lg:py-6">Status</th>
                   <th className="px-6 lg:px-10 py-4 lg:py-6">Attendance</th>
                   <th className="px-6 lg:px-10 py-4 lg:py-6 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {students.map(s => (
                   <tr key={s._id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 lg:px-10 py-4 lg:py-6 flex items-center gap-3 lg:gap-5">
                         <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500 group-hover:border-emerald-500/50 transition-all uppercase">{s.fullName.charAt(0)}</div>
                         <div>
                            <p className="text-xs lg:text-sm font-black text-white uppercase">{s.fullName}</p>
                            <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1 font-bold">{s.email}</p>
                         </div>
                      </td>
                      <td className="px-6 lg:px-10 py-4 lg:py-6 text-[10px] lg:text-xs text-emerald-500 font-black font-mono uppercase tracking-widest">
                         <p>{s.studyId}</p>
                         <p className="text-slate-600 text-[8px] lg:text-[9px] mt-1">SEAT {s.seat}</p>
                      </td>
                      <td className="px-6 lg:px-10 py-4 lg:py-6"><Badge>{s.status}</Badge></td>
                      <td className="px-6 lg:px-10 py-4 lg:py-6">
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                               <div className="flex-1 h-1 w-20 lg:w-24 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{width: `${s.attendancePercentage || 0}%`}}></div>
                               </div>
                               <span className="text-[9px] lg:text-[10px] font-black text-slate-300">{s.attendancePercentage || 0}%</span>
                            </div>
                            <p className="text-[8px] lg:text-[9px] font-black text-slate-600 uppercase tracking-widest">Last: {s.lastCheckIn || '--'}</p>
                         </div>
                      </td>
                      <td className="px-6 lg:px-10 py-4 lg:py-6 text-right group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onEdit(s)} className="p-2 lg:p-3 text-slate-500 hover:text-emerald-400"><FileEdit size={16} lg:size={18} /></button>
                         <button onClick={async () => { if(window.confirm('Delete student record?')){ await axios.delete(`${API_URL}/students/${s._id}`); onRefresh(); } }} className="p-2 lg:p-3 text-slate-500 hover:text-rose-500"><Trash2 size={16} lg:size={18} /></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </Card>
  );
}

function SeatLayout({ students, seats, onRefresh }) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [newSeat, setNewSeat] = useState('');

  const handleInitialize = async () => {
    if (!window.confirm('This will create 60 default seats (A1-F10). Continue?')) return;
    setIsInitializing(true);
    try {
      await axios.post(`${API_URL}/seats/initialize`);
      onRefresh();
    } catch (err) { alert('Init failed'); }
    finally { setIsInitializing(false); }
  };

  const handleAddSeat = async (e) => {
    e.preventDefault();
    if (!newSeat) return;
    try {
      await axios.post(`${API_URL}/seats`, { seatNumber: newSeat.toUpperCase() });
      setNewSeat('');
      onRefresh();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add seat'); }
  };

  const handleDeleteSeat = async (id) => {
    if (!window.confirm('Delete this seat?')) return;
    try {
      await axios.delete(`${API_URL}/seats/${id}`);
      onRefresh();
    } catch (err) { alert('Delete failed'); }
  };

  return (
    <Card className="animate-in fade-in duration-700 p-6 lg:p-12 bg-slate-950/40 border-emerald-500/10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 lg:gap-8 mb-10 lg:mb-16">
          <div><h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">Seat Management</h3><p className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Configure study spaces</p></div>
          <div className="flex flex-wrap gap-3 lg:gap-4 w-full md:w-auto">
             <form onSubmit={handleAddSeat} className="flex gap-2 flex-1 md:flex-initial">
                <input placeholder="G1" className="flex-1 md:w-24 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase text-white outline-none focus:border-emerald-500/50" value={newSeat} onChange={e => setNewSeat(e.target.value)} />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-[9px] lg:text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all shrink-0">Add</button>
             </form>
             <button onClick={handleInitialize} disabled={isInitializing} className="flex-1 md:flex-initial px-4 lg:px-6 py-2 border border-emerald-500/20 text-emerald-400 text-[9px] lg:text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500/10 transition-all disabled:opacity-50 shrink-0">
                {isInitializing ? '...' : 'Auto-Setup'}
             </button>
          </div>
       </div>

       <div className="flex flex-wrap gap-4 lg:gap-8 mb-8 lg:mb-10 pb-8 lg:pb-10 border-b border-white/5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div><span className="text-[9px] lg:text-[10px] text-slate-500 uppercase font-black">Occupied</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800"></div><span className="text-[9px] lg:text-[10px] text-slate-500 uppercase font-black">Available</span></div>
          <div className="ml-auto text-[9px] lg:text-[10px] text-slate-500 uppercase font-black">Total: {seats.length}</div>
       </div>

       <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 lg:gap-6">
          {seats.sort((a,b) => a.seatNumber.localeCompare(b.seatNumber, undefined, {numeric: true})).map(seat => {
            const student = students.find(s => s.seat === seat.seatNumber);
            return (
              <div key={seat._id} className={`aspect-square rounded-xl lg:rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group relative ${student ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' : 'border-slate-800 bg-slate-900/40 text-slate-600 hover:border-slate-600'}`}>
                 <span className="text-[9px] lg:text-[10px] font-black">{seat.seatNumber}</span>
                 <div className={`w-1.5 h-0.5 rounded-full ${student ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                 
                 <button onClick={(e) => { e.stopPropagation(); handleDeleteSeat(seat._id); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                    <X size={10} strokeWidth={4} />
                 </button>

                 {student && (
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 border border-emerald-500/30 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap shadow-2xl">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{student.fullName}</p>
                   </div>
                 )}
              </div>
            );
          })}
       </div>
    </Card>
  );
}

function NewsView({ notifications, onRefresh, onAdd }) {
    const deleteNote = async (id) => {
        if (!id) return;
        if (!window.confirm('Delete announcement?')) return;
        try { await axios.delete(`${API_URL}/notifications/${id}`); onRefresh(); } catch (err) { alert('Delete failed'); }
    };
    return (
        <Card noPadding className="border-emerald-500/10">
            <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20 flex justify-between items-center">
                <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><Bell className="text-emerald-500" size={18} /> Announcements</h3>
                <button onClick={onAdd} className="px-4 lg:px-6 py-2 rounded-xl bg-emerald-600 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"><Plus size={14} /> <span className="hidden sm:inline">New Message</span></button>
            </div>
            <div className="divide-y divide-white/5">
                {notifications.map(n => (
                    <div key={n._id} className="p-6 lg:p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                        <div className="flex gap-4 lg:gap-6 min-w-0">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><MessageSquare size={18} lg:size={20} /></div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 lg:gap-3 mb-1 flex-wrap">
                                    <p className="text-xs lg:text-sm font-black text-white uppercase truncate">{n.title}</p>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[7px] lg:text-[8px] font-black text-slate-400 uppercase">TO: {n.recipient}</span>
                                </div>
                                <p className="text-[10px] lg:text-xs text-slate-400 font-bold leading-relaxed truncate lg:whitespace-normal">{n.message}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteNote(n._id)} className="p-2 text-slate-600 hover:text-rose-500 transition-opacity"><Trash2 size={16} lg:size={18} /></button>
                    </div>
                ))}
                {notifications.length === 0 && <div className="p-10 lg:p-20 text-center text-slate-600 uppercase font-black tracking-widest text-xs">No broadcast messages</div>}
            </div>
        </Card>
    );
}

function NotificationForm({ students, onClose, onRefresh }) {
    const [formData, setFormData] = useState({ title: '', message: '', recipient: 'All', type: 'General' });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await axios.post(`${API_URL}/notifications`, formData); onRefresh(); onClose(); } catch (err) { alert('Failed to send'); }
        finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-emerald-500/30 relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all text-slate-500"><X size={24} /></button>
                <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter mb-8">Send Message</h3>
                <form className="space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient</label><select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.recipient} onChange={e=>setFormData({...formData, recipient: e.target.value})}><option value="All">All Students</option>{students.map(s => (<option key={s._id} value={s.studyId}>{s.fullName} ({s.studyId})</option>))}</select></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label><textarea required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none h-32" value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} /></div>
                    <button disabled={loading} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3"><Send size={16} /> {loading ? 'SENDING...' : 'Send Message'}</button>
                </form>
            </Card>
        </div>
    );
}

function ExpensesTable({ expenses, onRefresh, onAdd }) {
    return (
        <Card noPadding className="border-rose-500/10">
           <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20 flex justify-between items-center">
              <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Expense Records</h3>
              <button onClick={onAdd} className="px-4 lg:px-6 py-2 rounded-xl bg-rose-600 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all"><Plus size={14} /> Add</button>
           </div>
           <div className="divide-y divide-white/5">
              {expenses.map(e => (
                 <div key={e._id} className="p-4 lg:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                    <div className="flex items-center gap-3 lg:gap-5 min-w-0">
                       <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0"><TrendingDown size={18} /></div>
                       <div className="min-w-0"><p className="text-xs lg:text-sm font-black text-white uppercase truncate">{e.title}</p><p className="text-[8px] lg:text-[10px] text-slate-500 font-bold uppercase mt-1 truncate">{e.category} • {new Date(e.date).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                        <p className="text-xs lg:text-sm font-black text-rose-400 font-mono">₹{e.amount.toLocaleString()}</p>
                        <button onClick={async () => { if(window.confirm('Delete expense?')) { await axios.delete(`${API_URL}/expenses/${e._id}`); onRefresh(); } }} className="p-2 text-slate-600 hover:text-rose-500 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                 </div>
              ))}
              {expenses.length === 0 && <div className="p-10 lg:p-20 text-center text-slate-600 uppercase font-black tracking-widest text-xs">No records found</div>}
           </div>
        </Card>
    );
}

function ExpenseForm({ onClose, onRefresh }) {
    const [formData, setFormData] = useState({ title: '', amount: '', category: 'General', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await axios.post(`${API_URL}/expenses`, formData); onRefresh(); onClose(); } catch (err) { alert('Failed'); }
        finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <Card className="w-full max-w-md border-rose-500/30 relative">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all text-slate-500"><X size={24} /></button>
              <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter mb-8">Record Expense</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                 <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-rose-500/50 outline-none" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label><input required type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-rose-500/50 outline-none" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} /></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label><select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-rose-500/50 outline-none" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}><option value="Rent">Rent</option><option value="Electricity">Electricity</option><option value="Internet">Internet</option><option value="Furniture">Furniture</option><option value="Maintenance">Maintenance</option><option value="General">General</option></select></div></div>
                 <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label><input required type="date" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-rose-500/50 outline-none" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} /></div>
                 <button disabled={loading} className="w-full py-5 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl">{loading ? 'PROCESSING...' : 'Confirm Expense'}</button>
              </form>
           </Card>
        </div>
    );
}

function PaymentsTable({ students, onCollect }) {
    const sendReminder = (s) => {
        if (s.dueAmount <= 0) return alert('No outstanding balance.');
        
        const message = `Dear ${s.fullName}, your pending fee is Rs.${s.dueAmount.toLocaleString()}. Please clear it soon. Thank you!`;
        
        // Clean phone number and add country code
        let phone = s.phone.replace(/\D/g, '');
        if (phone.length === 10) phone = `91${phone}`;
        
        // Trigger WhatsApp immediately to avoid pop-up blockers
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        // Send internal notification in the background
        axios.post(`${API_URL}/notifications`, { 
            title: 'Fee Reminder', 
            message, 
            recipient: s.studyId, 
            type: 'Fee Reminder' 
        }).catch(err => console.error('Internal notification failed', err));
    };
    return (
        <Card noPadding className="border-emerald-500/10">
           <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20"><h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Fee Records</h3></div>
           <div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]"><thead className="text-[10px] text-slate-500 uppercase tracking-widest font-black bg-slate-950/30 border-b border-white/5"><tr><th className="px-6 lg:px-10 py-4 lg:py-6">Student</th><th className="px-6 lg:px-10 py-4 lg:py-6">Fee</th><th className="px-6 lg:px-10 py-4 lg:py-6">Paid</th><th className="px-6 lg:px-10 py-4 lg:py-6">Due</th><th className="px-6 lg:px-10 py-4 lg:py-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{students.map(s => (<tr key={s._id} className="hover:bg-white/[0.03] transition-colors group text-xs lg:text-sm font-black"><td className="px-6 lg:px-10 py-4 lg:py-6"><p className="text-white uppercase truncate max-w-[150px]">{s.fullName}</p><p className="text-[9px] text-slate-500 uppercase">{s.studyId}</p></td><td className="px-6 lg:px-10 py-4 lg:py-6 text-slate-300">₹{s.monthlyFee}</td><td className="px-6 lg:px-10 py-4 lg:py-6 text-emerald-400">₹{s.paidAmount}</td><td className="px-6 lg:px-10 py-4 lg:py-6 text-rose-400 font-mono">₹{s.dueAmount}</td><td className="px-6 lg:px-10 py-4 lg:py-6 text-right flex justify-end gap-1"><button onClick={() => onCollect(s)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><DollarSign size={16} /></button><button onClick={() => sendReminder(s)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><MessageCircle size={16} /></button></td></tr>))}</tbody></table></div>
        </Card>
    );
}

function PaymentForm({ student, onClose, onRefresh }) {
    const [formData, setFormData] = useState({ studentId: student._id, studentName: student.fullName, amount: student.dueAmount, method: 'UPI', month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), paymentDate: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await axios.post(`${API_URL}/payments`, formData); onRefresh(); onClose(); } catch (err) { alert('Failed'); }
        finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <Card className="w-full max-w-md border-emerald-500/30 relative">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all text-slate-500"><X size={24} /></button>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Collect Fee</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                 <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Student</p><p className="text-lg font-black text-white uppercase truncate">{student.fullName}</p></div>
                 <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label><input required type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} /></div><div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Method</label><select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.method} onChange={e=>setFormData({...formData, method: e.target.value})}><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option></select></div></div>
                 <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Month</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.month} onChange={e=>setFormData({...formData, month: e.target.value})} /></div><div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label><input required type="date" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.paymentDate} onChange={e=>setFormData({...formData, paymentDate: e.target.value})} /></div></div>
                 <button disabled={loading} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">{loading ? 'PROCESSING...' : 'Confirm Payment'}</button>
              </form>
           </Card>
        </div>
    );
}

function ComplaintsView({ complaints, onRefresh }) {
    const updateStatus = async (id, status) => { try { await axios.patch(`${API_URL}/complaints/${id}`, { status }); onRefresh(); } catch (err) {} };
    return (
        <Card noPadding className="border-blue-500/10">
            <div className="p-6 lg:p-8 border-b border-white/5 bg-slate-950/20"><h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><MessageSquare className="text-blue-500" size={18} /> Student Requests</h3></div>
            <div className="divide-y divide-white/5">
                {complaints.map(c => (
                    <div key={c._id} className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all">
                        <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-3"><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shrink-0 ${c.type === 'Complaint' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{c.type}</span><p className="text-xs lg:text-sm font-black text-white uppercase truncate">{c.subject}</p></div>
                            <p className="text-[10px] lg:text-xs text-slate-400 font-bold truncate lg:whitespace-normal">{c.message}</p>
                            <p className="text-[8px] lg:text-[10px] text-slate-600 font-black uppercase tracking-widest">By {c.studentName} • {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <select className={`bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[9px] lg:text-[10px] font-black uppercase outline-none shrink-0 ${c.status === 'Resolved' ? 'text-emerald-400' : 'text-amber-400'}`} value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select>
                    </div>
                ))}
                {complaints.length === 0 && <div className="p-10 lg:p-20 text-center text-slate-600 uppercase font-black tracking-widest text-xs">No active requests</div>}
            </div>
        </Card>
    );
}

const StudentForm = ({ initialData, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '', studyId: `SP-${Math.floor(1000 + Math.random() * 9000)}`, course: '', monthlyFee: 1500, seat: '', securityDeposit: 0, status: 'Active' });
  useEffect(() => { if (initialData) setFormData({ ...initialData, password: '' }); }, [initialData]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await axios.patch(`${API_URL}/students/${initialData._id}`, updateData);
      } else {
        await axios.post(`${API_URL}/students`, { ...formData, dueAmount: formData.monthlyFee });
      }
      onRefresh(); onClose();
    } catch (err) { alert('Failure'); } 
    finally { setIsSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
       <Card className="w-full max-w-2xl border-emerald-500/30 max-h-[90vh] overflow-y-auto relative custom-scrollbar">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all text-slate-500"><X size={24} /></button>
          <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter mb-8">{initialData ? 'Update Profile' : 'Enroll Student'}</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label><input required type="email" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.course} onChange={e=>setFormData({...formData, course: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monthly Fee</label><input required type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seat</label><input required placeholder="A1" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.seat} onChange={e=>setFormData({...formData, seat: e.target.value.toUpperCase()})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Study ID</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.studyId} onChange={e=>setFormData({...formData, studyId: e.target.value.toUpperCase()})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security</label><input type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.securityDeposit} onChange={e=>setFormData({...formData, securityDeposit: e.target.value})} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label><select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{initialData ? 'Reset Pass' : 'Password'}</label><input type="password" placeholder="••••••••" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-emerald-500/50 outline-none" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} /></div>
             <button disabled={isSubmitting} className="col-span-full mt-4 py-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl disabled:opacity-50">{isSubmitting ? 'PROCESSING...' : initialData ? 'Update' : 'Enroll'}</button>
          </form>
       </Card>
    </div>
  );
};
