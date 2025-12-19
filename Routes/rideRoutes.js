import express from "express";
import {
    register, login,
    addVehicle, getVehicles, deleteVehicle,
    addService, getServices,
    createBooking, getAllBookings, getUserBookings,
    authenticate
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
route.get('/bookings', authenticate, getAllBookings); // All bookings (Admin)
route.get('/my-bookings', authenticate, getUserBookings); // User specific

export default route;