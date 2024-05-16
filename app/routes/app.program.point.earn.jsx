import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {Form, useLoaderData} from "@remix-run/react";
import {useMutation, useQuery} from "@apollo/client";
import {GET_EARN_POINT} from "../graphql/query";
import {Badge, Card, Page, Spinner, Text, TextField, BlockStack, RadioButton, Button} from "@shopify/polaris";
import axios from "axios";
import {useCallback, useEffect, useState} from "react";
import {UPDATE_EARN_POINT} from "../graphql/mutation";

export async function loader({request}) {
    const {session} = await authenticate.admin(request);
    const url = new URL(request.url);
    const key = url.searchParams.get('type');

    if(key) {
        url.searchParams.set("type", 'Order');
    }

    let store = await axios.get(`https://${session.shop}/admin/api/2024-04/shop.json`, {
        headers: {
            "X-Shopify-Access-Token": session.accessToken, "Accept-Encoding": "application/json",
        },
    });
    store = store.data.shop;

    return json({session: session, shop: store, id: key ?? 'Order'});
}

export default function EarnSingular() {
    const {shop, id} = useLoaderData();
    const [rewardPoint, setRewardPoint] = useState(0);
    const [rewardPointError, setRewardPointError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [programStatus, setProgramStatus] = useState('disable');
    const [programType, setProgramType] = useState(0);
    const [programName, setProgramName] = useState('Program');
    const [programShareLink, setProgramShareLink] = useState('https://');
    const [isSync, setIsSync] = useState(true);
    const [isUpdated, setIsUpdated] = useState(false);

    const {loading: earnPLoading, data: earnP} = useQuery(GET_EARN_POINT, {
        variables: {
            input: {
                id: `${shop.id}`, key: id
            }
        }
    })

    const [updateProgram] = useMutation(UPDATE_EARN_POINT);
    const handleSubmit = async () => {
        setIsUpdated(true);
        console.log(rewardPoint);
        console.log(programStatus);
        console.log(programName);
        try {
            const updatePromise = await updateProgram({
                variables: {
                    input: {
                        id: `${shop.id}`,
                        key: earnP.getEarnPoint.key,
                        icon: null,
                        name: programName,
                        type: programType ?? undefined,
                        link: programShareLink ?? undefined,
                        reward_points: rewardPoint,
                        status: programStatus !== 'disable'
                    }
                }
            });

            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Update program timed out'));
                }, 10000);
            });

            await Promise.race([updatePromise, timeoutPromise]);

            setIsUpdated(false);
            shopify.toast.show('Updated successfully');
        } catch (error) {
            setIsUpdated(false);
            console.error('Error:', error.message);
            shopify.toast.show('Connection timeout', {
                isError: true,
            });
        }
    }
    const programStatusHandler = useCallback((_, newValue) => {
        setProgramStatus(newValue);
    }, [],);

    const programTypeHandler = useCallback((_, newValue) => {
        setProgramType(Number(newValue));
    }, [],)

    const handleRewardPointChange = useCallback((value) => setRewardPoint(Number(value)), [],)

    const handleNameChange = useCallback((value) => setProgramName(value), [],);

    const handleProgramShareLinkChange = useCallback((value) => setProgramShareLink(value), [],);


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
        if (!earnPLoading) {
            if (earnP.getEarnPoint.status) {
                setProgramStatus('active')
            } else {
                setProgramStatus('disable')
            }
            setRewardPoint(earnP.getEarnPoint.reward_points)
            setProgramName(earnP.getEarnPoint.name)
            setProgramType(earnP.getEarnPoint.type ?? null);
            setProgramShareLink(earnP.getEarnPoint.link ?? null)
            setIsSync(false);
        }

    }, [earnPLoading]);

    if (earnPLoading || isSync) {
        return (
            <Page>
                <Spinner/>
            </Page>
        )
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Page
                title={programName}
                backAction={{content: "Program", url: "../program/points"}}
                titleMetadata={programStatus === 'active' ? <Badge tone="success">Active</Badge> :
                    <Badge tone="critical">Inactive</Badge>}
                primaryAction={<Button variant="primary" submit loading={isUpdated}>Save</Button>}
            >
                    {earnP.getEarnPoint.key === 'Order' ? (
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
                                        id="1"
                                        onChange={programTypeHandler}
                                        checked={programType === 1}
                                    >
                                    </RadioButton>
                                    <RadioButton
                                        label="Fixed amount of points"
                                        id="0"
                                        onChange={programTypeHandler}
                                        checked={programType === 0}
                                    >
                                    </RadioButton>
                                    {programType === 0 ? (
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
                    ) : earnP.getEarnPoint.key === 'DoB' ? (
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
                    ) : earnP.getEarnPoint.key === 'FB_Share' ? (
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
                    ) : earnP.getEarnPoint.key === 'SignIn' ? (
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
                    ) : (
                        <BlockStack gap="500"></BlockStack>
                    )
                }
            </Page>
        </Form>)
}
