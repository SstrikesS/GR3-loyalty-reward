
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const earnPointSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    program_id: {
        type: String,
        require: true,
    },
    key: {
        type: String,
        required: true,
    },
    sub_key: {
        type: String,
    },
    icon: {
        type: String,
        required: true,
    },
    link: {
        type: String
    },
    name: {
        type: String,
        required: true,
    },
    reward_points: {
        type: Number,
        required: true,
    },
    limit: {
        type: Number,
    },
    requirement: {
        type: String,
    },
    limit_reset_loop: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('EarnPoints', earnPointSchema);
