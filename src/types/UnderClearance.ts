import { JOB_STATUS, JOB_STATUS_LIST, JOB_STATUS_DEPARTMENTS, JOB_STATUS_PAYMENT } from '@/shared/constants';

export type JobStatus = (typeof JOB_STATUS)[number];

export type JobStatusPayment = (typeof JOB_STATUS_PAYMENT)[number];

export type StatusList = (typeof JOB_STATUS_LIST)[number];

export type JobStatusDepartments = (typeof JOB_STATUS_DEPARTMENTS)[number];

export interface IUnderClearanceJob extends Document {
  _id: string;
  JobNo: number;
  JobDate?: Date;
  DepartmentId: number;
  DepartmentName: string;
  ReferenceNo?: string;
  ShipperName?: string;
  CustomerName?: string;
  ConsigneeName?: string;
  MemberOf: string;
  Volume?: string;
  CountryOfDeparture?: string;
  Departure?: string;
  CountryOfDestination?: string;
  Destination?: string;
  Etd?: Date;
  Eta?: Date;
  Atd?: Date;
  Ata?: Date;
  ShippingLine?: string;
  Vessel?: string;
  LoadingDate?: Date;
  CutOffDate?: Date;
  SpaceReleased: boolean;
  BlNo?: string;
  Status:string;
  Notes?: string;
  JobType: string;
  StatusType?: string;
  ContainerToCnee?: boolean;
  ContainerToCneeDate?: Date;
  EmptyContainer?: boolean;
  EmptyContainerDate?: Date;
  ConfirmEmptyContainer?: boolean;
  ConfirmEmptyContainerDate?: Date;
  Mbl? : string;
  Hbl?: string;
  ContainerNo?: string;
  Commodity?: string;
  TotalInvoices?: number;
  TotalCosts?: number;
  TotalProfit?: number;
  createdAt: Date;
  updatedAt: Date;
}
