import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Service } from './Model/rideModel.js';
import connectDb from './Db/db.js';

dotenv.config();

const seedServices = async () => {
    await connectDb();

    const services = [
        {
            name: "General Service",
            description: "Complete vehicle checkup including oil change, filter replacement, and break inspection.",
            price: 150,
            duration: "4 hours"
        },
        {
            name: "Oil Change",
            description: "Premium synthetic oil change and filter replacement.",
            price: 50,
            duration: "1 hour"
        },
        {
            name: "Brake Repair",
            description: "Brake pad replacement and rotor resurfacing.",
            price: 200,
            duration: "3 hours"
        },
        {
            name: "Tire Rotation",
            description: "Rotate tires to ensure even wear.",
            price: 30,
            duration: "45 mins"
        },
        {
            name: "Car Wash & Detailing",
            description: "Interior and exterior cleaning and polishing.",
            price: 80,
            duration: "2 hours"
        }
    ];

    try {
        await Service.deleteMany({}); // Clear existing services
        await Service.insertMany(services);
        console.log("Details: Services Seeded Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding services:", error);
        process.exit(1);
    }
};

seedServices();
