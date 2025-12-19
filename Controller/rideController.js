import { User, Vehicle, Service, Booking } from "../Model/rideModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ==========================
// Middleware
// ==========================
export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

// ==========================
// Authentication Controllers
// ==========================

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================
// Vehicle Controllers
// ==========================

export const addVehicle = async (req, res) => {
    try {
        const { make, model, year, licensePlate } = req.body;
        const newVehicle = new Vehicle({
            userId: req.user.id, // Assumes middleware sets req.user
            make,
            model,
            year,
            licensePlate
        });
        await newVehicle.save();
        res.status(201).json({ message: "Vehicle added successfully", vehicle: newVehicle });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        await Vehicle.findByIdAndDelete(id);
        res.json({ message: "Vehicle deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================
// Service Controllers
// ==========================

export const addService = async (req, res) => {
    try {
        const { name, description, price, duration } = req.body;
        const newService = new Service({ name, description, price, duration });
        await newService.save();
        res.status(201).json({ message: "Service added successfully", service: newService });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================
// Booking Controllers
// ==========================

export const createBooking = async (req, res) => {
    try {
        const { vehicleId, serviceId, date, deliveryDate, requirements, contactDetails } = req.body;
        const newBooking = new Booking({
            userId: req.user.id,
            vehicleId,
            serviceId,
            date,
            deliveryDate,
            requirements,
            contactDetails
        });
        await newBooking.save();
        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userId', 'name email').populate('vehicleId').populate('serviceId');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).populate('vehicleId').populate('serviceId');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};