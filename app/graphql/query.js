import { gql } from "@apollo/client";


export const HELLO_QUERY = gql`
    query hello {
        hello
    }
`;
export const GET_STORE_BY_ID = gql`
    query GetStoreByID($input: GetStoreInput) {
        GetStoreByID(input: $input) {
            id
            name
            email
            shop
            domain
            scope
            country
            shop_owner
            iana_timezone
            currency
            phone
            created_at
            accessToken
        }
    }
`;
