import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../services/api';

// Initialize Stripe outside component to prevent recreation on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // stripe and elements will be provided inside the CheckoutForm via Elements

  const { amount, email, name } = location.state || {};

  const [clientSecret, setClientSecret] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!amount) {
      toast.error('Please enter an amount first');
      navigate('/');
      return;
    }

    // Create payment intent on mount
    const initializePayment = async () => {
      try {
        const data = await createPaymentIntent({
          amount,
          currency: 'usd',
          customerEmail: email,
          customerName: name,
        });

        setClientSecret(data.clientSecret);
        setIsInitializing(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to initialize payment');
        navigate('/');
      }
    };

    initializePayment();
  }, [amount, email, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          {/* Payment Card */}
          <div className="card animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Purchase</h1>
              <p className="text-slate-600">Enter your payment details to buy USDC</p>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Amount (USD)</span>
                  <span className="font-semibold text-slate-900">${amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">You will receive</span>
                  <span className="font-semibold text-primary-600">{amount?.toFixed(2)} USDC</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">${amount?.toFixed(2)}</div>
                      <div className="text-sm text-slate-500">USD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm amount={amount} />
              </Elements>
            ) : (
              <div className="p-4 text-center text-slate-600">Failed to initialize payment.</div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Secured by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CheckoutForm - a child component that uses stripe hooks and handles confirmation
type CheckoutFormProps = {
  amount?: number;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <button type="submit" disabled={!stripe || isLoading} className="btn-primary w-full flex items-center justify-center space-x-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <DollarSign className="w-5 h-5" />
            <span>Pay ${amount?.toFixed(2)}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutPage;
