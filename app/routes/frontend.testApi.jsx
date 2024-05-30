import { cors } from 'remix-utils/cors'
import {authenticate} from "../shopify.server";
import axios from "axios";
import client from "../graphql/client";
import {GET_REDEEM_POINTS} from "../graphql/query";
export async function loader({request}) {
    const data = {
        name: 'thanhnt',
        age: 23,
    };

    const {session} = await authenticate.public.appProxy(request);
    let store = await axios.get(
        `https://${session.shop}/admin/api/2024-04/shop.json`,
        {
            headers: {
                "X-Shopify-Access-Token": session.accessToken,
                "Accept-Encoding": "application/json",
            },
        }
    );

    const res = await client.query({
        query: GET_REDEEM_POINTS,
        variables: {
            input: {
                id: `${store.data.shop.id}`
            }
        }
    })
    store = store.data.shop
    const response = {res}

    return await cors(request,response);
}

