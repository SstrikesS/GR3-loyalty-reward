import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {Form, useLoaderData} from "@remix-run/react";
import {useMutation, useQuery} from "@apollo/client";
import {GET_EARN_POINT} from "../graphql/query";
import {Badge, Card, Page, Spinner, Text, TextField, BlockStack, RadioButton, Button} from "@shopify/polaris";
import axios from "axios";
import {useCallback, useEffect, useState} from "react";
import {UPDATE_EARN_POINT} from "../graphql/mutation";

export async function loader({request, params}) {
    const {session} = await authenticate.admin(request);

    let store = await axios.get(`https://${session.shop}/admin/api/2024-04/shop.json`, {
        headers: {
            "X-Shopify-Access-Token": session.accessToken, "Accept-Encoding": "application/json",
        },
    });
    store = store.data.shop;

    return json({session: session, shop: store, id: params.id});
}

export default function EarnSingular() {
    const {shop, id} = useLoaderData();
    const [rewardPoint, setRewardPoint] = useState(0);
    const [rewardPointError, setRewardPointError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [programStatus, setProgramStatus] = useState('disable');
    const [programName, setProgramName] = useState('Program');
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
                        name: programName,
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

    const handleRewardPointChange = useCallback((value) => setRewardPoint(Number(value)), [],)

    const handleNameChange = useCallback((value) => setProgramName(value), [],);


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
            setProgramName(earnP.getEarnPoint.name);
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
                backAction={{content: "Program", url: "../point_program"}}
                titleMetadata={programStatus === 'active' ? <Badge tone="success">Active</Badge> :
                    <Badge tone="critical">Inactive</Badge>}
                primaryAction={<Button variant="primary" submit loading={isUpdated}>Save</Button>}
            >
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
                                label="Point earned when complete an order"
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
            </Page>
        </Form>)
}
