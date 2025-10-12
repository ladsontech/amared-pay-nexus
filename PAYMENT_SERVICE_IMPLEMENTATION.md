# Payment Service Implementation

This document outlines the comprehensive payment service implementation that integrates all payment-related API endpoints into your application.

## Overview

A complete payment service (`paymentService`) has been created that implements all payment endpoints from your API documentation. This service provides typed methods for all payment operations including bulk payments, collections, mobile money transactions, and more.

## File Locations

- **Payment Service**: `/src/services/paymentService.ts`
- **Usage Examples**: `/src/examples/PaymentServiceUsageExample.tsx`
- **API Configuration**: `/src/services/api-config.ts` (already configured)

## Available Endpoints

### 1. Currencies
- `getCurrencies(params?)` - List all currencies
- `getCurrency(id)` - Get specific currency details

### 2. Countries
- `getCountries(params?)` - List all countries
- `getCountry(id)` - Get specific country details
- `getCountryCurrencies(params?)` - List country-currency mappings
- `getCountryCurrency(id)` - Get specific country-currency mapping

### 3. Bulk Payments
- `getBulkPayments(params?)` - List bulk payments with filters (organization, currency, etc.)
- `getBulkPayment(id)` - Get specific bulk payment details
- `createBulkPayment(data)` - Create a new bulk payment
- `checkBulkPayment(linkId)` - Check payment link details
- `processBulkPayment(data)` - Process a bulk payment transaction

### 4. Payment Links
- `getLinks(params?)` - List payment links with filters
- `getLink(id)` - Get specific payment link details

### 5. Transactions
- `getTransactions(params?)` - List transactions with filters (mode, status, etc.)
- `getTransaction(id)` - Get specific transaction details

### 6. Collections
- `getCollections(params?)` - List collections with filters
- `getCollection(id)` - Get specific collection details
- `initiateCollection(data)` - Initiate a new collection

### 7. Mobile Money
- `getMoMoWithdraws(params?)` - List mobile money withdrawals
- `getMoMoWithdraw(id)` - Get specific withdrawal details
- `mobileMoneyWithdraw(data)` - Initiate a mobile money withdrawal
- `getPhoneNumberInfo(phoneNumber)` - Validate phone number information

### 8. Profits & Configuration
- `getProfits(params?)` - List all profits
- `getProfit(id)` - Get specific profit details
- `getProfitConfigurations(params?)` - List profit configurations
- `getProfitConfiguration(id)` - Get specific profit configuration
- `updateProfitConfiguration(id, data)` - Update profit configuration

## TypeScript Types

All API responses are fully typed. Available types include:

```typescript
- Currency
- Country
- CountryCurrency
- Organization
- Profit
- BulkPayment
- Transaction
- Link
- Collection
- MoMoWithdraw
- ProfitConfiguration
- PaginatedResponse<T>
- ApiResponse<T>
```

## Request Types

```typescript
- CreateBulkPaymentRequest
- ProcessBulkPaymentRequest
- InitiateCollectionRequest
- MobileMoneyWithdrawRequest
- UpdateProfitConfigRequest
```

## Usage Examples

### Import the Service

```typescript
import { paymentService } from '@/services/paymentService';
import { BulkPayment, Collection, Currency } from '@/services/paymentService';
```

### Fetch Bulk Payments

```typescript
const fetchBulkPayments = async (organizationId: string) => {
  try {
    const response = await paymentService.getBulkPayments({
      organization: organizationId,
      limit: 10,
      offset: 0
    });
    console.log('Bulk Payments:', response.results);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Create Bulk Payment

```typescript
const createPayment = async (orgId: string, amount: number) => {
  try {
    const payment = await paymentService.createBulkPayment({
      organization: orgId,
      total_amount: amount
    });
    return payment;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Initiate Collection

```typescript
const initiateCollection = async (orgId: string) => {
  try {
    const response = await paymentService.initiateCollection({
      organization: orgId,
      amount: 10000,
      phone_number: '+256700000000',
      reason: 'Payment for services'
    });
    console.log('Collection:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Process Bulk Payment

```typescript
const processPayment = async (linkId: string, code: string) => {
  try {
    const response = await paymentService.processBulkPayment({
      link: linkId,
      verification_code: code,
      mode: 'mobile_money'
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Mobile Money Withdrawal

```typescript
const withdraw = async (orgId: string) => {
  try {
    const response = await paymentService.mobileMoneyWithdraw({
      organization: orgId,
      amount: 5000,
      phone_number: '+256700000000'
    });
    console.log('Withdrawal:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get Currencies

```typescript
const fetchCurrencies = async () => {
  try {
    const response = await paymentService.getCurrencies({ limit: 100 });
    console.log('Currencies:', response.results);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Query Parameters

All list endpoints support query parameters for filtering and pagination:

```typescript
{
  limit?: number;          // Number of results per page
  offset?: number;         // Starting index
  organization?: string;   // Filter by organization ID
  status?: string;         // Filter by status
  currency?: string;       // Filter by currency
  // ... and more depending on the endpoint
}
```

## Response Format

### Paginated Responses

```typescript
{
  count: number;           // Total number of items
  next: string | null;     // URL to next page
  previous: string | null; // URL to previous page
  results: T[];           // Array of results
}
```

### API Action Responses

```typescript
{
  success: boolean;       // Operation success status
  message: string;        // Response message
  data: T;               // Result data
}
```

## Error Handling

All service methods throw errors that can be caught and handled:

```typescript
try {
  const result = await paymentService.someMethod(params);
  // Handle success
} catch (error: any) {
  // error.status - HTTP status code
  // error.details - Detailed error information
  // error.message - Error message
  toast({
    title: 'Error',
    description: error.message || 'Operation failed',
    variant: 'destructive'
  });
}
```

## Integration with Existing Pages

The payment service can be integrated into your existing pages:

1. **OrgBulkPayments.tsx** - Use `getBulkPayments()`, `createBulkPayment()`, `processBulkPayment()`
2. **OrgCollections.tsx** - Use `getCollections()`, `initiateCollection()`
3. **OrgDeposits.tsx** - Use `mobileMoneyWithdraw()`, `getMoMoWithdraws()`
4. **System Settings** - Use `getProfitConfigurations()`, `updateProfitConfiguration()`

## Best Practices

1. **Always handle errors** - Wrap service calls in try-catch blocks
2. **Use TypeScript types** - Import types for better type safety
3. **Show user feedback** - Use toast notifications for success/error states
4. **Load states** - Implement loading indicators during API calls
5. **Pagination** - Use limit/offset parameters for large datasets
6. **Filter data** - Use query parameters to filter results on the server

## Next Steps

1. Replace mock data in existing components with real API calls
2. Implement pagination for list views
3. Add comprehensive error handling
4. Create reusable hooks for common operations (e.g., `useBulkPayments`, `useCollections`)
5. Add optimistic updates for better UX
6. Implement caching strategies if needed

## Notes

- All endpoints are configured in `api-config.ts`
- Authentication is handled automatically via `apiClient`
- The service uses the same error handling pattern as other services
- All types match the API documentation exactly

For detailed usage examples, see `/src/examples/PaymentServiceUsageExample.tsx`
