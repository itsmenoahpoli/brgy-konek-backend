import User, { IUser } from "../models/User";

export const listUsers = async () => {
  return User.find().select("-password");
};

export const getUserById = async (userId: string) => {
  return User.findById(userId).select("-password");
};

export const updateUserById = async (userId: string, data: Partial<IUser>) => {
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
};

export const deleteUserById = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};
