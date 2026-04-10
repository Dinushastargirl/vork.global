/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  Github,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { HRManagement } from './components/HRManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { TaskManagement } from './components/TaskManagement';
import { LeaveManagement } from './components/LeaveManagement';
import { SettingsView } from './components/SettingsView';

// Types
type View = 'dashboard' | 'hr' | 'projects' | 'tasks' | 'leaves' | 'settings';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  jobTitle?: string;
  photoURL?: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Create default profile for new user
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'New Employee',
              email: currentUser.email || '',
              role: 'employee',
              jobTitle: 'AI Automation Specialist',
              photoURL: currentUser.photoURL || undefined,
            };
            await setDoc(doc(db, 'users', currentUser.uid), {
              ...newProfile,
              createdAt: Timestamp.now(),
            });
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-12 z-10"
        >
          <div className="flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 backdrop-blur-sm shadow-2xl shadow-primary/10"
            >
              <Briefcase className="w-10 h-10 text-primary" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-gradient"
            >
              NEXUS AI
            </motion.h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto font-light tracking-wide">
              The intelligent operating system for elite AI Automation Agencies.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="h-14 px-12 text-lg font-semibold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
            >
              Get Started
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Enterprise Grade Security</span>
            </div>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-8 border-t border-white/5">
            {[
              { icon: Users, label: 'HR & Talent' },
              { icon: LayoutDashboard, label: 'Project Hub' },
              { icon: Github, label: 'Dev Pipeline' }
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/30 transition-colors">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hr', label: 'HR Management', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'tasks', label: 'Tasks & Issues', icon: CheckSquare },
    { id: 'leaves', label: 'Leaves', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="relative flex flex-col border-r border-border bg-zinc-950/50 backdrop-blur-2xl z-30"
      >
        <div className="p-6 flex items-center gap-4 overflow-hidden">
          <div className="min-w-[40px] h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold text-xl tracking-tight whitespace-nowrap text-gradient"
            >
              NEXUS AI
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {sidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && sidebarOpen && (
                  <motion.div layoutId="active-nav-arrow" className="ml-auto">
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </button>
          
          <div className="mt-4 p-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-white/10 shadow-inner">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-zinc-800 text-xs font-bold">{profile?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-bold truncate tracking-tight">{profile?.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest truncate">{profile?.role}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-foreground transition-all"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-xs uppercase tracking-widest">NEXUS</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gradient">{currentView.replace('-', ' ')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search command..." 
                className="bg-white/5 border border-border rounded-full py-1.5 pl-10 pr-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 w-64 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-foreground relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background"></span>
              </button>
              <div className="h-4 w-[1px] bg-border mx-2" />
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground leading-none">{profile?.name.split(' ')[0]}</p>
                  <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter leading-none mt-1">Online</p>
                </div>
                <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-zinc-800 text-[10px]">{profile?.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentView === 'dashboard' && <Dashboard profile={profile} />}
              {currentView === 'hr' && <HRManagement profile={profile} />}
              {currentView === 'projects' && <ProjectManagement profile={profile} />}
              {currentView === 'tasks' && <TaskManagement profile={profile} />}
              {currentView === 'leaves' && <LeaveManagement profile={profile} />}
              {currentView === 'settings' && <SettingsView profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


