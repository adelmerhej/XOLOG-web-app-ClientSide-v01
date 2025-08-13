import { Activities } from './card-activities';
import { Task } from './task';
import { Opportunities } from './card-opportunities';
import { JOB_STATUS } from '../shared/constants';

export type JobStatus = (typeof JOB_STATUS)[number];

interface State {
    stateShort: string;
}

export interface ITotalProfit extends Document {
  _id: string;
  JobNo: number;
  DepartmentId: number;
  DepartmentName: string;
  JobDate?: Date;
  CustomerName?: string;
  ConsigneeName?: string;
  StatusType?: string;
  TotalProfit?: number;
  Eta?: Date;
  Ata?: Date;
  Arrival?: Date;
  UserName?: string;
  Notes?: string;
  CountryOfDeparture?: string;
  Departure?: string;
  Destination?: string;
  ReferenceNo?: string;
  vessel?: string;
  TotalInvoices?: number;
  TotalCosts?: number;
  MemberOf: string;
  JobType: string;
  // Relationships
  status: JobStatus,
  state: State,
  opportunities: Opportunities,
  activities: Activities[];
  tasks: Task[];
  image: string;
  firstName: string;
  lastName: string;
  // END Relationships
  createdAt: Date;
  updatedAt: Date;
}
