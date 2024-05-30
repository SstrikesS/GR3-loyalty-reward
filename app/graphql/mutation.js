import {gql} from "@apollo/client";

export const UPDATE_VIP_PROGRAM = gql`
    mutation UpdateVipProgram($input: UpdateVipProgramInput) {
        updateVipProgram(input: $input) {
            id
            milestone_type
            milestone_period_type
            milestone_start
            milestone_period_unit
            milestone_period_value
            status
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_POINT_PROGRAM = gql`
    mutation UpdatePointProgram($input: UpdatePointProgramInput) {
        updatePointProgram(input: $input) {
            id
            point_currency {
                singular
                plural
            }
            point_expiry {
                status
                period_time
                period_unit
                reactivation_email_time
                last_chance_email_time
            }
            status
            createdAt
            updatedAt
        }
    }
`

export const UPDATE_EARN_POINT = gql`
    mutation UpdateEarnPoint($input : UpdateEarnPointInput) {
        updateEarnPoint(input : $input) {
            id
            program_id
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
            program_id
            key
            icon
            title
            pointsCost
            discountValue
            isSetShippingRates
            programApply
            collections
            prefixCode
            combination {
                order
                product
                shipping
            }
            minimumRequire
            minimumRequireType
            start_at
            expire_at
            status
            createdAt
            updatedAt
        }
    }
`
export const UPDATE_REDEEM_POINT = gql`
    mutation UpdateRedeemPoint($input: UpdateRedeemPointInput) {
        updateRedeemPoint(input: $input) {
            id
            program_id
            key
            icon
            title
            pointsCost
            discountValue
            isSetShippingRates
            programApply
            collections
            prefixCode
            combination {
                order
                product
                shipping
            }
            minimumRequire
            minimumRequireType
            start_at
            expire_at
            status
            createdAt
            updatedAt
        }
    }
`
