import * as lnService from 'ln-service';

interface LightningConfig {
  lndHost: string;
  macaroon: string;
  cert: string;
}

class LightningService {
  private lnd: any;

  constructor(config: LightningConfig) {
    this.lnd = lnService.authenticatedLndGrpc({
      socket: config.lndHost,
      macaroon: config.macaroon,
      cert: config.cert,
    }).lnd;
  }

  async createInvoice(amount: number, description: string): Promise<string> {
    try {
      const invoice = await lnService.createInvoice({
        lnd: this.lnd,
        tokens: amount,
        description,
      });
      return invoice.request;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create lightning invoice');
    }
  }

  async payInvoice(paymentRequest: string): Promise<boolean> {
    try {
      const payment = await lnService.pay({
        lnd: this.lnd,
        request: paymentRequest,
      });
      return payment.is_confirmed;
    } catch (error) {
      console.error('Error paying invoice:', error);
      throw new Error('Failed to pay lightning invoice');
    }
  }

  async checkPayment(paymentRequest: string): Promise<boolean> {
    try {
      const details = await lnService.getInvoice({
        lnd: this.lnd,
        id: paymentRequest,
      });
      return details.is_confirmed;
    } catch (error) {
      console.error('Error checking payment:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

export default LightningService; 