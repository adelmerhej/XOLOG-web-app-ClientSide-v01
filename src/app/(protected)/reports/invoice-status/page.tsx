/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

import AppLayout from '@/components/layout/Layout';

// Importing data fetching functions
import {
  fetchClientInvoices,
  syncClientInvoicesData,
} from '@/app/api/client/reports/client-invoice/clientInvoiceApi';

// Import auth context for token access
import { useAuth } from '../../../../contexts/auth';

import {
  DataGrid, DataGridRef,
  Sorting, Selection, HeaderFilter, Scrolling, SearchPanel,
  ColumnChooser, Export, Column, Toolbar, Item, LoadPanel,
  DataGridTypes, Paging, Pager, Grouping, GroupPanel,
  Summary,
  GroupItem,
  SortByGroupSummaryInfo,
  MasterDetail
} from 'devextreme-react/data-grid';

import Button from 'devextreme-react/button';

import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';

import { IClientInvoice } from '@/types/clientInvoice';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
//import './InvoiceDetails.css';

// Import the detailed template component
import { InvoiceDetailTemplate } from './InvoiceDetailedStatusClientReport';

const exportFormats = ['xlsx', 'pdf'];

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const cellTotalInvoicesRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <span>${cell.data.TotalInvoices?.toFixed(2) || '0.00'}</span>
);

const cellProfitRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <span>${cell.data.TotalProfit?.toFixed(2) || '0.00'}</span>
);

const cellNameRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <div className='name-template'>
    <div>{cell.data.Customer}</div>
    <div className='position'>{cell.data.Consignee}</div>
  </div>
);

const cellDateRender = (cell: DataGridTypes.ColumnCellTemplateData, field: string) => {
  const date = cell.data[field];
  return date ? new Date(date).toLocaleDateString() : '';
};

const onExporting = (e: DataGridTypes.ExportingEvent) => {
  if (e.format === 'pdf') {
    const doc = new JsPdf();
    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: e.component,
    }).then(() => {
      doc.save('InvoiceStatusReport.pdf');
    });
  } else {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('InvoiceStatusReport');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'InvoiceStatusReport.xlsx');
      });
    });
    e.cancel = true;
  }
};

