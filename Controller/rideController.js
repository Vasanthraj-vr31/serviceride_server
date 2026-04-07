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

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

export const isClient = (req, res, next) => {
    if (req.user && req.user.role === 'Client') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Client only." });
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
        const finalRole = role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : 'User';
        const newUser = new User({ name, email, password: hashedPassword, role: finalRole });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Handle older users without a role by defaulting them to 'User'
        const dbRole = user.role || 'User';

        if (role && dbRole.toLowerCase() !== role.toLowerCase()) {
            return res.status(400).json({ message: "Invalid role selected" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Normalize the role to ensure it is Title Case, default to 'User'
        const finalRole = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'User';

        const token = jwt.sign({ id: user._id, userId: user._id, role: finalRole }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user._id, userId: user._id, name: user.name, email: user.email, role: finalRole } });
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

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const predefinedCosts = {
            "General Service": 4000,
            "Oil Change": 2500,
            "Engine Check": 6500,
            "Brake Service": 8000,
            "Full Service": 12000
        };

        const estimatedCost = predefinedCosts[service.name] || service.price;

        const newBooking = new Booking({
            userId: req.user.id,
            vehicleId,
            serviceId,
            date,
            deliveryDate,
            requirements,
            contactDetails,
            estimatedCost
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
        const bookings = await Booking.find({ userId: req.user.id }).populate('vehicleId').populate('serviceId').sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        if (booking.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending bookings can be cancelled" });
        }

        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: "Booking cancelled successfully", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const rateService = async (req, res) => {
    try {
        const { rating } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to rate this booking" });
        }

        if (booking.status !== 'Delivered') {
            return res.status(400).json({ message: "Can only rate delivered bookings" });
        }

        booking.rating = rating;
        await booking.save();
        res.json({ message: "Rating submitted successfully", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================
// Admin Controllers
// ==========================

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'User' });
        const totalClients = await User.countDocuments({ role: 'Client' });
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'Pending' });

        const completedBookings = await Booking.find({ status: 'Delivered' });
        const totalCompleted = completedBookings.length;

        const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.finalCost || 0), 0);

        const ratedBookings = completedBookings.filter(b => b.rating);
        const avgRating = ratedBookings.length > 0
            ? (ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length).toFixed(1)
            : 0;

        res.json({
            totalUsers,
            totalClients,
            totalBookings,
            pendingBookings,
            totalCompleted,
            totalRevenue,
            avgRating
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateBookingAdmin = async (req, res) => {
    try {
        const { status, finalCost, remarks, serviceDate, deliveryDate, updateMessage, adminMessage } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (status) booking.status = status;
        if (finalCost !== undefined) booking.finalCost = finalCost;
        if (remarks !== undefined) booking.remarks = remarks;
        if (serviceDate) booking.serviceDate = serviceDate;
        if (deliveryDate) booking.deliveryDate = deliveryDate;
        if (updateMessage !== undefined) booking.updateMessage = updateMessage;
        if (adminMessage !== undefined) booking.adminMessage = adminMessage;

        await booking.save();
        res.json({ message: "Booking updated successfully", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================
// Client Controllers
// ==========================

export const getClientBookings = async (req, res) => {
    try {
        // Clients only see bookings assigned to 'Accepted' or 'In Service' or 'Service Completed'
        const bookings = await Booking.find({
            status: { $in: ['Accepted', 'In Service', 'Service Completed'] }
        }).populate('userId', 'name email phone').populate('vehicleId').populate('serviceId');

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateBookingClient = async (req, res) => {
    try {
        const { status, clientMessage } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Client can only update status to 'In Service' or 'Service Completed'
        if (status) {
            if (!['In Service', 'Service Completed'].includes(status)) {
                return res.status(400).json({ message: "Client cannot set this status." });
            }
            booking.status = status;
        }

        if (clientMessage !== undefined) {
            booking.clientMessage = clientMessage;
        }

        await booking.save();
        res.json({ message: "Booking updated by client", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};