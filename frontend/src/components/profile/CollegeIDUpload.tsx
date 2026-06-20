import React, { useState } from 'react';
import Button from '../common/Button';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';

interface CollegeIDUploadProps {
  onUpload: (file: File) => void;
  onCancel?: () => void;
  loading?: boolean;
  currentFileUrl?: string;
  isVerified?: boolean;
}

export const CollegeIDUpload: React.FC<CollegeIDUploadProps> = ({
  onUpload,
  onCancel,
  loading = false,
  currentFileUrl,
  isVerified = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image (JPG, PNG) or PDF file';
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentFileUrl || null);
    setError('');
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    onUpload(selectedFile);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12 text-gray-400" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="w-12 h-12 text-blue-500" />;
    }
    return <FileText className="w-12 h-12 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      {isVerified ? (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">College ID Verified</p>
            <p className="text-xs text-green-700">
              Your college ID has been verified by our team
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">Verification Pending</p>
            <p className="text-xs text-yellow-700">
              Upload your college ID for verification to participate in events
            </p>
          </div>
        </div>
      )}

      {/* Current File Display */}
      {currentFileUrl && !selectedFile && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">Current College ID:</p>
          {currentFileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={currentFileUrl}
              alt="Current College ID"
              className="max-w-full h-auto max-h-64 rounded-lg border border-blue-300"
            />
          ) : (
            <div className="flex items-center text-blue-700">
              <FileText className="w-5 h-5 mr-2" />
              <span className="text-sm">Document uploaded</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="college-id-file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFileChange}
          disabled={loading}
        />

        <label
          htmlFor="college-id-file"
          className="flex flex-col items-center justify-center p-8 cursor-pointer"
        >
          {selectedFile ? (
            <div className="text-center">
              {getFileIcon()}
              <p className="mt-4 text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-sm font-medium text-gray-700">
                <span className="text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG or PDF (MAX. 5MB)
              </p>
            </div>
          )}
        </label>

        {/* Remove Button */}
        {selectedFile && !loading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Preview */}
      {preview && selectedFile?.type.startsWith('image/') && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Preview:</p>
          <img
            src={preview}
            alt="College ID Preview"
            className="max-w-full h-auto max-h-96 rounded-lg border-2 border-gray-300 shadow-sm"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Upload Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Upload a clear photo of your college ID card</li>
          <li>Ensure all text is readable and not blurred</li>
          <li>Accepted formats: JPG, PNG, or PDF</li>
          <li>Maximum file size: 5MB</li>
          <li>Your ID will be verified within 24-48 hours</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
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
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          isLoading={loading}
          className="flex-1"
          leftIcon={<Upload className="w-4 h-4" />}
        >
          {currentFileUrl ? 'Update College ID' : 'Upload College ID'}
        </Button>
      </div>
    </div>
  );
};

// Made with Bob