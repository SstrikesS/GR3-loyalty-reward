import {gql} from "@apollo/client";


export const HELLO_QUERY = gql`
    query hello {
        hello
    }
`;
export const GET_STORE_BY_ID = gql`
    query GetStoreByID($input: GetStoreInput) {
        getStoreByID(input: $input) {
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

export const GET_EARN_POINT = gql`
    query GetEarnPoint($input : GetEarnPointInput) {
        getEarnPoint(input: $input) {
            id
            name
            status
            point
        }
    }
`;

export const GET_EARN_POINTS = gql`
    query GetEarnPoints {
        getEarnPoints {
            id
            name
            status
            point
        }
    }
`;
