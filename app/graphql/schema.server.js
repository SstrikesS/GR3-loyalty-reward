const {buildSchema} = require("graphql")

export const schema = buildSchema(`
    scalar JSON
    scalar Date

    input GetEarnPointInput {
        program_id: String,
        id: String,
    }

    input GetPointProgramInput {
        id: String
    }

    input GetRedeemPointInput {
        program_id: String
        id: String
    }

    input CombinationSchemaInput {
        order: Boolean,
        product: Boolean,
        shipping: Boolean,
    }

    input CreateRedeemPointInput {
        program_id: String,
        id: String,
        key: String,
        icon: String,
        title: String,
        pointsCost: String,
        discountValue: String,
        isSetShippingRates: Boolean,
        programApply: String,
        collections: [String],
        prefixCode: String,
        combination: CombinationSchemaInput,
        minimumRequire: String,
        minimumRequireType: String,
        start_at: Date,
        expire_at: Date,
    }

    input UpdateRedeemPointInput {
        program_id: String,
        id: String,
        title: String,
        pointsCost: String,
        discountValue: String,
        isSetShippingRates: Boolean,
        programApply: String,
        collections: [String],
        prefixCode: String,
        combination: CombinationSchemaInput,
        minimumRequire: String,
        minimumRequireType: String,
        start_at: Date,
        expire_at: Date,
        status: Boolean,
    }

    input UpdateEarnPointInput {
        program_id: String,
        id: String,
        key: String,
        sub_key: String,
        link: String,
        name: String,
        reward_points: Int,
        status: Boolean
    }

    input UpdateVipProgramInput {
        id: String,
        milestone_type: String,
        milestone_period_type: String,
        milestone_period_value: Int,
        milestone_period_unit: String,
        status: Boolean,
        milestone_start: Date,
    }

    input PointCurrencyInput {
        singular: String,
        plural: String
    }

    input PointExpiryInput {
        status: Boolean,
        period_time: Int,
        period_unit: String,
        reactivation_email_time: Int,
        last_chance_email_time: Int
    }

    input UpdatePointProgramInput {
        id: String,
        point_currency: PointCurrencyInput,
        point_expiry: PointExpiryInput,
        status: Boolean
    }

    input GetVipProgramInput {
        id: String
    }

    input GetVipTierInput {
        program_id: String,
        index: Int,
    }

    input GetCustomerInput {
        id: String,
        program_id: String,
        sort: String,
        reverse: Int,
        limit: Int,
        skip: Int,
    }

    type PointCurrencySchema {
        singular: String,
        plural: String
    }

    type PointExpirySchema {
        status: Boolean,
        period_time: Int,
        period_unit: String,
        reactivation_email_time: Int,
        last_chance_email_time: Int
    }

    type EarnPointSchema {
        id: String,
        program_id: String,
        key: String,
        icon: String,
        sub_key: String,
        link: String,
        name: String,
        reward_points: Int,
        limit: Int,
        requirement: JSON,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date
    }

    type CombinationSchema {
        order: Boolean,
        product: Boolean,
        shipping: Boolean,
    }

    type RedeemPointSchema {
        id: String,
        program_id: String,
        key: String,
        icon: String,
        title: String,
        pointsCost: String,
        discountValue: String,
        isSetShippingRates: Boolean,
        programApply: String,
        collections: [String],
        prefixCode: String,
        combination: CombinationSchema,
        minimumRequire: String,
        minimumRequireType: String,
        start_at: Date,
        expire_at: Date,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date
    }

    type PointProgram {
        id: String,
        point_currency: PointCurrencySchema,
        point_expiry: PointExpirySchema,
        status: Boolean
        createdAt: Date,
        updatedAt: Date
    }

    type MilestoneRewardSchema {
        reward_type: String,
        points: String,
        reward_id: String
    }

    type TierSchema {
        index: Int,
        name: String,
        icon: String,
        milestone_requirement: String,
        reward: [MilestoneRewardSchema]
        perks: [String],
    }

    type VipProgram {
        id: String,
        milestone_type: String,
        milestone_period_type: String,
        milestone_start: Date,
        milestone_period_unit: String,
        milestone_period_value: Int,
        milestone_period_expiry_penalty: String,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date
    }

    type Reward {
        id: String,
        program_id: String,
    }

    type PageInfoSchema {
        hasNextPage: Boolean,
        hasPreviousPage: Boolean
    }

    type Customer {
        id: String,
        program_id: String,
        points_balance: String,
        points_earn: String,
        points_spent: String,
        referral_link: String,
        referral_count: Int,
        date_of_birth: Date,
        vip_tier_index: Int,
        reward: [Reward],
        createdAt: Date,
        updatedAt: Date
    }

    type CustomerList {
        customers: [Customer],
        pageInfo: PageInfoSchema
    }

    type Query {
        hello: String
        getEarnPoint(input: GetEarnPointInput): EarnPointSchema
        getEarnPoints(input: GetEarnPointInput): [EarnPointSchema]
        getRedeemPoint(input: GetRedeemPointInput): RedeemPointSchema
        getRedeemPoints(input: GetRedeemPointInput): [RedeemPointSchema]
        getPointProgram(input: GetPointProgramInput): PointProgram

        getVipProgram(input: GetVipProgramInput): VipProgram
        getVipTiers(input: GetVipTierInput): [TierSchema]
        getVipTier(input: GetVipTierInput): TierSchema

        getCustomers(input: GetCustomerInput): CustomerList

        shopGetEarnPoints(input: GetEarnPointInput): [EarnPointSchema]
        shopGetRedeemPoints(input: GetRedeemPointInput): [RedeemPointSchema]
    }

    type Mutation {
        updateEarnPoint(input: UpdateEarnPointInput): EarnPointSchema
        createRedeemPoint(input: CreateRedeemPointInput): RedeemPointSchema
        updateRedeemPoint(input: UpdateRedeemPointInput): RedeemPointSchema

        updateVipProgram(input: UpdateVipProgramInput): VipProgram
        updatePointProgram(input: UpdatePointProgramInput): PointProgram
    }
`)
