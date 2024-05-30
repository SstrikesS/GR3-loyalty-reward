import mongoose from "mongoose";

const Schema = mongoose.Schema;

const customerReward = new Schema({
    reward_id: { // discount id code
        type: String,
        require: true,
    },
    program_id: { // id of program that customer get this reward
        type: String,
        require: true,
    },
    reward_type: { // gift card or discount
        type: String,
        require: true
    }
})

const customerSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    program_id: {
        type: String,
        require: true,
    },
    points_balance: {
        type: String,
        require: true,
    },
    points_earn: {
        type: String,
        require: true,
    },
    points_spent: {
        type: String,
        require: true,
    },
    referral_count: {
        type: Number,
        require: true,
    },
    date_of_birth: {
        type: Date
    },
    vip_tier_index: {
        type: Number
    },
    reward: {
        type: [customerReward]
    }
}, {
    timestamps: true,
})

export default mongoose.model('Customers', customerSchema);
