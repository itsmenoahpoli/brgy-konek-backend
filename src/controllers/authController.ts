import { Request, Response } from "express";
import { authService } from "../services/authService";

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

    const result = await authService.register({
      name,
      email,
      password,
      mobile_number,
      user_type,
      address,
      birthdate,
      barangay_clearance: req.file ? req.file.filename : undefined,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User with this email already exists") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "JWT secret not configured") {
      res.status(500).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "Invalid credentials") {
      res.status(401).json({ message: errorMessage });
    } else if (errorMessage === "JWT secret not configured") {
      res.status(500).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
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

    const user = await authService.getProfile(req.user.id);

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const requestOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    await authService.requestOTP(email);

    res.json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp_code } = req.body;

    console.log(email, otp_code);

    if (!email || !otp_code) {
      res.status(400).json({ message: "Email and OTP code are required" });
      return;
    }

    await authService.verifyOTP(email, otp_code);

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else if (errorMessage === "No OTP requested") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "Invalid OTP code") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "OTP code has expired") {
      res.status(400).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log(req.body);
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { name, mobile_number, address, birthdate } = req.body;

    const result = await authService.updateProfile(req.user.id, {
      name,
      mobile_number,
      address,
      birthdate,
    });

    res.json({
      message: "Profile updated successfully",
      user: result,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else {
      console.log(error);
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, new_password } = req.body;

    console.log(email, new_password);

    if (!email || !new_password) {
      res.status(400).json({
        message: "Email and new password are required",
      });
      return;
    }

    await authService.resetPassword({ email, new_password });

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};
