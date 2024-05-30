import client from "../graphql/client";
import {GET_CUSTOMERS} from "../graphql/query";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";

export async function ApiGetCustomers(request, data = null) {
    const {admin} = await authenticate.admin(request);
    // let sort = 'name';
    // let reverse = false;
    // let limit = 2;
    // let page = 1;
    // let program_id = '';
    //
    // if (!data) {
    //     const body = await request.json();
    //     sort = body.sort ? body.sort : 'name';
    //     reverse = body.reverse ? body.reverse : false;
    //     limit = body.limit ? parseInt(body.limit) : 2;
    //     page = body.page ? parseInt(body.page) : 1;
    //     program_id = body.program_id;
    // } else {
    //     sort = data.sort ? data.sort : 'name';
    //     reverse = data.reverse ? data.reverse : false;
    //     limit = data.limit ? data.limit : 2;
    //     page = data.page ? data.page : 1;
    //     program_id = data.program_id
    // }
    // if (page < 1) {
    //     page = 1;
    // }
    // if (limit < 1) {
    //     limit = 1;
    // }

    const response = await client.query({
        query: GET_CUSTOMERS,
        variables: {
            input: {
                program_id: program_id,
                sort: sort,
                reverse: reverse,
                limit: limit,
                skip: limit * (page - 1)
            }
        }
    });

    const responseJson = response.data.getCustomers;

    const query = responseJson.customers.map(customer => `id:${customer.id}`).join(' OR ')

    const shopifyData = await admin.graphql(`
        #query
        query MyQuery {
             customers(first: ${limit}, query: "${query}") {
                edges {
                  node {
                    id
                    email
                    displayName
                    lastName
                    firstName
                    image {
                      url
                      src
                      altText
                    }
                  }
                }
              }
        }
    `)

    const shopifyDataJson = await shopifyData.json();
    const shopifyMap = new Map(shopifyDataJson.data.customers.edges.map(item => [item.node.id, item.node]));
    const customerData = responseJson.customers.map(item1 => {
        const item2 = shopifyMap.get(`gid://shopify/Customer/${item1.id}`);
        return item2 ? {...item1, ...item2} : item1;
    });

    return json({
        customers: customerData,
        pageInfo: responseJson.pageInfo,
    });
}
