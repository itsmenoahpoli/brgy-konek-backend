import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      mobile_number,
      user_type,
      address,
      birthdate,
    } = req.body;

    console.log(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      mobile_number,
      user_type: user_type || "resident",
      address,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      barangay_clearance: req.file ? req.file.filename : undefined,
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret not configured" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
        barangay_clearance: user.barangay_clearance,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret not configured" });
      return;
    }

    // @ts-ignore
    const token = jwt.sign({ userId: user._id }, jwtSecret as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    res.json({
      message: "Profile retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};
