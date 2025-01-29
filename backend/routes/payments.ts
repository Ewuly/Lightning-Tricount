import express from 'express';
import { 
  createPaymentRequest, 
  processPayment, 
  checkPaymentStatus 
} from '../controllers/paymentController';

const router = express.Router();

router.post('/create', createPaymentRequest);
router.post('/process', processPayment);
router.get('/status/:paymentRequest', checkPaymentStatus);

export default router; 