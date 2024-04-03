import mongoose from "mongoose";

const Schema = mongoose.Schema;

const storeSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true
    },
    shop: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true,
    },
    scope: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    shop_owner: {
        type: String,
        required: true,
    },
    iana_timezone: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    created_at: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
    }
});

export default mongoose.model('Store', storeSchema);