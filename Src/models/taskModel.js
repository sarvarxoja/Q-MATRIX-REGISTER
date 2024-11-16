import { Schema, model } from 'mongoose';

const task = new Schema({
    file_name: {
        type: String,
        required: true,
        minlength: 3
    },

    link: {
        type: String,
        default: null
    },

    mnn: {
        type: String
    },


    expiration_date: {
        type: String
    },

    description: {
        type: String
    },

    compound: {
        type: String
    },

    specification: {
        type: String
    },

    dosage_form: {
        type: String
    },

    article: {
        type: String
    },

    package: {
        type: String
    },

    storage_conditions: {
        type: String
    },

    release_form: {
        type: String
    },

    pharmacological_properties: {
        type: String
    },

    pharmacotherapeutic_group: {
        type: String
    },


    legal_address_telephone_fax_email: {
        type: String
    },
    
    secondary: {
        type: String
    },

    conditions_for_dispensing_medicine_from_pharmacy: {
        type: String
    },

    license_validity_number_type_of_activity: {
        type: String
    },

    code_athx: {
        type: String
    },

    storage: {
        type: String
    },

    organization_manufacturer_country: {
        type: String
    },

    excipient: {
        type: String
    },

    title: {
        type: String
    },

    status_content: {
        type: String,
        default: null
    },

    value: {
        type: String,
    },

    part_id: {
        type: Schema.ObjectId,
        ref: "Part"
    },

    access_userId: [
        {
            type: Schema.ObjectId,
            ref: "Users",
            default: null
        }
    ],

    createdAt: {
        type: Date,
        default: null
    }
})

export const TaskModel = model('Task', task)