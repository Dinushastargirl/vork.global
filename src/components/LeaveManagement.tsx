import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, Timestamp, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar as CalendarIcon, Plus, Check, X, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'vacation' | 'personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export function LeaveManagement({ profile }: { profile: any }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'vacation' as any,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  });

  useEffect(() => {
    if (!profile) return;
    let q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    if (profile.role !== 'admin' && profile.role !== 'manager') {
      q = query(collection(db, 'leaves'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leaves'));

    return () => unsubscribe();
  }, [profile]);

  const handleApplyLeave = async () => {
    if (!profile) return;
    try {
      await addDoc(collection(db, 'leaves'), {
        ...newLeave,
        userId: profile.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      setIsApplyOpen(false);
      toast.success('Leave application submitted');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leaves');
    }
  };

  const handleAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'leaves', leaveId), {
        status,
        approvedBy: profile?.uid
      });
      toast.success(`Leave request ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leaves/${leaveId}`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
            <CalendarIcon className="w-3 h-3" />
            <span>Time Off Tracking</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">Leave Management</h1>
          <p className="text-muted-foreground font-light">Request time off and manage team leave approvals.</p>
        </div>
        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 h-11 px-6">
              <Plus className="w-4 h-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border text-foreground max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Apply for Leave</DialogTitle>
              <CardDescription className="text-muted-foreground font-light">Submit a new leave request for approval.</CardDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Leave Type</Label>
                <span className="block">
                  <Select value={newLeave.type} onValueChange={(v) => setNewLeave({...newLeave, type: v})}>
                    <SelectTrigger className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border text-foreground">
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                  <Input 
                    type="date" 
                    value={newLeave.startDate} 
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/30" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                  <Input 
                    type="date" 
                    value={newLeave.endDate} 
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/30" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reason</Label>
                <Input 
                  value={newLeave.reason} 
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/30" 
                  placeholder="Optional reason for leave"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setIsApplyOpen(false)} className="rounded-xl h-11">Cancel</Button>
              <Button onClick={handleApplyLeave} className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20">Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle className="text-xl font-display font-bold">Leave Requests</CardTitle>
          <CardDescription className="text-xs font-light">History and status of leave applications.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Duration</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                {(profile?.role === 'admin' || profile?.role === 'manager') && (
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id} className="border-border hover:bg-muted/30 transition-colors group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        leave.type === 'vacation' ? 'bg-primary' :
                        leave.type === 'sick' ? 'bg-red-500' :
                        'bg-amber-500'
                      }`} />
                      <span className="capitalize font-bold text-sm tracking-tight">{leave.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Applied {format(leave.createdAt.toDate(), 'MMM d')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-light max-w-[200px] truncate">
                    {leave.reason || 'No reason provided'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                      leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      leave.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {leave.status}
                    </Badge>
                  </TableCell>
                  {(profile?.role === 'admin' || profile?.role === 'manager') && leave.status === 'pending' && (
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleAction(leave.id, 'approved')}
                          variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleAction(leave.id, 'rejected')}
                          variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {leaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-light italic">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
