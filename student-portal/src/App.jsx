import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, QrCode, LogOut, CheckCircle2, CreditCard, 
  Clock, RefreshCcw, Camera, Bell, Activity, MapPin, X, User, History,
  MessageSquare, Send, Plus, Trash2, Mail, Phone, Calendar, Menu, Settings
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API_URL = 'http://localhost:5005/api';

const Card = ({ children, className = "", glow = false }) => (
  <div className={`bg-[#111827]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:border-white/10 ${glow ? 'ring-1 ring-blue-500/30 shadow-blue-500/10' : ''} ${className}`}>
    <div className="p-6 md:p-10">{children}</div>
  </div>
);

const Badge = ({ children }) => (
  <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
    {children}
  </span>
);

export default function StudentApp() {
  const [student, setStudent] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scanned, setScanned] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student_user');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
    fetchAdminInfo();
  }, []);

  useEffect(() => {
    if (student?._id) {
      if (activeTab === 'Dashboard') {
        refreshStudentData();
        fetchNotifications();
      }
      if (activeTab === 'Support') fetchComplaints();
      if (activeTab === 'Payments') fetchPayments();
      if (activeTab === 'Profile') fetchAdminInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?._id, activeTab]);

  const fetchAdminInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/admin-info`);
      setAdminInfo(res.data);
    } catch (err) { console.error('Admin info fetch failed', err); }
  };

  const refreshStudentData = async () => {
    try {
      const res = await axios.get(`${API_URL}/students/${student._id}`);
      setStudent(res.data);
      localStorage.setItem('student_user', JSON.stringify(res.data));
    } catch (err) { console.error('Student refresh failed', err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      const relevant = res.data.filter(n => n.recipient === 'All' || n.recipient === student.studyId);
      setNotifications(relevant);
    } catch (err) { console.error(err); }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/payments/student/${student._id}`);
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/complaints/student/${student._id}`);
      setComplaints(res.data);
    } catch (err) { 
        console.error('Complaints fetch error:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/student/login`, {
        studyId: loginId.trim(),
        password
      });
      setStudent(res.data.student);
      localStorage.setItem('student_token', res.data.token);
      localStorage.setItem('student_user', JSON.stringify(res.data.student));
    } catch (err) {
      setError(err.response?.data?.message || 'AUTH_FAILED: Invalid Credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setStudent(null);
    localStorage.clear();
  };

  const startScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(async (decodedText) => {
        if (decodedText === "STUDY_HUB_AUTH_2026") {
          try {
            await axios.post(`${API_URL}/attendance/sync`, { studentId: student._id, type: 'In' });
            setScanned(true);
            scanner.clear();
            setTimeout(() => { setShowScanner(false); setScanned(false); }, 3000);
            refreshStudentData();
          } catch (err) { alert('Verification Failed'); }
        }
      });
    }, 100);
  };

  if (!student) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 scale-110 blur-sm" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
      </div>
      <Card className="w-full max-w-md z-10 border-white/10 bg-slate-900/40 backdrop-blur-2xl p-8 md:p-16">
         <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/40 transform -rotate-6">
            <ShieldCheck className="text-white" size={40} />
         </div>
         <h2 className="text-4xl font-black text-white text-center mb-2 uppercase tracking-tighter">STUDY HUB</h2>
         <p className="text-[10px] text-blue-500 font-black text-center mb-12 uppercase tracking-[0.5em]">Secure Student Access</p>
         
         <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Study ID</label>
               <input required placeholder="SP-XXXX" className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-black tracking-widest focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-slate-800" value={loginId} onChange={e => setLoginId(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Pin</label>
               <input required type="password" placeholder="••••••••" className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-black tracking-widest focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-slate-800" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-500 font-black uppercase tracking-widest text-center">{error}</div>}
            <button disabled={isLoggingIn} className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-50">
               {isLoggingIn ? 'LOGGING IN...' : 'Login to Portal'}
            </button>
         </form>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-16 antialiased relative overflow-hidden flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-radial-gradient from-blue-500/30 via-transparent to-transparent animate-pulse z-0"></div>
      
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 relative z-10 gap-6">
         <div className="space-y-4">
            <Badge>Student Dashboard Online</Badge>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">Welcome, {student.fullName.split(' ')[0]}</h1>
         </div>
         <div className="flex items-center gap-6 md:gap-10">
            <div className="text-right leading-none hidden sm:block">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Student Profile</p>
               <p className="text-lg font-black text-white uppercase">{student.studyId}</p>
            </div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-3xl border-2 border-blue-500/30 shadow-2xl flex items-center justify-center text-blue-400 font-black text-xl">{student.fullName.charAt(0)}</div>
         </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10 mb-32">
         <div className="lg:col-span-2 space-y-10">
            {activeTab === 'Dashboard' ? (
                <>
                    <Card glow={scanned} className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-blue-500/10 flex flex-col justify-center min-h-[450px]">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        <div className="flex-1 space-y-8 text-center md:text-left order-2 md:order-1">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">Mark Attendance</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-md">Scan the library QR code to record your attendance for today's session.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 md:p-8 rounded-[2rem] bg-slate-950/60 border border-white/5 shadow-inner">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-slate-500"><Activity size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Attendance</span></div>
                                <p className="text-3xl md:text-4xl font-black text-white leading-none">{student.attendancePercentage || 0}%</p>
                                </div>
                                <div className="p-6 md:p-8 rounded-[2rem] bg-slate-950/60 border border-white/5 shadow-inner">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-blue-400"><MapPin size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Assigned Seat</span></div>
                                <p className="text-3xl md:text-4xl font-black text-blue-400 leading-none">{student.seat}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={startScanner} className="relative group shrink-0 order-1 md:order-2">
                            <div className={`w-48 h-48 md:w-64 md:h-64 bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 flex items-center justify-center transition-all duration-1000 ${scanned ? 'scale-95 shadow-[0_0_100px_rgba(16,185,129,0.3)]' : 'group-hover:scale-105'}`}>
                                {scanned ? (
                                <div className="text-center animate-in zoom-in-50 duration-700">
                                    <CheckCircle2 size={80} className="text-emerald-500 mx-auto" strokeWidth={2.5} />
                                    <p className="text-sm font-black text-slate-900 uppercase mt-4 tracking-[0.2em]">Verified</p>
                                </div>
                                ) : (
                                <QrCode size={150} className="text-slate-900 transition-all duration-700 group-hover:rotate-90" />
                                )}
                            </div>
                            {!scanned && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/90 rounded-[2.5rem] md:rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-all text-white font-black uppercase tracking-[0.3em] text-[10px] gap-4 backdrop-blur-sm pointer-events-none px-4 text-center">
                                <Camera size={32} />
                                <span>Scan QR Code</span>
                                </div>
                            )}
                        </button>
                    </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="bg-slate-900/40 border-white/5 h-full">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                            <Bell className="text-blue-400" size={18} /> Latest Notifications
                        </h4>
                        <div className="space-y-8">
                            {notifications.slice(0, 3).map((n, i) => (
                                <div key={i} className="flex gap-5 group">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,1)] group-hover:scale-150 transition-transform"></div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase">{n.title}</p>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-bold">{n.message}</p>
                                </div>
                                </div>
                            ))}
                            {notifications.length === 0 && <p className="text-xs text-slate-600 italic uppercase font-black">No notifications</p>}
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5 h-full">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                            <CreditCard className="text-blue-400" size={18} /> Fee Status
                        </h4>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Fee</span>
                                <span className="text-sm font-black text-white font-mono">Rs.{student.monthlyFee}</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Paid Amount</span>
                                <span className="text-sm font-black text-emerald-400 font-mono">Rs.{student.paidAmount || 0}</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Balance Due</span>
                                <span className="text-sm font-black text-rose-400 font-mono">Rs.{student.dueAmount || 0}</span>
                            </div>
                        </div>
                    </Card>
                    </div>
                </>
            ) : activeTab === 'Payments' ? (
                <Card className="bg-slate-900/40 border-white/5 h-full">
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                        <History className="text-blue-400" size={18} /> Payment History
                    </h4>
                    <div className="overflow-x-auto -mx-6 md:mx-0">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.map(p => (
                                    <tr key={p._id} className="text-sm font-bold hover:bg-white/5 transition-all">
                                        <td className="px-6 py-4 text-white">{p.month}</td>
                                        <td className="px-6 py-4 text-emerald-400">Rs.{p.amount}</td>
                                        <td className="px-6 py-4 text-slate-400">{p.method}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {payments.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-slate-600 uppercase font-black text-xs">No records found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : activeTab === 'Support' ? (
                <div className="space-y-10">
                    <Card className="bg-slate-900/40 border-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-3">
                                <MessageSquare className="text-blue-400" size={18} /> Support Center
                            </h4>
                            <button onClick={() => setShowComplaintForm(true)} className="px-4 md:px-6 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20">
                                <Plus size={14} /> <span className="hidden sm:inline">New Request</span><span className="sm:hidden">New</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            {complaints.map(c => (
                                <div key={c._id} className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-6 group hover:border-blue-500/30 transition-all">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-white uppercase">{c.subject}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 font-bold">{c.message}</p>
                                        <p className="text-[9px] text-slate-600 mt-2 uppercase font-black tracking-widest">{new Date(c.createdAt).toLocaleDateString()} • {c.type}</p>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-4">
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {c.status}
                                        </div>
                                        <button onClick={async () => { if (window.confirm('Delete this request?')) { try { await axios.delete(`${API_URL}/complaints/${c._id}`); fetchComplaints(); } catch (err) { alert('Delete failed'); } } }} className="p-2 text-slate-500 hover:text-rose-500 transition-all">
                                          <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {complaints.length === 0 && <p className="text-xs text-slate-600 italic uppercase font-black text-center py-10">No requests sent yet</p>}
                        </div>
                    </Card>
                </div>
            ) : activeTab === 'Profile' ? (
                <div className="space-y-10 pb-32">
                    <Card className="bg-slate-900/40 border-white/5 overflow-hidden">
                    <div className="h-32 -mx-10 -mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                    <div className="flex flex-col items-center -mt-16 mb-10 relative z-10">
                        <div className="w-32 h-32 bg-slate-800 rounded-[3rem] border-4 border-[#020617] flex items-center justify-center text-blue-400 text-4xl font-black mb-4 uppercase shadow-2xl">
                            {student.fullName.charAt(0)}
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{student.fullName}</h3>
                        <div className="mt-2"><Badge>{student.studyId}</Badge></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ProfileField icon={MapPin} label="Seat Number" value={student.seat} />
                        <ProfileField icon={Calendar} label="Joining Date" value={student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : 'N/A'} />
                        <ProfileField icon={Mail} label="Email Address" value={student.email} />
                        <ProfileField icon={Phone} label="Phone Number" value={student.phone} />
                        <ProfileField icon={Activity} label="Attendance Rate" value={`${student.attendancePercentage || 0}%`} />
                        <ProfileField icon={Clock} label="Last Check-In" value={student.lastCheckIn} />
                    </div>
                    </Card>

                    

                    {adminInfo && (
                    <Card className="bg-slate-900/40 border-blue-500/10">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-3">
                                <ShieldCheck className="text-blue-400" size={18} /> Library Administration
                            </h4>
                            <div className="h-px flex-1 bg-white/5 mx-6 hidden sm:block"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 group hover:border-blue-500/30 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Administrator</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><User size={18} /></div>
                                    <p className="text-sm font-black text-white uppercase">{adminInfo.fullName}</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 group hover:border-blue-500/30 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Official Support</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Mail size={18} /></div>
                                    <p className="text-sm font-black text-blue-400 break-all">{adminInfo.email}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    )}
                    <Card className="bg-slate-900/40 border-emerald-500/10">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-3">
                                <Settings className="text-emerald-400" size={18} /> System Information
                            </h4>
                            <div className="h-px flex-1 bg-white/5 mx-6 hidden sm:block"></div>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-slate-950/60 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Architected & Developed By</p>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Aman Raj Verma</h3>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Full Stack Engineer</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Contact</p>
                                    <a href="mailto:amanrv2004@gmail.com" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black hover:bg-white/10 transition-all">
                                        <Mail size={14} className="text-emerald-400" /> amanrv2004@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : null}
         </div>

         <div className="hidden lg:block space-y-10">
            {activeTab === 'Profile' ? (
                <Card className="bg-slate-900/40 border-blue-500/10 h-full flex flex-col justify-center py-16">
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] mx-auto">
                        <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4 text-center">Security Protocol</h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest text-center px-10">Your account is secured with end-to-end encryption.</p>
                    <div className="mt-10 pt-10 border-t border-white/5 w-full px-10 space-y-4">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-600 tracking-widest"><span>Session ID</span><span className="text-emerald-500">Active</span></div>
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-600 tracking-widest"><span>IP Address</span><span className="text-white">Authorized</span></div>
                    </div>
                </Card>
            ) : (
                <Card className="bg-slate-900/40 border-white/5 h-full flex flex-col items-center justify-center gap-8 py-20 min-h-[500px]">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center text-blue-400 animate-pulse border border-blue-500/20">
                        <ShieldCheck size={48} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">System Status</p>
                        <p className="text-lg font-black text-white uppercase tracking-widest">Terminal Secured</p>
                        <div className="flex items-center justify-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                        Connection Active
                        </div>
                    </div>
                </Card>
            )}
         </div>
      </main>

      <nav className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-2 md:p-4 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] z-50 w-[90%] md:w-auto overflow-x-auto justify-center">
         {['Dashboard', 'Payments', 'Support', 'Profile'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 md:px-10 py-3 md:py-4 rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shrink-0 ${ activeTab === tab ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'text-slate-500 hover:text-white'}`}>
             {tab}
           </button>
         ))}
         <div className="w-[1px] h-8 bg-white/10 mx-1 md:mx-4 shrink-0"></div>
         <button onClick={handleLogout} className="p-3 md:p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"><LogOut size={20} /></button>
      </nav>

      {showScanner && (
          <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
             <Card className="w-full max-w-xl relative border-blue-500/30">
                <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 p-3 hover:bg-white/5 rounded-full transition-all"><X size={24} className="text-slate-500 hover:text-white" /></button>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-10">Attendance Scanner</h3>
                <div id="reader" className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50"></div>
                <p className="text-[9px] md:text-[10px] text-slate-500 text-center mt-10 font-black uppercase tracking-[0.3em]">Point camera at the library QR code</p>
             </Card>
          </div>
      )}

      {showComplaintForm && <ComplaintForm student={student} onClose={() => setShowComplaintForm(false)} onRefresh={fetchComplaints} />}
    </div>
  );
}

function ComplaintForm({ student, onClose, onRefresh }) {
    const [formData, setFormData] = useState({ studentId: student._id, studentName: student.fullName, studyId: student.studyId, subject: '', message: '', type: 'Complaint' });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/complaints`, formData);
            alert('Request sent successfully!');
            onRefresh();
            onClose();
        } catch (err) { alert('Failed to send request'); }
        finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
            <Card className="w-full max-w-md relative border-blue-500/30">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-all"><X size={24} className="text-slate-500 hover:text-white" /></button>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10">Submit Request</h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                        <select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-blue-500/50 outline-none appearance-none" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                            <option value="Complaint">Complaint</option>
                            <option value="Request">Request</option>
                        </select>
                    </div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label><input required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-blue-500/50 outline-none" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label><textarea required className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-blue-500/50 outline-none h-32" value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} /></div>
                    <button disabled={loading} className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                        <Send size={16} /> {loading ? 'SENDING...' : 'Send Signal'}
                    </button>
                </form>
            </Card>
        </div>
    );
}

function ProfileField({ icon: Icon, label, value }) {
    return (
        <div className="p-4 md:p-6 rounded-2xl bg-slate-950/60 border border-white/5 group hover:border-blue-500/30 transition-all flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 shrink-0">
                {Icon && <Icon size={18} />}
            </div>
            <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate">{label}</p>
                <p className="text-xs md:text-sm font-black text-white uppercase tracking-widest truncate">{value || 'N/A'}</p>
            </div>
        </div>
    );
}
