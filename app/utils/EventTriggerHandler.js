import client from "../graphql/client";
import {
    GET_CUSTOMER,
    GET_EARN_POINT,
    GET_POINT_PROGRAM,
    GET_VIP_PROGRAM,
    GET_VIP_TIERS
} from "../graphql/query";
import {UPDATE_CUSTOMER, UPDATE_VIP_TIER} from "../graphql/mutation";
import {addDays, addMonths, addWeeks, addYears, parseISO, startOfToday} from "date-fns";
import {agenda} from "../shopify.server";
import CustomerModel from "../models/customer.model";

function findTierIndex(earn_points, tiers) {
    if (earn_points < parseInt(tiers[0].milestone_requirement)) {
        return null;
    }
    for (let i = 0; i < tiers.length; i++) {
        if (earn_points < parseInt(tiers[i].milestone_requirement)) {
            return tiers[i - 1].id;
        }
    }

    return tiers[tiers.length - 1].id;
}

export async function NewVipTierCreateHandler(currentTier, program_id, previousTier, nextTier) {
    if (previousTier) {
        await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    program_id: program_id,
                    id: previousTier,
                    nextTier: currentTier,
                }
            }
        })
    }

    if (nextTier) {
        await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    program_id: program_id,
                    id: nextTier,
                    previousTier: currentTier,
                }
            }
        })
    }
}

export async function UpdateVipTierHandler(currentTier, program_id, oldPreviousTier, oldNextTier, newPreviousTier, newNextTier) {
    if (oldPreviousTier) {
        if (oldNextTier) {
            await client.mutate({
                mutation: UPDATE_VIP_TIER,
                variables: {
                    input: {
                        program_id: program_id,
                        id: oldPreviousTier,
                        nextTier: oldNextTier,
                    }
                }
            });
            await client.mutate({
                mutation: UPDATE_VIP_TIER,
                variables: {
                    input: {
                        program_id: program_id,
                        id: oldNextTier,
                        previousTier: oldPreviousTier,
                    }
                }
            })
        } else {
            await client.mutate({
                mutation: UPDATE_VIP_TIER,
                variables: {
                    input: {
                        program_id: program_id,
                        id: oldPreviousTier,
                        nextTier: null,
                    }
                }
            });
        }
    } else if (oldNextTier) {
        await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    program_id: program_id,
                    id: oldNextTier,
                    previousTier: null,
                }
            }
        });
    }

    NewVipTierCreateHandler(currentTier, program_id, newPreviousTier, newNextTier).then((r) => console.log(`Update tier ${newPreviousTier} and ${newNextTier} successfully!`))
}


