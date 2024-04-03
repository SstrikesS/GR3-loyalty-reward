import {
    Badge,
    BlockStack,
    Card,
    Divider,
    DataTable,
    Layout,
    Page,
    Text,
    Link, Spinner, Button
} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {useQuery} from "@apollo/client";
import {GET_EARN_POINTS} from "../graphql/query";

export async function loader({request}) {
    const {session} = await authenticate.admin(request);

    return json({
        session: session,
    })
}

export default function PointProgram() {
    const {session} = useLoaderData();

    const {data: EPoint, loading: EPointLoading} = useQuery(GET_EARN_POINTS);

    if (EPointLoading) {
        return (
            <Page>
                <Spinner/>
            </Page>
        );
    }
    let EPointData = EPoint.getEarnPoints.map((value) => {
        return [
            <Link
                removeUnderline
                url={`../earn/${value.id}`}
            >{value.name}</Link>,
            10,
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
                            <div>
                                <Button size="medium">Add new ways</Button>
                            </div>
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
