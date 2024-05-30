import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";

export async function GetShopifyCustomers(request) {
    const {admin} = await authenticate.admin(request);
    const body = await request.json();
    let query = '';
    if(body.endCursor) {
        query = `
        #query
        query MyQuery {
            customers(sortKey: ${body.sort}, reverse: ${body.reverse}, first: 2, after: "${body.endCursor}" ) {
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
                pageInfo {
                  endCursor
                  hasNextPage
                  hasPreviousPage
                  startCursor
                }
              }
        }`
    } else if(body.startCursor) {
        query = `
        #query
        query MyQuery {
            customers(sortKey: ${body.sort}, reverse: ${body.reverse}, last: 2, before: "${body.startCursor}" ) {
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
                pageInfo {
                  endCursor
                  hasNextPage
                  hasPreviousPage
                  startCursor
                }
              }
        }`
    } else {
        query = `
        #query
        query MyQuery {
            customers(sortKey: ${body.sort}, reverse: ${body.reverse}, first: 2) {
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
                pageInfo {
                  endCursor
                  hasNextPage
                  hasPreviousPage
                  startCursor
                }
              }
        }`
    }

    const response = await admin.graphql(query);

    const responseJson = await response.json();
    return json({
        customerData: responseJson.data.customers.edges,
        pageInfo: responseJson.data.customers.pageInfo,
    })
}

export async function loader({request}) {
    const result = await GetShopifyCustomers(request);
    return json(result);
}
