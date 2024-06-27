import { cors } from 'remix-utils/cors'
import client from "../graphql/client";
import {SHOP_GET_CUSTOMER} from "../graphql/query";
import {authenticate} from "../shopify.server";
export async function loader({request}) {

    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
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

    const response = await client.query({
        query: SHOP_GET_CUSTOMER,
        variables: {
            input: {
                program_id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                id: customer_id,
            }
        },
        fetchPolicy: 'no-cache',
    });

    const shopifyData = await admin.graphql(`
        #graphql
        query MyQuery {
          customer(id: "gid://shopify/Customer/${customer_id}") {
            email
            displayName
            firstName
            lastName
            state
            image {
              altText
              url
              src
            }
          }
        }
    `);
    const shopifyDataJson = await shopifyData.json();
    const customerData = {...response.data.shopGetCustomer, ...shopifyDataJson.data.customer}

    return await cors(request, customerData);
}

