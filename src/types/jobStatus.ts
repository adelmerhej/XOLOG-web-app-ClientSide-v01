import { JOB_STATUS, JOB_STATUS_LIST, JOB_STATUS_DEPARTMENTS, JOB_STATUS_PAYMENT } from '../shared/constants';

export type JobStatus = (typeof JOB_STATUS)[number];

export type JobStatusPayment = (typeof JOB_STATUS_PAYMENT)[number];

export type StatusList = (typeof JOB_STATUS_LIST)[number];

export type JobStatusDepartments = (typeof JOB_STATUS_DEPARTMENTS)[number];

export interface IJobStatus extends Document {
  _id: string;
  JobNo: number;
  DepartmentId: number;
  DepartmentName: string;
  StatusType: string;
  TotalProfit: number;
  OrderBy: string;
  ReferenceNo: string;
  JobDate: Date;
  OperatingUserId: string;
  UserName: string;
  CustomerName: string;
  PendingInvoices: number;
  PendingCosts: number;
  Tejrim: string;
  CanceledJob: boolean;
  ConsigneeName: string;
  MemberOf: string;
  JobType: string;
  Atd?: Date;
  Etd?: Date;
  Ata?: Date;
  Eta?: Date;
  FullPaid?: boolean;
  PaymentDate?: Date;
  PaidDO?: boolean;
  PaidDate?: Date;
  MissingDocuments?: boolean;
  MissingDocumentsDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
