import {
    Badge,
    BlockStack,
    Card,
    Divider,
    Layout,
    Button,
    Page,
    Text,
    ResourceList,
    ResourceItem,
    Icon,
    Modal,
    EmptyState,
    InlineStack,
    TextField,
    RadioButton,
    Select,
    ContextualSaveBar,
    Frame
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
import {useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {GET_EARN_POINTS, GET_POINT_PROGRAM, GET_REDEEM_POINTS} from "../graphql/query";
import {useCallback, useEffect, useState} from "react";
import client from "../graphql/client";
import {isStringInteger} from "../components/helper/helper";
import {UPDATE_POINT_PROGRAM} from "../graphql/mutation";

export async function loader({request}) {
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

    try {
        const [pointProgramResponse, earnPointsResponse, redeemPointsResponse] = await Promise.all([
            client.query({
                query: GET_POINT_PROGRAM,
                variables: {input: {id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}},
                fetchPolicy: 'no-cache',
            }),
            client.query({
                query: GET_EARN_POINTS,
                variables: {input: {program_id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}},
                fetchPolicy: 'no-cache',
            }),
            client.query({
                query: GET_REDEEM_POINTS,
                variables: {input: {program_id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}},
                fetchPolicy: 'no-cache',
            }),
        ]);

        const dataResponse = {
            pointProgram: pointProgramResponse.data.getPointProgram,
            earnPointProgram: earnPointsResponse.data.getEarnPoints,
            redeemPointProgram: redeemPointsResponse.data.getRedeemPoints,
        }

        return json({
            shop: responseJson.data.shop,
            data: dataResponse,
        })

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export async function action({request}) {
    const body = await request.json();

    try {
        const response = await client.mutate({
            mutation: UPDATE_POINT_PROGRAM,
            variables: {
                input: body,
            }
        });
        if (response.data.updatePointProgram) {

            return json({
                action: 'success'
            })
        } else {
            return json({
                action: 'failed',
                error: 'MongoDB error'
            });
        }
    } catch (error) {
        console.error(error);

        return json({
            action: 'failed',
            error: error
        });
    }

}

export default function PointProgram() {
    const {data, shop} = useLoaderData();
    const [isShowModal, setIsShowModal] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData();
    const [currency, setCurrency] = useState(data.pointProgram.point_currency ? {
        plural: data.pointProgram.point_currency.plural,
        singular: data.pointProgram.point_currency.singular,
    } : {
        plural: 'Points',
        singular: 'Point',
    })
    const [currencyError, setCurrencyError] = useState({
        plural: null,
        singular: null
    });
    const [expiryStatus, setExpiryStatus] = useState(data.pointProgram.point_expiry.status ? 'active' : 'disable')
    const [programStatus, setProgramStatus] = useState(data.pointProgram.status ? 'program-active' : 'program-disable');
    const [periodUnit, setPeriodUnit] = useState(data.pointProgram.point_expiry.period_unit ?? 'month');
    const [periodTime, setPeriodTime] = useState(data.pointProgram.point_expiry.period_time ? `${data.pointProgram.point_expiry.period_time}` : "1");
    const [periodTimeError, setPeriodTimeError] = useState(null);


    const currencyChangeHandler = useCallback((newValue, _id) => {
        setCurrency((prevState) => ({
            ...prevState,
            [_id]: newValue
        }));
        setIsDataChange(true);
    }, []);

    const expiryChangeHandler = useCallback((_, newValue) => {
        setExpiryStatus(newValue);
        setIsDataChange(true);
    }, [],);

    const periodTimeChangeHandler = useCallback((value) => {
        setPeriodTime(value);
        setIsDataChange(true)
    }, [],);

    const programStatusHandler = useCallback((_, newValue) => {
        setProgramStatus(newValue);
        setIsDataChange(true);
    }, [],);

    const periodUnitOptions = [
        {label: 'day(s)', value: 'day'},
        {label: 'week(s)', value: 'week'},
        {label: 'month(s)', value: 'month'},
        {label: 'year(s)', value: 'year'},
    ];

    const handlePeriodUnitSelectChange = useCallback((value) => {
            setPeriodUnit(value)
            setIsDataChange(true);
        },
        [],
    );

    useEffect(() => {
        const errors = {
            plural: currency.plural.length === 0 ? 'Plural cannot be empty' : null,
            singular: currency.singular.length === 0 ? 'Singular cannot be empty' : null
        };

        setCurrencyError(errors);
    }, [currency]);

    useEffect(() => {
        if (expiryStatus === "active") {
            if (!isStringInteger(periodTime)) {
                setPeriodTimeError("Time must be a number")
            } else {
                setPeriodTimeError(null);
            }
        }
    }, [periodTime]);

    useEffect(() => {
        if (actionData) {
            if (actionData.action === 'success') {
                shopify.toast.show('Updated successfully');
                setIsSubmitting(false);
            } else {
                shopify.toast.show('Failed to update');
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    let EPointData = data.earnPointProgram.map((value) => {
        return {
            id: value.key,
            url: `../program/point/earn/${value.id}`,
            reward_point: value.reward_points,
            status: value.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>,
            name: value.name,
            icon: value.icon,
        };
    });
    let RPointData = data.redeemPointProgram.map((value) => {
        return {
            id: value.key,
            url: `../reward/${value.id}?type=${value.key}`,
            reward_point: value.pointsCost,
            reward: value.discountValue,
            status: value.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>,
            title: value.title,
            icon: value.icon,
        };
    })

    const addRedeemPoints = () => {
        setIsShowModal(true);
    }
    const handleSubmit = async () => {
        const data = JSON.stringify({
            id: shop.id.split('gid://shopify/Shop/')[1],
            point_currency: currency,
            point_expiry: {
                status: expiryStatus === 'active',
                period_time: expiryStatus === 'active' ? parseInt(periodTime) : undefined,
                period_unit: expiryStatus === 'active' ? periodUnit : undefined,
                reactivation_email_time: expiryStatus === 'active' ? 30 : undefined,
                last_chance_email_time: expiryStatus === 'active' ? 1 : undefined,
            },
            status: programStatus === 'program-active',
        });

        submit(data, {replace: true, method: 'PUT', encType: "application/json"});
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
        <div style={{
            marginBottom: "20px"
        }}>
            <Frame>
                <ContextualSaveBar
                    message="Unsaved changes"
                    saveAction={{
                        onAction: () => {
                            setIsSubmitting(true);
                            handleSubmit().then(() => {
                            })
                        },
                        loading: isSubmitting,
                        disabled: !isDataChange,
                    }}
                    discardAction={{
                        onAction: () => {
                            navigate("../programs");
                        },
                    }}
                ></ContextualSaveBar>
                <div style={{marginTop: "55px"}}>
                    <Page
                        title="Points"
                        backAction={{content: "Programs", url: "../programs"}}
                        titleMetadata={programStatus === 'program-active' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <BlockStack gap="600">
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            Earn Points
                                        </Text>
                                        <p>Set up how your customers can earn points when they interact with your
                                            brand</p>
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
                                                                          <InlineStack gap="400" wrap={false}>
                                                                              <div style={{
                                                                                  width: '80%'
                                                                              }}>{reward_point} points
                                                                              </div>
                                                                              <div style={{
                                                                                  float: "right",
                                                                                  width: '20%'
                                                                              }}>{status}</div>
                                                                          </InlineStack>
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
                                                        url: '../reward/new?type=amount_discount',
                                                        name: 'Amount discount',
                                                        icon: CashDollarIcon,
                                                    },
                                                    {
                                                        id: '2',
                                                        url: '../reward/new?type=percentage_off',
                                                        name: 'Percentage off',
                                                        icon: DiscountIcon,
                                                    },
                                                    {
                                                        id: '3',
                                                        url: '../reward/new?type=free_shipping',
                                                        name: 'Free Shipping',
                                                        icon: DeliveryIcon,
                                                    },
                                                    {
                                                        id: '4',
                                                        url: '../reward/new?type=free_product',
                                                        name: 'Free Product',
                                                        icon: ProductIcon,
                                                    },
                                                    {
                                                        id: '5',
                                                        url: '../reward/new?type=gift_card',
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
                                                                          <Text variant="bodyMd" fontWeight="bold"
                                                                                as="h3">
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
                                            {RPointData.length > 0 ? (
                                                <ResourceList
                                                    items={RPointData}
                                                    renderItem={(item) => {
                                                        const {
                                                            id,
                                                            url,
                                                            icon,
                                                            title,
                                                            reward,
                                                            reward_point,
                                                            status
                                                        } = item;
                                                        const media = <img
                                                            src={icon}
                                                            alt=""/>
                                                        // const media = <Icon source={DiscountIcon}/>

                                                        return (
                                                            <ResourceItem
                                                                id={id}
                                                                url={url}
                                                                media={media}
                                                                accessibilityLabel={`View details for ${title}`}
                                                            >
                                                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                    {title}
                                                                </Text>
                                                                <div>
                                                                    <InlineStack gap="400" wrap={false}>
                                                                        <div style={{
                                                                            width: '80%'
                                                                        }}>
                                                                            {reward_point} points exchange for {
                                                                            id === 'amount_discount' ? `${reward}$ off` :
                                                                                id === 'percentage_off' ? `${reward}% off` :
                                                                                    id === 'free_shipping' ? 'Free Shipping' :
                                                                                        null
                                                                        }
                                                                        </div>
                                                                        <div style={{
                                                                            float: "right",
                                                                            width: '20%'
                                                                        }}>{status}</div>
                                                                    </InlineStack>
                                                                </div>
                                                            </ResourceItem>
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <ResourceList
                                                    emptyState={emptyStateMarkup}
                                                    items={RPointData}
                                                    renderItem={() => <></>}
                                                    resourceName={{singular: 'program', plural: 'programs'}}
                                                >
                                                </ResourceList>
                                            )}
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <Text variant="headingMd" as="h6">
                                        Point Currency
                                    </Text>
                                    <p>Name your points currency to match your brand</p>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="500">
                                        <Card>
                                            <TextField
                                                label="Plural"
                                                id="plural"
                                                placeholder="Example: Points"
                                                autoComplete="off"
                                                value={currency.plural}
                                                onChange={currencyChangeHandler}
                                                error={currencyError.plural}
                                            >
                                            </TextField>
                                            <TextField
                                                label="Singular"
                                                id="singular"
                                                placeholder="Example: Point"
                                                autoComplete="off"
                                                value={currency.singular}
                                                onChange={currencyChangeHandler}
                                                error={currencyError.singular}
                                            >
                                            </TextField>
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <Text variant="headingMd" as="h6">
                                        Point Expiry
                                    </Text>
                                    <p>Set an expiry for your points program. Member will lose their balance if they
                                        have not
                                        earned or spent points in one period of time</p>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="500">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Status
                                                </Text>
                                                <RadioButton
                                                    label="Active"
                                                    id="active"
                                                    onChange={expiryChangeHandler}
                                                    checked={expiryStatus === 'active'}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="disable"
                                                    onChange={expiryChangeHandler}
                                                    checked={expiryStatus === 'disable'}
                                                >
                                                </RadioButton>
                                            </BlockStack>
                                        </Card>
                                        {expiryStatus === 'active' ?
                                            <div>
                                                <BlockStack gap="500">
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <InlineStack gap="400" wrap={false}>
                                                                <div style={{
                                                                    width: '80%'
                                                                }}>
                                                                    <TextField
                                                                        label="Expiration period"
                                                                        autoComplete="off"
                                                                        value={periodTime}
                                                                        onChange={periodTimeChangeHandler}
                                                                        type="number"
                                                                        error={periodTimeError}
                                                                    >
                                                                    </TextField>
                                                                </div>
                                                                <div style={{
                                                                    width: '20%'
                                                                }}>
                                                                    <Select
                                                                        label="Unit"
                                                                        options={periodUnitOptions}
                                                                        onChange={handlePeriodUnitSelectChange}
                                                                        value={periodUnit}
                                                                    >
                                                                    </Select>
                                                                </div>
                                                            </InlineStack>
                                                        </BlockStack>

                                                    </Card>
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <Text as="h6" variant="headingMd">
                                                                Reactivation Email
                                                            </Text>
                                                            <p>Reactivation emails are your members' first reminder that
                                                                their points will be expiring soon.</p>
                                                        </BlockStack>
                                                    </Card>
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <Text as="h6" variant="headingMd">
                                                                Last Chance Email
                                                            </Text>
                                                            <p>Last chance emails give your members a final reminder
                                                                that the points they've earned are about to expire</p>
                                                        </BlockStack>
                                                    </Card>
                                                </BlockStack>
                                            </div>
                                            :
                                            null}
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            Program Status
                                        </Text>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Status
                                                </Text>
                                                <RadioButton
                                                    label="Active"
                                                    id="program-active"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'program-active'}
                                                ></RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="program-disable"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'program-disable'}
                                                ></RadioButton>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                        </BlockStack>
                    </Page>
                </div>
            </Frame>
        </div>
    );
}
