export const navigation = [
  {
    text: 'Admin Reports',
    icon: 'refresh',
    path: '',
    items: [
      {
        text: 'Total Profit',
        path: '/total-profit',
      },
      {
        text: 'Job Status',
        path: '/job-status',
      },
      {
        text: 'Empty Containers',
        path: '/empty-containers',
      },
      {
        text: 'Client Invoices',
        path: '/client-invoices',
      },
      {
        text: 'Ongoing Jobs',
        path: '/ongoing-jobs',
      },
    ],
  },
  {
    text: 'Client Reports',
    icon: 'user',
    path: '',
    items: [
      {
        text: 'To be loaded',
        path: '/client/reports/to-be-loaded',
      },
      {
        text: 'On Water',
        path: '/client/reports/on-water',
      },
      {
        text: 'Under Clearance',
        path: '/client/reports/under-clearance',
      },
      {
        text: 'Invoice Status',
        path: '/client/reports/invoice-status',
      },
    ],
  },
  {
    text: 'KPI Analytics',
    icon: 'chart',
    path: '',
    items: [
      {
        text: 'Dashboard',
        path: '/analytics-dashboard',
      },
      {
        text: 'Sales Report',
        path: '/analytics-sales-report',
      },
      {
        text: 'Geography',
        path: '/analytics-geography',
      },
    ],
  },
  {
    text: 'Settings',
    icon: 'box',
    path: '',
    items: [
      {
        text: 'User Profile',
        path: '/user-profile',
      }
    ]
  },
];
