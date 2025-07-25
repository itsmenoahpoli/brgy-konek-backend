import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { emailService } from "./emailService";
import Otp from "../models/Otp";
import argon2 from "argon2";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobile_number?: string;
  user_type?: string;
  address?: string;
  birthdate?: string;
  barangay_clearance?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  mobile_number?: string;
  address?: string;
  birthdate?: string;
  barangay_clearance?: string;
}

export interface ResetPasswordData {
  email: string;
  new_password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile_number?: string;
    user_type: string;
    address?: string;
    birthdate?: Date;
    barangay_clearance?: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await argon2.hash(data.password);
    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      mobile_number: data.mobile_number,
      user_type: data.user_type || "resident",
      address: data.address,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      barangay_clearance: data.barangay_clearance,
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret not configured");
    }

    const userId = user._id?.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as string) || "7d",
    } as SignOptions);

    return {
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
        barangay_clearance: user.barangay_clearance,
      },
    };
  },

  async login(data: LoginData): Promise<AuthResult> {
    const user = (await User.findOne({
      email: data.email,
    }).exec()) as IUser | null;
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(user.password, data.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret not configured");
    }

    const userId = user._id?.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as string) || "7d",
    } as SignOptions);

    return {
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
      },
    };
  },

  async getProfile(userId: string) {
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      user_type: user.user_type,
      address: user.address,
      birthdate: user.birthdate,
      barangay_clearance: user.barangay_clearance,
    };
  },

  async requestOTP(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      code: otpCode,
      expires_at: otpExpiresAt,
      verified: false,
      type: "email_verification",
    });

    await emailService.sendOTP(email, otpCode);
  },

  async verifyOTP(email: string, otpCode: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const otp = await Otp.findOne({
      email,
      code: otpCode,
      type: "email_verification",
    });
    if (!otp) {
      throw new Error("Invalid OTP code");
    }

    if (otp.verified) {
      throw new Error("OTP already used");
    }

    if (new Date() > otp.expires_at) {
      throw new Error("OTP code has expired");
    }

    otp.verified = true;
    await otp.save();
  },

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    if (data.name) {
      user.name = data.name;
    }
    if (data.mobile_number !== undefined) {
      user.mobile_number = data.mobile_number;
    }
    if (data.address !== undefined) {
      user.address = data.address;
    }
    if (data.birthdate) {
      user.birthdate = new Date(data.birthdate);
    }
    if (data.barangay_clearance !== undefined) {
      user.barangay_clearance = data.barangay_clearance;
    }

    await user.save();

    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      user_type: user.user_type,
      address: user.address,
      birthdate: user.birthdate,
      barangay_clearance: user.barangay_clearance,
    };
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new Error("User not found");
    }

    user.password = await argon2.hash(data.new_password);
    await user.save();
  },

  async listUsers() {
    return User.find().select("-password");
  },

  async getUserById(userId: string) {
    return User.findById(userId).select("-password");
  },

  async updateUserById(userId: string, data: Partial<IUser>) {
    if (data.password) {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      user.password = data.password;
      if (data.name !== undefined) user.name = data.name;
      if (data.mobile_number !== undefined)
        user.mobile_number = data.mobile_number;
      if (data.user_type !== undefined) user.user_type = data.user_type;
      if (data.address !== undefined) user.address = data.address;
      if (data.birthdate !== undefined) user.birthdate = data.birthdate;
      if (data.barangay_clearance !== undefined)
        user.barangay_clearance = data.barangay_clearance;
      await user.save();
      return User.findById(userId).select("-password");
    } else {
      return User.findByIdAndUpdate(userId, data, {
        new: true,
        runValidators: true,
      }).select("-password");
    }
  },

  async deleteUserById(userId: string) {
    return User.findByIdAndDelete(userId);
  },
};