export async function VipProgramUpdateHandler(previous, update) {

    const vipTier = await client.query({
        query: GET_VIP_TIERS,
        variables: {
            input: {
                program_id: update.id,
            }
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    });


    if ((update.milestone_type && update.milestone_type !== previous.milestone_type)
        || update.status === true && update.status !== previous.status) {
        if (update.status === true) {
            const customerList = await CustomerModel.find({program_id: update.id}, null, null);
            for (const customer of customerList) {
                const earn_points = parseInt(customer.vip_points[update.milestone_type]);
                const result = findTierIndex(earn_points, vipTier.data.getVipTiers)
                if (result) {
                    if (customer.vip_tier_index !== result) {

                        updateTierCounter(result, customer.vip_tier_index, update.id).then(
                            () => console.log(`---Customer ${customer.id}: New Tier update!---`)
                        )

                        customer.vip_tier_index = result;
                        const tier = vipTier.data.getVipTiers.find(item => item.id === result);
                        if (tier?.reward.length > 0) {
                            customer.points_earn = `${parseInt(customer.points_earn) + parseInt(tier?.reward[0].points)}`;
                            customer.points_balance = `${parseInt(customer.points_balance) + parseInt(tier?.reward[0].points)}`
                        }
                    }
                } else if (customer.vip_tier_index !== null) {

                    updateTierCounter(result, customer.vip_tier_index, update.id).then(
                        () => console.log(`---Customer ${customer.id}: New Tier update!---`)
                    )
                    customer.vip_tier_index = null;
                }

                await customer.save()
            }
        }
    }

    if ((update.milestone_start && update.milestone_start !== previous.milestone_start)
        || (update.milestone_period_value && update.milestone_period_value !== previous.milestone_period_value)
        || (update.milestone_period_unit && update.milestone_period_unit !== previous.milestone_period_unit)
    ) {
        if (update.milestone_period_type !== 'infinity') {
            const existingJobs = await agenda.jobs({name: `${update.id}/vip-program-period-reset`});
            if (existingJobs.length === 0) {
                agenda.define(`${update.id}/vip-program-period-reset`, async (job, done) => {
                    const {update, vipTier} = job.attrs.data;
                    const customerList = await CustomerModel.find({program_id: update.id}, null, null);
                    for (const customer of customerList) {
                        customer.vip_points = {
                            earn_points: "0",
                            money_spent: "0",
                        }
                        if (vipTier.data.getVipTiers[0].milestone_requirement === 0) {
                            customer.vip_tier_index = vipTier.data.getVipTiers[0].id;
                            if (vipTier.data.getVipTiers[0].reward.length > 0) {
                                customer.points_earn = `${parseInt(customer.points_earn) + parseInt(vipTier.data.getVipTiers[0].reward[0].points)}`;
                                customer.points_balance = `${parseInt(customer.points_balance) + parseInt(vipTier.data.getVipTiers[0].reward[0].points)}`
                            }
                        } else {
                            customer.vip_tier_index = null;
                        }

                        await customer.save();
                    }

                    done();
                })
            } else {
                await existingJobs[0].remove();
            }
            let time_reset = parseISO(update.milestone_start);
            switch (update.milestone_period_unit) {
                case 'day' :
                    time_reset = addDays(time_reset, parseInt(update.milestone_period_value))
                    break;
                case 'week':
                    time_reset = addWeeks(time_reset, parseInt(update.milestone_period_value))
                    break;
                case 'month' :
                    time_reset = addMonths(time_reset, parseInt(update.milestone_period_value))
                    break;
                case 'year' :
                    time_reset = addYears(time_reset, parseInt(update.milestone_period_value))
                    break;
                default:
                    break;
            }

            await agenda.every(`${update.milestone_period_value} ${update.milestone_period_unit}`, `${update.id}/vip-program-period-reset`, {
                update,
                vipTier
            }, {startDate: time_reset})
        }
    }
}

export async function orderPaid(payload, shopResponseJson, discount = []) {
    const customer_id = payload.customer.id;
    let data = {};

    const [vip_program, points_program, customerData, vipTier] = await Promise.all([
        client.query({
            query: GET_VIP_PROGRAM,
            variables: {input: {id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1]}},
            fetchPolicy: 'no-cache',
        }),
        client.query({
            query: GET_POINT_PROGRAM,
            variables: {input: {id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1]}},
            fetchPolicy: 'no-cache',
        }),
        client.query({
            query: GET_CUSTOMER,
            variables: {
                input: {
                    id: `${customer_id}`,
                    program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                }
            }
        }),
        client.query({
            query: GET_VIP_TIERS,
            variables: {
                input: {
                    program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                }
            }
        })
    ]);

    if (customerData.data.getCustomer) {
        console.log(`---Customer: ${customerData.data.getCustomer.id}---`);
        if (points_program.data.getPointProgram) {
            if (points_program.data.getPointProgram.status) {
                const [earn_points_program] = await Promise.all([
                    client.query({
                        query: GET_EARN_POINT,
                        variables: {
                            input: {
                                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                                key: 'place_an_order'
                            }
                        }
                    }),
                ]);
                console.log(`---VIP Program: ${vip_program.data.getVipProgram.status === true ? 'active' : 'disable'}---`);
                if (vip_program.data.getVipProgram.status === true) {
                    if (earn_points_program.data.getEarnPoint.requirement !== "") {
                        if (customerData.data.getCustomer.vip_tier_index) {
                            const requirement = earn_points_program.data.getEarnPoint.requirement.split('/');
                            if (customerData.data.getCustomer.vip_tier_index === requirement[1]) {
                                if (requirement[0] === 'exclude') {
                                    console.log(`---Error: Customer ${customerData.data.getCustomer.id} eligibility not meet requirement---\n---Requirement: ${requirement}---\n---Customer Tier:  ${customerData.data.getCustomer.vip_tier_index}---`);

                                    return null;
                                }
                            } else if (requirement[0] === 'include') {
                                console.log(`---Error: Customer ${customerData.data.getCustomer.id} eligibility not meet requirement---\n---Requirement: ${requirement}---\n---Customer Tier:  ${customerData.data.getCustomer.vip_tier_index}---`);

                                return null;
                            }

                            console.log(`---Customer Requirement:  ${requirement}---`);
                        }
                    } else {
                        console.log(`---No customer requirement---`);
                    }
                }

                if (earn_points_program.data.getEarnPoint.limit !== -1) {
                    const customerLimit = customerData.data.getCustomer.program_limit.find((value) => value.program_type === 'place_an_order');

                    if (customerLimit.used >= earn_points_program.data.getEarnPoint.limit) {

                        console.log(`---Error: Customer ${customerData.data.getCustomer.id} usage limit reached---\n---Customer used: ${customerLimit.used}---\n---Limit set:  ${earn_points_program.data.getEarnPoint.limit}---`);

                        return null;
                    }

                    console.log(`---Customer used}: ${customerLimit.used}---\n---Limit set:  ${earn_points_program.data.getEarnPoint.limit}---`)
                } else {
                    console.log(`---No usage limit---`)
                }

                if (vip_program.data.getVipProgram.status) {
                    const tier = vipTier.data.getVipTiers.find((value) => value.id === customerData.data.getCustomer.vip_tier_index);

                    console.log(`---Customer Tier: ${tier ? tier.name : 'No VIP tier'}---`)
                    if(tier) {
                        if (earn_points_program.data.getEarnPoint.status) {

                            if (earn_points_program.data.getEarnPoint.sub_key === 'money_spent') {
                                data.earn_points_reward = parseFloat(payload.subtotal_price) * parseInt(earn_points_program.data.getEarnPoint.reward_points) * (1 + parseFloat(tier.perks) / 100);
                            } else if (earn_points_program.data.getEarnPoint.sub_key === 'fixed_point') {
                                data.earn_points_reward = parseInt(earn_points_program.data.getEarnPoint.reward_points) * (1 + parseFloat(tier.perks) / 100);
                            }

                            console.log(`---Total price: ${payload.subtotal_price}$---\n---Earn: ${data.earn_points_reward} points---`);
                        }
                    } else {
                        if (earn_points_program.data.getEarnPoint.sub_key === 'money_spent') {
                            data.earn_points_reward = parseFloat(payload.subtotal_price) * parseInt(earn_points_program.data.getEarnPoint.reward_points);
                        } else if (earn_points_program.data.getEarnPoint.sub_key === 'fixed_point') {
                            data.earn_points_reward = parseInt(earn_points_program.data.getEarnPoint.reward_points);
                        }
                    }

                } else {
                    if (earn_points_program.data.getEarnPoint.status) {
                        if (earn_points_program.data.getEarnPoint.sub_key === 'money_spent') {
                            data.earn_points_reward = parseFloat(payload.subtotal_price) * parseInt(earn_points_program.data.getEarnPoint.reward_points);
                        } else if (earn_points_program.data.getEarnPoint.sub_key === 'fixed_point') {
                            data.earn_points_reward = parseInt(earn_points_program.data.getEarnPoint.reward_points);
                        }

                        console.log(`---Total price: ${payload.subtotal_price}---\n---Earn: ${data.earn_points_reward} points---`);
                    }
                }
            }
        }
    }

    if (data) {
        if (data.earn_points_reward) {
            data.earn_points = parseInt(customerData.data.getCustomer.points_earn) + data.earn_points_reward
            data.balance = parseInt(customerData.data.getCustomer.points_balance) + data.earn_points_reward
            data.vip_points = {
                earn_points: vip_program.data.getVipProgram.milestone_type === 'earn_points' ? `${parseInt(customerData.data.getCustomer.vip_points.earn_points) + data.earn_points_reward}` : undefined,
                money_spent: vip_program.data.getVipProgram.milestone_type === 'money_spent' ? `${parseInt(customerData.data.getCustomer.vip_points.money_spent) + data.earn_points_reward}` : undefined,
            }
        }

        const updateCustomer = await client.mutate({
            mutation: UPDATE_CUSTOMER,
            variables: {
                input: {
                    id: `${customer_id}`,
                    program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                    points_earn: data.earn_points ? `${parseInt(data.earn_points)}` : undefined,
                    points_balance: data.balance ? `${parseInt(data.balance)}` : undefined,
                    vip_points: vip_program.data.getVipProgram.status ? data.vip_points : undefined,
                    last_earned_points: startOfToday().toISOString(),
                    program_limit: {
                        program_type: 'place_an_order',
                        used: 1,
                    }
                }
            }
        });

        if (updateCustomer.data.updateCustomer) {
            updateCustomerTier(customerData.data.getCustomer.id, vipTier, vip_program.data.getVipProgram.milestone_type, shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1]).then()

            console.log("---Trigger order/paid completed successfully!---");

            return null;
        }
    } else {
        console.log("---Warning: Nothing changed! Skip---");

        return null;
    }

    //customer Activity
}

