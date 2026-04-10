import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Briefcase, CheckSquare, Users, Calendar, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  jobTitle?: string;
  photoURL?: string;
}

export function Dashboard({ profile }: { profile: UserProfile | null }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
          <Sparkles className="w-3 h-3" />
          <span>System Overview</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-gradient">
          Welcome back, {profile?.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground font-light text-lg">
          Your agency's performance at a glance.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard 
          title="Active Projects" 
          value="12" 
          icon={Briefcase} 
          trend="+2" 
          description="Projects in delivery"
          variants={item}
        />
        <StatCard 
          title="Tasks Due" 
          value="08" 
          icon={CheckSquare} 
          trend="3" 
          trendLabel="Urgent"
          description="Pending completion"
          color="text-red-400"
          variants={item}
        />
        <StatCard 
          title="Team Presence" 
          value="94%" 
          icon={Users} 
          trend="18/20" 
          description="Members online"
          variants={item}
        />
        <StatCard 
          title="Leave Requests" 
          value="02" 
          icon={Calendar} 
          trend="Pending" 
          description="Requires review"
          color="text-amber-400"
          variants={item}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground font-light">Latest updates from your team and projects.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-mono uppercase tracking-widest hover:bg-accent">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="p-6 flex gap-5 items-start hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-all duration-300">
                    <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary font-bold">Alex Chen</span> merged PR <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">#42</span> in <span className="text-foreground/80 font-semibold italic">Nexus Core</span>
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">Feature/Auth-System</span>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] text-muted-foreground/60">Updated authentication flow for enterprise clients</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between group h-11 rounded-xl bg-muted/50 border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300" variant="outline">
                <span className="flex items-center gap-3">
                  <Clock className="w-4 h-4" /> 
                  <span className="text-sm font-medium">Check In Today</span>
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
              <Button className="w-full justify-between group h-11 rounded-xl bg-muted/50 border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300" variant="outline">
                <span className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> 
                  <span className="text-sm font-medium">Create Project</span>
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
              <Button className="w-full justify-between group h-11 rounded-xl bg-muted/50 border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300" variant="outline">
                <span className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" /> 
                  <span className="text-sm font-medium">Apply for Leave</span>
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">AI Insights</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your team's velocity increased by <span className="text-emerald-500 font-bold">12%</span> this week. Project "Nexus Core" is ahead of schedule.
                </p>
              </div>
              <Button size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-8">
                View Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendLabel, description, color = "text-foreground", variants }: any) {
  return (
    <motion.div variants={variants}>
      <Card className="glass-card group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-muted rounded-xl border border-border group-hover:border-primary/30 transition-colors">
              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                {trend}
                {trendLabel && <span className="text-[10px] text-muted-foreground font-normal ml-1">{trendLabel}</span>}
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-display font-bold ${color}`}>{value}</p>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-light italic">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
