import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import client from "../graphql/client";
import {GET_CUSTOMER} from "../graphql/query";
import {UPDATE_CUSTOMER} from "../graphql/mutation";
import {customerDoBUpdate} from "../utils/EventTriggerHandler";

export async function action({request}) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const dob = url.searchParams.get('dob');
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

    const customerData = await client.query({
        query: GET_CUSTOMER,
        variables: {
            input: {
                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                id: customer_id,
            }
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    });

    if(customerData.data.getCustomer) {
        const updateData = await client.mutate({
            mutation: UPDATE_CUSTOMER,
            variables: {
                input: {
                    program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                    id: customer_id,
                    date_of_birth: dob,
                }
            }
        });

        if(updateData.data.updateCustomer) {
            customerDoBUpdate({
                customer_id: customer_id,
                dob: dob,
                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1]
            }).then()
            return json({
                success: true,
                date_of_birth: dob,
            })
        } else {
            return json({
                success: false,
                message: 'Error: Update Failed'
            })
        }
    }


    return json({
        success: false,
        message: 'Error: Invalid Customer ID'
    })
}
