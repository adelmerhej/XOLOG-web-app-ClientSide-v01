/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

import AppLayout from '@/components/layout/Layout';

// Import ongoing jobs API
import { fetchTobeLoadedData } from '@/app/api/client/reports/tobe-loaded/TobeLoadedApiClient';

// Import auth context for token access
import { useAuth } from '@/contexts/auth';

import {
  DataGrid, DataGridRef,
  Sorting, Selection, HeaderFilter, Scrolling, SearchPanel,
  ColumnChooser, Export, Column, Toolbar, Item, LoadPanel,
  DataGridTypes, Paging, Pager, Grouping, GroupPanel,
  Summary,
  GroupItem,
} from 'devextreme-react/data-grid';

import Button from 'devextreme-react/button';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

import { IOngoingJob } from '@/types/ongoingJob';

const exportFormats = ['xlsx', 'pdf'];

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function TobeLoadedClientReport() {
  // Get auth context for token access (when auth system includes tokens)
  const { user } = useAuth();

  const [gridDataSource, setGridDataSource] = useState<DataSource<IOngoingJob, string>>();
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const gridRef = useRef<DataGridRef>(null);

    // Helper function to load "To Be Loaded" data specifically
  const loadToBeLoadedData = useCallback(async() => {
    // If user not authenticated yet, don't call the API
    if (!user?.token) {
      return [];
    }
    const params: {
      page: number;
      limit: number;
      jobStatusType?: string;
      token?: string;
      userId?: number;
      email?: string;
    } = {
      page: 1,
      limit: 0,
      jobStatusType: 'To Be Loaded', // Filter specifically for "To Be Loaded" status
      token: user.token,
      email:  user.email,
      userId: user.userId,
      // prefer numeric/string id; fallback to unique email if needed
      // userId: user.userId ?? user.email, // prefer numeric/string id; fallback to unique email if needed
    };

    try {
      const data = await fetchTobeLoadedData(params);
      // If API response has a totalProfit field, use it for accurate total
      if (data && typeof data === 'object' && 'totalProfit' in data) {
        setTotalProfit(data.totalProfit || 0);
        // Return the actual data array
        return data.data || data || [];
      }
      return data;
    } catch (error) {
      console.error('Error loading To Be Loaded data:', error);
      return [];
    }
  }, [user?.token, user?.userId, user?.email]);

  useEffect(() => {
    setGridDataSource(new DataSource({
      key: '_id',
      load: loadToBeLoadedData,
    }));
  }, [loadToBeLoadedData]);

  const refresh = useCallback(() => {
    gridRef.current?.instance().refresh();
  }, []);

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

  const cellSpaceReleasedRender = (cell: DataGridTypes.ColumnCellTemplateData) => {
    const spaceReleasedValue = cell.data.SpaceReleased;

    // Debug: Log the actual value and the entire data object to console
    // console.log('Full cell data:', cell.data);
    // console.log('SpaceReleased value:', spaceReleasedValue, 'Type:', typeof spaceReleasedValue);

    // Handle different data types that might represent boolean values
    let isReleased = false;
    if (typeof spaceReleasedValue === 'boolean') {
      isReleased = spaceReleasedValue;
    } else if (typeof spaceReleasedValue === 'string') {
      isReleased = spaceReleasedValue.toLowerCase() === 'true' || spaceReleasedValue === '1' || spaceReleasedValue.toLowerCase() === 'yes';
    } else if (typeof spaceReleasedValue === 'number') {
      isReleased = spaceReleasedValue === 1;
    } else if (spaceReleasedValue === null || spaceReleasedValue === undefined) {
      // Default to false for null/undefined values
      isReleased = false;
    }

    return (
      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: isReleased ? '#4CAF50' : '#F44336',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {isReleased ? '✓' : '✗'}
        </span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
          {isReleased ? 'Released' : 'Not Released'}
        </span>
      </div>
    );
  };

  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      const doc = new JsPdf();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save('ToBeLoadedReport.pdf');
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('ToBeLoadedReport');

      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'ToBeLoadedReport.xlsx');
        });
      });
      e.cancel = true;
    }
  };


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
          <SearchPanel visible placeholder='Search To Be Loaded Jobs' />
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
              <div className='grid-header'>To Be Loaded Jobs Report</div>
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
            dataField='JobDate'
            caption='Job Date'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'JobDate')}
            visible={false}
          />
          <Column
            dataField='ReferenceNo'
            caption='XONO'
            dataType='string'
            width={100}
          />
          <Column
            dataField='ConsigneeName'
            caption='Consignee'
            dataType='string'
            width={250}
            cellRender={cellNameRender}
          />
          <Column
            dataField='MemberOf'
            caption='Member Of'
            visible={false}
          />
          <Column
            dataField='Volume'
            caption='Volume'
            dataType='string'
            width={100}
          />
          <Column
            dataField='CountryOfDeparture'
            caption='Country Of Departure'
            dataType='string'
            width={100}
          />
          <Column
            dataField='Departure'
            caption='POL'
            dataType='string'
            width={100}
          />
          <Column
            dataField='CountryOfDestination'
            caption='Country Of Destination'
            dataType='string'
            width={100}
          />
          <Column
            dataField='Destination'
            caption='POD'
            dataType='string'
            width={100}
          />
          <Column
            dataField='Etd'
            caption='ETD'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'Etd')}
          />
          <Column
            dataField='Eta'
            caption='ETA'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'Eta')}
          />
          <Column
            dataField='CarrierName'
            caption='Sea Carrier'
            width={100}
          />
          <Column
            dataField='LoadingDate'
            caption='Loading Date'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'LoadingDate')}
          />
          <Column
            dataField='CutOffDate'
            caption='Cut Off Date'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'CutOffDate')}
          />
          <Column
            dataField='SpaceReleased'
            caption='Space Released'
            dataType='boolean'
            width={100}
            cellRender={cellSpaceReleasedRender}
          />
          <Column
            dataField='Bl'
            caption='BL#'
            width={100}
          />
          <Column
            dataField='Status'
            caption='Status'
            width={100}
          />
          <Column
            dataField='StatusType'
            caption='Status Type'
            width={100}
            visible={false}
          />
          <Column
            dataField='DepartmentName'
            caption='Department Name'
            visible={false}
          />
          <Summary>
            <GroupItem
              column='JobNo'
              summaryType='count'
              displayFormat='{0} jobs'
              showInGroupFooter
            />
          </Summary>
        </DataGrid>
      </div>
    </div>
    
    </AppLayout>
  );
}