export default function InvoiceStatusClientReport() {
const [gridDataSource, setGridDataSource] = useState<DataSource<IClientInvoice, string>>();
  const gridRef = useRef<DataGridRef>(null);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalInvoice, setTotalInvoice] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = useCallback(() => {
    gridRef.current?.instance().refresh();
  }, []);

  const syncAndUpdateData = useCallback(async() => {
    setIsSyncing(true);

    try {
      const result = await syncClientInvoicesData();

      if (!result.success) {
        throw new Error('Failed to sync Invoice Status data', result);
      }
      refresh();
      notify('Invoice Status data synced successfully', 'success', 3000);
    } catch (error) {
      console.error('Error loading invoice status:', error);
      return [];
    }finally {
      setIsSyncing(false);
    }
  }, [refresh]);

  // Helper function to load data - no filters applied
  const loadInvoiceStatusData = useCallback(async() => {
    const params: {
      page: number;
      limit: number;
    } = {
      page: 1,
      limit: 0,
    };

    console.log('Loading invoice status with params:', params);

    try {
      const clientInvoices = await fetchClientInvoices(params);
      return clientInvoices as IClientInvoice[];
    } catch (error) {
      console.error('Error loading invoice status:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadInvoiceStatusData();
  }, [loadInvoiceStatusData]);

  useEffect(() => {
    const dataSource = new DataSource({
      key: 'JobNo',
      load: loadInvoiceStatusData,
    });

    setGridDataSource(dataSource);
  }, [loadInvoiceStatusData]);

  // Calculate total profit when grid data changes
  useEffect(() => {
    if (gridDataSource) {
      gridDataSource.load().then((data: IClientInvoice[]) => {
        const totalInvoice = data.reduce((sum, item) => sum + (item.TotalInvoices || 0), 0);
        const totalProfit = data.reduce((sum, item) => sum + (item.TotalProfit || 0), 0);
        setTotalInvoice(totalInvoice);
        setTotalProfit(totalProfit);
      });
    }
  }, [gridDataSource]);

  const refreshOnClick = useCallback(() => {
    // Refresh data with current parameters
    setGridDataSource(new DataSource({
      key: 'JobNo',
      load: loadInvoiceStatusData,
    }));

    gridRef.current?.instance().refresh();
  }, [loadInvoiceStatusData]);


  return (
    <AppLayout>
    <div className='view crm-contact-list'>
      <div className='view-wrapper view-wrapper-contact-list list-page'>
        <DataGrid
          className='grid theme-dependent'
          noDataText=''
          focusedRowEnabled
          height='100%'
          dataSource={gridDataSource}
          onExporting={onExporting}
          allowColumnReordering
          showBorders
          ref={gridRef}
          filterRow={{ visible: true, applyFilter: 'auto' }}
          pager={{
            showPageSizeSelector: true,
            allowedPageSizes: [100, 200, 1000, 0],
            showInfo: true,
            visible: true,
          }}
        >
          <MasterDetail
            enabled
            component={InvoiceDetailTemplate}
          />
          <Grouping contextMenuEnabled />
          <GroupPanel visible />
          <Paging defaultPageSize={100} />
          <Pager visible showPageSizeSelector />
          <LoadPanel showPane={false} />
          <SearchPanel visible placeholder='Job Search' />
          <ColumnChooser enabled />
          <Export enabled allowExportSelectedData formats={exportFormats} />
          <Selection
            selectAllMode='allPages'
            showCheckBoxesMode='always'
            mode='multiple'
          />
          <HeaderFilter visible />
          <Sorting mode='multiple' />
          <Scrolling mode='virtual' />
          <Toolbar>
            <Item location='before'>
              <div className='grid-header'>Invoice Status Report</div>
            </Item>
            <Item location='after'>
              <div className='total-profit-display'>Total Invoices: ${formatCurrency(totalInvoice)} &nbsp;&nbsp;&nbsp;&nbsp;</div>
            </Item>
            <Item location='after'>
              <div className='total-profit-display'>Total Profit: ${formatCurrency(totalProfit)} &nbsp;&nbsp;&nbsp;&nbsp;</div>
            </Item>

            <Item
              location='after'
              locateInMenu='auto'
              showText='inMenu'
              widget='dxButton'
            >
              <Button
                icon='refresh'
                text='Refresh'
                stylingMode='text'
                onClick={refresh}
              />
            </Item>
            <Item location='after' locateInMenu='auto'>
              <div className='separator' />
            </Item>
            <Item name='exportButton' />
            <Item location='after' locateInMenu='auto'>
              <div className='separator' />
            </Item>
            <Item name='columnChooserButton' locateInMenu='auto' />
            <Item name='searchPanel' locateInMenu='auto' />
          </Toolbar>
          <Column
            dataField='JobNo'
            caption='Job#'
            dataType='number'
            alignment='left'
            sortOrder='asc'
            width={100}
          />
          <Column
            dataField='Customer'
            caption='Customer'
            dataType='string'
            width={150}
            cellRender={cellNameRender}
          />
          <Column
            dataField='DepartmentName'
            caption='Department'
            width={120}
            visible={false}
          />
          <Column
            dataField='StatusType'
            caption='Status Type'
            width={120}
            visible={false}
          />
          <Column
            dataField='Pol'
            caption='POL'
            width={100}
          />
          <Column
            dataField='Pod'
            caption='POD'
            width={100}
          />
          <Column
            dataField='Etd'
            caption='ETD'
            dataType='date'
            width={100}
          />
          <Column
            dataField='Eta'
            caption='ETA'
            dataType='date'
            width={100}
          />
          <Column
            dataField='Atd'
            caption='ATD'
            dataType='date'
            width={100}
          />
          <Column
            dataField='Ata'
            caption='ATA'
            dataType='date'
            width={100}
          />
          <Column
            dataField='TotalInvoices'
            caption='Total Invoices'
            dataType='number'
            format='currency'
            width={120}
            customizeText={(data) => {
              const value = typeof data.value === 'number' ? data.value : 0;
              const formattedValue = formatCurrency(value);
              return `${formattedValue}`;
            }}
          />
          <Column
            dataField='TotalProfit'
            caption='Total Profit'
            dataType='number'
            format='currency'
            width={120}
            customizeText={(data) => {
              const value = typeof data.value === 'number' ? data.value : 0;
              const formattedValue = formatCurrency(value);
              return `${formattedValue}`;
            }}
          />
          <Column
            dataField='Consignee'
            caption='Consignee'
            width={120}
            visible={false}
          />
          <Column
            dataField='Notes'
            caption='Notes'
            width={200}
            visible={false}
          />
          <Column
            dataField='vessel'
            caption='Vessel'
            width={120}
            visible={false}
          />
          <Column
            dataField='Invoices'
            caption='Invoices Count'
            cellRender={(cell) => <span>{cell.data.Invoices?.length || 0}</span>}
            width={100}
          />
          <Summary>
            <GroupItem
              column='JobNo'
              summaryType='count'
              displayFormat='{0} jobs'
            />
            <GroupItem
              column='TotalProfit'
              summaryType='sum'
              customizeText={(data) => {
                const value = typeof data.value === 'number' ? data.value : 0;
                const formattedValue = formatCurrency(value);
                return `Totals: $${formattedValue}`;
              }}
              showInGroupFooter
            />
            <GroupItem
              column='TotalInvoices'
              summaryType='sum'
              customizeText={(data) => {
                const value = typeof data.value === 'number' ? data.value : 0;
                const formattedValue = formatCurrency(value);
                return `Totals: $${formattedValue}`;
              }}
              showInGroupFooter
            />
          </Summary>
          <SortByGroupSummaryInfo summaryItem='count' />
        </DataGrid>
      </div>
    </div>
    </AppLayout>
  );
}
