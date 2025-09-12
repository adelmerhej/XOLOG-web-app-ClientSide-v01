/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

import AppLayout from '@/components/layout/Layout';

// Import OnWater jobs API
import {
  fetchOnWaterData,

} from '@/app/api/client/reports/on-water/OnWaterApiClient';

// Import auth context for token access
import { useAuth } from '../../../../contexts/auth';

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

export default function OnWater() {
  // Get auth context for token access (when auth system includes tokens)
  const { user } = useAuth();

  const [gridDataSource, setGridDataSource] = useState<DataSource<IOngoingJob, string>>();
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const gridRef = useRef<DataGridRef>(null);

  // Helper function to load "On Water" data specifically
  const loadOnWaterData = useCallback(async() => {
    const params: {
      page: number;
      limit: number;
      jobStatusType?: string;
    } = {
      page: 1,
      limit: 0,
      jobStatusType: 'On Water', // Filter specifically for "On Water" status
    };

    try {
      const data = await fetchOnWaterData(params);
      // If API response has a totalProfit field, use it for accurate total
      if (data && typeof data === 'object' && 'totalProfit' in data) {
        setTotalProfit(data.totalProfit || 0);
        // Return the actual data array
        return data.data || data || [];
      }
      return data;
    } catch (error) {
      console.error('Error loading On Water data:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    setGridDataSource(new DataSource({
      key: '_id',
      load: loadOnWaterData,
    }));
  }, [loadOnWaterData]);

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
            visible={false}
            cellRender={(cell) => cellDateRender(cell, 'JobDate')}
          />
          <Column
            dataField='ReferenceNo'
            caption='XONO'
            dataType='string'
            width={100}
          />
          <Column
            dataField='ShipperName'
            caption='Shipper'
            dataType='string'
            width={250}
            cellRender={cellNameRender}
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
            dataType='string'
            width={250}
            cellRender={cellNameRender}
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
            dataField='Atd'
            caption='ATD'
            dataType='date'
            width={100}
            cellRender={(cell) => cellDateRender(cell, 'Atd')}
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
            dataField='Fod'
            caption='FOD'
            width={100}
          />
          <Column
            dataField='StatusType'
            caption='Status Type'
            width={100}
          />
          <Column
            dataField='vessel'
            caption='Vessel'
            width={120}
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
            dataField='PaymentDate'
            caption='Payment Date'
            dataType='date'
            cellRender={(cell) => cellDateRender(cell, 'PaymentDate')}
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
          </Summary>
        </DataGrid>
      </div>
    </div>
  </AppLayout>
  );
}