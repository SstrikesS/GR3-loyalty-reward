import {cors} from 'remix-utils/cors'
import {authenticate} from "../shopify.server";
import {parseISO} from "date-fns";

export async function loader({request}) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('logged_in_customer_id');

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
    const today = new Date().valueOf();
    const activeDiscounts = metafields.filter((item) => {
        const endsAt = item.expiry_at ? parseISO(item.expiry_at).valueOf() : 0;
        return (endsAt > today || endsAt === 0) && item.used === false
    })

    return await cors(request, activeDiscounts);
}

