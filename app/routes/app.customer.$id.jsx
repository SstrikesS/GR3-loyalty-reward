import {useLoaderData} from "@remix-run/react";
import {Page} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import client from "../graphql/client";
import {GET_CUSTOMER} from "../graphql/query";
import {json} from "@remix-run/node";

export async function loader({request, params}) {
    const {admin} = await authenticate.admin(request);
    const id = params.id
    const shopResponse = await admin.graphql(
        `#graphql
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
    const shop_id = shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1];

    const res = await client.query({
        query: GET_CUSTOMER,
        variables: {
            input: {
                program_id: shop_id,
                id: id,
            }
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    });

    const response = await admin.graphql(`
    #graphql
        query MyQuery {
          customer(id: "gid://shopify/Customer/${id}") {
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

    return json({
        shop_id: shop_id,
        customerData: res.data.getCustomer ?? null,
    })
}

export default function CustomerIndex() {
    const {customerData} = useLoaderData();
    if(customerData) {
        return (
            <Page
                title={`${customerData.name}`}
            >

            </Page>
        )
    } else {
        return (
            <Page>Error</Page>
        )
    }

}
