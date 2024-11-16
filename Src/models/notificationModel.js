import { Schema, model } from "mongoose";

const Notification = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: "Users"
    },

    to_user_id: {
        type: Schema.ObjectId,
        ref: "Users"
    },

    status_content: {
        type: String,
        default: null
    },

    content: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    seen: {
        type: Boolean,
        default: false
    },

    task_id: {
        type: Schema.ObjectId,
        ref: "Task",
    },

    status: {
        type: Boolean,
        default: null
    },

    comment: {
        type: String,
        default: null,
    },

    telegram_id: {
        type: Number,
        required: true
    },

    part_id: {
        type: Schema.ObjectId,
        ref: "Part",
    },

    deadline: {
        type: Date,
        required: true 
    },


    finished_time: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
    }
});

export const NotificationsModel = model("Notifications", Notification)