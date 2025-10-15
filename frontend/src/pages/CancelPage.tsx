import { useNavigate } from 'react-router-dom';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center animate-fade-in">
            {/* Cancel Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Canceled</h1>
              <p className="text-slate-600">Your payment was not completed</p>
            </div>

            {/* Information */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">What Happened?</h2>
              <p className="text-slate-600 mb-4">
                You canceled the payment process or closed the payment window. No charges have been
                made to your account.
              </p>
              <p className="text-slate-600">
                If you experienced any issues or have questions, please don't hesitate to contact
                our support team.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Need assistance?{' '}
              <a href="mailto:support@veloxpay.com" className="text-primary-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
