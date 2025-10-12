/**
 * PAYMENT SERVICE USAGE EXAMPLES
 *
 * This file demonstrates how to use the paymentService in your components.
 * All payment endpoints from the API are now available through this service.
 */

import { useEffect, useState } from 'react';
import { paymentService, BulkPayment, Collection, Currency, Transaction } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

export const PaymentServiceExamples = () => {
  const { toast } = useToast();
  const [bulkPayments, setBulkPayments] = useState<BulkPayment[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Example 1: Fetch bulk payments for an organization
  const fetchBulkPayments = async (organizationId: string) => {
    try {
      const response = await paymentService.getBulkPayments({
        organization: organizationId,
        limit: 10,
        offset: 0
      });
      setBulkPayments(response.results);
      console.log('Bulk Payments:', response.results);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch bulk payments',
        variant: 'destructive'
      });
    }
  };

  // Example 2: Create a new bulk payment
  const createBulkPayment = async (organizationId: string, totalAmount: number) => {
    try {
      const newPayment = await paymentService.createBulkPayment({
        organization: organizationId,
        total_amount: totalAmount
      });
      toast({
        title: 'Success',
        description: 'Bulk payment created successfully'
      });
      console.log('Created Bulk Payment:', newPayment);
      return newPayment;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create bulk payment',
        variant: 'destructive'
      });
    }
  };

  // Example 3: Check bulk payment details by link
  const checkBulkPaymentLink = async (linkId: string) => {
    try {
      const response = await paymentService.checkBulkPayment(linkId);
      console.log('Payment Link Details:', response.data);
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check payment link',
        variant: 'destructive'
      });
    }
  };

  // Example 4: Process bulk payment
  const processBulkPayment = async (linkId: string, verificationCode: string, mode: 'mobile_money' | 'bank_transfer' | 'cashout') => {
    try {
      const response = await paymentService.processBulkPayment({
        link: linkId,
        verification_code: verificationCode,
        mode: mode
      });
      toast({
        title: 'Success',
        description: response.message || 'Payment processed successfully'
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process payment',
        variant: 'destructive'
      });
    }
  };

  // Example 5: Fetch collections for an organization
  const fetchCollections = async (organizationId: string) => {
    try {
      const response = await paymentService.getCollections({
        organization: organizationId,
        status: 'pending', // Can filter by status
        limit: 10
      });
      setCollections(response.results);
      console.log('Collections:', response.results);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch collections',
        variant: 'destructive'
      });
    }
  };

  // Example 6: Initiate a collection
  const initiateCollection = async (organizationId: string, amount: number, phoneNumber: string, reason: string) => {
    try {
      const response = await paymentService.initiateCollection({
        organization: organizationId,
        amount: amount,
        phone_number: phoneNumber,
        reason: reason
      });
      toast({
        title: 'Success',
        description: response.message || 'Collection initiated successfully'
      });
      console.log('Collection initiated:', response.data);
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate collection',
        variant: 'destructive'
      });
    }
  };

  // Example 7: Fetch currencies
  const fetchCurrencies = async () => {
    try {
      const response = await paymentService.getCurrencies({ limit: 100 });
      setCurrencies(response.results);
      console.log('Currencies:', response.results);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch currencies',
        variant: 'destructive'
      });
    }
  };

  // Example 8: Mobile money withdraw
  const mobileMoneyWithdraw = async (organizationId: string, amount: number, phoneNumber: string) => {
    try {
      const response = await paymentService.mobileMoneyWithdraw({
        organization: organizationId,
        amount: amount,
        phone_number: phoneNumber
      });
      toast({
        title: 'Success',
        description: response.message || 'Withdrawal initiated successfully'
      });
      console.log('Withdrawal:', response.data);
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate withdrawal',
        variant: 'destructive'
      });
    }
  };

  // Example 9: Get payment transactions
  const fetchTransactions = async (status?: 'pending' | 'successful' | 'failed') => {
    try {
      const response = await paymentService.getTransactions({
        status: status,
        limit: 20
      });
      console.log('Transactions:', response.results);
      return response.results;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch transactions',
        variant: 'destructive'
      });
    }
  };

  // Example 10: Get profit configurations
  const fetchProfitConfigurations = async () => {
    try {
      const response = await paymentService.getProfitConfigurations({ limit: 100 });
      console.log('Profit Configurations:', response.results);
      return response.results;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch profit configurations',
        variant: 'destructive'
      });
    }
  };

  // Example 11: Update profit configuration
  const updateProfitConfig = async (configId: string, fee: number) => {
    try {
      const updated = await paymentService.updateProfitConfiguration(configId, {
        fee: fee,
        use_percentage: false
      });
      toast({
        title: 'Success',
        description: 'Profit configuration updated successfully'
      });
      console.log('Updated Config:', updated);
      return updated;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update configuration',
        variant: 'destructive'
      });
    }
  };

  // Example 12: Get payment links
  const fetchPaymentLinks = async (bulkPaymentId?: string) => {
    try {
      const response = await paymentService.getLinks({
        bulk_payment: bulkPaymentId,
        status: 'sent',
        limit: 10
      });
      console.log('Payment Links:', response.results);
      return response.results;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch payment links',
        variant: 'destructive'
      });
    }
  };

  // Example 13: Get countries and country-currency mappings
  const fetchCountriesAndCurrencies = async () => {
    try {
      const countries = await paymentService.getCountries({ limit: 100 });
      const countryCurrencies = await paymentService.getCountryCurrencies({ limit: 100 });

      console.log('Countries:', countries.results);
      console.log('Country-Currency Mappings:', countryCurrencies.results);

      return { countries: countries.results, mappings: countryCurrencies.results };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch countries data',
        variant: 'destructive'
      });
    }
  };

  // Example 14: Get phone number info (for validation)
  const validatePhoneNumber = async (phoneNumber: string) => {
    try {
      const info = await paymentService.getPhoneNumberInfo(phoneNumber);
      console.log('Phone Number Info:', info);
      return info;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate phone number',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Service Usage Examples</h1>
      <p className="text-muted-foreground mb-6">
        This component demonstrates how to use the payment service.
        Check the console for responses and the source code for implementation details.
      </p>

      {/* The actual UI would go here */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Methods:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>getBulkPayments() - Fetch all bulk payments</li>
            <li>createBulkPayment() - Create a new bulk payment</li>
            <li>checkBulkPayment() - Check payment link details</li>
            <li>processBulkPayment() - Process a payment</li>
            <li>getCollections() - Fetch collections</li>
            <li>initiateCollection() - Initiate a new collection</li>
            <li>mobileMoneyWithdraw() - Initiate mobile money withdrawal</li>
            <li>getCurrencies() - Get available currencies</li>
            <li>getTransactions() - Get payment transactions</li>
            <li>getProfitConfigurations() - Get profit configurations</li>
            <li>updateProfitConfiguration() - Update profit config</li>
            <li>getLinks() - Get payment links</li>
            <li>getCountries() - Get countries</li>
            <li>getPhoneNumberInfo() - Validate phone number</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * HOW TO USE IN YOUR COMPONENTS:
 *
 * 1. Import the service:
 *    import { paymentService } from '@/services/paymentService';
 *
 * 2. Import types as needed:
 *    import { BulkPayment, Collection, Currency } from '@/services/paymentService';
 *
 * 3. Call methods in your async functions:
 *    const payments = await paymentService.getBulkPayments({ organization: orgId });
 *
 * 4. Handle errors appropriately with try-catch blocks
 *
 * 5. All methods return properly typed responses matching the API documentation
 */

export default PaymentServiceExamples;