export async function customerCreate(payload) {

}

export async function productUpdate(payload) {
    // for testing only
}

export async function customerDoBUpdate(payload) {
    const today = new Date();
    const dob = parseISO(payload.dob);

    const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    let oneMonthLater;
    if (today.getMonth() === 11) {
        oneMonthLater = new Date(today.getFullYear() + 1, 0, today.getDate());
    } else {
        oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }

    if (birthdayThisYear > oneMonthLater) {
        const customerData = await client.query({
            query: GET_CUSTOMER,
            variables: {
                input: {
                    id: payload.customer_id,
                    program_id: payload.program_id,
                }
            }
        })
        agenda.define("Happy_Birthday_Reward", async (job) => {

        });
    }
}

export async function customerRedeemCode(payload) {
    const customerData = await client.query({
        query: GET_CUSTOMER,
        variables: {
            input: {
                id: payload.customer_id,
                program_id: payload.program_id,
            }
        }
    })
    if (customerData.data.getCustomer) {
        await client.mutate({
            mutation: UPDATE_CUSTOMER,
            variables: {
                input: {
                    id: payload.customer_id,
                    program_id: payload.program_id,
                    points_balance: `${parseInt(customerData.data.getCustomer.points_balance) - parseInt(payload.redeemProgram.pointsCost)}`,
                    points_spent: `${parseInt(customerData.data.getCustomer.points_spent) + parseInt(payload.redeemProgram.pointsCost)}`,
                    last_used_points: startOfToday().toISOString(),
                    reward: [{
                        reward_id: payload.reward_id,
                        program_id: payload.redeemProgram.id,
                        reward_type: 'discount_code',
                    }]
                }
            }
        });
    }
}

