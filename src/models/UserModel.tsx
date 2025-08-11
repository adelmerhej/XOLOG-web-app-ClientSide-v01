/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "user" | "customer";

interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  profilePicture?: string;
  resetToken: string;
  tokenExpiryDate: Date;
  role: UserRole;
  loginAttempts: number;
  lockUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      validate: {
        validator: function (v: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            v
          );
        },
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    profilePicture: {
      type: String,
      default: "",
      validate: {
        validator: (v: string) => v === "" || /\.(jpe?g|png|gif|bmp)$/i.test(v),
        message: "Profile picture must be a valid image URL",
      },
    },
    resetToken: {
      type: String,
      default: "",
    },
    tokenExpiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 3600000), // 1 hour from now
    },

    role: {
      type: String,
      enum: ["admin", "user", "customer"],
      default: "user",
      required: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
// Add indexes for better performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
// Add a compound index for username and email
UserSchema.index({ username: 1, email: 1 }, { unique: true });
UserSchema.index({ username: 'text', email: 'text' });

// 🔑 Password field should not be returned in queries
// Prevent returning resetToken in queries
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.__v;
  return user;
};

// 🔐 Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// 🔍 Method to compare hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔒 Export the model
// Prevent model overwrite during hot reloads
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export const getUsers = async () => {
  return await UserModel.find().select('-password -resetToken');
};

export const getUserByUsername = async (username: string) => {
  return await UserModel.findOne({ username }).select('-password -resetToken');
};
