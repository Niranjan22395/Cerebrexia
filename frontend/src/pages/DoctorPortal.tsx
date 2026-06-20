import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Stethoscope, CreditCard, Banknote, QrCode } from 'lucide-react';
import { doctorApi } from '../lib/api';
import { Button, Card, Input } from '../components/common';
import toast from 'react-hot-toast';

const DoctorPortal: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    paymentAmount: '',
    paymentMode: 'online' as 'cash' | 'online',
  });

  const submitMutation = useMutation({
    mutationFn: () => doctorApi.submitPayment({
      ...formData,
      paymentAmount: parseFloat(formData.paymentAmount),
    }),
    onSuccess: () => {
      toast.success('Payment submitted successfully!');
      setFormData({
        name: '',
        designation: '',
        email: '',
        phone: '',
        paymentAmount: '',
        paymentMode: 'online',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment submission failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-600 rounded-full">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Doctor Payment Portal
          </h1>
          <p className="text-lg text-gray-600">
            Submit your payment details securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Payment Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Dr. John Doe"
                />

                <Input
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  placeholder="Cardiologist"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />

                <Input
                  label="Payment Amount"
                  name="paymentAmount"
                  type="number"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  required
                  placeholder="5000"
                  leftIcon={<span className="text-gray-500">₹</span>}
                />

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: 'online' })}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center transition-all ${
                        formData.paymentMode === 'online'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      <span className="font-medium">Online</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: 'cash' })}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center transition-all ${
                        formData.paymentMode === 'cash'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Banknote className="h-5 w-5 mr-2" />
                      <span className="font-medium">Cash</span>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={submitMutation.isPending}
                >
                  {formData.paymentMode === 'online' ? 'Proceed to Payment' : 'Submit Details'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Finance QR & Info */}
          <div className="space-y-6">
            {/* Finance QR */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Finance QR Code
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Scan for payment verification
              </p>
            </Card>

            {/* Info Card */}
            <Card className="bg-indigo-50 border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">
                Important Information
              </h3>
              <ul className="text-sm text-indigo-800 space-y-2">
                <li>• All payments are secure and encrypted</li>
                <li>• Receipt will be sent to your email</li>
                <li>• For queries, contact finance team</li>
                <li>• Keep transaction ID for reference</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPortal;

// Made with Bob
