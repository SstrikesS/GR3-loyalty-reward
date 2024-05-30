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
        return EarnPointModel.findOne({id: input.id, program_id: input.program_id}, null, {
            lean: true
        });
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
        })
    },

    getCustomers: async ({input}, request) => {
        let {sort, reverse, limit, program_id, skip} = input;
        let option = {lean: true, sort : { _id: 1}};
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

    createRedeemPoint: async ({input}, request) => {
        return RedeemPointModel.create({
            ...input,
            status: true,
        }, null);
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
            const {id, program_id, key, name, link, sub_key, reward_points, status} = input;
            return EarnPointModel.findOneAndUpdate({
                id: id,
                program_id: program_id,
                key: key
            }, {
                sub_key: sub_key ?? undefined,
                name: name,
                link: link ?? undefined,
                reward_points: reward_points,
                status: status,
            }, {
                returnDocument: "after",
                new: true,
                lean: true,
            })
        },

    getVipProgram:
        async ({input}, request) => {
            return VipProgramModel.findOne({id: input.id}, null, {
                lean: true
            });
        },

    getVipTier:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.id}, null, {
                lean: true
            });

            if (vipProgram) {
                return vipProgram.tier;
            } else {
                return null;
            }
        },

    getVipTiers:
        async ({input}, request) => {
            const vipProgram = await VipProgramModel.findOne({id: input.program_id}, null, {
                lean: true
            });

            if (vipProgram) {
                return vipProgram.tier.find((value) => value === input.index);
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
            return RedeemPointModel.find({program_id: input.program_id, status: true}, null, {
                lean: true
            })
        },


}
