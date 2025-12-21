/**
 * Agent Profile Page with Offline Sync
 * Enhanced with offline editing capabilities
 */

'use client';

// Force dynamic rendering to avoid prerender errors with navigator
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAgentOfflineSync } from '@/hooks/useAgentOfflineSync';
import { OfflineSyncStatus } from '@/components/agent/OfflineSyncStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Edit,
  Save,
  X,
  WifiOff,
  CheckCircle,
  Camera
} from 'lucide-react';

interface AgentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  specialties: string[];
  joinedAt: string;
  isVerified: boolean;
  commissionRate: number;
  totalSales: number;
  activeleads: number;
}

export default function AgentProfilePage() {
  const { toast } = useToast();
  const {
    syncStatus,
    updateAgentProfileOffline,
  } = useAgentOfflineSync();

  // State
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AgentProfile>>({});
  const [uploading, setUploading] = useState(false);

  // Load profile
  const loadProfile = async () => {
    try {
      const response = await fetch('/api/agent/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setEditData(profileData);
      } else {
        throw new Error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (!syncStatus.isOnline) {
        toast({
          title: "📱 Offline Mode",
          description: "Showing cached profile. Changes will sync when online.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!editData) return;

    try {
      if (syncStatus.isOnline) {
        // Try online first
        const response = await fetch('/api/agent/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
          },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          const updatedProfile = await response.json();
          setProfile(updatedProfile);
          setEditing(false);
          toast({
            title: "✅ Profile Updated",
            description: "Your profile has been updated successfully",
          });
          return;
        } else {
          throw new Error('Online update failed');
        }
      } else {
        // Queue for offline sync
        await updateAgentProfileOffline(editData);
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...editData } : null);
        setEditing(false);
        
        toast({
          title: "📱 Profile Queued",
          description: "Profile changes saved offline and will sync when online",
        });
      }
    } catch (error) {
      // Fallback to offline mode
      await updateAgentProfileOffline(editData);
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...editData } : null);
      setEditing(false);

      toast({
        title: "📱 Saved Offline",
        description: "Profile changes saved and will sync when online",
      });
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      if (syncStatus.isOnline) {
        const response = await fetch('/api/agent/profile/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('agentToken')}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setProfile(prev => prev ? { ...prev, avatar: result.avatarUrl } : null);
          setEditData(prev => ({ ...prev, avatar: result.avatarUrl }));
          
          toast({
            title: "✅ Avatar Updated",
            description: "Your profile photo has been updated",
          });
          return;
        }
      }

      // For offline mode, create a local blob URL
      const avatarUrl = URL.createObjectURL(file);
      setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      setEditData(prev => ({ ...prev, avatar: avatarUrl }));
      
      // Queue the avatar update
      await updateAgentProfileOffline({ avatar: file.name });

      toast({
        title: "📱 Avatar Queued",
        description: "Avatar will be uploaded when online",
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Profile Not Found</h3>
            <p className="text-muted-foreground">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Agent Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional information {!syncStatus.isOnline && '(Offline Mode)'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OfflineSyncStatus showDetails={false} />
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
                {!syncStatus.isOnline && (
                  <WifiOff className="h-3 w-3 ml-2" />
                )}
              </Button>
              <Button variant="outline" onClick={() => {
                setEditing(false);
                setEditData(profile);
              }}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Offline Sync Status */}
      {(!syncStatus.isOnline || syncStatus.queuedCount > 0) && (
        <OfflineSyncStatus />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={profile.avatar} alt={profile.firstName} />
                <AvatarFallback className="text-lg">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              {editing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Camera className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                </div>
              )}
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <CardTitle className="flex items-center justify-center gap-2">
                {profile.firstName} {profile.lastName}
                {profile.isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </CardTitle>
              <p className="text-muted-foreground">Sales Agent</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${profile.totalSales.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Sales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {profile.activeleads}
                </div>
                <div className="text-xs text-muted-foreground">Active Leads</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {profile.phone}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {profile.location}
              </div>
              {profile.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">Commission Rate</div>
              <Badge variant="secondary" className="text-lg">
                {profile.commissionRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your professional information and specialties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={editData.location || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={editData.website || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about yourself..."
                    value={editData.bio || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialties">Specialties (comma separated)</Label>
                  <Input
                    id="specialties"
                    placeholder="SUVs, Luxury Cars, Electric Vehicles..."
                    value={editData.specialties?.join(', ') || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    }))}
                  />
                </div>

                {!syncStatus.isOnline && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <WifiOff className="h-4 w-4" />
                      <span className="font-medium">Offline Mode</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Changes will be saved locally and synced when you're back online.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">
                    {profile.bio || 'No bio provided yet.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties && profile.specialties.length > 0 ? (
                      profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No specialties listed</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}