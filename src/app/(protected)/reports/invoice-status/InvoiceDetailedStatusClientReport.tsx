/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { DataGrid, Column, type DataGridTypes } from 'devextreme-react/data-grid';
import { ArrayStore, DataSource } from 'devextreme-react/common/data';
//import './InvoiceDetails.css';
import { IClientInvoice } from '@/types/clientInvoice';
// Importing data fetching function
import {
  fetchClientInvoices,
  syncClientInvoicesData,
} from '@/app/api/client/reports/client-invoice/clientInvoiceApi';

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const InvoiceDetailTemplate = (props: DataGridTypes.MasterDetailTemplateData) => {
  const { Customer, DepartmentName, TotalInvoices } = props.data.data;
  const [gridDataSource, setGridDataSource] = React.useState<DataSource | null>(null);

  const dataSource = new DataSource({
    store: new ArrayStore({
      data: props.data.data.Invoices || [],
      key: 'InvoiceNo', // Assuming InvoiceNo is unique for invoices
    }),
  });

  const loadInvoiceStatusDetailData = React.useCallback(async() => {
    // Simulate an API call to fetch client invoices data
    try {
      const clientInvoices = await fetchClientInvoices();
      return clientInvoices.invoices as IClientInvoice[];
    } catch (error) {
      console.error('Error loading invoice status detail:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const dataSource = new DataSource({
      key: 'JobNo',
      load: loadInvoiceStatusDetailData,
    });

    setGridDataSource(dataSource);
  }, [loadInvoiceStatusDetailData]);

  const formatTotalInvoiceRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
    <span>${cell.data.TotalAmount?.toFixed(2) || '0.00'}</span>
  );

  const formatTotalReceivedRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
    <span>${cell.data.TotalReceive?.toFixed(2) || '0.00'}</span>
  );

  const formatTotalDueRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
    <span>${cell.data.TotalDue?.toFixed(2) || '0.00'}</span>
  );

  return (
    <React.Fragment>
      <div style={{ padding: '5px' }}>
        <div className='master-detail-caption'>
          Detailed Invoice Status:
        </div>
        <div style={{ marginBottom: '5px', color: '#666' }}>
          Customer: {Customer} | Department: {DepartmentName} | Total Invoices: ${formatCurrency(TotalInvoices || 0)}
        </div>
        <DataGrid
          dataSource={dataSource}
          showBorders
          showRowLines
          rowAlternationEnabled
          columnAutoWidth
        >
          <Column dataField='InvoiceNo' />
          <Column dataField='InvoiceDate' dataType='date' />
          <Column dataField='DueDate' dataType='date' />
          <Column dataField='CurrencyCode' />
          <Column
            dataField='TotalAmount'
            dataType='number'
            format='currency'
            alignment='right'
            customizeText={(data) => {
              const value = typeof data.value === 'number' ? data.value : 0;
              const formattedValue = formatCurrency(value);
              return `${formattedValue}`;
            }}
          />
          <Column
            dataField='TotalReceived'
            dataType='number'
            format='currency'
            alignment='right'
            customizeText={(data) => {
              const value = typeof data.value === 'number' ? data.value : 0;
              const formattedValue = formatCurrency(value);
              return `${formattedValue}`;
            }}
          />
          <Column
            dataField='TotalDue'
            dataType='number'
            format='currency'
            alignment='right'
            customizeText={(data) => {
              const value = typeof data.value === 'number' ? data.value : 0;
              const formattedValue = formatCurrency(value);
              return `${formattedValue}`;
            }}
          />
        </DataGrid>
      </div>
    </React.Fragment>
  );
};
