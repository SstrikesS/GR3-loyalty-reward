import {authenticate} from "../shopify.server";
import client from "../graphql/client";
import {GET_CUSTOMER, GET_REDEEM_POINT} from "../graphql/query";
import {escapeJsonString, generateRandomString} from "../components/helper/helper";
import {customerRedeemCode} from "../utils/EventTriggerHandler";
import {json} from "@remix-run/node";
import {parseISO} from "date-fns";

export async function action({request}) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const redeem_program_id = url.searchParams.get('redeem_program_id');
    const customer_id = url.searchParams.get('logged_in_customer_id');
    const shopResponse = await admin.graphql(`
        #graphql
            query MyQuery {
              shop {
                id
                name
                url
                myshopifyDomain
                plan {
                  displayName
                  partnerDevelopment
                  shopifyPlus
                }
              }
            }
    `);
    const shopResponseJson = await shopResponse.json();

    const redeemProgram = await client.query({
        query: GET_REDEEM_POINT,
        variables: {
            input: {
                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                id: redeem_program_id,
            }
        }
    })

    const customerData = await client.query({
        query: GET_CUSTOMER,
        variables: {
            input: {
                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                id: customer_id,
            }
        }
    });

    if (redeemProgram.data.getRedeemPoint && customerData.data.getCustomer) {
        const redeemData = redeemProgram.data.getRedeemPoint
        const code = generateRandomString(12, redeemData.prefixCode ?? "")
        const collection = redeemData.programApply === 'specific_collections' ? redeemData.collections.map((value) => {
            return `"gid://shopify/Collection/${value}"`
        }) : undefined;

        if(parseInt(redeemData.pointsCost) > parseInt(customerData.data.getCustomer.points_balance))  {
            return json ({
                success: false,
                message: 'Error: Not enough points',
            })
        }

        if (redeemData.key === 'percentage_off' || redeemData.key === 'amount_discount') {
            const query = `
            mutation MyMutation {
              discountCodeBasicCreate(
                basicCodeDiscount: {
                    appliesOncePerCustomer: true,
                    code: "${code}",
                    combinesWith: {
                        shippingDiscounts: ${redeemData.combination.shipping},
                        productDiscounts: ${redeemData.combination.product},
                        orderDiscounts: ${redeemData.combination.order}
                    },
                    customerGets: {
                        appliesOnOneTimePurchase: true,
                        value: {
                        ${redeemData.key === 'amount_discount' ? `
                            discountAmount: {
                                amount: "${redeemData.discountValue}",
                                appliesOnEachItem: false
                            }
                        ` : `
                            percentage: ${parseFloat(redeemData.discountValue) / 100}
                        `}
                        },
                        items: {
                            all: ${redeemData.programApply === 'entire_order'},
                            ${collection ? `collections: { add: [${collection}]}` : ""}
                        }
                    },
                    customerSelection: {
                        all: false,
                        customers: {
                           add: "gid://shopify/Customer/${customer_id}",
                        }
                    },
                    ${redeemData.minimumRequireType === "no_required" ? "" :
                redeemData.minimumRequireType === "minimum_purchase" ? `
                            minimumRequirement: {
                                subtotal: {
                                    greaterThanOrEqualToSubtotal: "${redeemData.minimumRequire}"
                                }
                            },` : `
                            minimumRequirement: {
                                quantity: {
                                    greaterThanOrEqualToQuantity: "${redeemData.minimumRequire}"
                                }
                            },`}
                title: "${redeemData.title}",
                usageLimit: 1,
                startsAt: "${redeemData.start_at}",
                ${redeemData.expire_at ? parseISO(redeemData.expire_at).valueOf() !== parseISO(redeemData.start_at).valueOf() ?  `endsAt: "${redeemData.expire_at}"` : "" : ""}
              }) {
                codeDiscountNode {
                  codeDiscount {
                    ... on DiscountCodeBasic {
                      endsAt
                      appliesOncePerCustomer
                      asyncUsageCount
                      createdAt
                      discountClass
                      hasTimelineComment
                      codes(first: 1) {
                        nodes {
                          code
                        }
                      }
                      customerGets {
                        value {
                          ... on DiscountAmount {
                            __typename
                            amount {
                              amount
                            }
                          }
                          ... on DiscountPercentage {
                            __typename
                            percentage
                          }
                        }
                      }
                      minimumRequirement {
                        ... on DiscountMinimumSubtotal {
                          __typename
                          greaterThanOrEqualToSubtotal {
                            amount
                          }
                        }
                      }
                      shortSummary
                      startsAt
                      status
                      summary
                      title
                      updatedAt
                      usageLimit
                    }
                  }
                  id
                }
                userErrors {
                  code
                  extraInfo
                  field
                  message
                }
              }
            }
        `;
            const response = await admin.graphql(query);
            const responseJson = await response.json();
            if (responseJson.data.discountCodeBasicCreate.codeDiscountNode) {
                const shopifyCustomer = await admin.graphql(`
                #graphql
                query MyQuery {
                  customer(id: "gid://shopify/Customer/${customer_id}") {
                    metafield(key: "reward", namespace: "customer.reward") {
                      value
                    }
                  }
                }
                `);
                const shopifyCustomerJson = await shopifyCustomer.json();
                const metafield = JSON.parse(shopifyCustomerJson.data.customer.metafield.value);
                metafield.push({
                    reward_id: responseJson.data.discountCodeBasicCreate.codeDiscountNode.id,
                    reward_type: 'discount_code',
                    program_id: redeemProgram.data.getRedeemPoint.id,
                    title: responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.title,
                    code: code,
                    used: false,
                    type: responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.customerGets.value.__typename,
                    value: responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.customerGets.value.__typename === 'DiscountPercentage' ?
                        responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.customerGets.value.percentage :
                        responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.customerGets.value.__typename === 'DiscountAmount' ?
                            responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.customerGets.value.amount.amount : undefined,
                    expiry_at: responseJson.data.discountCodeBasicCreate.codeDiscountNode.codeDiscount.endsAt ?? undefined,
                });
                const updateMetafield = await admin.graphql(`
                #graphql
                    mutation MyMutation {
                      metafieldsSet(
                        metafields: {
                            ownerId: "gid://shopify/Customer/${customer_id}",
                            key: "reward",
                            namespace: "customer.reward",
                            type: "single_line_text_field",
                            value: "${escapeJsonString(JSON.stringify(metafield))}"
                        }
                      ) {
                        metafields {
                          id
                          value
                          key
                          namespace
                          updatedAt
                          createdAt
                        }
                      }
                    }
                `);
                const updateMetafieldJson = await updateMetafield.json();
                if (updateMetafieldJson.data.metafieldsSet?.metafields.length > 0) {

                    customerRedeemCode({
                        success: true,
                        reward_id: responseJson.data.discountCodeBasicCreate.codeDiscountNode.id,
                        customer_id: customer_id,
                        program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                        redeemProgram: redeemProgram.data.getRedeemPoint,
                    }).then((r) => {
                            console.log('Update success')
                    });

                    return json({
                        success: true,
                    })
                } else {

                    return json({
                        success: false,
                        message: 'Error: Update Metafield failed'
                    })
                }

            } else {
                return json({
                    success: false,
                    message: 'Error: Create discount code failed'
                });
            }
        } else if (redeemData.key === 'free_shipping') {


        }
    }

    return json({
        success: false,
        message: 'Error: Invalid Redeem Program'
    });
}
