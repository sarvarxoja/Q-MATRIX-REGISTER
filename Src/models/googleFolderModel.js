import { Schema, model } from "mongoose";

const Folders = new Schema({
    section: {
        type: String,
        required: true,
    },

    folder_id: {
        type: String,
    },

    folder_link: {
        type: String,
    },

    oldText: {
        type: String,
        required: true
    },

    project_id: {
        type: Schema.ObjectId,
        ref: "Projects",
        required: true
    },

    createdAt: {
        type: Date,
    }
})

export const FoldersModel = model("FoldersModel", Folders)