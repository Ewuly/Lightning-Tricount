import { Request, Response } from 'express';
import LightningService from '../services/lightning';
import Group from '../models/Group';

const lightningService = new LightningService({
  lndHost: process.env.LND_HOST || '',
  macaroon: process.env.LND_MACAROON || '',
  cert: process.env.LND_CERT || '',
});

export const createPaymentRequest = async (req: Request, res: Response) => {
  try {
    const { groupId, requestId, amount } = req.body;
    const description = `Payment for group ${groupId} - Request ${requestId}`;
    
    const paymentRequest = await lightningService.createInvoice(amount, description);
    
    // Update payment request with invoice
    await Group.findOneAndUpdate(
      { 
        '_id': groupId,
        'paymentRequests._id': requestId 
      },
      { 
        $set: { 
          'paymentRequests.$.paymentRequest': paymentRequest,
          'paymentRequests.$.status': 'pending_payment'
        } 
      }
    );

    res.json({ paymentRequest });
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({ error: 'Failed to create payment request' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { groupId, requestId, paymentRequest } = req.body;
    
    // Pay the invoice
    const success = await lightningService.payInvoice(paymentRequest);
    
    if (success) {
      // Update payment request status
      await Group.findOneAndUpdate(
        { 
          '_id': groupId,
          'paymentRequests._id': requestId 
        },
        { 
          $set: { 
            'paymentRequests.$.status': 'paid',
            'paymentRequests.$.paidAt': new Date()
          } 
        }
      );
      
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentRequest } = req.params;
    const isPaid = await lightningService.checkPayment(paymentRequest);
    res.json({ paid: isPaid });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
}; 