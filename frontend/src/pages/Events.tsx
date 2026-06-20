import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, Search, Filter } from 'lucide-react';
import { eventApi } from '../lib/api';
import { Event, EventFilters } from '../types';
import { Button, Card, Input, Loading } from '../components/common';

const Events: React.FC = () => {
  const [filters, setFilters] = useState<EventFilters>({
    category: '',
    search: '',
    isActive: true,
  });

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventApi.getEvents(filters),
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'academic', label: 'Academic' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'competition', label: 'Competition' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category });
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading events..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-600 mb-4">Failed to load events</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Events
          </h1>
          <p className="text-gray-600">
            Discover and register for 70+ exciting events
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={filters.search}
                onChange={handleSearchChange}
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-5 w-5" />}>
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card hover className="h-full">
                  {/* Event Image */}
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Event Details */}
                  <div>
                    {/* Category Badge */}
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2">
                      {event.category}
                    </span>

                    {/* Event Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.venue}</span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Max {event.maxParticipants} participants</span>
                        </div>
                      )}
                      <div className="flex items-center font-semibold text-indigo-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        <span>{event.registrationFee}</span>
                      </div>
                    </div>

                    {/* Register Button */}
                    <div className="mt-4">
                      <Button fullWidth>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={() => setFilters({ category: '', search: '', isActive: true })}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Events;

// Made with Bob
