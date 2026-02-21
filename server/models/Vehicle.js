import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['truck', 'van', 'trailer', 'pickup'], default: 'truck' },
  capacity: { type: Number, required: true, min: 0 },
  odometer: { type: Number, default: 0, min: 0 },
  fuelType: { type: String, enum: ['diesel', 'petrol', 'electric', 'hybrid'], default: 'diesel' },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'in_shop', 'retired'],
    default: 'available',
  },
  image: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
