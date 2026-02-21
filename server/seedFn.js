import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';
import Trip from './models/Trip.js';
import Maintenance from './models/Maintenance.js';
import FuelLog from './models/FuelLog.js';

const seed = async () => {
    try {
        // Clear all collections
        await Promise.all([
            User.deleteMany(),
            Vehicle.deleteMany(),
            Driver.deleteMany(),
            Trip.deleteMany(),
            Maintenance.deleteMany(),
            FuelLog.deleteMany(),
        ]);
        console.log('Cleared existing data');

        // Create users
        const users = await User.create([
            { name: 'Alex Morgan', email: 'admin@fleetflow.com', password: 'admin123', role: 'manager' },
            { name: 'Jordan Lee', email: 'dispatch@fleetflow.com', password: 'dispatch123', role: 'dispatcher' },
            { name: 'Sarah Safe', email: 'safety@fleetflow.com', password: 'safety123', role: 'safety_officer' },
            { name: 'Finn Finnace', email: 'finance@fleetflow.com', password: 'finance123', role: 'financial_analyst' },
        ]);
        console.log('Created users');

        // Create vehicles
        const vehicles = await Vehicle.create([
            { name: 'Titan Hauler', plate: 'FL-1001', type: 'truck', capacity: 12000, odometer: 45230, fuelType: 'diesel', status: 'available' },
            { name: 'Swift Carrier', plate: 'FL-1002', type: 'van', capacity: 3500, odometer: 28100, fuelType: 'diesel', status: 'available' },
            { name: 'Thunder Rig', plate: 'FL-1003', type: 'trailer', capacity: 20000, odometer: 87600, fuelType: 'diesel', status: 'on_trip' },
            { name: 'Bolt Runner', plate: 'FL-1004', type: 'pickup', capacity: 1500, odometer: 12400, fuelType: 'petrol', status: 'available' },
            { name: 'Atlas Freight', plate: 'FL-1005', type: 'truck', capacity: 15000, odometer: 62000, fuelType: 'diesel', status: 'in_shop' },
            { name: 'Echo Van', plate: 'FL-1006', type: 'van', capacity: 4000, odometer: 19800, fuelType: 'hybrid', status: 'available' },
            { name: 'Ironclad Max', plate: 'FL-1007', type: 'truck', capacity: 18000, odometer: 102000, fuelType: 'diesel', status: 'available' },
            { name: 'Viper Express', plate: 'FL-1008', type: 'pickup', capacity: 2000, odometer: 8300, fuelType: 'petrol', status: 'retired' },
        ]);
        console.log('Created vehicles');

        // Create drivers
        const futureDate = new Date('2027-06-15');
        const expiredDate = new Date('2025-01-10');
        const drivers = await Driver.create([
            { name: 'Rajesh Kumar', phone: '+91-9876543210', licenseType: 'C', licenseNumber: 'DL-C-78901', expiryDate: futureDate, status: 'on_duty', rating: 4.8, totalTrips: 142 },
            { name: 'Priya Sharma', phone: '+91-9876543211', licenseType: 'D', licenseNumber: 'DL-D-45623', expiryDate: futureDate, status: 'on_trip', rating: 4.9, totalTrips: 198 },
            { name: 'Amit Verma', phone: '+91-9876543212', licenseType: 'C', licenseNumber: 'DL-C-33210', expiryDate: expiredDate, status: 'off_duty', rating: 4.2, totalTrips: 67 },
            { name: 'Deepa Nair', phone: '+91-9876543213', licenseType: 'B', licenseNumber: 'DL-B-99012', expiryDate: futureDate, status: 'on_duty', rating: 4.6, totalTrips: 95 },
            { name: 'Vikram Singh', phone: '+91-9876543214', licenseType: 'E', licenseNumber: 'DL-E-11234', expiryDate: futureDate, status: 'on_duty', rating: 4.7, totalTrips: 210 },
            { name: 'Sunita Rao', phone: '+91-9876543215', licenseType: 'C', licenseNumber: 'DL-C-55678', expiryDate: futureDate, status: 'on_duty', rating: 4.5, totalTrips: 88 },
        ]);
        console.log('Created drivers');

        // Create trips
        const trips = await Trip.create([
            { vehicleId: vehicles[2]._id, driverId: drivers[1]._id, cargoWeight: 15000, cargoDescription: 'Steel beams', origin: 'Mumbai', destination: 'Delhi', distance: 1400, status: 'dispatched', startOdometer: 87600, dispatchedAt: new Date() },
            { vehicleId: vehicles[0]._id, driverId: drivers[0]._id, cargoWeight: 8000, cargoDescription: 'Electronics', origin: 'Bangalore', destination: 'Chennai', distance: 350, status: 'completed', startOdometer: 44880, endOdometer: 45230, completedAt: new Date(Date.now() - 86400000) },
            { vehicleId: vehicles[1]._id, driverId: drivers[3]._id, cargoWeight: 2500, cargoDescription: 'Textiles', origin: 'Pune', destination: 'Hyderabad', distance: 560, status: 'completed', startOdometer: 27540, endOdometer: 28100, completedAt: new Date(Date.now() - 172800000) },
            { vehicleId: vehicles[3]._id, driverId: drivers[4]._id, cargoWeight: 1200, cargoDescription: 'Documents', origin: 'Kolkata', destination: 'Patna', distance: 600, status: 'completed', startOdometer: 11800, endOdometer: 12400, completedAt: new Date(Date.now() - 259200000) },
        ]);
        console.log('Created trips');

        // Create maintenance records
        await Maintenance.create([
            { vehicleId: vehicles[4]._id, serviceType: 'engine_repair', description: 'Engine overheating fix', cost: 12500, date: new Date(), resolved: false },
            { vehicleId: vehicles[0]._id, serviceType: 'oil_change', description: 'Regular oil change', cost: 1800, date: new Date(Date.now() - 604800000), resolved: true },
            { vehicleId: vehicles[2]._id, serviceType: 'tire_replacement', description: 'All 6 tires replaced', cost: 45000, date: new Date(Date.now() - 1209600000), resolved: true },
            { vehicleId: vehicles[1]._id, serviceType: 'brake_service', description: 'Brake pad replacement', cost: 3200, date: new Date(Date.now() - 2592000000), resolved: true },
        ]);
        console.log('Created maintenance records');

        // Create fuel logs
        await FuelLog.create([
            { vehicleId: vehicles[0]._id, tripId: trips[1]._id, liters: 120, cost: 10800, odometer: 45230, date: new Date(Date.now() - 86400000) },
            { vehicleId: vehicles[1]._id, tripId: trips[2]._id, liters: 85, cost: 7650, odometer: 28100, date: new Date(Date.now() - 172800000) },
            { vehicleId: vehicles[3]._id, tripId: trips[3]._id, liters: 95, cost: 9500, odometer: 12400, date: new Date(Date.now() - 259200000) },
            { vehicleId: vehicles[2]._id, liters: 200, cost: 18000, odometer: 87600, date: new Date(Date.now() - 432000000) },
            { vehicleId: vehicles[6]._id, liters: 150, cost: 13500, odometer: 102000, date: new Date(Date.now() - 518400000) },
        ]);
        console.log('Created fuel logs');

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        throw error;
    }
};

export default seed;
