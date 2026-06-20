import React from 'react';
import { Event } from '../../types';
import Button from '../common/Button';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
  isRegistered?: boolean;
  showActions?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  onViewDetails,
  isRegistered = false,
  showActions = true,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sports: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      technical: 'bg-green-100 text-green-800',
      academic: 'bg-yellow-100 text-yellow-800',
      workshop: 'bg-pink-100 text-pink-800',
      competition: 'bg-red-100 text-red-800',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = () => {
    if (isRegistered) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Registered
        </span>
      );
    }
    if (
      event.registrationCount !== undefined &&
      event.maxParticipants !== undefined &&
      event.registrationCount >= event.maxParticipants
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Full
        </span>
      );
    }
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        Open
      </span>
    );
  };

  const isRegistrationOpen = () => {
    return (
      !isRegistered &&
      event.registrationCount !== undefined &&
      event.maxParticipants !== undefined &&
      event.registrationCount < event.maxParticipants &&
      event.registrationDeadline &&
      new Date(event.registrationDeadline) > new Date()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span>{formatDate(event.startDate)}</span>
            {event.endDate && event.endDate !== event.startDate && (
              <span className="ml-1">- {formatDate(event.endDate)}</span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            <span>{formatTime(event.startDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{event.venue}</span>
          </div>

          {event.registrationCount !== undefined && event.maxParticipants !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <span>
                {event.registrationCount} / {event.maxParticipants} participants
              </span>
            </div>
          )}

          {event.registrationFee > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-semibold text-gray-900">₹{event.registrationFee}</span>
            </div>
          )}
        </div>

        {/* Registration Deadline */}
        {event.registrationDeadline && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Registration closes on{' '}
              <span className="font-semibold text-gray-900">
                {formatDate(event.registrationDeadline)}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails?.(event.id)}
            >
              View Details
            </Button>
            {isRegistrationOpen() && onRegister && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onRegister(event.id)}
              >
                Register Now
              </Button>
            )}
            {isRegistered && (
              <Button variant="secondary" className="flex-1" disabled>
                Already Registered
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Made with Bob
