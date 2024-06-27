import {
    Badge,
    BlockStack,
    Button,
    Card, ContextualSaveBar, DatePicker,
    Divider,
    EmptyState, Frame, Icon, InlineStack,
    Layout,
    Page, RadioButton,
    ResourceItem,
    ResourceList, Select,
    Text, TextField
} from "@shopify/polaris";
import {useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {authenticate} from "../shopify.server";
import client from "../graphql/client";
import {json} from "@remix-run/node";
import {GET_ALL_CUSTOMERS, GET_VIP_PROGRAM, GET_VIP_TIERS} from "../graphql/query";
import {useCallback, useEffect, useState} from "react";
import {parseISO, startOfToday} from "date-fns";
import {CalendarIcon} from "@shopify/polaris-icons";
import {isStringInteger} from "../components/helper/helper";
import {UPDATE_VIP_PROGRAM} from "../graphql/mutation";
import {VipProgramUpdateHandler} from "../utils/EventTriggerHandler";

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
        const [vipProgramResponse, vipTierResponse, customer] = await Promise.all([
            client.query({
                query: GET_VIP_PROGRAM,
                variables: {
                    input: {
                        id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                    }
                },
                fetchPolicy: 'no-cache'
            }),
            client.query({
                query: GET_VIP_TIERS,
                variables: {
                    input: {
                        program_id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                    }
                },
                fetchPolicy: 'no-cache'
            }),
            client.query({
                query: GET_ALL_CUSTOMERS,
                variables: {
                    input: {
                        program_id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1],
                    }
                }
            })
        ]);
        const dataResponse = {
            vipProgram: vipProgramResponse.data.getVipProgram,
            tier: vipTierResponse.data.getVipTiers,
        };


        return json({
            shop: responseJson.data.shop,
            dataResponse: dataResponse,
        })
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export async function action({request}) {
    const body = await request.json();
    try {
        const previous = await client.query({
            query: GET_VIP_PROGRAM,
            variables: {
                input: {
                    id: body.id,
                }
            }
        });

        const response = await client.mutate({
            mutation: UPDATE_VIP_PROGRAM,
            variables: {
                input: {
                    id: body.id,
                    milestone_type: body.milestone_type,
                    milestone_period_type: body.milestone_period_type,
                    milestone_period_value: body.milestone_period_value ?? undefined,
                    milestone_period_unit: body.milestone_period_unit ?? undefined,
                    status: body.status,
                    milestone_start: body.milestone_start,
                }
            }
        });
        if (response.data.updateVipProgram) {

            VipProgramUpdateHandler(previous.data.getVipProgram, response.data.updateVipProgram).then((r)=> console.log('Handle Vip Program finished successfully'))

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

export default function VipProgram() {
    const {dataResponse, shop} = useLoaderData();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData();
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [milestoneType, setMilestoneType] = useState(dataResponse.vipProgram.milestone_type ? dataResponse.vipProgram.milestone_type : 'earn_points');
    const [milestoneLifetime, setMilestoneLifetime] = useState(dataResponse.vipProgram.milestone_period_type ? dataResponse.vipProgram.milestone_period_type : 'infinity');
    const [periodTime, setPeriodTime] = useState(dataResponse.vipProgram.milestone_period_value ? `${dataResponse.vipProgram.milestone_period_value}` : "1");
    const [periodTimeError, setPeriodTimeError] = useState(null);
    const [periodUnit, setPeriodUnit] = useState(dataResponse.vipProgram.milestone_period_unit ? dataResponse.vipProgram.milestone_period_unit : 'year');
    const [programStatus, setProgramStatus] = useState(dataResponse.vipProgram.status ? 'active1' : 'disable1');
    const [isDataChange, setIsDataChange] = useState(false);
    const [{month, year}, setDate] = useState({
        month: dataResponse.vipProgram.milestone_start ? parseISO(dataResponse.vipProgram.milestone_start).getMonth() : startOfToday().getMonth(),
        year: dataResponse.vipProgram.milestone_start ? parseISO(dataResponse.vipProgram.milestone_start).getFullYear() : startOfToday().getFullYear()})
    const [selectedDate, setSelectedDate] = useState({
        start: dataResponse.vipProgram.milestone_start ? parseISO(dataResponse.vipProgram.milestone_start) : startOfToday(),
        end: dataResponse.vipProgram.milestone_start ? parseISO(dataResponse.vipProgram.milestone_start) : startOfToday(),
    });
    let VipTierData = dataResponse.tier;


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
    const handleMonthChange = useCallback(
        (month, year) => {
            setDate({month, year});
        },
        [],
    );

    const milestoneTypeChangeHandler = useCallback((_, newValue) => {
        setMilestoneType(newValue);
        setIsDataChange(true);
    }, [],);

    const milestoneLifetimeChangeHandler = useCallback((_, newValue) => {
        setMilestoneLifetime(newValue);
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
    const addNewTier = () => {
        navigate('../program/vip/tier/new')
    }

    const handleSubmit = async () => {
        const data = JSON.stringify({
            id: shop.id.split('gid://shopify/Shop/')[1],
            milestone_type: milestoneType,
            milestone_period_type: milestoneLifetime,
            milestone_period_value: milestoneLifetime === 'period' ? parseInt(periodTime) ?? undefined : undefined,
            milestone_period_unit: milestoneLifetime === 'period' ? periodUnit ?? undefined : undefined,
            status: programStatus === 'active1',
            milestone_start: selectedDate.start.toISOString(),
        });

        submit(data, {replace: true, method: 'PUT', encType: "application/json"})
    }

    useEffect(() => {
        if (milestoneLifetime === "period") {
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

    const emptyStateMarkup =
        <EmptyState
            heading="Create new tier to get started"
            action={{
                content: 'Add new tier',
                onAction: addNewTier
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
                        title="VIP Program"
                        backAction={{content: "Programs", url: "../programs"}}
                        titleMetadata={programStatus === 'active1' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <BlockStack gap="600">
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            VIP tiers
                                        </Text>
                                        <p>Create VIP tiers to reward your most loyal customers, and increase their
                                            lifetime
                                            value
                                            in your brand</p>
                                        <div>
                                            <Button size="medium" onClick={addNewTier}>Add new tier</Button>
                                        </div>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="200">
                                        <Text variant="headingMd" as="h6">
                                            VIP TIERS
                                        </Text>
                                        <Divider borderColor="border"/>
                                        {VipTierData?.length > 0 ?
                                            <ResourceList items={VipTierData} renderItem={(item) => {
                                                const {id, name, icon, milestone_requirement, count} = item;
                                                const media = <img style={{
                                                    width: "32px", height: "32px"
                                                }} src={icon} alt=""/>;
                                                return (
                                                    <ResourceItem
                                                        id={id}
                                                        url={`../program/vip/tier/${id}`}
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
                                                                }}>
                                                                    {dataResponse.vipProgram.milestone_type === 'earn_points' ?
                                                                        `Earn ${milestone_requirement} points to achieve` :
                                                                        dataResponse.vipProgram.milestone_type === 'money_spent' ?
                                                                            `Spent ${milestone_requirement} $ to achieve` : null
                                                                    }
                                                                </div>
                                                                <div style={{
                                                                    float: "right",
                                                                    width: '20%'
                                                                }}>{count} customers
                                                                </div>
                                                            </InlineStack>
                                                        </div>
                                                    </ResourceItem>
                                                )
                                            }}>
                                            </ResourceList>
                                            :
                                            <Card>
                                                <ResourceList
                                                    emptyState={emptyStateMarkup}
                                                    items={VipTierData}
                                                    renderItem={() => <></>}
                                                    resourceName={{singular: 'program', plural: 'programs'}}
                                                >
                                                </ResourceList>
                                            </Card>
                                        }
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            VIP milestone
                                        </Text>
                                        <p>Set up what a customer has to do before they can join a specific tier of your
                                            rewards
                                            program</p>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="300">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Members enters a VIP tier based on their
                                                </Text>
                                                <RadioButton
                                                    label="Points earn"
                                                    id="earn_points"
                                                    onChange={milestoneTypeChangeHandler}
                                                    checked={milestoneType === 'earn_points'}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Amount spent"
                                                    id="money_spent"
                                                    onChange={milestoneTypeChangeHandler}
                                                    checked={milestoneType === 'money_spent'}
                                                >
                                                </RadioButton>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Program start date
                                                </Text>
                                                <TextField
                                                    label="Start at"
                                                    labelHidden
                                                    autoComplete="off"
                                                    prefix={<Icon source={CalendarIcon}/>}
                                                    value={selectedDate.start.toLocaleDateString()}
                                                    readOnly
                                                ></TextField>
                                                <DatePicker
                                                    month={month}
                                                    year={year}
                                                    selected={selectedDate}
                                                    onMonthChange={handleMonthChange}
                                                    onChange={setSelectedDate}
                                                    disableDatesAfter={startOfToday()}
                                                >
                                                </DatePicker>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Members has the following amount of time to achieve a VIP tier
                                                </Text>
                                                <RadioButton
                                                    label="Their lifetime as member"
                                                    helpText="Once members achieve a tier, they will keep their status forever"
                                                    id="infinity"
                                                    onChange={milestoneLifetimeChangeHandler}
                                                    checked={milestoneLifetime === "infinity"}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Period"
                                                    helpText="A member achieve a vip tier will get the remainder of the period time and the next full period time"
                                                    id="period"
                                                    onChange={milestoneLifetimeChangeHandler}
                                                    checked={milestoneLifetime === "period"}
                                                >
                                                </RadioButton>
                                                <InlineStack gap="400" wrap={false}>
                                                    <div style={{
                                                        width: '80%'
                                                    }}>
                                                        <TextField
                                                            disabled={milestoneLifetime !== "period"}
                                                            autoComplete="off"
                                                            label="Period time"
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
                                                            disabled={milestoneLifetime !== "period"}
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
                                                    id="active1"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'active1'}
                                                ></RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="disable1"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'disable1'}
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
    )
}
