import mongoose from "mongoose";

const Schema = mongoose.Schema;
const CurrencySchema = new Schema({
    singular: {
        type: String,
        require: true,
    },
    plural: {
        type: String,
        require: true,
    }
})
const pointSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    point_currency: {
        type: CurrencySchema,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model('Points', pointSchema);
