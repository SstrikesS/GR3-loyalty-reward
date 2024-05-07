import {
    Badge,
    BlockStack,
    Card,
    Divider,
    Layout,
    Button,
    Page,
    Text,
    Spinner, ResourceList, ResourceItem, Icon, Modal, InlineGrid, EmptyState
} from "@shopify/polaris";
import {
    DiscountIcon,
    CashDollarIcon,
    DeliveryIcon,
    ProductIcon,
    GiftCardIcon

} from '@shopify/polaris-icons';
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {useQuery} from "@apollo/client";
import {GET_EARN_POINTS, GET_POINT_PROGRAM, GET_REDEEM_POINTS} from "../graphql/query";
import axios from "axios";
import {useState} from "react";

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
    const {shop} = useLoaderData();

    const [isShowModal, setIsShowModal] = useState(false);

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

    const {data: RedeemPointProgram, loading: RedeemPointProgramLoading} = useQuery(GET_REDEEM_POINTS, {
        variables: {
            input: {
                id: `${shop.id}`
            }
        }
    });

    if (PointProgramLoading || EarnPointProgramLoading || RedeemPointProgramLoading) {
        return (
            <Page>
                <Spinner/>
            </Page>
        );
    }

    let EPointData = EarnPointProgram.getEarnPoints.map((value) => {
        return {
            id: value.key,
            url: `../earn/${value.key}`,
            reward_point: value.reward_points,
            status: value.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>,
            name: value.name,
            icon: value.icon,
        };
    });
    let RPointData = RedeemPointProgram.getRedeemPoints.map((value) => {
        return [
            {
                id: value.key,
                url: `../new_reward/${value.key}`,
                reward_point: value.reward_points,
                status: value.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>,
                name: value.name,
                icon: value.icon,
            }
        ];
    })


    const addRedeemPoints = () => {
        setIsShowModal(true);
    }
    const activator = <Button size="medium" onClick={addRedeemPoints}>Add new ways</Button>;

    const emptyStateMarkup =
        <EmptyState
            heading="Create new way to get started"
            action={{
                content: 'Add new way',
                onAction: addRedeemPoints
            }}
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
        >
        </EmptyState>;

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
                                <ResourceList items={EPointData}
                                              renderItem={(item) => {
                                                  const {id, url, name, icon, reward_point, status} = item;
                                                  const media = <img
                                                      src={icon}
                                                      alt=""/>

                                                  return (
                                                      <ResourceItem
                                                          id={id}
                                                          url={url}
                                                          media={media}
                                                          accessibilityLabel={`View details for ${name}`}
                                                      >
                                                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                              {name}
                                                          </Text>
                                                          <div>
                                                              <InlineGrid gap="400" columns={5}>
                                                                  <div>{reward_point} points</div>
                                                                  <div></div>
                                                                  <div></div>
                                                                  <div></div>
                                                                  <div style={{float: "right"}}>{status}</div>
                                                              </InlineGrid>
                                                          </div>
                                                      </ResourceItem>
                                                  );
                                              }}
                                />
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
                <Divider borderColor="border-inverse"/>
                <Layout>
                    <Layout.Section variant="oneThird">
                        <BlockStack gap="300">
                            <Text variant="headingMd" as="h6">
                                Redeem Points
                            </Text>
                            <p>Set up how your customers can get rewards with points they've earned</p>
                            <div>
                                <Modal
                                    open={isShowModal}
                                    onClose={() => setIsShowModal(false)}
                                    activator={activator} title='Add new ways'
                                    secondaryActions={[
                                        {
                                            content: 'Cancel',
                                            onAction: () => setIsShowModal(false),
                                        },
                                    ]}
                                >
                                    <ResourceList items={[
                                        {
                                            id: '1',
                                            url: '../new_reward/amount_discount',
                                            name: 'Amount discount',
                                            icon: CashDollarIcon,
                                        },
                                        {
                                            id: '2',
                                            url: '../new_reward/percentage_off',
                                            name: 'Percentage off',
                                            icon: DiscountIcon,
                                        },
                                        {
                                            id: '3',
                                            url: '../new_reward/free_shipping',
                                            name: 'Free Shipping',
                                            icon: DeliveryIcon,
                                        },
                                        {
                                            id: '4',
                                            url: '../new_reward/free_product',
                                            name: 'Free Product',
                                            icon: ProductIcon,
                                        },
                                        {
                                            id: '5',
                                            url: '../new_reward/gift_card',
                                            name: 'Gift Card',
                                            icon: GiftCardIcon,
                                        },
                                    ]}
                                                  renderItem={(item) => {
                                                      const {id, url, name, icon} = item;
                                                      const media = <Icon source={icon} tone='base'/>

                                                      return (
                                                          <ResourceItem
                                                              id={id}
                                                              url={url}
                                                              media={media}
                                                              accessibilityLabel={`View details for ${name}`}
                                                          >
                                                              <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                  {name}
                                                              </Text>
                                                          </ResourceItem>
                                                      );
                                                  }}
                                    />
                                </Modal>
                            </div>
                        </BlockStack>
                    </Layout.Section>
                    <Layout.Section>
                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h6">
                                WAY TO REDEEM
                            </Text>
                            <Divider borderColor="border"/>
                            <Card>
                                {RPointData ? (
                                    <ResourceList
                                        emptyState={emptyStateMarkup}
                                        items={RPointData}
                                        renderItem={() => <></>}
                                        resourceName={{singular: 'program', plural: 'programs'}}
                                    >
                                    </ResourceList>
                                ) : (
                                    <ResourceList
                                        items={RPointData}
                                        renderItem={(item) => {
                                            const {id, url, name, icon, reward_point, status} = item;
                                            const media = <img
                                                src={icon}
                                                alt=""/>

                                            return (
                                                <ResourceItem
                                                    id={id}
                                                    url={url}
                                                    media={media}
                                                    accessibilityLabel={`View details for ${name}`}
                                                >
                                                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                        {name}
                                                    </Text>
                                                    <div>
                                                        <InlineGrid gap="400" columns={5}>
                                                            <div>{reward_point} points</div>
                                                            <div></div>
                                                            <div></div>
                                                            <div></div>
                                                            <div style={{float: "right"}}>{status}</div>
                                                        </InlineGrid>
                                                    </div>
                                                </ResourceItem>
                                            );
                                        }}
                                    />
                                )}


                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}
