import bcrypt from "bcryptjs";
import { ObjectId } from "mongoose";
import { BCRYPT_ROUNDS } from "../../../shared/constants/crypto.constants";
import User, { UserDoc } from "../../../shared/models/user.model";
import CreateUserDto from "../types/CreateUserDto";

export const createUser = async (userData: CreateUserDto): Promise<UserDoc> => {
  const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

  const user = new User({
    ...userData,
    password: hashedPassword,
    emailVerified: true,
  });

  return await user.save();
};

export const findUserByEmail = async (
  email: string
): Promise<UserDoc | null> => {
  return await User.findOne({ email: email.toLowerCase() });
};

export const findUserIdByEmail = async (
  email: string
): Promise<ObjectId | undefined> => {
  const user = await findUserByEmail(email);
  return user?._id;
};

export const findUserById = async (id: string): Promise<UserDoc | null> => {
  return await User.findById(id);
};
