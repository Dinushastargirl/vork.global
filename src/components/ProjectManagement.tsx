import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, Timestamp, where, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Briefcase, Github, Users, Plus, ExternalLink, MoreVertical, Sparkles, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  name: string;
  description: string;
  repositoryName: string;
  ownerId: string;
  members: string[];
  status: 'active' | 'archived' | 'completed';
  createdAt: Timestamp;
}

export function ProjectManagement({ profile }: { profile: any }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    repositoryName: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    return () => unsubscribe();
  }, []);

  const handleCreateProject = async () => {
    if (!profile || !newProject.name) return;
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        ownerId: profile.uid,
        members: [profile.uid],
        status: 'active',
        createdAt: Timestamp.now(),
      });
      setIsCreateOpen(false);
      setNewProject({ name: '', description: '', repositoryName: '' });
      toast.success('Project created successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3" />
            <span>Project Hub</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">Projects</h1>
          <p className="text-muted-foreground font-light">Manage your agency's client projects and repositories.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 h-11 px-6">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 text-foreground max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Create New Project</DialogTitle>
              <CardDescription className="text-muted-foreground font-light">Set up a new workflow for your client.</CardDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Name</Label>
                <Input 
                  id="name" 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/30" 
                  placeholder="e.g. Nexus Core AI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                <Input 
                  id="desc" 
                  value={newProject.description} 
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/30" 
                  placeholder="Brief overview of the project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Repository Name</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-white/5 border border-white/10 rounded-xl text-muted-foreground text-xs font-mono">
                    agency/
                  </div>
                  <Input 
                    id="repo" 
                    value={newProject.repositoryName} 
                    onChange={(e) => setNewProject({...newProject, repositoryName: e.target.value})}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/30" 
                    placeholder="nexus-core-ai"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11">Cancel</Button>
              <Button onClick={handleCreateProject} className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20">Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="glass-card group overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-4 relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-6 text-2xl font-display font-bold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px] font-light text-sm mt-2">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Github className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[100px]">{project.repositoryName || 'No repo'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl bg-white/5 border-white/5 hover:bg-primary hover:text-white transition-all group/btn">
                      Board <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl bg-white/5 border-white/5 hover:bg-zinc-800 transition-all">
                      <Github className="w-3.5 h-3.5" /> Repo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
