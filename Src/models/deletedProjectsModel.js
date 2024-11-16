import { Schema, model } from "mongoose";

const deletedProjects = new Schema({
    project_number: {
        type: String,
        required: true,
        minlength: 3
    },
    project_name: {
        type: String,
        // required: true
    },
    user_id: {
        type: Schema.ObjectId,
        ref: "Users"
    },
    stb: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
    },
    createdAt: {
        type: Date,
    }
});

export const deletedProjectsModel = model("DeletedProjects", deletedProjects);