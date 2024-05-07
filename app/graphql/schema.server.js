const {buildSchema} = require("graphql")

export const schema = buildSchema(`
    scalar JSON
    scalar Date

    input GetEarnPointInput {
        id: String,
        key: String
    }

    input GetPointProgramInput {
        id: String
    }

    input GetRedeemPointInput {
        id: String
    }

    input UpdateEarnPointInput {
        id: String,
        key: String,
        type: Int,
        link: String,
        name: String,
        reward_points: Int,
        status: Boolean
    }

    type PointCurrencySchema {
        singular: String,
        plural: String
    }

    type EarnPointSchema {
        id: String,
        key: String,
        icon: String,
        type: Int,
        link: String,
        name: String,
        reward_points: Int,
        limit: Int,
        requirement: JSON,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date
    }

    type DiscountItems {
        all: Boolean,
        collection: [String]
    }

    type RedeemPointSchema {
        id: String,
        reward_id: String,
        key: String,
        type: Int,
        name: String,
        reward_points: Int,
        items: DiscountItems,
        minimumReq: Int,
        prefix: String,
        status: Boolean,
        combination: String,
        start_at: Date,
        expire_at: Date,
        createdAt: Date,
        updatedAt: Date
    }

    type PointProgram {
        id: String,
        point_currency: PointCurrencySchema,
        status: Boolean
        createdAt: Date,
        updatedAt: Date
    }

    type Query {
        hello: String
        getEarnPoint(input: GetEarnPointInput): EarnPointSchema
        getEarnPoints(input: GetEarnPointInput): [EarnPointSchema]
        getRedeemPoints(input: GetRedeemPointInput): [RedeemPointSchema]
        getPointProgram(input: GetPointProgramInput): PointProgram
    }

    type Mutation {
        updateEarnPoint(input: UpdateEarnPointInput): EarnPointSchema
    }
`)
