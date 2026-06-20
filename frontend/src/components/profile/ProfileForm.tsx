import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Phone, Building2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '../../types';

interface ProfileFormProps {
  user: UserType;
  onSubmit: (data: ProfileFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  collegeName: string;
  collegeId?: File;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || '',
    phone: user.phone || '',
    collegeName: user.collegeName || '',
  });

  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null);
  const [collegeIdPreview, setCollegeIdPreview] = useState<string | null>(
    user.collegeId || null
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        collegeId: 'Please upload a valid image (JPG, PNG) or PDF file',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        collegeId: 'File size must be less than 5MB',
      }));
      return;
    }

    setCollegeIdFile(file);
    setErrors((prev) => ({ ...prev, collegeId: undefined }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollegeIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCollegeIdPreview(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required';
    }

    if (!user.collegeId && !collegeIdFile) {
      newErrors.collegeId = 'College ID proof is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      collegeId: collegeIdFile || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Verification Status */}
      {user.isVerified ? (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-semibold text-green-900">Profile Verified</p>
            <p className="text-xs text-green-700">Your profile has been verified by our team</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">Verification Pending</p>
            <p className="text-xs text-yellow-700">
              Please complete your profile and upload your college ID for verification
            </p>
          </div>
        </div>
      )}

      {/* Email (Read-only) */}
      <Input
        label="Email"
        type="email"
        value={user.email}
        disabled
        leftIcon={<User className="w-4 h-4 text-gray-400" />}
        helperText="Email cannot be changed"
      />

      {/* Name */}
      <Input
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        leftIcon={<User className="w-4 h-4 text-gray-400" />}
        error={errors.name}
        required
        disabled={loading}
        placeholder="Enter your full name"
      />

      {/* Phone */}
      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
        error={errors.phone}
        required
        disabled={loading}
        placeholder="10-digit mobile number"
        maxLength={10}
      />

      {/* College Name */}
      <Input
        label="College Name"
        type="text"
        value={formData.collegeName}
        onChange={(e) => handleInputChange('collegeName', e.target.value)}
        leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
        error={errors.collegeName}
        required
        disabled={loading}
        placeholder="Enter your college name"
      />

      {/* College ID Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          College ID Proof <span className="text-red-500">*</span>
        </label>

        {/* Current College ID */}
        {user.collegeId && !collegeIdFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              College ID already uploaded. Upload a new file to replace it.
            </p>
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="college-id-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              errors.collegeId
                ? 'border-red-300 bg-red-50 hover:bg-red-100'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${errors.collegeId ? 'text-red-500' : 'text-gray-400'}`} />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 5MB)</p>
            </div>
            <input
              id="college-id-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        </div>

        {/* Preview */}
        {collegeIdPreview && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={collegeIdPreview}
              alt="College ID Preview"
              className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* File Name */}
        {collegeIdFile && (
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium">{collegeIdFile.name}</span>
          </p>
        )}

        {/* Error */}
        {errors.collegeId && (
          <p className="text-sm text-red-600">{errors.collegeId}</p>
        )}

        <p className="text-xs text-gray-500">
          Upload a clear photo of your college ID card or admission letter
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          isLoading={loading}
          className="flex-1"
        >
          {user.profileCompleted ? 'Update Profile' : 'Complete Profile'}
        </Button>
      </div>
    </form>
  );
};

// Made with Bob