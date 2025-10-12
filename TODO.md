# Fix Organization Dashboard to Show Real Data

## Tasks
- [ ] Import useOrganization hook in OrgDashboard.tsx
- [ ] Replace hardcoded dashboardData with data from useOrganization hook
- [ ] Map API data to dashboard structure:
  - totalCollections: sum of wallet balances or specific collections wallet
  - walletBalance: totalWalletBalance from hook
  - pettyCashBalance: balance from petty cash wallet if exists
  - monthlyTransactions: monthlyTransactions from hook
  - pendingApprovals: pendingApprovals from hook
  - recentTransactions: map walletTransactions to dashboard format
  - teamMetrics: use totalStaff, activeStaff from hook
- [ ] Add loading states and error handling
- [ ] Test the dashboard displays real organization data

## Status
In Progress
