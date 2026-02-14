import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

// 1. Exporting Interfaces is MANDATORY to avoid "Private Name" error
export interface IUserMethods {
  isPasswordMatch(enteredPassword: string): Promise<boolean>;
}

export interface IUser extends Document, IUserMethods {
  id?: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: "user" | "admin";
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      // Logic: Password tabhi chahiye jab Google login nahi hai
      required: function (this: IUser) {
        return !this.googleId;
      },
      minlength: 8,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// 2. Pre-save Hook with Explicit Type for 'this'
userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// 3. Instance Method with Defensive Check
userSchema.methods.isPasswordMatch = async function (this: IUser, enteredPassword: string): Promise<boolean> {
  // Defensive: Agar user fetch karte waqt password select nahi kiya tha
  if (!this.password) {
    throw new Error("Password field is missing. Make sure to use .select('+password') in your service/controller.");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);
export default User;