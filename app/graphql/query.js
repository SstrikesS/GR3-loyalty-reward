import {gql} from "@apollo/client";


export const HELLO_QUERY = gql`
    query hello {
        hello
    }
`;

export const GET_CUSTOMERS = gql`
    query GetCustomers($input: GetCustomerInput) {
        getCustomers(input: $input) {
            customers {
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
            pageInfo {
                hasNextPage
                hasPreviousPage
            }
        }
    }
`

export const GET_CUSTOMER = gql`
    query GetCustomer($input: GetCustomerInput) {
        getCustomer(input: $input) {
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
            vip_points{
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

export const GET_ALL_CUSTOMERS = gql`
    query GetAllCustomers($input: GetCustomerInput) {
        getAllCustomers(input: $input) {
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
            vip_points{
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
export const SHOP_GET_CUSTOMER = gql`
    query ShopGetCustomer($input: GetCustomerInput) {
        shopGetCustomer(input: $input){
            points_balance
            date_of_birth
            vip_tier_index
            vip_points{
                earn_points
                money_spent
            }
            vip_expiry_date
            program_limit {
                program_type
                used
            }
            reward {
                reward_id
                program_id
                reward_type
            }
        }
    }
`

export const GET_EARN_POINT = gql`
    query GetEarnPoint($input : GetEarnPointInput) {
        getEarnPoint(input: $input) {
            id
            program_id
            key
            sub_key
            icon
            link
            name
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
export const GET_EARN_POINTS = gql`
    query GetEarnPoints($input : GetEarnPointInput) {
        getEarnPoints(input: $input) {
            id
            program_id
            key
            sub_key
            icon
            link
            name
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

export const SHOP_GET_EARN_POINTS = gql`
    query ShopGetEarnPoints($input : GetEarnPointInput) {
        shopGetEarnPoints(input: $input) {
            id
            key
            sub_key
            icon
            link
            name
            reward_points
            limit
            requirement
            limit_reset_loop
        }
    }
`;

export const SHOP_GET_REWARDS = gql`
    query ShopGetRewards ($input: GetRewardInput) {
        shopGetRewards(input: $input) {
            reward_id
            reward_type
            program_id
        }
    }
`

export const SHOP_GET_REWARD = gql`
    query ShopGetReward ($input: GetRewardInput) {
        shopGetReward(input: $input) {
            reward_id
            reward_type
            program_id
        }
    }
`

export const SHOP_GET_REDEEM_POINTS = gql`
    query ShopGetRedeemPoints ($input : GetRedeemPointInput) {
        shopGetRedeemPoints(input: $input) {
            id
            key
            icon
            title
            pointsCost
            discountValue
            isSetShippingRates
            programApply
            collections
            combination {
                order
                product
                shipping
            }
            minimumRequire
            minimumRequireType
            start_at
            expire_at
        }
    }
`;

export const SHOP_GET_VIP_PROGRAM = gql`
    query ShopGetVipProgram($input: GetVipProgramInput) {
        shopGetVipProgram(input: $input) {
            id
            milestone_type
            milestone_period_type
            milestone_start
            milestone_period_unit
            milestone_period_value
            status
        }
    }
`

export const SHOP_GET_VIP_TIERS = gql`
    query ShopGetVipTiers($input: GetVipTierInput) {
        shopGetVipTiers(input: $input) {
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
            perks
        }
    }
`

export const SHOP_GET_VIP_TIER = gql`
    query ShopGetVipTier($input: GetVipTierInput) {
        shopGetVipTier(input: $input) {
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
            perks
        }
    }
`
export const GET_REDEEM_POINTS = gql`
    query GetRedeemPoints ($input : GetRedeemPointInput) {
        getRedeemPoints(input: $input) {
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
`;
export const GET_REDEEM_POINT = gql`
    query GetRedeemPoint ($input : GetRedeemPointInput) {
        getRedeemPoint(input: $input) {
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
`;
export const GET_POINT_PROGRAM = gql`
    query GetPointProgram($input : GetPointProgramInput) {
        getPointProgram(input: $input) {
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
`;

export const GET_VIP_PROGRAM = gql`
    query GetVipProgram($input: GetVipProgramInput) {
        getVipProgram(input: $input) {
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
`
export const GET_VIP_TIER = gql`
    query GetVipTier($input: GetVipTierInput) {
        getVipTier(input: $input) {
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
            perks
            count
            status
        }
    }
`

export const GET_VIP_TIERS = gql`
    query GetVipTiers($input: GetVipTierInput) {
        getVipTiers(input: $input) {
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


