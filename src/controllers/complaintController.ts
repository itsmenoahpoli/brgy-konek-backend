import { Request, Response } from "express";
import * as complaintService from "../services/complaintService";

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.createComplaint(req.body);
    res.status(201).json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(400).json({ error: error.message });
  }
};

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await complaintService.getComplaints();
    res.json(complaints);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.updateComplaint(
      req.params.id,
      req.body
    );
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(400).json({ error: error.message });
  }
};

export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.deleteComplaint(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};
