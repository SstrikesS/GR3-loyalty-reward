import {json} from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import {
    Card, InlineGrid,
} from "@shopify/polaris";

import {authenticate} from "../shopify.server";
import PointModel from "../models/pointProgram.model";
import EarnPointModel from "../models/earnPoint.model";
import {de_customer, de_earnPoint, de_pointProgram, de_vipProgram} from "../constants/default_new_store_config";
import {ulid} from "ulid";
import VipProgramModel from "../models/vipProgram.model";
import {startOfToday} from "date-fns";
import CustomerModel from "../models/customer.model";

export const loader = async ({request}) => {
    const {admin} = await authenticate.admin(request);
    const response = await admin.graphql(`
        #graphql
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
    const responseJson = await response.json();
    const store_id = responseJson.data.shop.id.split('gid://shopify/Shop/')[1];
    const isExist = await PointModel.exists({id: store_id}).lean();
    if (!isExist) {
        const earn_point_default = de_earnPoint.map((item, index) => {
            return {id: ulid(), program_id: store_id, ...item}
        });
        await PointModel.create({
            id: store_id,
            ...de_pointProgram
        });
        await VipProgramModel.create({
            id: store_id,
            milestone_start: startOfToday().toISOString(),
            ...de_vipProgram
        });
        await EarnPointModel.insertMany(earn_point_default);

        let isNext = true;
        let node = ''
        do {
            let response;
            if(node && node.length > 0) {
                response = await admin.graphql(`
                #query
                query MyQuery {
                    customers(first: 10, after: "${node}") {
                        edges {
                          node {
                            id
                          }
                        }
                        pageInfo {
                          endCursor
                          hasNextPage
                        }
                      }
                    }
            `);
            } else {
                response = await admin.graphql(`
                #query
                query MyQuery {
                    customers(first: 10) {
                        edges {
                          node {
                            id
                          }
                        }
                        pageInfo {
                          endCursor
                          hasNextPage
                        }
                      }
                    }
            `);
            }
            const responseJson = await response.json();
            if(!responseJson.data.customers.pageInfo.hasNextPage) {
                isNext = false;
            } else {
                node = responseJson.data.customers.pageInfo.endCursor;
            }
            const customerData = responseJson.data.customers.edges.map((item) => {
                return {id: item.node.id.split('gid://shopify/Customer/')[1], program_id: store_id, ...de_customer}
            })

            await CustomerModel.insertMany(customerData)
        } while (isNext)
    }

    return json({shop: responseJson.data.shop});
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
