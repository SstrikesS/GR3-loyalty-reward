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

    input UpdateEarnPointInput{
        id: String,
        key: String,
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
        type: Int,
        name: String,
        reward_points: Int,
        limit: Int,
        requirement: JSON,
        status: Boolean,
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
        getPointProgram(input: GetPointProgramInput): PointProgram
    }

    type Mutation {
        updateEarnPoint(input: UpdateEarnPointInput): EarnPointSchema
    }
`)
