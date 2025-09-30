/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

// Add CSS for spinning animation
const spinningStyles = `
  .spinning-icon-button .dx-icon.dx-icon-refresh {
    animation: dx-spin 1s linear infinite;
  }
  
  @keyframes dx-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = spinningStyles;
  document.head.appendChild(styleElement);
}
import AppLayout from "@/components/layout/Layout";

// Import OnWater jobs API
import {
  getOnWaterData, syncOnWaterData

} from '@/app/api/client/reports/on-water/OnWaterApiClient';

// Import auth context for token access
import { useAuth } from "@/contexts/auth";

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

import { IOnWaterJob } from '@/types/OnWaterJob';

const exportFormats = ['xlsx', 'pdf'];

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function OnWaterClientReport() {
  // Get auth context for token access (when auth system includes tokens)
  const { user, loading } = useAuth();

  const [gridDataSource, setGridDataSource] = useState<DataSource<IOnWaterJob, string>>();
  const [isSyncing, setIsSyncing] = useState(false);

  const gridRef = useRef<DataGridRef>(null);

  // Helper function to load "On Water" data specifically
  const loadOnWaterData = useCallback(async() => {
    // Avoid firing request while auth still loading
    if (loading) {
      return [];
    }
    const params: {
      page: number;
      limit: number;
      jobStatusType?: string;
      token?: string;
      userId?: number;
    } = {
      page: 1,
      limit: 0,
      jobStatusType: 'On Water', // Filter specifically for "On Water" status
      token: user?.token || (user as unknown as { apiToken?: string })?.apiToken, // prefer apiToken then legacy token
      userId: user?.userId,
    };

    try {
      const data = await getOnWaterData(params);

      return data;
    } catch (error) {
      console.error('Error loading On Water data:', error);
      return [];
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading) {
      setGridDataSource(new DataSource({
        key: '_id',
        load: loadOnWaterData,
      }));
    }
  }, [loadOnWaterData, loading]);

  const syncAndUpdateData = useCallback(async() => {
    setIsSyncing(true);
    try {
      const result = await syncOnWaterData();

      if (!result.success) {
        throw new Error('Failed to sync On Water data');
      }
      refresh();
      notify('On Water data synced successfully', 'success', 3000);
    } catch (error) {
      console.error('Error syncing On Water data:', error);
      notify('Error syncing data', 'error', 3000);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    gridRef.current?.instance().refresh();
  }, []);

  const cellNameRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
    <div className='name-template'>
      <div>{cell.data.CustomerName}</div>
      <div className='position'>{cell.data.ConsigneeName}</div>
    </div>
  );

  const cellDateRender = (cell: DataGridTypes.ColumnCellTemplateData, field: string) => {
    const date = cell.data[field];
    return date ? new Date(date).toLocaleDateString() : '';
  };

  const cellSpaceReleasedRender = (cell: DataGridTypes.ColumnCellTemplateData) => {
    const spaceReleasedValue = cell.data.SpaceReleased;

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
        doc.save('OnWaterReport.pdf');
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('OnWaterReport');

      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'OnWaterReport.xlsx');
        });
      });
      e.cancel = true;
    }
  };

  // Optional simple loading placeholder
  if (loading) {
    return <div style={{ padding: 24 }}>Initializing report...</div>;
  }

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
          <SearchPanel visible placeholder='Search On Water Jobs' />
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
              <div className='grid-header'>On Water Jobs Report</div>
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
                onClick={syncAndUpdateData}
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
            dataField='Mbl'
            caption='Mbl'
            dataType='string'
            width={150}
          />          
          <Column
            dataField='ConsigneeName'
            caption='Consignee'
            dataType='string'
            width={250}
            cellRender={cellNameRender}
            visible={false}
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
            visible={false}
          />
          <Column
            dataField='Destination'
            caption='POD'
            dataType='string'
            width={100}
          />
          <Column
            dataField='ETD'
            caption='ETD'
            dataType='date'
            width={110}
            cellRender={(cell) => cellDateRender(cell, 'ETD')}
          />
          <Column
            dataField='ETA'
            caption='ETA'
            dataType='date'
            width={110}
            cellRender={(cell) => cellDateRender(cell, 'ETA')}
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
