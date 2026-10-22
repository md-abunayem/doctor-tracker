import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9\s-]{7,15}$/, "Invalid phone number"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    patientCount: {
      type: Number,
      default: 0,
      min: [0, "Patient count cannot be negative"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  },
);

doctorSchema.index({createdAt: -1});
doctorSchema.index({specialization: 1, createdAt: -1});
doctorSchema.index({hospital: 1, createdAt: -1});

//search
doctorSchema.index({ name: "text", specialization: "text", hospital: "text" });

export const Doctor = model("Doctor", doctorSchema);