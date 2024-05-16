import {authenticate} from "../shopify.server";
import axios from "axios";
import {json} from "@remix-run/node";

export async function loader({request}) {
    const {session} = await authenticate.admin(request);

    let store = await axios.get(
        `https://${session.shop}/admin/api/2024-04/shop.json`,
        {
            headers: {
                "X-Shopify-Access-Token": session.accessToken,
                "Accept-Encoding": "application/json",
            },
        }
    );

    store = store.data.shop;
    return json({
        shop: store,
    })
}
