import { Request, Response } from "express";
import * as administratorService from "../services/administratorService";

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await administratorService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await administratorService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const user = await administratorService.updateUserById(
      req.params.id,
      req.body
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const user = await administratorService.deleteUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
