import { Schema, model } from "mongoose";

const files = new Schema({
    part_id: {
        type: Schema.ObjectId,
        ref: "Part"
    },
    task_id: {
        type: Schema.ObjectId,
        ref: "Task"
    },
    file_url: {
        type: String
    }
}, { timestamps: true })

export const FilesModel = model("Files", files)