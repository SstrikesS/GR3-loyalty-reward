import {json} from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import {
    Card, InlineGrid,
} from "@shopify/polaris";

import {authenticate} from "../shopify.server";
import axios from "axios";
import PointModel from "../models/point.model";
import EarnPointModel from "../models/earnPoint.model";
import {forEach} from "lodash";

export const loader = async ({request}) => {
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

    const StoreID = await PointModel.exists({id: store.id});
    if (!StoreID) {
        const earn_point_default = [
            {
                id: store.id,
                key: 'Order',
                icon: 'https://cdn-icons-png.flaticon.com/32/2435/2435281.png',
                type: 0,
                name: 'Complete an order',
                reward_points: 100,
                requirement: null,
                limit: 0,
                status: true,
            },
            {
                id: store.id,
                key: 'FB_Share',
                icon: 'https://cdn-icons-png.flaticon.com/32/1051/1051360.png',
                name: 'Share on Facebook',
                link: 'https://',
                reward_points: 100,
                requirement: null,
                limit: 0,
                status: false,
            },
            {
                id: store.id,
                key: 'DoB',
                icon: 'https://cdn-icons-png.flaticon.com/32/6479/6479517.png',
                name: 'Happy Birthday',
                reward_points: 100,
                requirement: null,
                limit: 0,
                status: false,
            },
            {
                id: store.id,
                key: 'SignIn',
                icon: 'https://cdn-icons-png.flaticon.com/32/10479/10479877.png',
                name: 'Sign In',
                reward_points: 100,
                requirement: null,
                limit: 0,
                status: false,
            }
        ];
        await PointModel.create({
            id: store.id,
            point_currency: {
                singular: 'point',
                plural: 'points',
            },
            status: true,
        })
        forEach(earn_point_default, async (value) => {
            await EarnPointModel.create(value)
        })
    }

    return json({shop: store});
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
    const {shop} = useLoaderData();
    //
    // useEffect(() => {
    //     window.storeData = shop;
    // }, [shop])


    return (
        <Card>
            <InlineGrid gap="400" columns={3}>
                <Placeholder height="320px"/>
                <Placeholder height="320px"/>
                <Placeholder height="320px"/>
            </InlineGrid>
        </Card>
    );
}
