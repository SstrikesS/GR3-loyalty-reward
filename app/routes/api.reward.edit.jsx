import client from "../graphql/client";
import {UPDATE_REDEEM_POINT} from "../graphql/mutation";
import {json} from "@remix-run/node";

export async function UpdateRedeemPoint(request) {
    const body = await request.json();
    try {
        const response = await client.mutate({
            mutation: UPDATE_REDEEM_POINT,
            variables: {
                input: {
                    program_id: body.program_id,
                    id: body.id,
                    title: body.title,
                    pointsCost: body.pointsCost,
                    discountValue: body.discountValue,
                    isSetShippingRates: body.key === "free_shipping" ? body.isSetShippingRates : undefined,
                    programApply: body.programApply,
                    collections: body.collections,
                    prefixCode: !body.isAddPrefixCode || body.prefixCode === "" ? undefined : body.prefixCode,
                    combination: {
                        order: body.combination.order,
                        product: body.combination.product,
                        shipping: body.combination.shipping,
                    },
                    minimumRequire: body.isSetMinimumRequirement === 'no_required' ? undefined : body.minimumRequire,
                    minimumRequireType: body.isSetMinimumRequirement,
                    start_at: body.expiryDate.start,
                    expire_at: body.isRewardExpiry === 'set_expired' ? body.expiryDate.end : body.expiryDate.start,
                    status: body.status === "active"
                }
            }
        })
        if (response.data.updateRedeemPoint) {

            return json({
                action: 'success'
            })
        } else {
            return json({
                action: 'failed',
                error: 'MongoDB error'
            });
        }
    } catch (error) {
        console.error(error);

        return json({
            action: 'failed',
            error: error
        });
    }
}

export async function action({request}) {
    const result = await UpdateRedeemPoint(request);
    return json(result);
}
