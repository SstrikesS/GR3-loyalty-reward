import mongoose from "mongoose";

const Schema = mongoose.Schema;

const earnPointSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    key: {
        type: String,
        required: true,
    },
    type: {
        type: Number
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
        type: Schema.Types.Mixed,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('EarnPoints', earnPointSchema);
