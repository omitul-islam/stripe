import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { getPaymentIntent } from '../services/api';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      navigate('/');
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        const data = await getPaymentIntent(paymentIntentId);
        setPaymentDetails(data);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center animate-fade-in">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
              <p className="text-slate-600">Your USDC purchase has been completed</p>
            </div>

            {/* Payment Details */}
            {paymentDetails && (
              <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Transaction Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment ID</span>
                    <span className="font-mono text-sm text-slate-900">
                      {paymentDetails.id.slice(0, 20)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-semibold text-slate-900">
                      ${paymentDetails.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">USDC Received</span>
                    <span className="font-semibold text-primary-600">
                      {paymentDetails.metadata?.usdcAmount || paymentDetails.amount.toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {paymentDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date</span>
                    <span className="text-slate-900">
                      {new Date(paymentDetails.created * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-slate-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <span>Your USDC will be transferred to your wallet shortly</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <span>You'll receive an email confirmation with transaction details</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <span>Check your wallet to verify the USDC balance</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/')}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <span>Make Another Purchase</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex-1"
              >
                Print Receipt
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@veloxpay.com" className="text-primary-600 hover:underline">
                support@veloxpay.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
