import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest stable API version
  typescript: true,
});

// Stripe configuration for checkout sessions
export const STRIPE_CONFIG = {
  currency: 'usd',
  mode: 'payment' as const,
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meetings?payment=cancelled`,
};

// Helper function to verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

// Types for our application
export interface BookingSessionData {
  type: 'booking';
  meetingTypeId: string;
  customerEmail: string;
  customerName?: string;
  amount: number; // in cents
  meetingName: string;
  meetingDescription: string;
}
