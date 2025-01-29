import mongoose from 'mongoose';

const PaymentRequestSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'pending_payment', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentRequest: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const GroupSchema = new mongoose.Schema({
  // ... existing fields ...
  paymentRequests: [PaymentRequestSchema]
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema); 