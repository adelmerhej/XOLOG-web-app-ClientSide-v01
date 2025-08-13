import { JOB_STATUS, JOB_STATUS_LIST, JOB_STATUS_DEPARTMENTS, JOB_STATUS_PAYMENT, INVOICE_PAYMENT } from '../shared/constants';

export type JobStatus = (typeof JOB_STATUS)[number];

export type JobStatusPayment = (typeof JOB_STATUS_PAYMENT)[number];
export type InvoicePayment = (typeof INVOICE_PAYMENT)[number];

export type StatusList = (typeof JOB_STATUS_LIST)[number];

export type JobStatusDepartments = (typeof JOB_STATUS_DEPARTMENTS)[number];

export interface IClientInvoice extends Document {
  _id: string;
  JobNo: number;
  JobType: string;
  DepartmentId: number;
  DepartmentName: string;
  ReferenceNo: string;
  JobDate: Date;
  Customer: string;
  Consignee: string;
  Mbl?: string;
  CountryOfDeparture?: string;
  CountryOfDestination?: string;
  Pol?: string;
  Pod?: string;
  Etd?: Date;
  Eta?: Date;
  Atd?: Date;
  Ata?: Date;
  Volume?: string;
  Status?: string;
  StatusType?: string;
  JobStatusType?: JobStatus;
  UserName?: string;
  Salesman?: string;
  ArrivalDate?: Date;
  Notes?: string;
  Vessel?: string;
  TotalInvoices?: number;
  TotalCosts?: number;
  TotalProfit?: number;
  createdAt: Date;
  updatedAt: Date;
  Invoices: {
    JobNo: number;
    DepartmentId: number;
    InvoiceNo: number;
    InvoiceDate?: string;
    CurrencyCode: string;
    DueDate?: Date;
    TotalAmount?: number;
    TotalReceived?: number;
    TotalDue?: number;
  }[];
}
