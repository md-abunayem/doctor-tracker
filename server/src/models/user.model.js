import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);


//pre-save middlware to hash the password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
})


//method to compare password
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

//methods to generate JWT tokens
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id: this._id,
        jti: randomUUID(),
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const User = model("User", userSchema);
