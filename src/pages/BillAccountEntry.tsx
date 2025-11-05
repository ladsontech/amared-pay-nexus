import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Droplets, Zap } from 'lucide-react';

const BillAccountEntry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // NWSC Districts
  const nwscDistricts = [
    "Kampala",
    "Entebbe",
    "Jinja",
    "Lugazi",
    "Iganga",
    "Others"
  ];

  // Provider configurations
  const providerConfigs: Record<string, { name: string; label: string; placeholder: string; requiresDistrict?: boolean }> = {
    // Water Providers
    'nwsc': { name: 'NWSC', label: 'Meter Number', placeholder: 'E.g 1234567879', requiresDistrict: true },
    // Electricity Providers
    'uedcl_postpaid': { name: 'UEDCL Post Paid', label: 'Meter Number', placeholder: 'Enter meter number' },
    'uedcl_light': { name: 'UEDCL Light', label: 'Meter Number', placeholder: 'Enter meter number' },
  };

  const providerConfig = provider ? providerConfigs[provider] : null;
  const IconComponent = category === 'water' ? Droplets : Zap;

  if (!category || !provider || !providerConfig) {
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
    if (!accountNumber.trim()) {
      return;
    }
    
    // For NWSC, require district selection
    if (provider === 'nwsc' && !selectedDistrict) {
      return;
    }

    // Navigate to amount entry page
    const params = new URLSearchParams({
      category,
      provider,
      accountNumber: accountNumber.trim(),
    });
    
    if (provider === 'nwsc' && selectedDistrict) {
      params.append('district', selectedDistrict);
    }
    
    navigate(`/org/pay-bills/amount-entry?${params.toString()}`);
  };

  const canContinue = accountNumber.trim() && (provider !== 'nwsc' || selectedDistrict);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/org/pay-bills/provider-selection?category=${category}`)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{providerConfig.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-8 pb-20 space-y-6">
        {/* District Selection for NWSC */}
        {provider === 'nwsc' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Area</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="bg-white h-12">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {nwscDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Account Number */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{providerConfig.label}</Label>
          <Input
            placeholder={providerConfig.placeholder}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="bg-white h-12 text-base"
          />
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillAccountEntry;

