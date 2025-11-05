import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Tv, Building2 } from 'lucide-react';

const CardNumberEntry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const [cardNumber, setCardNumber] = useState('');

  // Provider configurations
  const providerConfigs: Record<string, { name: string; label: string; placeholder: string }> = {
    // TV Providers
    'dstv': { name: 'DSTV', label: 'Smart card number', placeholder: 'E.g 1234567879' },
    'startimes': { name: 'STARTIMES', label: 'Smart card number', placeholder: 'E.g 1234567879' },
    'gotv': { name: 'GOTV', label: 'Smart card number', placeholder: 'E.g 1234567879' },
    'azam_tv': { name: 'AZAM TV', label: 'Smart card number', placeholder: 'E.g 1234567879' },
    // Tax Providers
    'ura': { name: 'URA', label: 'PRN/ Payment reference number', placeholder: 'E.g 1234567879' },
    'kcca': { name: 'KCCA', label: 'PRN/ Payment reference number', placeholder: 'E.g 1234567879' },
  };

  const providerConfig = provider ? providerConfigs[provider] : null;

  if (!provider || !providerConfig) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Provider not found</p>
          <Button onClick={() => navigate('/org/pay-bills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pay Bills
          </Button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!cardNumber.trim() || !category || !provider) {
      return;
    }
    // Check if mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile, navigate to amount entry page
      navigate(`/org/pay-bills/amount-entry?category=${category}&provider=${provider}&cardNumber=${encodeURIComponent(cardNumber)}`);
    } else {
      // On desktop, navigate to pay bills page with params
      navigate(`/org/pay-bills?category=${category}&provider=${provider}&cardNumber=${encodeURIComponent(cardNumber)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(category ? `/org/pay-bills/provider-selection?category=${category}` : '/org/pay-bills')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            {(category === 'tv' || category === 'tax') && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {category === 'tv' ? (
                  <Tv className="h-5 w-5 text-blue-600" />
                ) : (
                  <Building2 className="h-5 w-5 text-blue-600" />
                )}
              </div>
            )}
            <h1 className="text-lg font-semibold text-gray-900">{providerConfig.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-8 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Label */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-700">{providerConfig.label}</Label>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={providerConfig.placeholder}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full h-14 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleContinue}
          disabled={!cardNumber.trim() || !category || !provider}
          className={`w-full h-12 text-base font-medium ${
            cardNumber.trim() && category && provider
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};

export default CardNumberEntry;
