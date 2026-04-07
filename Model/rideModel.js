import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin', 'Client'], default: 'User' }
});

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true } // e.g., "2 hours"
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    requirements: { type: String },
    contactDetails: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true }
    },
    status: { type: String, enum: ['Pending', 'Accepted', 'In Service', 'Service Completed', 'Ready for Pickup', 'Delivered', 'Cancelled'], default: 'Pending' },
    estimatedCost: { type: Number },
    finalCost: { type: Number },
    remarks: { type: String }, // General remarks, kept for backwards compatibility if needed, but not user-visible via new logic
    serviceDate: { type: Date },
    updateMessage: { type: String }, // Old generic message
    adminMessage: { type: String }, // New specific message for user
    clientMessage: { type: String }, // New specific message for admin
    rating: { type: Number, min: 1, max: 5 }
});

const User = mongoose.model("User", userSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const Service = mongoose.model("Service", serviceSchema);
const Booking = mongoose.model("Booking", bookingSchema);

export { User, Vehicle, Service, Booking };