/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { jsPDF as JsPdf } from "jspdf";
import { saveAs } from "file-saver-es";
import { Workbook } from "exceljs";

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
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = spinningStyles;
  document.head.appendChild(styleElement);
}

// Importing data fetching function
import {
  getTobeLoadedData,
  syncTobeLoadedData,
} from "@/app/api/client/reports/tobe-loaded/TobeLoadedApiClient";

import AppLayout from "@/components/layout/Layout";

// Import auth context for token access
import { useAuth } from "@/contexts/auth";
import { useSession } from "next-auth/react";

import {
  DataGrid,
  DataGridRef,
  Sorting,
  Selection,
  HeaderFilter,
  Scrolling,
  SearchPanel,
  ColumnChooser,
  Export,
  Column,
  Toolbar,
  Item,
  LoadPanel,
  DataGridTypes,
  Paging,
  Pager,
  Grouping,
  GroupPanel,
  Summary,
  GroupItem,
  SortByGroupSummaryInfo,
} from "devextreme-react/data-grid";

import Button from "devextreme-react/button";
import DropDownButton, {
  DropDownButtonTypes,
} from "devextreme-react/drop-down-button";

import { exportDataGrid as exportDataGridToPdf } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToXLSX } from "devextreme/excel_exporter";

import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";

import { ITobeLoadedJob, StatusList } from "@/types/TobeLoadedJob";
import {
  JOB_STATUS,
  JOB_STATUS_LIST,
  JOB_STATUS_DEPARTMENTS,
  JOB_STATUS_PAYMENT,
} from "@/shared/constants";

type FilterStatusListType = StatusList | "All";
const filterJobStatus = ["All", ...JOB_STATUS];

const cellNameRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <div className="name-template">
    <div>{cell.data.CustomerName}</div>
    <div className="position">{cell.data.ConsigneeName}</div>
  </div>
);

const cellProfitRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <span>${cell.data.TotalProfit?.toFixed(2) || "0.00"}</span>
);

const onExporting = (e: DataGridTypes.ExportingEvent) => {
  if (e.format === "pdf") {
    const doc = new JsPdf();
    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: e.component,
    }).then(() => {
      doc.save("TotalProfit.pdf");
    });
  } else {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("TotalProfit");

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "TotalProfit.xlsx"
        );
      });
    });
    e.cancel = true;
  }
};

const dropDownOptions = { width: "auto" };
const exportFormats = ["xlsx", "pdf"];

