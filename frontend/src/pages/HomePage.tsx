import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('100');
  const [email, setEmail] = useState<string>('');

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 0.5) {
      toast.error('Minimum purchase amount is $0.50');
      return;
    }

    if (numAmount > 999999.99) {
      toast.error('Maximum purchase amount is $999,999.99');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    navigate('/checkout', { state: { amount: numAmount, email } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                USDC Pay
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-slate-600 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#" className="text-slate-600 hover:text-primary-600 transition-colors">
                Security
              </a>
              <button
                onClick={() => navigate('/transactions')}
                className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
              >
                Transactions
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  Buy USDC with{' '}
                  <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                    Stripe
                  </span>
                </h2>
                <p className="text-xl text-slate-600">
                  Purchase USDC cryptocurrency instantly using your credit card or bank account.
                  Secure, fast, and reliable.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Secure Payments</h3>
                    <p className="text-slate-600">
                      Industry-leading security powered by Stripe
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Instant Processing</h3>
                    <p className="text-slate-600">
                      Receive your USDC immediately after payment
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Global Access</h3>
                    <p className="text-slate-600">
                      Available worldwide with multiple payment methods
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Purchase Form */}
            <div className="card animate-slide-up">
              <form onSubmit={handlePurchase} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Start Your Purchase
                  </h3>
                  <p className="text-slate-600">
                    Enter the amount you want to purchase
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.50"
                        max="999999.99"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field pl-10"
                        placeholder="100.00"
                        required
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      You will receive: <span className="font-semibold text-primary-600">
                        {parseFloat(amount || '0').toFixed(2)} USDC
                      </span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Receive payment confirmation via email
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center space-x-2 group"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-slate-500 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 pt-12 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">$10M+</div>
                <div className="text-slate-600">Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">50K+</div>
                <div className="text-slate-600">Transactions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">99.9%</div>
                <div className="text-slate-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">24/7</div>
                <div className="text-slate-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-slate-600">
            <p>© 2025 USDC Pay. Powered by Stripe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
