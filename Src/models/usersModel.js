import { Schema, model } from "mongoose";

const Users = new Schema(
  {
    avatar: {
      type: String,
      default: null
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    rule: {
      type: String,
      required: true,
    },

    super_admin: {
      type: Boolean,
      default: false,
    },

    last_login: {
      type: Date,
      default: null,
    },

    deleted: {
      type: Boolean,
      default: false
    },
    telegram_id: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const UsersModel = model("Users", Users);