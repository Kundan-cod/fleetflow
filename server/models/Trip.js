import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  cargoWeight: { type: Number, required: true, min: 0 },
  cargoDescription: { type: String, trim: true, default: '' },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  distance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'dispatched', 'in_transit', 'completed', 'cancelled'],
    default: 'draft',
  },
  startOdometer: { type: Number, default: 0 },
  endOdometer: { type: Number, default: 0 },
  dispatchedAt: { type: Date },
  completedAt: { type: Date },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
