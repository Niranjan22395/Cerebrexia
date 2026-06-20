import React from 'react';
import { Calendar } from 'lucide-react';
import { Button, Card } from '../../components/common';

const Events: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <Button leftIcon={<Calendar className="h-5 w-5" />}>
            Create Event
          </Button>
        </div>
        <Card className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Management</h3>
          <p className="text-gray-600">Manage all events from here</p>
        </Card>
      </div>
    </div>
  );
};

export default Events;

// Made with Bob
