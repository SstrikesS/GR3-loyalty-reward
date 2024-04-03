import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import {
    Form,
    FormLayout,
    TextField,
    Page,
    VerticalStack,
    Card,
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

export default function Index() {
    const { shop } = useLoaderData();

    useEffect(() => {
        window.storeData = shop;
    }, [shop])


    return (
        <Page title="Store information">
            <VerticalStack gap="5">
                <Card>
                    <Form>
                        <FormLayout>
                            <TextField
                                label="Shop id"
                                value={shop.id}
                                type="password"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop name"
                                value={shop.name}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop email"
                                value={shop.email}
                                type="email"
                                autoComplete="email"
                            />

                            <TextField
                                label="Shop domain"
                                value={shop.domain}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop scope"
                                value={shop.domain}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop country"
                                value={shop.domain}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop customer email"
                                value={shop.domain}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop my shopify domain"
                                value={shop.myshopify_domain}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop plan name"
                                value={shop.plan_name}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop plan display name"
                                value={shop.plan_display_name}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop shop owner"
                                value={shop.shop_owner}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop iana timezone"
                                value={shop.iana_timezone}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop currency"
                                value={shop.currency}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop address1"
                                value={shop.address1}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop address2"
                                value={shop.address2}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop phone"
                                value={shop.phone}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop created at"
                                value={shop.created_at}
                                type="text"
                                autoComplete="text"
                            />

                            <TextField
                                label="Shop access token"
                                value={shop.accessToken}
                                type="text"
                                autoComplete="text"
                            />
                        </FormLayout>
                    </Form>
                </Card>
            </VerticalStack>
        </Page>
    );
}
