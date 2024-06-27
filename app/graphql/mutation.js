import {gql} from "@apollo/client";

export const UPDATE_CUSTOMER = gql`
    mutation UpdateCustomer($input: UpdateCustomerInput) {
        updateCustomer(input: $input) {
            id
            program_id
            points_balance
            points_earn
            points_spent
            referral_link
            referral_count
            date_of_birth
            vip_tier_index
            last_used_points
            last_earned_points
            vip_expiry_date
            vip_points {
                earn_points
                money_spent
            }
            program_limit {
                program_type
                used
            }
            reward {
                reward_id
                program_id
                reward_type
            }
            createdAt
            updatedAt
        }
    }
`

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
            limit_reset_loop
            status
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_NEW_TIER = gql`
    mutation CreateNewTier($input: CreateNewTierInput) {
        createNewTier(input: $input) {
            id
            name
            icon
            milestone_requirement
            reward {
                reward_type
                points
                reward_id
            }
            previousTier
            nextTier
            count
            perks
            status
        }
    }
`
export const UPDATE_VIP_TIER = gql`
    mutation UpdateVipTier($input: UpdateVipTierInput) {
        updateVipTier(input: $input) {
            id
            name
            icon
            milestone_requirement
            reward {
                reward_type
                points
                reward_id
            }
            previousTier
            nextTier
            count
            perks
            status
        }
    }
`

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
