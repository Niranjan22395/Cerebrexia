import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import EventModel from '../models/Event';
import EventRegistrationModel from '../models/EventRegistration';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const is_active = req.query.is_active === 'true';

  const filters: any = {
    limit,
    offset: (page - 1) * limit,
  };

  if (category) filters.category = category;
  if (search) filters.search = search;
  if (is_active !== undefined) filters.is_active = is_active;

  const result = await EventModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      events: result.events,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   GET /api/events/:eventId
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const event = await EventModel.findById(req.params.eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      event,
      isRegistered: false, // No auth, always false
    },
  });
}));

/**
 * @route   POST /api/events
 * @desc    Create new event - NO AUTH REQUIRED
 * @access  Public
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {

  const {
    name,
    description,
    category,
    event_date,
    registration_fee,
    max_participants,
    venue,
    rules,
    prizes,
  } = req.body;

  if (!name || !category || !event_date) {
    throw new AppError('Name, category, and event date are required', 400);
  }

  const event = await EventModel.create({
    name,
    description,
    category,
    event_date: new Date(event_date),
    registration_fee: registration_fee || 0,
    max_participants,
    venue,
    rules,
    prizes,
  });

  res.status(201).json({
    success: true,
    data: { event },
    message: 'Event created successfully',
  });
}));

/**
 * @route   PUT /api/events/:eventId
 * @desc    Update event - NO AUTH REQUIRED
 * @access  Public
 */
router.put('/:eventId', asyncHandler(async (req: Request, res: Response) => {

  const updates: any = {};
  const allowedFields = [
    'name',
    'description',
    'category',
    'event_date',
    'registration_fee',
    'max_participants',
    'venue',
    'rules',
    'prizes',
    'is_active',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.event_date) {
    updates.event_date = new Date(updates.event_date);
  }

  const event = await EventModel.update(req.params.eventId, updates);

  res.status(200).json({
    success: true,
    data: { event },
    message: 'Event updated successfully',
  });
}));

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete event - NO AUTH REQUIRED
 * @access  Public
 */
router.delete('/:eventId', asyncHandler(async (req: Request, res: Response) => {

  await EventModel.delete(req.params.eventId);

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
}));

/**
 * @route   GET /api/events/:eventId/availability
 * @desc    Check event availability
 * @access  Public
 */
router.get('/:eventId/availability', asyncHandler(async (req: Request, res: Response) => {
  const available = await EventModel.checkAvailability(req.params.eventId);

  res.status(200).json({
    success: true,
    data: { available },
  });
}));

/**
 * @route   GET /api/events/:eventId/participants
 * @desc    Get event participants - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/:eventId/participants', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const filters = {
    event_id: req.params.eventId,
    limit,
    offset: (page - 1) * limit,
  };

  const result = await EventRegistrationModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      participants: result.registrations,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   GET /api/events/:eventId/stats
 * @desc    Get event statistics - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/:eventId/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await EventModel.getEventStatistics(req.params.eventId);

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

/**
 * @route   GET /api/events/categories/list
 * @desc    Get all event categories
 * @access  Public
 */
router.get('/categories/list', asyncHandler(async (req: Request, res: Response) => {
  // This would ideally come from a categories table or enum
  const categories = [
    'Sports',
    'Cultural',
    'Technical',
    'Academic',
    'Workshop',
    'Competition',
    'Seminar',
    'Exhibition',
    'Other',
  ];

  res.status(200).json({
    success: true,
    data: { categories },
  });
}));

/**
 * @route   POST /api/events/:eventId/register
 * @desc    Register for an event - NO AUTH REQUIRED
 * @access  Public
 */
router.post('/:eventId/register', asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.body; // Get user_id from request body instead of auth
  
  if (!user_id) {
    throw new AppError('User ID is required', 400);
  }

  // Check if event exists and is available
  const event = await EventModel.findById(req.params.eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.is_active) {
    throw new AppError('Event is not active', 400);
  }

  const available = await EventModel.checkAvailability(req.params.eventId);
  if (!available) {
    throw new AppError('Event is full', 400);
  }

  // Check if already registered
  const existingRegistration = await EventRegistrationModel.findByUserAndEvent(
    user_id,
    req.params.eventId
  );

  if (existingRegistration) {
    throw new AppError('Already registered for this event', 400);
  }

  // Create registration (payment will be handled by payment routes)
  const registration = await EventRegistrationModel.create({
    user_id: user_id,
    event_id: req.params.eventId,
    payment_status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: { registration },
    message: 'Registration initiated. Please complete payment.',
  });
}));

/**
 * @route   GET /api/events/my/registrations
 * @desc    Get user's event registrations - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/my/registrations', asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.query.user_id as string; // Get from query param
  
  if (!user_id) {
    throw new AppError('User ID is required', 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filters = {
    user_id: user_id,
    limit,
    offset: (page - 1) * limit,
  };

  const result = await EventRegistrationModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      registrations: result.registrations,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

export default router;

// Made with Bob
