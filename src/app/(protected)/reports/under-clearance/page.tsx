/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

import AppLayout from '@/components/layout/Layout';

// Importing data fetching function
import {
  fetchUnderClearanceData
} from '@/app/api/client/reports/under-clearance/UnderClearanceApiClient';

// Import auth context for token access
import { useAuth } from '../../../../contexts/auth';

import {
  DataGrid, DataGridRef,
  Sorting, Selection, HeaderFilter, Scrolling, SearchPanel,
  ColumnChooser, Export, Column, Toolbar, Item, LoadPanel,
  DataGridTypes, Paging, Pager, Grouping, GroupPanel,
  FilterRow, Summary, GroupItem, SortByGroupSummaryInfo
} from 'devextreme-react/data-grid';

import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import DropDownButton, { DropDownButtonTypes } from 'devextreme-react/drop-down-button';

import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';

import { JobStatusPayment as JobStatusPaymentType,
  IOngoingJob } from '@/types/TobeLoadedJob';

import { JOB_STATUS_PAYMENT } from '../../../../shared/constants';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

type FilterJobStatusPaymentType = JobStatusPaymentType | 'All';

const filterPaymentList = ['All', ...JOB_STATUS_PAYMENT];

const cellNameRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <div className='name-template'>
    <div>{cell.data.CustomerName}</div>
    <div className='position'>{cell.data.ConsigneeName}</div>
  </div>
);

const cellProfitRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <span>${cell.data.TotalProfit?.toFixed(2) || '0.00'}</span>
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
      doc.save('UnderClearanceReport.pdf');
    });
  } else {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('UnderClearanceReport');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'UnderClearanceReport.xlsx');
      });
    });
    e.cancel = true;
  }
};

const dropDownOptions = { width: 'auto' };
const exportFormats = ['xlsx', 'pdf'];

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};


export default function UnderClearanceClientReport() {
  // Get auth context for token access (when auth system includes tokens)
  const { user } = useAuth();

  const [gridDataSource, setGridDataSource] = useState<DataSource<IOngoingJob, string>>();
  const [paymentStatus, setPaymentStatus] = useState(filterPaymentList[0]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const gridRef = useRef<DataGridRef>(null);

  // Helper function to load data with current parameters - filtered for "Under Clearance" only
  const loadUnderClearanceData = useCallback(async() => {
    const params: {
      page: number;
      limit: number;
      fullPaid?: string;
      jobStatusType?: string; // Add status type filter
    } = {
      page: 1,
      limit: 0,
      jobStatusType: 'Under Clearance' // Filter only "Under Clearance" data
    };

    // Add payment status filter if set
    if (paymentStatusFilter) {
      if (paymentStatusFilter === 'Full Paid') {
        params.fullPaid = 'true';
      } else if (paymentStatusFilter === 'Not Paid') {
        params.fullPaid = 'false';
      } else {
        params.fullPaid = undefined;
      }
    }

    const data = await fetchUnderClearanceData(params);
    // If API response has a totalProfit field, use it for accurate total
    if (data && typeof data === 'object' && 'totalProfit' in data) {
      setTotalProfit(data.totalProfit || 0);
      // Return the actual data array
      return data.data || data || [];
    }
    return data;

  }, [paymentStatusFilter]);

  useEffect(() => {
    setGridDataSource(new DataSource({
      key: '_id',
      load: loadUnderClearanceData,
    }));
  }, [loadUnderClearanceData]);

  const filterByJobPaymentStatus = useCallback((e: DropDownButtonTypes.SelectionChangedEvent) => {
    const { item: paymentStatus }: { item: FilterJobStatusPaymentType } = e;

    setTotalProfit(0); // Reset total to get fresh API total

    if (paymentStatus === 'All') {
      setPaymentStatusFilter(null);
    } else {
      setPaymentStatusFilter(paymentStatus);
    }

    setPaymentStatus(paymentStatus);

    // Refresh the grid data source with new filter
    setGridDataSource(new DataSource({
      key: '_id',
      load: loadUnderClearanceData,
    }));
  }, [loadUnderClearanceData]);

  const refresh = useCallback(() => {
    gridRef.current?.instance().refresh();
  }, []);

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
          <Grouping contextMenuEnabled />
          <GroupPanel visible />
          <Paging defaultPageSize={100} />
          <Pager visible showPageSizeSelector />
          <LoadPanel showPane={false} />
          <SearchPanel visible placeholder='Contact Search' />
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
              <div className='grid-header'>Under Clearance Report</div>
            </Item>
            <Item location='after'>
              <div className='total-profit-display'>Total Profit: ${formatCurrency(totalProfit)} &nbsp;&nbsp;&nbsp;&nbsp;</div>
            </Item>
            <Item location='before' locateInMenu='auto'>
              <DropDownButton
                items={filterPaymentList}
                stylingMode='text'
                text={paymentStatus}
                dropDownOptions={dropDownOptions}
                useSelectMode
                onSelectionChanged={filterByJobPaymentStatus}
              />
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
            dataField='JobDate'
            caption='Job Date'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'JobDate')}
          />
          <Column
            dataField='ReferenceNo'
            caption='XONO'
            dataType='string'
            width={100}
          />
          <Column
            dataField='CustomerName'
            caption='Customer'
            dataType='string'
            width={250}
            cellRender={cellNameRender}
          />
          <Column
            dataField='Eta'
            caption='ETA'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'Eta')}
          />
          <Column
            dataField='Ata'
            caption='ATA'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'Ata')}
          />
          <Column
            dataField='StatusType'
            caption='Status Type'
            width={100}
          />
          <Column
            dataField='PaymentDate'
            caption='Payment Date'
            dataType='date'
            cellRender={(cell) => cellDateRender(cell, 'PaymentDate')}
          />
          <Column
            dataField='TotalProfit'
            caption='Total Profit'
            dataType='number'
            cellRender={cellProfitRender}
            format='currency'
          />
          <Column
            dataField='DepartmentName'
            caption='Department Name'
            visible={false}
          />
          <Column
            dataField='Arrival'
            caption='Arrival'
            visible={false}
          />
          <Column
            dataField='MemberOf'
            caption='Member Of'
            visible={false}
          />
          <Column
            dataField='OperatingUserId'
            caption='Operating User'
            visible={false}
          />
          <Column
            dataField='Tejrim'
            caption='Tejrim'
            visible={false}
          />
          <Column
            dataField='CanceledJob'
            caption='Canceled Job'
            visible={false}
          />
          <Column
            dataField='PendingCosts'
            caption='Pending Costs'
            visible={false}
          />
          <Column
            dataField='FullPaid'
            caption='Full Paid'
            visible={false}
          />
          <Column
            dataField='Status'
            caption='Status'
            visible={false}
          />
          <Column
            dataField='JobStatusType'
            caption='Job Type'
            visible={false}
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
    </div>    </AppLayout>
  );
}