async function updateTierCounter(newTier, oldTier, program_id) {
    if (newTier) {
        await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    id: newTier,
                    program_id: program_id,
                    count: 1,
                }
            }
        }).then((r) => {
            if (r.data.updateVipTier) {
                console.log(`---Increase customer of tier ${r.data.updateVipTier.name}---`)
            }
        });
    }
    if (oldTier) {
        await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    id: oldTier,
                    program_id: program_id,
                    count: -1,
                }
            }
        }).then((r) => {
            if (r.data.updateVipTier) {
                console.log(`Decrease customer of tier ${r.data.updateVipTier.name}---`)
            }
        });
    }
}


async function updateCustomerTier(customerID, vipTier, milestone_type, program_id) {
    const customer = await CustomerModel.findOne({id: customerID, program_id: program_id}, null, null)
    const earn_points = parseInt(customer.vip_points[milestone_type]);

    const result = findTierIndex(earn_points, vipTier.data.getVipTiers)
    if (result) {
        if (customer.vip_tier_index !== result) {

            updateTierCounter(result, customer.vip_tier_index, program_id).then((r) => console.log(`---Customer ${customer.id}: New Tier update!---`));

            customer.vip_tier_index = result;

            const tier = vipTier.data.getVipTiers.find(item => item.id === result);
            if (tier?.reward.length > 0) {
                customer.points_earn = `${parseInt(customer.points_earn) + parseInt(tier?.reward[0].points)}`;
                customer.points_balance = `${parseInt(customer.points_balance) + parseInt(tier?.reward[0].points)}`
            }
        }


    }

    await customer.save()
}
