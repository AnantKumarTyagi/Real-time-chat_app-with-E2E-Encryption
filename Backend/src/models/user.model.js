import mongoose from "mongoose";
import { stringify } from "querystring";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    publicKey: {
    type: Object, 
    default: "",
    },
    encryptedPrivateKey: {
      type: String,
      default: "",
    },
    keyBackupSalt: {
      type: String,
      default: "",
    },
    keyBackupIv: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
