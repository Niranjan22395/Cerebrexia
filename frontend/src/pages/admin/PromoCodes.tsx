import React from 'react';
import { Tag } from 'lucide-react';
import { Button, Card } from '../../components/common';

const PromoCodes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
          <Button leftIcon={<Tag className="h-5 w-5" />}>
            Create Promo Code
          </Button>
        </div>
        <Card className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Promo Code Management</h3>
          <p className="text-gray-600">Create and manage promo codes (up to 200 active)</p>
        </Card>
      </div>
    </div>
  );
};

export default PromoCodes;

// Made with Bob
