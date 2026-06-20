import React, { useState } from 'react';
import { Event } from '../../types';
import Button from '../common/Button';
import { 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface EventTableProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onView?: (eventId: string) => void;
  onToggleActive?: (eventId: string, isActive: boolean) => void;
  onCreate?: () => void;
  loading?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({
  events,
  onEdit,
  onDelete,
  onView,
  onToggleActive,
  onCreate,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && event.isActive) ||
      (statusFilter === 'inactive' && !event.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category: string) => {
    const badges = {
      sports: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      technical: 'bg-green-100 text-green-800',
      academic: 'bg-yellow-100 text-yellow-800',
      workshop: 'bg-indigo-100 text-indigo-800',
      competition: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isOngoing = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Event Management</h2>
          
          <div className="flex flex-col md:flex-row gap-3">
            {onCreate && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onCreate}
              >
                Create Event
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="academic">Academic</option>
              <option value="workshop">Workshop</option>
              <option value="competition">Competition</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Venue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  {/* Event Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-16 h-16 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {event.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(event.category)}`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </td>

                  {/* Date & Venue */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center mb-1">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {formatDate(event.startDate)}
                      {event.endDate && event.endDate !== event.startDate && (
                        <span className="ml-1">- {formatDate(event.endDate)}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      {event.venue}
                    </div>
                  </td>

                  {/* Participants */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.maxParticipants ? (
                      <div className="text-sm text-gray-900 flex items-center">
                        <Users className="w-3 h-3 mr-1 text-gray-400" />
                        {event.registrationCount || 0} / {event.maxParticipants}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unlimited</span>
                    )}
                  </td>

                  {/* Fee */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                      {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {event.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      {isOngoing(event.startDate, event.endDate) && (
                        <span className="block text-xs text-blue-600 font-medium">Ongoing</span>
                      )}
                      {isUpcoming(event.startDate) && (
                        <span className="block text-xs text-purple-600 font-medium">Upcoming</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(event.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(event)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onToggleActive && (
                        <button
                          onClick={() => onToggleActive(event.id, !event.isActive)}
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title={event.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {event.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(event.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{filteredEvents.length}</span> of{' '}
            <span className="font-medium">{events.length}</span> results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob