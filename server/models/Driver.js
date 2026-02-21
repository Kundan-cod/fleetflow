import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  licenseType: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], required: true },
  licenseNumber: { type: String, trim: true, default: '' },
  expiryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['on_duty', 'on_trip', 'off_duty'],
    default: 'on_duty',
  },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  totalTrips: { type: Number, default: 0 },
}, { timestamps: true });

driverSchema.virtual('isLicenseExpired').get(function () {
  return new Date() > this.expiryDate;
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

export default mongoose.model('Driver', driverSchema);
