import {gql} from "@apollo/client";

export const UPDATE_EARN_POINT = gql`
    mutation UpdateEarnPoint($input : UpdateEarnPointInput) {
        updateEarnPoint(input : $input) {
            id
            key
            name
            link
            reward_points
            limit
            requirement
            status
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_REDEEM_POINT = gql`
    mutation CreateRedeemPoint($input: CreateRedeemPointInput) {
        createRedeemPoint(input: $input) {
            id
            store_id
            key
            title
            pointsCost
            discountValue
            programApply
            collections
            prefixCode
            combination {
                order
                product
                shipping
            }
            minimumRequire
            start_at
            expire_at
            status
            createdAt
            updatedAt
        }
    }
`
