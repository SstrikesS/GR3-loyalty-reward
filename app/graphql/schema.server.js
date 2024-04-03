const { buildSchema } = require("graphql")

export const schema = buildSchema(`
    scalar HSON
    scalar Date

    input GetStoreInput {
        id: String,
        accessToken: String,
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

    type Query {
        hello: String
        getStoreByID(input: GetStoreInput): Store
    }
`)