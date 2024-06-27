import jwt from "jsonwebtoken";
import PointModel from "~/models/pointProgram.model";
import EarnPointModel from "~/models/earnPoint.model";
import RedeemPointModel from "~/models/redeemPoint.model";
import VipProgramModel from "~/models/vipProgram.model";
import CustomerModel from "~/models/customer.model";

export const verifyToken = async (bearerToken) => {
    if (!bearerToken) {
        throw new Error('You have to provide bearer token on the request headers');
    } else {
        const token = bearerToken.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        console.log('DECODED: ', decoded);
        if (!decoded) {
            throw new Error('Invalid access token');
        }
        return true;
    }
}

export const resolver = {
    hello: () => {
        return "Hello World";
    },
    getEarnPoint: async ({input}, request) => {
        if (input.id) {
            return EarnPointModel.findOne({id: input.id, program_id: input.program_id}, null, {
                lean: true
            });
        } else if (input.key) {
            return EarnPointModel.findOne({key: input.key, program_id: input.program_id}, null, {
                lean: true
            });
        } else {
            return null;
        }
    },
    getEarnPoints: async ({input}, request) => {
        return EarnPointModel.find({program_id: input.program_id}, null, {
            lean: true
        });
    },
    getRedeemPoints: async ({input}, request) => {
        return RedeemPointModel.find({program_id: input.program_id}, null, {
            lean: true
        });
    },
    getRedeemPoint: async ({input}, request) => {
        return RedeemPointModel.findOne({program_id: input.program_id, id: input.id}, null, {
            lean: true
        });
    },
    getPointProgram: async ({input}, request) => {
        return PointModel.findOne({id: input.id}, null, {
            lean: true
        });
    },

    shopGetRewards: async ({input}, request) => {
        const customer = await CustomerModel.findOne({id: input.customer_id, program_id: input.program_id}, null, {
            lean: true
        });

        if (customer) {
            return customer.reward;
        } else {
            return [];
        }
    },

    shopGetReward: async ({input}, request) => {
        const customer = await CustomerModel.findOne({id: input.customer_id, program_id: input.program_id}, null, {
            lean: true
        });

        if (customer) {
            return customer.reward.find(item => item.reward_id === input.reward_id);
        }
    },

    getCustomer: async ({input}, request) => {
        return CustomerModel.findOne({id: input.id, program_id: input.program_id}, null, {
            lean: true
        });
    },

    shopGetCustomer: async ({input}, request) => {
        return CustomerModel.findOne({id: input.id, program_id: input.program_id}, null, {
            lean: true
        })
    },

    getCustomers: async ({input}, request) => {
        let {sort, reverse, limit, program_id, skip} = input;
        let option = {lean: true, sort: {_id: 1}};
        if (sort) {
            option = {
                ...option,
                sort: {
                    [sort]: reverse,
                    _id: 1,
                }
            }
        }

        if (limit) {
            option = {
                ...option,
                limit: limit + 1
            }
        }
        if (skip) {
            option = {
                ...option,
                skip: skip,
            }
        }
        const customers = await CustomerModel.find(
            {program_id: program_id},
            null,
            option
        );

        if (customers.length > limit) {
            customers.pop();

            return {
                customers: customers,
                pageInfo: {
                    hasNextPage: true,
                    hasPreviousPage: skip > 0,
                }
            }
        } else {

            return {
                customers: customers,
                pageInfo: {
                    hasNextPage: false,
                    hasPreviousPage: skip > 0,
                }
            }
        }
    },

    getAllCustomers: async ({input}, request) => {
        return CustomerModel.find({program_id: input.program_id}, null, null)
    },

    createRedeemPoint: async ({input}, request) => {
        return RedeemPointModel.create({
            ...input,
            status: true,
        }, null);
    },

    createNewTier: async ({input}, request) => {
        let vipProgram = await VipProgramModel.findOne({
            id: input.program_id
        }, null, null);
        if (vipProgram) {
            vipProgram.tier.push({
                id: input.id,
                name: input.name,
                icon: input.icon,
                milestone_requirement: input.milestone_requirement,
                reward: input.reward,
                perks: input.perks,
                previousTier: input.previousTier ?? null,
                nextTier: input.nextTier ?? null,
                count: 0,
                status: true,
            });
            await vipProgram.save();

            return vipProgram.tier[vipProgram.tier.length - 1];
        }
    },

    updateVipTier: async ({input}, request) => {
        let vipProgram = await VipProgramModel.findOneAndUpdate(
            {id: input.program_id, 'tier.id': input.id},
            {
                $set: {
                    'tier.$.icon': input.icon ?? undefined,
                    'tier.$.name': input.name ?? undefined,
                    'tier.$.milestone_requirement': input.milestone_requirement ?? undefined,
                    'tier.$.reward': input.reward ?? undefined,
                    'tier.$.perks': input.perks ?? undefined,
                    'tier.$.previousTier' : input.previousTier === null || input.previousTier === "null"? null : input.previousTier ?? undefined,
                    'tier.$.nextTier': input.nextTier === null || input.nextTier === "null" ? null : input.nextTier ?? undefined,

                },
                $inc: {
                    'tier.$.count': input.count ?? 0,
                }
            },
            {
                returnDocument: "after",
                new: true,
                lean: true,
            }
        );

        if (vipProgram) {
            return vipProgram.tier.find(value => value.id === input.id);
        }
    },

    updateVipProgram:
        async ({input}, request) => {

            return VipProgramModel.findOneAndUpdate({
                id: input.id
            }, {
                milestone_type: input.milestone_type,
                milestone_period_type: input.milestone_period_type,
                milestone_start: input.milestone_start,
                milestone_period_unit: input.milestone_period_unit ?? undefined,
                milestone_period_value: input.milestone_period_value ?? undefined,
                status: input.status
            }, {
                returnDocument: "after",
                new: true,
                lean: true,
            })
        },

    updatePointProgram:
        async ({input}, request) => {

            return PointModel.findOneAndUpdate({
                id: input.id
            }, {
                point_currency: {
                    singular: input.point_currency.singular,
                    plural: input.point_currency.plural,
                },
                point_expiry: {
                    status: input.point_expiry.status,
                    period_time: input.point_expiry.period_time ?? undefined,
                    period_unit: input.point_expiry.period_unit ?? undefined,
                    reactivation_email_time: input.point_expiry.reactivation_email_time ?? undefined,
                    last_chance_email_time: input.point_expiry.last_chance_email_time ?? undefined,
                },
                status: input.status,
            }, {
                returnDocument: "after",
                new: true,
                lean: true,
            });
        },

    updateRedeemPoint:
        async ({input}, request) => {
            const {
                id, store_id, title, pointsCost, discountValue, isSetShippingRates, programApply, collections,
                prefixCode, combination, minimumRequire, minimumRequireType, start_at, expire_at, status
            } = input;

            return RedeemPointModel.findOneAndUpdate({
                id: id,
                store_id: store_id
            }, {
                title: title,
                pointsCost: pointsCost,
                discountValue: discountValue,
                isSetShippingRates: isSetShippingRates ?? undefined,
                programApply: programApply,
                collections: collections ?? undefined,
                prefixCode: prefixCode ?? undefined,
                combination: combination,
                minimumRequire: minimumRequire ?? undefined,
                minimumRequireType: minimumRequireType,
                start_at: start_at,
                expire_at: expire_at ?? undefined,
                status: status
            }, {
                returnDocument: "after",
                new: true,
                lean: true,
            })
        },

    updateEarnPoint:
        async ({input}, request) => {
            const {
                id,
                program_id,
                key,
                name,
                link,
                requirement,
                limit,
                limit_reset_loop,
                sub_key,
                reward_points,
                status
            } = input;
            return EarnPointModel.findOneAndUpdate({
                id: id,
                program_id: program_id,
                key: key
            }, {
                sub_key: sub_key ?? undefined,
                name: name,
                link: link ?? undefined,
                reward_points: reward_points,
                requirement: requirement ?? undefined,
                limit: limit ?? undefined,
                limit_reset_loop: limit_reset_loop ?? undefined,
                status: status,
            }, {
                returnDocument: "after",
                new: true,
                lean: true,
            })
        },

    updateCustomer: async ({input}, request) => {
        const {
            id,
            program_id,
            points_balance,
            points_earn,
            points_spent,
            referral_link,
            referral_count,
            date_of_birth,
            vip_tier_index,
            last_used_points,
            last_earned_points,
            vip_expiry_date,
            vip_points,
            program_limit,
            reward,
        } = input;
        if (program_limit) {
            return CustomerModel.findOneAndUpdate(
                {
                    id: id,
                    program_id: program_id,
                    'program_limit.program_type': program_limit.program_type
                }, {
                    $set: {
                        points_balance: points_balance ?? undefined,
                        points_earn: points_earn ?? undefined,
                        points_spent: points_spent ?? undefined,
                        referral_link: referral_link ?? undefined,
                        referral_count: referral_count ?? undefined,
                        date_of_birth: date_of_birth ?? undefined,
                        vip_tier_index: vip_tier_index ?? undefined,
                        last_used_points: last_used_points ?? undefined,
                        last_earned_points: last_earned_points ?? undefined,
                        vip_expiry_date: vip_expiry_date ?? undefined,
                        'vip_points.earn_points': vip_points ? vip_points.earn_points : undefined,
                        'vip_points.money_spent': vip_points ? vip_points.money_spent : undefined,
                    },
                    $inc: {
                        'program_limit.$.used': program_limit.used
                    },
                    $push: {reward: reward?.length > 0 ? {$each: reward} : undefined},
                }, {
                    returnDocument: "after",
                    new: true,
                    lean: true,
                })
        } else {
            return CustomerModel.findOneAndUpdate(
                {
                    id: id,
                    program_id: program_id,
                }, {
                    $set: {
                        points_balance: points_balance ?? undefined,
                        points_earn: points_earn ?? undefined,
                        points_spent: points_spent ?? undefined,
                        referral_link: referral_link ?? undefined,
                        referral_count: referral_count ?? undefined,
                        date_of_birth: date_of_birth ?? undefined,
                        vip_tier_index: vip_tier_index ?? undefined,
                        last_used_points: last_used_points ?? undefined,
                        last_earned_points: last_earned_points ?? undefined,
                        vip_expiry_date: vip_expiry_date ?? undefined,
                        vip_points: vip_points ?? undefined,
                    },
                    $push: {reward: reward?.length > 0 ? {$each: reward} : undefined},
                }, {
                    returnDocument: "after",
                    new: true,
                    lean: true,
                })
        }

    },

    getVipProgram:
        async ({input}, request) => {
            return VipProgramModel.findOne({id: input.id}, null, {
                lean: true
            });
        },

    shopGetVipProgram: async ({input}, request) => {
        return VipProgramModel.findOne({id: input.id}, null, {
            lean: true
        });
    },

    shopGetVipTier:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.program_id}, null, {
                lean: true
            });

            if (vipProgram) {
                return vipProgram.tier.find((value) => value.id === input.id);
            } else {
                return null;
            }
        },

    shopGetVipTiers:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.program_id}, null, {
                lean: true
            });

            if (vipProgram) {
                const map = new Map();
                let startNode = null;

                vipProgram.tier.forEach(node => {
                    map.set(node.id, node);
                    if (node.previousTier === null) {
                        startNode = node;
                    }
                });

                const result = [];
                let currentNode = startNode;

                while (currentNode !== null) {
                    result.push(currentNode);
                    currentNode = map.get(currentNode.nextTier) || null;
                }

                return result;
            } else {
                return [];
            }
        },

    getVipTiers:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.program_id}, null, {
                lean: true
            });

            if (vipProgram) {
                const map = new Map();
                let startNode = null;

                vipProgram.tier.forEach(node => {
                    map.set(node.id, node);
                    if (node.previousTier === null) {
                        startNode = node;
                    }
                });

                const result = [];
                let currentNode = startNode;

                while (currentNode !== null) {
                    result.push(currentNode);
                    currentNode = map.get(currentNode.nextTier) || null;
                }

                return result;
            } else {
                return [];
            }
        },

    getVipTier:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.program_id}, null, {
                lean: true
            });

            if (vipProgram) {
                return vipProgram.tier.find((value) => value.id === input.id);
            } else {
                return null;
            }
        },

    shopGetEarnPoints:
        async ({input}, request) => {
            return EarnPointModel.find({program_id: input.program_id, status: true}, null, {
                lean: true
            });
        },

    shopGetRedeemPoints:
        async ({input}, request) => {
            const today = new Date().toISOString();
            return RedeemPointModel.find({
                program_id: input.program_id,
                status: true,
                start_at: {$lt: today},
                $or: [
                    {expire_at: {$exists: false}},
                    {expire_at: {$gt: today}},
                    {$expr: {$eq: ['$expire_at', '$start_at']}}
                ],
            }, null, {
                lean: true
            });
        },
}
