import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User, Upload } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button, Card, Input } from '../components/common';
import toast from 'react-hot-toast';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    collegeName: '',
  });
  const [collegeId, setCollegeId] = useState<File | null>(null);

  const completeMutation = useMutation({
    mutationFn: () => {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('collegeName', formData.collegeName);
      if (collegeId) {
        data.append('collegeId', collegeId);
      }
      return authApi.completeProfile(data);
    },
    onSuccess: (user) => {
      updateUser(user);
      toast.success('Profile completed successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId) {
      toast.error('Please upload your college ID');
      return;
    }
    completeMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCollegeId(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-indigo-600 rounded-full">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Please provide your details to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91 1234567890"
            />

            <Input
              label="College Name"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              required
              placeholder="ABC University"
            />

            {/* College ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College ID Proof <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                  {collegeId && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {collegeId.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your profile will be verified by our team before you can participate in events.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={completeMutation.isPending}
            >
              Complete Profile
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;

// Made with Bob
