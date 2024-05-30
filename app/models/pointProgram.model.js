import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PointExpirySchema = new Schema({
    status: {
        type: Boolean,
        require: true,
    },
    period_time: {
        type: Number,
        require: true,
    },
    period_unit: {
        type: String,
        require: true,
    },
    reactivation_email_time: {
        type: Number,
        require: true,
    },
    last_chance_email_time: {
        type: Number,
        require: true,
    }
})
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
const pointProgramSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    point_currency: {
        type: CurrencySchema,
        required: true,
    },
    point_expiry: {
        type: PointExpirySchema,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model('PointPrograms', pointProgramSchema);
