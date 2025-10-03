import { JOB_STATUS, JOB_STATUS_LIST, JOB_STATUS_DEPARTMENTS, JOB_STATUS_PAYMENT } from '@/shared/constants';

export type JobStatus = (typeof JOB_STATUS)[number];

export type JobStatusPayment = (typeof JOB_STATUS_PAYMENT)[number];

export type StatusList = (typeof JOB_STATUS_LIST)[number];

export type JobStatusDepartments = (typeof JOB_STATUS_DEPARTMENTS)[number];

import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUnderClearanceJob extends Document {
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
  Status: string;
  Notes?: string;
  JobType: string;
  StatusType?: string;
  ContainerToCnee: boolean;
  ContainerToCneeDate?: Date;
  EmptyContainer: boolean;
  EmptyContainerDate?: Date;
  ConfirmEmptyContainer: boolean;
  ConfirmEmptyContainerDate?: Date;
  Mbl?: string;
  Hbl?: string;
  ContainerNo?: string;
  Commodity?: string;
  TotalInvoices?: number;
  TotalCosts?: number;
  TotalProfit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UnderClearanceJobSchema: Schema<IUnderClearanceJob> = new Schema(
  {
    JobNo: {
      type: Number,
      required: [true, "JobNo is required"],
      unique: true,
    },
    JobDate: {
      type: Date,
    },
    DepartmentId: {
      type: Number,
      required: [true, "DepartmentId is required"],
    },
    DepartmentName: {
      type: String,
      required: [true, "DepartmentName is required"],
      maxlength: [50, "DepartmentName cannot exceed 50 characters"],
    },
    ReferenceNo: {
      type: String,
      default: "",
      maxlength: [50, "ReferenceNo cannot exceed 50 characters"],
    },
    ShipperName: {
      type: String,
      default: "",
      maxlength: [100, "ShipperName cannot exceed 100 characters"],
    },
    CustomerName: {
      type: String,
      default: "",
      maxlength: [100, "CustomerName cannot exceed 100 characters"],
    },
    ConsigneeName: {
      type: String,
      default: "",
      maxlength: [100, "ConsigneeName cannot exceed 100 characters"],
    },
    MemberOf: {
      type: String,
      required: [true, "MemberOf is required"],
      maxlength: [50, "MemberOf cannot exceed 50 characters"],
    },
    Volume: {
      type: String,
      default: "",
      maxlength: [50, "Volume cannot exceed 50 characters"],
    },
    CountryOfDeparture: {
      type: String,
      default: "",
      maxlength: [50, "CountryOfDeparture cannot exceed 50 characters"],
    },
    Departure: {
      type: String,
      default: "",
      maxlength: [50, "Departure cannot exceed 50 characters"],
    },
    CountryOfDestination: {
      type: String,
      default: "",
      maxlength: [50, "CountryOfDestination cannot exceed 50 characters"],
    },
    Destination: {
      type: String,
      default: "",
      maxlength: [50, "Destination cannot exceed 50 characters"],
    },
    Etd: {
      type: Date,
    },
    Eta: {
      type: Date,
    },
    Atd: {
      type: Date,
    },
    Ata: {
      type: Date,
    },
    ShippingLine: {
      type: String,
      default: "",
      maxlength: [50, "ShippingLine cannot exceed 50 characters"],
    },
    Vessel: {
      type: String,
      default: "",
      maxlength: [50, "Vessel cannot exceed 50 characters"],
    },
    LoadingDate: {
      type: Date,
    },
    CutOffDate: {
      type: Date,
    },
    SpaceReleased: {
      type: Boolean,
      default: false,
    },
    BlNo: {
      type: String,
      default: "",
      maxlength: [50, "BlNo cannot exceed 50 characters"],
    },
    Status: {
      type: String,
      required: [true, "Status is required"],
      maxlength: [50, "Status cannot exceed 50 characters"],
    },
    Notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    JobType: {
      type: String,
      required: [true, "JobType is required"],
      maxlength: [50, "JobType cannot exceed 50 characters"],
    },
    StatusType: {
      type: String,
      default: "",
      maxlength: [50, "StatusType cannot exceed 50 characters"],
    },
    ContainerToCnee: {
      type: Boolean,
      default: false,
    },
    ContainerToCneeDate: {
      type: Date,
    },
    EmptyContainer: {
      type: Boolean,
      default: false,
    },
    EmptyContainerDate: {
      type: Date,
    },
    ConfirmEmptyContainer: {
      type: Boolean,
      default: false,
    },
    ConfirmEmptyContainerDate: {
      type: Date,
    },
    Mbl: {
      type: String,
      default: "",
      maxlength: [50, "Mbl cannot exceed 50 characters"],
    },
    Hbl: {
      type: String,
      default: "",
      maxlength: [50, "Hbl cannot exceed 50 characters"],
    },
    ContainerNo: {
      type: String,
      default: "",
      maxlength: [50, "ContainerNo cannot exceed 50 characters"],
    },
    Commodity: {
      type: String,
      default: "",
      maxlength: [100, "Commodity cannot exceed 100 characters"],
    },
    TotalInvoices: {
      type: Number,
      default: 0,
      min: [0, "TotalInvoices cannot be negative"],
    },
    TotalCosts: {
      type: Number,
      default: 0,
      min: [0, "TotalCosts cannot be negative"],
    },
    TotalProfit: {
      type: Number,
      default: 0,
      min: [0, "TotalProfit cannot be negative"],
    },
  },
  { timestamps: true, collection: "underclearance" }
);

// Add indexes for better performance
UnderClearanceJobSchema.index({ CustomerName: 1 });
UnderClearanceJobSchema.index({ Status: 1 });
UnderClearanceJobSchema.index({ JobDate: 1 });
UnderClearanceJobSchema.index({ TotalProfit: 1 });
UnderClearanceJobSchema.index({ Status: 1, JobDate: -1 });
UnderClearanceJobSchema.index({ JobNo: 1 });
UnderClearanceJobSchema.index({ ReferenceNo: 1 });
UnderClearanceJobSchema.index({ Vessel: 1 });
UnderClearanceJobSchema.index({ Eta: 1 });

// Virtual property to check if shipment is delayed
UnderClearanceJobSchema.virtual('isDelayed').get(function() {
  if (!this.Eta) return false;
  return !["Completed", "Cancelled"].includes(this.Status) && new Date() > this.Eta;
});

// Virtual property to check if cutoff time has passed
UnderClearanceJobSchema.virtual('isCutOffPassed').get(function() {
  if (!this.CutOffDate) return false;
  return new Date() > this.CutOffDate;
});

// Virtual property to calculate profit margin
UnderClearanceJobSchema.virtual('profitMargin').get(function() {
  if (!this.TotalInvoices || this.TotalInvoices === 0) return 0;
  return ((this.TotalProfit || 0) / this.TotalInvoices) * 100;
});

// Virtual property to get days until ETA
UnderClearanceJobSchema.virtual('daysUntilETA').get(function() {
  if (!this.Eta) return null;
  const today = new Date();
  const eta = new Date(this.Eta);
  const diffTime = eta.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export const UnderClearanceJobModel: Model<IUnderClearanceJob> =
  mongoose.models.UnderClearanceJob || mongoose.model<IUnderClearanceJob>("UnderClearanceJob", UnderClearanceJobSchema);