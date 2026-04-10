import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, Timestamp, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CheckSquare, Plus, Clock, AlertCircle, Github, GitBranch, GitPullRequest, MessageSquare, Filter, LayoutGrid, List as ListIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Testing' | 'Done';
  deadline?: Timestamp;
  issueNumber: number;
  branchName?: string;
}

const STATUS_COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done'] as const;

export function TaskManagement({ profile }: { profile: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let q = query(collection(db, 'tasks'), orderBy('issueNumber', 'desc'));
    if (selectedProjectId !== 'all') {
      q = query(collection(db, 'tasks'), where('projectId', '==', selectedProjectId));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tks);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    return () => unsubscribe();
  }, [selectedProjectId]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
            <Github className="w-3 h-3" />
            <span>Development Pipeline</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">Tasks & Issues</h1>
          <p className="text-muted-foreground font-light">Track development progress and manage GitHub-style issues.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[180px] bg-transparent border-none h-8 text-xs focus:ring-0">
                <SelectValue placeholder="Filter by Project" />
              </SelectTrigger>
              <SelectContent className="glass border-border text-foreground">
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> New Issue
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-1">
          <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
            <TabsTrigger value="board" className="bg-transparent border-none p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground transition-all flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Kanban Board</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="bg-transparent border-none p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground transition-all flex items-center gap-2">
              <ListIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Issue List</span>
            </TabsTrigger>
            <TabsTrigger value="prs" className="bg-transparent border-none p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground transition-all flex items-center gap-2">
              <GitPullRequest className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Pull Requests</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="mt-8">
          <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] custom-scrollbar">
            {STATUS_COLUMNS.map(status => (
              <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-5">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground italic">{status}</h3>
                    <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                      {tasks.filter(t => t.status === status).length}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-accent">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="flex-1 bg-muted/20 rounded-2xl p-3 border border-dashed border-border space-y-4 min-h-[500px]">
                  <AnimatePresence>
                    {tasks.filter(t => t.status === status).map(task => (
                      <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-8">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {tasks.map(task => (
                  <motion.div 
                    key={task.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 flex items-start gap-5 hover:bg-muted/30 transition-all group"
                  >
                    <div className="mt-1">
                      {task.status === 'Done' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <CheckSquare className="w-3 h-3 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-border">
                          <AlertCircle className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">#{task.issueNumber}</span>
                      </div>
                      <div className="flex items-center gap-5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {task.deadline ? format(task.deadline.toDate(), 'MMM d') : 'No deadline'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" /> 2 comments
                        </span>
                        {task.branchName && (
                          <span className="flex items-center gap-1.5 text-primary/80">
                            <GitBranch className="w-3 h-3" /> {task.branchName}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                      task.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      task.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {task.priority}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prs" className="mt-8">
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground space-y-6 glass-card rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border">
              <GitPullRequest className="w-10 h-10 opacity-20" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-display font-bold text-lg">No active pull requests</p>
              <p className="text-sm font-light">Start a new feature branch to create a merge request.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-8 h-10 bg-muted/50 border-border hover:bg-primary hover:text-primary-foreground transition-all">
              Create Pull Request
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: Task, onStatusChange: any, key?: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="glass-card group overflow-hidden">
        <div className={`h-1 w-full ${
          task.priority === 'urgent' ? 'bg-red-500' :
          task.priority === 'high' ? 'bg-amber-500' :
          task.priority === 'medium' ? 'bg-primary' :
          'bg-zinc-700'
        }`} />
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{task.issueNumber}</span>
            <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest h-5 px-2 rounded-full ${
              task.priority === 'urgent' ? 'border-red-500/50 text-red-400 bg-red-500/5' :
              task.priority === 'high' ? 'border-amber-500/50 text-amber-400 bg-amber-500/5' :
              'border-border text-muted-foreground bg-muted'
            }`}>
              {task.priority}
            </Badge>
          </div>
          <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{task.title}</h4>
          
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex -space-x-2">
              <Avatar className="w-7 h-7 border-2 border-background ring-1 ring-border">
                <AvatarFallback className="text-[8px] font-bold bg-muted">JD</AvatarFallback>
              </Avatar>
            </div>
            {task.branchName && (
              <div className="flex items-center gap-1.5 text-[9px] text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <GitBranch className="w-3 h-3" />
                {task.branchName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


