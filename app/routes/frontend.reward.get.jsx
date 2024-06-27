import {authenticate} from "../shopify.server";
import {cors} from 'remix-utils/cors'

export async function loader({request}) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('logged_in_customer_id');
    const reward_id = url.searchParams.get('reward_id');
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
    const metafields = JSON.parse(shopifyCustomerJson.data.customer.metafield.value);

    const metafield = metafields.find((metafield) => metafield.reward_id === `gid://shopify/DiscountCodeNode/${reward_id}`);

    return await cors(request, metafield);
}
