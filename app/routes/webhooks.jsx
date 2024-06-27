import {authenticate} from "../shopify.server";
import db from "../db.server";
import {customerCreate, orderPaid, productUpdate} from "../utils/EventTriggerHandler";
import {escapeJsonString} from "../components/helper/helper";

export const action = async ({request}) => {
    const {topic, shop, payload, session, admin} = await authenticate.webhook(request);

    const shopResponse = await admin.graphql(`
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


    switch (topic) {
        case "APP_UNINSTALLED":
            if (session) {
                await db.session.deleteMany({where: {shop}});
            }
            break;
        case "ORDERS_PAID":
            console.log("Webhook ORDERS_PAID triggers");
            if (session) {
                const shopifyCustomer = await admin.graphql(`
                #graphql
                query MyQuery {
                  customer(id: "gid://shopify/Customer/${payload.customer.id}") {
                    metafield(key: "reward", namespace: "customer.reward") {
                      value
                    }
                  }
                }
                `);
                const shopifyCustomerJson = await shopifyCustomer.json();
                let metafields = JSON.parse(shopifyCustomerJson.data.customer.metafield.value);
                if (payload.discount_codes.length > 0) {
                    for (const value of payload.discount_codes) {
                        const response = await admin.graphql(
                            `#graphql
                        query MyQuery {
                          codeDiscountNodeByCode(code: "${value.code}") {
                            id
                            codeDiscount {
                              ... on DiscountCodeBasic {
                                endsAt
                                title
                                customerGets {
                                  value {
                                    ... on DiscountAmount {
                                      __typename
                                      amount {
                                        amount
                                        currencyCode
                                      }
                                    }
                                    ... on DiscountPercentage {
                                      __typename
                                      percentage
                                    }
                                  }
                                }
                                status
                              }
                            }
                          }
                        }
                        `);

                        const responseJson = await response.json();
                        const reward_id = responseJson.data.codeDiscountNodeByCode.id;

                        let metafield = metafields.find(item => item.reward_id === reward_id);
                        if(metafield) {
                            metafield.used = true;
                        }
                    };
                    await admin.graphql(`
                    #graphql
                        mutation MyMutation {
                          metafieldsSet(
                            metafields: {
                                ownerId: "gid://shopify/Customer/${payload.customer.id}",
                                key: "reward",
                                namespace: "customer.reward",
                                type: "single_line_text_field",
                                value: "${escapeJsonString(JSON.stringify(metafields))}"
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
                }

                await orderPaid(payload, shopResponseJson);
            }
            break;
        case "PRODUCTS_UPDATE":
            console.log("Webhook PRODUCTS_UPDATE triggers!!");
            if (session) {
                await productUpdate(payload, admin);
            }
            break;
        case "CUSTOMERS_CREATE":
            console.log("Webhooks CUSTOMER_CREATE triggers!!");
            if (session) {
                await customerCreate(payload, admin);
            }
            break;
        case "CUSTOMERS_DATA_REQUEST":
        case "CUSTOMERS_REDACT":
        case "SHOP_REDACT":
        default:
            throw new Response("Unhandled webhook topic", {status: 404});
    }

    throw new Response();
};
