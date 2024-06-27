import { cors } from 'remix-utils/cors'
import client from "../graphql/client";
import {SHOP_GET_VIP_PROGRAM} from "../graphql/query";
import {authenticate} from "../shopify.server";
export async function loader({request}) {

    const {admin} = await authenticate.public.appProxy(request);
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
        query: SHOP_GET_VIP_PROGRAM,
        variables: {
            input: {
                id: shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1],
            }
        },
        fetchPolicy: 'no-cache',
    });

    return await cors(request, response.data.shopGetVipProgram);
}

