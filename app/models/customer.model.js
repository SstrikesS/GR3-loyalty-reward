import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ProgramLimitSchema = new Schema({
    program_type: String,
    used: Number,
})

const customerReward = new Schema({
    reward_id: { // discount id code
        type: String,
        require: true,
    },
    program_id: { // id of program that customer get this reward
        type: String,
        require: true,
    },
    reward_type: { // gift or points exchange
        type: String,
        require: true
    }
})

const customerVipPoints = new Schema({
    earn_points: {
        type: String,
        require: true,
    },
    money_spent: {
        type: String,
        require: true,
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
    program_limit: {
      type:  [ProgramLimitSchema],
      require: true,
    },
    date_of_birth: {
        type: Date
    },
    vip_tier_index: {
        type: String
    },
    last_used_points: {
        type: Date,
    },
    last_earned_points: {
        type: Date,
    },
    vip_expiry_date: {
        type: Date,
    },
    vip_points: {
        type: customerVipPoints,
    },
    reward: {
        type: [customerReward]
    }
}, {
    timestamps: true,
})

export default mongoose.model('Customers', customerSchema);
