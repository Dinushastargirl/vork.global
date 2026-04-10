import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, Timestamp, addDoc, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Clock, UserCheck, UserX, Search, Filter, Sparkles, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  jobTitle?: string;
  photoURL?: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: Timestamp;
  checkOut?: Timestamp;
  status: 'present' | 'absent' | 'late';
}

export function HRManagement({ profile }: { profile: UserProfile | null }) {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setEmployees(users);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'attendance'), 
      where('userId', '==', profile.uid),
      where('date', '==', today)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTodayRecord({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceRecord);
      } else {
        setTodayRecord(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'attendance'));

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'attendance'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      setAttendance(records);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'attendance'));

    return () => unsubscribe();
  }, []);

  const handleCheckIn = async () => {
    if (!profile) return;
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();
      const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      
      await addDoc(collection(db, 'attendance'), {
        userId: profile.uid,
        date: today,
        checkIn: Timestamp.now(),
        status: isLate ? 'late' : 'present'
      });
      toast.success('Successfully checked in');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'attendance');
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    try {
      await updateDoc(doc(db, 'attendance', todayRecord.id), {
        checkOut: Timestamp.now()
      });
      toast.success('Successfully checked out');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `attendance/${todayRecord.id}`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3" />
            <span>Talent Management</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">HR Management</h1>
          <p className="text-muted-foreground font-light">Manage your team and track daily attendance.</p>
        </div>
        <div className="flex gap-3">
          {!todayRecord ? (
            <Button onClick={handleCheckIn} className="gap-2 rounded-xl shadow-lg shadow-primary/20 h-11 px-6">
              <UserCheck className="w-4 h-4" /> Check In
            </Button>
          ) : !todayRecord.checkOut ? (
            <Button onClick={handleCheckOut} variant="outline" className="gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 h-11 px-6 rounded-xl">
              <UserX className="w-4 h-4" /> Check Out
            </Button>
          ) : (
            <Badge variant="outline" className="h-11 px-6 text-muted-foreground border-white/5 bg-white/5 rounded-xl font-mono text-[10px] uppercase tracking-widest">
              Shift Completed
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02]">
            <div>
              <CardTitle className="text-xl font-display font-bold">Employee Directory</CardTitle>
              <CardDescription className="text-xs font-light">A list of all team members and their roles.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6">Employee</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.uid} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 ring-2 ring-white/5 group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={emp.photoURL} />
                          <AvatarFallback className="bg-zinc-800 font-bold">{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight">{emp.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{emp.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{emp.jobTitle || 'Team Member'}</span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{emp.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-lg font-display font-bold">Today's Attendance</CardTitle>
            <CardDescription className="text-xs font-light">Real-time tracking of team presence.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {employees.map(emp => {
                const record = attendance.find(a => a.userId === emp.uid && a.date === format(new Date(), 'yyyy-MM-dd'));
                return (
                  <motion.div 
                    key={emp.uid} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 ring-1 ring-white/5 group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={emp.photoURL} />
                        <AvatarFallback className="bg-zinc-800 text-[10px] font-bold">{emp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">{emp.name}</span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">{emp.jobTitle || 'Team Member'}</span>
                      </div>
                    </div>
                    {record ? (
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`rounded-full px-2 py-0 text-[8px] font-bold uppercase tracking-widest ${
                          record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          record.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {record.status}
                        </Badge>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {format(record.checkIn.toDate(), 'HH:mm')}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="rounded-full px-2 py-0 text-[8px] font-bold uppercase tracking-widest bg-white/5 text-muted-foreground border-white/5">
                        Offline
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
