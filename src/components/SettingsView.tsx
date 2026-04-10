import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

export function SettingsView({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    jobTitle: profile?.jobTitle || '',
    role: profile?.role || 'employee',
  });

  const handleUpdateProfile = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details and role within the agency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-zinc-800 border-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={profile?.email} 
                disabled 
                className="bg-zinc-800 border-zinc-700 opacity-50 cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                value={formData.jobTitle} 
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="bg-zinc-800 border-zinc-700" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as any})}
                disabled={profile?.role !== 'admin'}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              {profile?.role !== 'admin' && (
                <p className="text-[10px] text-zinc-500">Only admins can change roles.</p>
              )}
            </div>
          </div>
          
          <Separator className="bg-zinc-800" />
          
          <div className="flex justify-end">
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-zinc-500">Receive daily summaries and urgent task alerts.</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Slack Integration</Label>
              <p className="text-xs text-zinc-500">Connect your agency's Slack workspace.</p>
            </div>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