// Helper function to format number with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function TobeLoadedClientReport() {
  // Get auth context for token access (when auth system includes tokens)
  const { user } = useAuth();
  const { data: session } = useSession();

  const [gridDataSource, setGridDataSource] =
    useState<DataSource<ITobeLoadedJob[], string>>();
  const [isPanelOpened, setPanelOpened] = useState(false);
  const [contactId, setContactId] = useState<number>(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const gridRef = useRef<DataGridRef>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [totalProfit, setTotalProfit] = useState<number>(0);

  const [statusList, setStatusList] = useState("All");
  const [statusListFilter, setStatusListFilter] = useState<string>("All");

  // Helper function to get auth token (placeholder for when auth system includes tokens)
  const getAuthToken = useCallback(() => {
    // When your auth system includes tokens, you would get it like:
    // return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    // For now, return undefined since the current auth system doesn't use tokens
    return undefined;
  }, []);

  // Helper function to load data with current parameters
  const loadTotalProfitsData = useCallback(() => {
    const params: {
      page: number;
      limit: number;
      statusType?: string;
    } = {
      page: 1,
      limit: 0,
    };

    // Add status list filter if set
    if (statusListFilter && statusListFilter !== "All") {
      params.statusType = statusListFilter;
    }

    return getTobeLoadedData(params);
  }, [statusListFilter]);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        key: "_id",
        load: loadTotalProfitsData,
      })
    );
  }, [loadTotalProfitsData]);

  // Calculate total profit when grid data changes
  useEffect(() => {
    if (gridDataSource) {
      gridDataSource.load().then((data: ITobeLoadedJob[]) => {
        const total = data.reduce(
          (sum, item) => sum + (item.TotalProfit || 0),
          0
        );
        setTotalProfit(total);
      });
    }
  }, [gridDataSource]);

  const changePanelOpened = useCallback(() => {
    setPanelOpened(!isPanelOpened);
    gridRef.current?.instance().option("focusedRowIndex", -1);
  }, [isPanelOpened]);

  const changePanelPinned = useCallback(() => {
    gridRef.current?.instance().updateDimensions();
  }, []);

  const syncAndUpdateData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncTobeLoadedData();

      if (!result.success) {
        throw new Error("Failed to sync Total Profit", result);
      }
      loadTotalProfitsData();
      notify("Total Profit data synced successfully", "success", 3000);
    } catch (error) {
      console.error("Error loading Total Profit:", error);
      return [];
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const filterByStatusList = useCallback(
    (e: DropDownButtonTypes.SelectionChangedEvent) => {
      const { item: statusList }: { item: FilterStatusListType } = e;

      if (statusList === "All") {
        setStatusListFilter("All");
      } else {
        setStatusListFilter(statusList);
      }

      setStatusList(statusList);

      // Refresh the grid data source with new filter
      setGridDataSource(
        new DataSource({
          key: "_id",
          load: loadTotalProfitsData,
        })
      );
    },
    [loadTotalProfitsData]
  );

  // Function to update grid dimensions on window resize
  // Function to refresh the grid
  const refresh = useCallback(() => {
    gridRef.current?.instance().refresh();
  }, []);

  return (
    <AppLayout>
      <div className="view crm-contact-list">
        <div className="view-wrapper view-wrapper-contact-list list-page">
          <DataGrid
            className="grid theme-dependent"
            noDataText=""
            focusedRowEnabled
            height="100%"
            dataSource={gridDataSource}
            onExporting={onExporting}
            allowColumnReordering
            showBorders
            ref={gridRef}
            filterRow={{ visible: true, applyFilter: "auto" }}
            pager={{
              showPageSizeSelector: true,
              allowedPageSizes: [100, 200, 1000, 0],
              showInfo: true,
              visible: true,
            }}
          >
            <Grouping contextMenuEnabled />
            <GroupPanel visible /> {/* or "auto" */}
            <Paging defaultPageSize={100} />
            <Pager visible showPageSizeSelector />
            <LoadPanel showPane={false} />
            <SearchPanel visible placeholder="Contact Search" />
            <ColumnChooser enabled />
            <Export enabled allowExportSelectedData formats={exportFormats} />
            <Selection
              selectAllMode="allPages"
              showCheckBoxesMode="always"
              mode="multiple"
            />
            <HeaderFilter visible />
            <Sorting mode="multiple" />
            <Scrolling mode="virtual" />
            <Toolbar>
              <Item location="before">
                <div className="grid-header">Total Profit Report</div>
              </Item>
              <Item location="after">
                <div className="total-profit-display">
                  Total Profit: ${formatCurrency(totalProfit)}{" "}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </Item>
              <Item location="before" locateInMenu="auto">
                <DropDownButton
                  items={filterJobStatus}
                  stylingMode="text"
                  text={statusList}
                  dropDownOptions={dropDownOptions}
                  useSelectMode
                  onSelectionChanged={filterByStatusList}
                />
              </Item>
              <Item location="after" locateInMenu="auto">
                <Button
                  icon={isSyncing ? "refresh" : "plus"}
                  text="Sync data"
                  type="default"
                  stylingMode="contained"
                  onClick={syncAndUpdateData}
                  disabled={isSyncing}
                  elementAttr={
                    isSyncing ? { class: "spinning-icon-button" } : {}
                  }
                />
              </Item>
              <Item
                location="after"
                locateInMenu="auto"
                showText="inMenu"
                widget="dxButton"
              >
                <Button
                  icon="refresh"
                  text="Refresh"
                  stylingMode="text"
                  onClick={refresh}
                />
              </Item>
              <Item location="after" locateInMenu="auto">
                <div className="separator" />
              </Item>
              <Item name="exportButton" />
              <Item location="after" locateInMenu="auto">
                <div className="separator" />
              </Item>
              <Item name="columnChooserButton" locateInMenu="auto" />
              <Item name="searchPanel" locateInMenu="auto" />
            </Toolbar>
            <Column
              dataField="JobNo"
              caption="Job#"
              dataType="string"
              sortOrder="asc"
              width={150}
            />
            <Column
              dataField="JobDate"
              caption="Job Date"
              dataType="date"
              width={150}
            />
            <Column
              dataField="CustomerName"
              caption="Customer"
              dataType="string"
              width={250}
              cellRender={cellNameRender}
            />
            <Column dataField="Eta" caption="ETA" dataType="date" width={100} />
            <Column dataField="Ata" caption="ATA" dataType="date" width={100} />
            <Column dataField="StatusType" caption="Status Type" width={150} />
            <Column
              dataField="TotalProfit"
              caption="Total Profit"
              dataType="number"
              cellRender={cellProfitRender}
              format="currency"
              width={100}
            />
            <Column
              dataField="Arrival"
              caption="Arrival"
              dataType="date"
              visible={false}
              width={100}
            />
            <Column
              dataField="DepartmentName"
              caption="Department Name"
              width={150}
              visible={false}
            />
            <Summary>
              <GroupItem
                column="TotalProfit"
                summaryType="count"
                displayFormat="{0} orders"
              />
              <GroupItem
                column="TotalProfit"
                summaryType="sum"
                displayFormat="Total: $ {0}"
                showInGroupFooter
              />
            </Summary>
            <SortByGroupSummaryInfo summaryItem="count" />
          </DataGrid>
        </div>
      </div>
    </AppLayout>
  );
}
