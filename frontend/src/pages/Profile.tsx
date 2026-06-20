import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Building, CheckCircle, XCircle } from 'lucide-react';
import { userApi } from '../lib/api';
import { Button, Card, Loading } from '../components/common';

const Profile: React.FC = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
  });

  if (isLoading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-600">Failed to load profile</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center mb-6">
                <div className="p-4 bg-indigo-100 rounded-full mr-4">
                  <User className="h-12 w-12 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-3 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.collegeName && (
                  <div className="flex items-center text-gray-600">
                    <Building className="h-5 w-5 mr-3 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">College</p>
                      <p>{user.collegeName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button fullWidth>Edit Profile</Button>
              </div>
            </Card>
          </div>

          {/* Status Card */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Completed</span>
                  {user.profileCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  {user.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" fullWidth size="sm">
                  View Registrations
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Browse Events
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// Made with Bob
