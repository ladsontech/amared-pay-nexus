import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Droplets, Tv, Building } from 'lucide-react';

const ProviderSelection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const billCategories = [
    {
      id: 'water',
      name: 'Water',
      icon: Droplets,
      color: 'text-blue-600 bg-blue-100',
      providers: [
        { id: 'nwsc', name: 'NWSC', accountLabel: 'Customer Number', placeholder: 'Enter customer number' }
      ]
    },
    {
      id: 'electricity',
      name: 'Electricity',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100',
      providers: [
        { id: 'uedcl_postpaid', name: 'UEDCL Post Paid', accountLabel: 'Meter Number', placeholder: 'Enter meter number' },
        { id: 'uedcl_light', name: 'UEDCL Light', accountLabel: 'Meter Number', placeholder: 'Enter meter number' }
      ]
    },
    {
      id: 'tv',
      name: 'TV',
      icon: Tv,
      color: 'text-purple-600 bg-purple-100',
      providers: [
        { id: 'dstv', name: 'DSTV', accountLabel: 'SmartCard Number', placeholder: 'Enter SmartCard number' },
        { id: 'startimes', name: 'STARTIMES', accountLabel: 'SmartCard Number', placeholder: 'Enter SmartCard number' },
        { id: 'gotv', name: 'GOTV', accountLabel: 'IUC Number', placeholder: 'Enter IUC number' },
        { id: 'azam_tv', name: 'AZAM TV', accountLabel: 'SmartCard Number', placeholder: 'Enter SmartCard number' }
      ]
    },
    {
      id: 'tax',
      name: 'Tax',
      icon: Building,
      color: 'text-green-600 bg-green-100',
      providers: [
        { id: 'ura', name: 'URA', accountLabel: 'TIN Number', placeholder: 'Enter TIN number' },
        { id: 'kcca', name: 'KCCA', accountLabel: 'Property ID', placeholder: 'Enter property ID' }
      ]
    }
  ];

  const selectedCategory = billCategories.find(cat => cat.id === category);

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/org/pay-bills')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Category not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const IconComponent = selectedCategory.icon;

  const handleProviderSelect = (providerId: string) => {
    // For TV and Tax providers, navigate to card number entry screen
    if (category === 'tv' || category === 'tax') {
      navigate(`/org/pay-bills/card-entry?category=${category}&provider=${providerId}`);
    } else {
      // For Water and Electricity, navigate directly to pay bills page
      navigate(`/org/pay-bills?category=${category}&provider=${providerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/org/pay-bills')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-2 rounded-lg ${selectedCategory.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{selectedCategory.name}</h1>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">Select a provider</p>
          <div className="grid grid-cols-1 gap-3">
            {selectedCategory.providers.map((provider) => (
              <Card
                key={provider.id}
                className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-blue-300 active:scale-95"
                onClick={() => handleProviderSelect(provider.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCategory.color} flex-shrink-0`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{provider.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{provider.accountLabel}</p>
                    </div>
                    <div className="text-blue-600">
                      →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSelection;

