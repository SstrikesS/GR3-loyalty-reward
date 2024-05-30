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
    program_id: {
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
    icon: {
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
    isSetShippingRates: {
        type: Boolean,
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
    minimumRequireType: {
        type: String,
        required: true,
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
