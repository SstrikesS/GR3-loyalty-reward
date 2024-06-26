import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MilestoneRewardSchema = new Schema({
    reward_type: {
        type: String,
        require: true,
    },
    points: {
        type: String,
    },
    reward_id: {
        type: String,
    }
})
const tierSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    icon: {
        type: String,
        require: true,
    },
    milestone_requirement: {
        type: String,
        require: true,
    },
    reward: {
        type: [MilestoneRewardSchema],
    },
    previousTier: {
        type: String,
    },
    nextTier: {
        type: String,
    },
    perks: { // exclusive perks when achieve
        type: String, //
    },
    count: {
        type: Number,
    },
    status: {
        type: Boolean,
        require: true,
    }
});

const vipProgramSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    tier: {
        type: [tierSchema],
        require: true,
    },
    milestone_type: {
        type: String,
        require: true,
    },
    milestone_period_type: {
        type: String,
        require: true,
    },
    milestone_start: {
        type: Date,
        require: true,
    },
    milestone_period_unit: {
        type: String,
    },
    milestone_period_value: {
        type: String,
    },
    status: {
        type: Boolean,
        require: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('VipPrograms', vipProgramSchema);
