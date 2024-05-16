import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Combination = new Schema({
    order: {
        type: Boolean,
        require: true,
    },
    product: {
        type: Boolean,
        require: true,
    },
    shipping: {
        type: Boolean,
        require: true,
    },
})

const redeemPointSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    store_id: {
        type: String,
        require: true,
    },
    key: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    pointsCost: {
        type: String,
        required: true,
    },
    discountValue: {
        type: String,
        required: true,
    },
    programApply: {
        type: String,
        required: true,
    },
    collections: {
        type: [String],
    },
    prefixCode: {
        type: String
    },
    combination: {
        type: Combination,
        required: true,
    },
    minimumRequire: {
        type: String,
    },
    start_at: {
        type: Date,
        required: true,
    },
    expire_at: {
        type: Date,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('RedeemPoints', redeemPointSchema);
