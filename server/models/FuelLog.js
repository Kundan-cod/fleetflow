import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  liters: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  odometer: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('FuelLog', fuelLogSchema);
