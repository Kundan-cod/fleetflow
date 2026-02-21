import { Router } from 'express';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { protect } from '../middleware/auth.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
    console.log(`🤖 AI Chat received: "${req.body.message}" from ${req.user.name}`);
    try {
        const { message } = req.body;

        // 1. Fetch live fleet context
        const [trips, vehicles, drivers] = await Promise.all([
            Trip.find().populate('vehicleId driverId'),
            Vehicle.find(),
            Driver.find()
        ]);

        // 2. Build detailed system context for Gemini
        const fleetSummary = {
            activeTrips: trips.filter(t => t.status === 'dispatched').length,
            totalVehicles: vehicles.length,
            availableVehicles: vehicles.filter(v => v.status === 'available').length,
            inMaintenance: vehicles.filter(v => v.status === 'in_shop').length,
            onDutyDrivers: drivers.filter(d => d.status === 'on_duty').length,
            tripsData: trips.map(t => ({
                route: `${t.origin} -> ${t.destination}`,
                status: t.status,
                driver: t.driverId?.name,
                vehicle: t.vehicleId?.name
            })).slice(0, 10) // Limit to recent 10 for tokens
        };

        const prompt = `
      You are FleetFlow AI, an expert logistics assistant. 
      You have access to the following real-time fleet data:
      - Active Trips: ${fleetSummary.activeTrips}
      - Total Fleet: ${fleetSummary.totalVehicles} (${fleetSummary.availableVehicles} available, ${fleetSummary.inMaintenance} in shop)
      - Drivers: ${fleetSummary.onDutyDrivers} on duty.
      - Recent Activity: ${JSON.stringify(fleetSummary.tripsData)}

      User (${req.user.name}): "${message}"

      Respond as a professional, concise logistics AI. Provide data-driven answers based on the context above. If you don't have specific data about a named truck or driver not in the summary, speak generally about fleet health. Keep it under 3 sentences.
    `;

        // 3. Get response from Gemini
        if (!process.env.GEMINI_API_KEY) {
            // Fallback if no API key is provided
            return res.json({ response: "AI integration is active, but GEMINI_API_KEY is missing in .env. Please add it to enable advanced logic." });
        }

        const result = await model.generateContent(prompt);
        if (!result.response) {
            throw new Error("Empty response from Gemini");
        }

        const responseText = result.response.text();
        res.json({ response: responseText });
    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({
            message: "Advanced AI processing error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
