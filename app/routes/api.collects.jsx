import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";

export async function loader({request}) {
    const { admin} = await authenticate.admin(request);
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const cursor = url.searchParams.get("cursor");

    const response = await admin.graphql(`
        #graphql
            query MyQuery {
              collections(first: ${Number.parseInt(limit)}, after: "${cursor}") {
                edges {
                  node {
                    id
                    title
                  }
                  cursor
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
        `);
    const responseJson = await response.json();


    return json({
        collections: responseJson.data.collections,
    });
}
