import { Schema, model } from 'mongoose';

const patientSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: [0, "Age cannot be negative"],
        max: [130,"Age is too high"],
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    phone: {
        type: String,
        trim: true, 
        match: [/^\+?[0-9\s-]{7,15}$/, "Invalid phone number"]
    },
    condition: {
        type: String,
        trim: true,
        maxlength: [1000, "Condition description is too long"]
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    }
},{
    timestamps: true,
})


//indexing
patientSchema.index({ doctor:1, createdAt: -1 });
patientSchema.index({condition: 1, createdAt: -1});
patientSchema.index({createdAt: -1});
patientSchema.index({ name: "text", condition: "text" });

export const Patient = model("Patient", patientSchema);
