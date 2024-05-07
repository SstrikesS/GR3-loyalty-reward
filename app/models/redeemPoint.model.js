import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DiscountItems = new Schema({
    all: {
        type: Boolean,
    },
    collection: {
        type: [String],
    },
})

const redeemPointSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    reward_id: {
        type: String,
        required: true,
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
    items: {
        type: DiscountItems,
        required: true,
    },
    minimumReq: {
        type: Number,
        required: true,
    },
    prefix: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
    },
    combination: {
        type: String,
        required: true,
    },
    start_at: {
        type: Date,
        required: true,
    },
    expire_at: {
        type: Date,
    }
}, {
    timestamps: true,
})

export default mongoose.model('RedeemPoints', redeemPointSchema);
