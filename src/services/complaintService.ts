import Complaint from "../models/Complaint";
import { Document, FilterQuery } from "mongoose";

export const createComplaint = async (data: Record<string, any>) => {
  return await Complaint.create(data);
};

export const getComplaints = async (filter: FilterQuery<Document> = {}) => {
  return await Complaint.find(filter);
};

export const getComplaintById = async (id: string) => {
  return await Complaint.findById(id);
};

export const updateComplaint = async (
  id: string,
  data: Record<string, any>
) => {
  return await Complaint.findByIdAndUpdate(id, data, { new: true });
};

export const deleteComplaint = async (id: string) => {
  return await Complaint.findByIdAndDelete(id);
};
