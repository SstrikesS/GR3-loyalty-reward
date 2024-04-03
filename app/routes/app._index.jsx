import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import {
    Card, InlineGrid,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import axios from "axios";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
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

    return json({ shop: store });
};

const Placeholder = ({height = 'auto', width = 'auto'}) => {
    return (
        <div
            style={{
                display: 'inherit',
                background: 'var(--p-color-text-info)',
                height: height ?? undefined,
                width: width ?? undefined,
            }}
        />
    );
};
export default function Index() {
    const { shop } = useLoaderData();

    useEffect(() => {
        window.storeData = shop;
    }, [shop])


    return (
        <Card>
            <InlineGrid gap="400" columns={3}>
                <Placeholder height="320px" />
                <Placeholder height="320px" />
                <Placeholder height="320px" />
            </InlineGrid>
        </Card>
    );
}
