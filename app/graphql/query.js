import {gql} from "@apollo/client";


export const HELLO_QUERY = gql`
    query hello {
        hello
    }
`;
export const GET_EARN_POINT = gql`
    query GetEarnPoint($input : GetEarnPointInput) {
        getEarnPoint(input: $input) {
            id
            key
            icon
            type
            link
            name
            reward_points
            limit
            requirement
            status
            createdAt
            updatedAt
        }
    }
`;
export const GET_EARN_POINTS = gql`
    query GetEarnPoints($input : GetEarnPointInput) {
        getEarnPoints(input: $input) {
            id
            key
            icon
            type
            link
            name
            reward_points
            limit
            requirement
            status
            createdAt
            updatedAt
        }
    }
`;
export const GET_REDEEM_POINTS = gql`
    query GetRedeemPoints ($input : GetRedeemPointInput) {
        getRedeemPoints(input: $input) {
            id
            reward_id
            key
            type
            name
            reward_points
            items {
                all
                collection
            }
            minimumReq
            prefix
            status
            combination
            start_at
            expire_at
            createdAt
            updatedAt
        }
    }
`;
export const GET_POINT_PROGRAM = gql`
    query GetPointProgram($input : GetPointProgramInput) {
        getPointProgram(input: $input) {
            id
            point_currency {
                singular
                plural
            }
            status
            createdAt
            updatedAt
        }
    }
`;
