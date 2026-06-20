import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode as QrCodeIcon } from 'lucide-react';
import { userApi } from '../lib/api';
import { Button, Card, Loading } from '../components/common';

const MyRegistrations: React.FC = () => {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => userApi.getMyRegistrations(),
  });

  if (isLoading) {
    return <Loading fullScreen text="Loading registrations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Registrations</h1>

        {registrations && registrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration: any) => (
              <Card key={registration.id}>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {registration.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {registration.event?.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(registration.event?.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{registration.event?.venue}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {registration.qrCodeId && (
                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                      leftIcon={<QrCodeIcon className="h-4 w-4" />}
                    >
                      View QR Code
                    </Button>
                  )}
                  <Link to={`/events/${registration.eventId}`}>
                    <Button variant="ghost" fullWidth size="sm">
                      View Event Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registrations Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring events and register to participate
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;

// Made with Bob
