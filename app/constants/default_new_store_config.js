export const de_earnPoint = [
    {
        key: 'place_an_order',
        icon: 'https://cdn-icons-png.flaticon.com/32/2435/2435281.png',
        sub_key: 'money_spent',
        name: 'Complete an order',
        reward_points: 5,
        requirement: "",
        limit: 0,
        limit_reset_loop: 'lifetime',
        status: true,
    },
    {
        key: 'share_on_facebook',
        icon: 'https://cdn-icons-png.flaticon.com/32/1051/1051360.png',
        name: 'Share on Facebook',
        link: 'https://',
        reward_points: 250,
        requirement: "",
        limit: 0,
        limit_reset_loop: 'lifetime',
        status: false,
    },
    {
        key: 'happy_birthday',
        icon: 'https://cdn-icons-png.flaticon.com/32/6479/6479517.png',
        name: 'Happy Birthday',
        reward_points: 150,
        requirement: "",
        status: false,
    },
    {
        key: 'sign_in',
        icon: 'https://cdn-icons-png.flaticon.com/32/10479/10479877.png',
        name: 'Sign In',
        reward_points: 200,
        requirement: "",
        status: false,
    }
];

export const de_vipProgram = {
    milestone_type: 'earn_point',
    milestone_period_type: 'infinity',
    milestone_period_unit: 'year',
    milestone_period_value: 1,
    status: false,
}

export const de_pointProgram = {
    point_currency: {
        singular: 'point',
        plural: 'points',
    },
    point_expiry: {
        status: false,
        period_unit: 'month',
        period_time: 1,
        reactivation_email_time: 30,
        last_chance_email_time: 1,
    },
    status: true,
}

export const de_customer = {
    points_balance: "0",
    points_earn: '0',
    points_spent: '0',
    referral_count: 0,
    date_of_birth: undefined,
    vip_tier_index: undefined,
    last_used_points: new Date().toISOString(),
    last_earned_points: new Date().toISOString(),
    program_limit: [
        {
            program_type: "place_an_order",
            used: 0
        },
        {
            program_type: "share_on_facebook",
            used: 0
        }
    ],
    vip_points: {
        earn_points: "0",
        money_spent: "0"
    },
    reward: []
}
