import { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import { Event, EventFilters, PaginatedResponse } from '../types';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  getEventById: (id: string) => Promise<Event>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventStatus: (id: string, isActive: boolean) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useEvents = (initialFilters?: EventFilters): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<EventFilters>(initialFilters || {});

  // Fetch events with filters
  const fetchEvents = useCallback(async (newFilters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = newFilters || filters;
      const response = await axios.get('/events', { params });
      
      const data: PaginatedResponse<Event> = response.data.data;
      setEvents(data.data);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);

      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch events';
      setError(errorMessage);
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single event by ID
  const getEventById = useCallback(async (id: string): Promise<Event> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/events/${id}`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new event
  const createEvent = useCallback(async (data: Partial<Event>): Promise<Event> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/events', data);
      const newEvent: Event = response.data.data;
      
      // Add to local state
      setEvents(prev => [newEvent, ...prev]);
      setTotal(prev => prev + 1);

      return newEvent;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update event
  const updateEvent = useCallback(async (id: string, data: Partial<Event>): Promise<Event> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`/events/${id}`, data);
      const updatedEvent: Event = response.data.data;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));

      return updatedEvent;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`/events/${id}`);
      
      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== id));
      setTotal(prev => prev - 1);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle event active status
  const toggleEventStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`/events/${id}`, { isActive });
      const updatedEvent: Event = response.data.data;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle event status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh events
  const refreshEvents = useCallback(async () => {
    await fetchEvents(filters);
  }, [fetchEvents, filters]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    refreshEvents,
  };
};

// Made with Bob