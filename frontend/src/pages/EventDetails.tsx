import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, MapPin, Users, IndianRupee, Clock, Award, Info } from 'lucide-react';
import { eventApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button, Card, Loading, Modal } from '../components/common';
import toast from 'react-hot-toast';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id!),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () => eventApi.registerForEvent(id!, promoCode || undefined),
    onSuccess: () => {
      toast.success('Registration successful!');
      setShowRegisterModal(false);
      navigate('/my-registrations');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.profileCompleted) {
      navigate('/complete-profile');
      return;
    }

    setShowRegisterModal(true);
  };

  const confirmRegistration = () => {
    registerMutation.mutate();
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <Card className="mb-6">
          {/* Event Image */}
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
              <Calendar className="h-24 w-24 text-white opacity-50" />
            </div>
          )}

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
            {event.category}
          </span>

          {/* Event Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p>{new Date(event.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p>{new Date(event.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Venue</p>
                <p>{event.venue}</p>
              </div>
            </div>
            {event.maxParticipants && (
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium">Max Participants</p>
                  <p>{event.maxParticipants}</p>
                </div>
              </div>
            )}
          </div>

          {/* Registration Fee */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg mb-6">
            <span className="text-lg font-semibold text-gray-900">Registration Fee</span>
            <div className="flex items-center text-2xl font-bold text-indigo-600">
              <IndianRupee className="h-6 w-6" />
              <span>{event.registrationFee}</span>
            </div>
          </div>

          {/* Register Button */}
          <Button
            size="lg"
            fullWidth
            onClick={handleRegister}
            disabled={!event.isActive}
          >
            {event.isActive ? 'Register Now' : 'Registration Closed'}
          </Button>
        </Card>

        {/* Event Description */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <Info className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">About Event</h2>
          </div>
          <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
        </Card>

        {/* Rules */}
        {event.rules && (
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.rules}</p>
          </Card>
        )}

        {/* Prizes */}
        {event.prizes && (
          <Card className="mb-6">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Prizes</h2>
            </div>
            <p className="text-gray-600 whitespace-pre-line">{event.prizes}</p>
          </Card>
        )}

        {/* Contact Info */}
        {event.contactInfo && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.contactInfo}</p>
          </Card>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Confirm Registration"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRegistration}
              isLoading={registerMutation.isPending}
            >
              Confirm & Pay
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to register for <strong>{event.name}</strong>
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Registration Fee:</span>
              <span className="font-semibold">₹{event.registrationFee}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code (Optional)
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <p className="text-sm text-gray-500">
            You will be redirected to the payment page after confirmation.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;

// Made with Bob
