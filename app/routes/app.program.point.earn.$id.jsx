import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {GET_EARN_POINT} from "../graphql/query";
import {
    Badge,
    Card,
    Page,
    Text,
    TextField,
    BlockStack,
    RadioButton,
    Frame,
    ContextualSaveBar, Layout
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {UPDATE_EARN_POINT} from "../graphql/mutation";
import client from "../graphql/client";

export async function loader({request, params}) {
    const {admin} = await authenticate.admin(request);
    const id = params.id;

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

    const earnP = await client.query({
        query: GET_EARN_POINT,
        variables: {
            input: {
                program_id: `${responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}`,
                id: id
            }
        }
    })

    return json({
        shop: responseJson.data.shop,
        earnP: earnP.data.getEarnPoint
    });
}

export async function action({request}) {
    const body = await request.json();
    console.log(body);
    try {
        const response = await client.mutate({
            mutation: UPDATE_EARN_POINT,
            variables: {
                input: body,
            },
        });

        if (response.data.updateEarnPoint) {
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
        console.log(error);

        return json({
            action: 'failed',
            error: error
        })
    }
}

export default function EarnSingular() {
    const {shop, earnP} = useLoaderData();
    const submit = useSubmit();
    const actionData = useActionData();
    const [rewardPoint, setRewardPoint] = useState(0);
    const [rewardPointError, setRewardPointError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [programStatus, setProgramStatus] = useState('disable');
    const [programType, setProgramType] = useState("");
    const [programName, setProgramName] = useState('Program');
    const [programShareLink, setProgramShareLink] = useState('https://');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async () => {
        const data = JSON.stringify({
            program_id: `${shop.id.split('gid://shopify/Shop/')[1]}`,
            id: earnP.id,
            name: programName,
            key: earnP.key,
            sub_key: programType ?? undefined,
            link: programShareLink ?? undefined,
            reward_points: rewardPoint,
            status: programStatus !== 'disable'
        });

        submit(data, {replace: true, method: 'PUT', encType: "application/json"});
    }
    const programStatusHandler = useCallback((_, newValue) => {
        setProgramStatus(newValue);
        setIsDataChange(true);
    }, [],);

    const programTypeHandler = useCallback((_, newValue) => {
        setProgramType(newValue);
        setIsDataChange(true);
    }, [],)

    const handleRewardPointChange = useCallback((value) => {
        setRewardPoint(Number(value));
        setIsDataChange(true);

    }, [],)

    const handleNameChange = useCallback((value) => {
        setProgramName(value);
        setIsDataChange(true);
    }, [],);

    const handleProgramShareLinkChange = useCallback((value) => {
        setProgramShareLink(value);
        setIsDataChange(true);
    }, [],);


    useEffect(() => {
        if (!Number.isInteger(rewardPoint) || rewardPoint <= 0) {
            setRewardPointError('Point must be a number')

        } else {
            setRewardPointError(null);
        }
    }, [rewardPoint])

    useEffect(() => {
        if (programName.length === 0) {
            setNameError('Program Name cannot be empty')
        } else {
            setNameError(null);
        }
    }, [programName])

    useEffect(() => {
        if (earnP.status) {
            setProgramStatus('active')
        } else {
            setProgramStatus('disable')
        }
        setRewardPoint(earnP.reward_points)
        setProgramName(earnP.name)
        setProgramType(earnP.sub_key ?? null);
        setProgramShareLink(earnP.link ?? null)
    }, []);

    useEffect(() => {
        if (actionData) {
            if (actionData.action === 'success') {
                shopify.toast.show('Updated successfully');
                setTimeout(() => {
                    navigate('../program/points');
                }, 500)
            } else {
                shopify.toast.show('Failed to update');
                setTimeout(() => {
                    navigate('../program/points');
                }, 500)
            }
        }
    }, [actionData])

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
                            navigate("../program/points");
                        },
                    }}
                ></ContextualSaveBar>
                <div style={{marginTop: "55px"}}>
                    <Page
                        title={programName}
                        backAction={{content: "Program", url: "../program/points"}}
                        titleMetadata={programStatus === 'active' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <Layout>
                            <Layout.Section variant="oneHalf">
                                <Form onSubmit={handleSubmit}>
                                    {earnP.key === 'place_an_order' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <RadioButton
                                                        label="Increments of points"
                                                        id="money_spent"
                                                        onChange={programTypeHandler}
                                                        checked={programType === "money_spent"}
                                                    >
                                                    </RadioButton>
                                                    <RadioButton
                                                        label="Fixed amount of points"
                                                        id="fixed_point"
                                                        onChange={programTypeHandler}
                                                        checked={programType === "fixed_point"}
                                                    >
                                                    </RadioButton>
                                                    {programType === "fixed_point" ? (
                                                        <TextField
                                                            label="Point earned when complete an order"
                                                            type="number"
                                                            value={rewardPoint}
                                                            suffix="points"
                                                            onChange={handleRewardPointChange}
                                                            error={rewardPointError}
                                                            autoComplete="off"
                                                        >
                                                        </TextField>
                                                    ) : (
                                                        <TextField
                                                            label="Points earned for every $1 spent"
                                                            type="number"
                                                            value={rewardPoint}
                                                            suffix="points"
                                                            onChange={handleRewardPointChange}
                                                            error={rewardPointError}
                                                            autoComplete="off"
                                                        >
                                                        </TextField>
                                                    )}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Requirement
                                                    </Text>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : earnP.key === 'happy_birthday' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned"
                                                        type="number"
                                                        value={rewardPoint}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer eligibility
                                                    </Text>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : earnP.key === 'share_on_facebook' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Social Link
                                                    </Text>
                                                    <TextField
                                                        value={programShareLink}
                                                        onChange={handleProgramShareLinkChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="Facebook page URL "
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned when complete an action"
                                                        type="number"
                                                        value={rewardPoint}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Requirement
                                                    </Text>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : earnP.key === 'sign_in' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned"
                                                        type="number"
                                                        value={rewardPoint}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Requirement
                                                    </Text>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : null}
                                </Form>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>
        </div>
    )
}
