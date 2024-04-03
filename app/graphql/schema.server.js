const {buildSchema} = require("graphql")

export const schema = buildSchema(`
    scalar JSON
    scalar Date

    input GetStoreInput {
        id: String,
        accessToken: String,
    }

    input GetEarnPointInput {
        id: String,
    }

    type Store {
        id: String,
        name: String,
        email: String,
        shop: String,
        domain: String,
        scope: String,
        country: String,
        shop_owner: String,
        iana_timezone: String,
        currency: String,
        phone: String,
        created_at: String,
        accessToken: String,
    }

    type EarnPoint {
        id: String,
        name: String,
        status: Boolean,
        point: String,
    }

    type Query {
        hello: String
        getStoreByID(input: GetStoreInput): Store
        getEarnPoints : [EarnPoint]
        getEarnPoint(input: GetEarnPointInput): EarnPoint
    }
`)
