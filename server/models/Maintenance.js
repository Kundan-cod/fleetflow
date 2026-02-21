import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: {
    type: String,
    enum: ['oil_change', 'tire_replacement', 'brake_service', 'engine_repair', 'general_inspection', 'transmission', 'other'],
    required: true,
  },
  description: { type: String, trim: true, default: '' },
  cost: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Maintenance', maintenanceSchema);
