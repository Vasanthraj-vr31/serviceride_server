import express from "express";
import {
    register, login,
    addVehicle, getVehicles, deleteVehicle,
    addService, getServices,
    createBooking, getAllBookings, getUserBookings, cancelBooking, rateService,
    authenticate, isAdmin, isClient, getDashboardStats, updateBookingAdmin,
    getClientBookings, updateBookingClient
} from "../Controller/rideController.js";

const route = express.Router();

// Auth Routes
route.post('/register', register);
route.post('/login', login);

// Vehicle Routes
route.post('/vehicles', authenticate, addVehicle);
route.get('/vehicles', authenticate, getVehicles);
route.delete('/vehicles/:id', authenticate, deleteVehicle);

// Service Routes
route.post('/services', addService); // Assuming public or admin restricted (but no admin middleware requested yet)
route.get('/services', getServices);

// Booking Routes
route.post('/booking', authenticate, createBooking);
route.get('/bookings', authenticate, getAllBookings); // All bookings
route.get('/my-bookings', authenticate, getUserBookings); // User specific
route.put('/bookings/:id/cancel', authenticate, cancelBooking);
route.put('/bookings/:id/rate', authenticate, rateService);

// Admin Routes
route.get('/admin/stats', authenticate, isAdmin, getDashboardStats);
route.put('/admin/bookings/:id', authenticate, isAdmin, updateBookingAdmin);

// Client Routes
route.get('/client/bookings', authenticate, isClient, getClientBookings);
route.put('/client/bookings/:id', authenticate, isClient, updateBookingClient);

export default route;