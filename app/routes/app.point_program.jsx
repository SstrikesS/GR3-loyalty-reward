import {
    Badge,
    BlockStack,
    Card,
    Divider,
    DataTable,
    Layout,
    Page,
    Text,
    Link, Spinner
} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {useQuery} from "@apollo/client";
import {GET_EARN_POINTS, GET_POINT_PROGRAM} from "../graphql/query";
import axios from "axios";

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
        session: session,
        shop: store,
    })
}

export default function PointProgram() {
    const {session, shop} = useLoaderData();

    const {data: PointProgram, loading: PointProgramLoading} = useQuery(GET_POINT_PROGRAM, {
        variables: {
            input: {
                id: `${shop.id}`
            }
        }
    });

    const {data: EarnPointProgram, loading: EarnPointProgramLoading} = useQuery(GET_EARN_POINTS, {
        variables: {
            input: {
                id: `${shop.id}`
            }
        }
    });

    if (PointProgramLoading || EarnPointProgramLoading) {
        return (
            <Page>
                <Spinner/>
            </Page>
        );
    } else {
        console.log(EarnPointProgram.getEarnPoints);
    }

    let EPointData = EarnPointProgram.getEarnPoints.map((value) => {
        return [
            <Link
                removeUnderline
                url={`../earn/${value.key}`}
            >{value.name}</Link>,
            value.reward_points,
            value.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>
        ];
    })

    return (
        <Page
            title="Points"
            backAction={{content: "Programs", url: "../programs"}}
            titleMetadata={<Badge tone="success">Active</Badge>}
            // primaryAction={{content: 'Save'}}
        >
            <BlockStack gap="600">
                <Divider borderColor="border-inverse"/>
                <Layout>
                    <Layout.Section variant="oneThird">
                        <BlockStack gap="300">
                            <Text variant="headingMd" as="h6">
                                Earn Points
                            </Text>
                            <p>Set up how your customers can earn points when they interact with your brand</p>
                            {/*<div>*/}
                            {/*    <Button size="medium">Add new ways</Button>*/}
                            {/*</div>*/}
                        </BlockStack>
                    </Layout.Section>
                    <Layout.Section>
                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h6">
                                WAY TO EARN
                            </Text>
                            <Divider borderColor="border"/>
                            <Card>
                                <DataTable
                                    columnContentTypes={[
                                        'text',
                                        'numeric',
                                        'text',
                                    ]}
                                    headings={[
                                        'Program Name',
                                        'Points',
                                        'Status',
                                    ]}
                                    rows={EPointData}
                                    pagination={{
                                        hasNext: true,
                                        onNext: () => {
                                        },
                                    }}
                                >
                                </DataTable>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}
