import { Schema, model } from 'mongoose';

const part = new Schema({
    project_number: {
        type: String,
        required: true,
        minlength: 3
    },
    part_number: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    project_id: {
        type: Schema.ObjectId,
        ref: "Project"
    },
})

export const partModel = model('Part', part)