import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {GET_EARN_POINT, GET_VIP_PROGRAM, GET_VIP_TIERS} from "../graphql/query";
import {
    Badge,
    Card,
    Page,
    Text,
    TextField,
    BlockStack,
    RadioButton,
    Frame,
    ContextualSaveBar, Layout, Checkbox, InlineStack, Select, Tooltip
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {UPDATE_EARN_POINT} from "../graphql/mutation";
import client from "../graphql/client";
import {isStringInteger} from "../components/helper/helper";

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
    const [earnP, vipP, vipTier] = await Promise.all([
        client.query({
            query: GET_EARN_POINT,
            variables: {
                input: {
                    program_id: `${responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}`,
                    id: id
                }
            }
        }),
        client.query({
            query: GET_VIP_PROGRAM,
            variables: {
                input: {
                    id: `${responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}`,
                }
            }
        }),
        client.query({
            query: GET_VIP_TIERS,
            variables: {
                input: {
                    program_id: `${responseJson.data.shop.id.split('gid://shopify/Shop/')[1]}`
                }
            }
        })
    ])

    return json({
        shop: responseJson.data.shop,
        earnP: earnP.data.getEarnPoint,
        vipTier: vipTier.data.getVipTiers,
        vipProgram: vipP.data.getVipProgram,
    });
}

export async function action({request}) {
    const body = await request.json();
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
    const {shop, earnP, vipTier, vipProgram} = useLoaderData();
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
    const [isLimitTimesUse, setIsLimitTimesUse] = useState(false);
    const [limitTimesUse, setLimitTimesUse] = useState("0");
    const [limitTimesUseError, setLimitTimesUseError] = useState(null);
    const [limitTimeUnit, setLimitTimeUnit] = useState("day");
    const [isVipLimit, setIsVipLimit] = useState(false);
    const [vipLimit, setVipLimit] = useState('include');
    const [tierLimit, setTierLimit] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async () => {
        if(!rewardPointError && !nameError && !limitTimesUseError) {
            const data = JSON.stringify({
                program_id: `${shop.id.split('gid://shopify/Shop/')[1]}`,
                id: earnP.id,
                name: programName,
                key: earnP.key,
                sub_key: programType ?? undefined,
                link: programShareLink ?? undefined,
                reward_points: rewardPoint,
                status: programStatus !== 'disable',
                limit: isLimitTimesUse ? parseInt(limitTimesUse) : -1,
                requirement: isVipLimit ? `${vipLimit}/${tierLimit}` : undefined,
                limit_reset_loop: isLimitTimesUse ? limitTimeUnit : undefined,
            });

            submit(data, {replace: true, method: 'PUT', encType: "application/json"});
        } else {
            shopify.toast.show('Invalid input. Save failed!');
        }
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

    const handleIsLimitTimeUseChange = useCallback((value) => {
        setIsLimitTimesUse(prevState => !prevState);
        setIsDataChange(true);
    }, [])

    const handleLimitTimesUseChange = useCallback((value) => {
        setLimitTimesUse(value);
        setIsDataChange(true);
    }, []);

    const handleLimitTimeUnitChange = useCallback((value) => {
        setLimitTimeUnit(value);
        setIsDataChange(true);
    }, []);

    const handleIsVipLimitChange = useCallback((value) => {
        setIsVipLimit(prevState => !prevState);
        setIsDataChange(true);
    }, []);

    const handleVipLimitChange = useCallback((value, id) => {
        setVipLimit(id);
        setIsDataChange(true);
    }, []);

    const handleTierLimitChange = useCallback((value) => {
        setTierLimit(value);
        setIsDataChange(true);
    }, [])

    useEffect(() => {
        if(isLimitTimesUse) {
            if(!isStringInteger(limitTimesUse)) {
                setLimitTimesUseError('Value must be a number');
            } else {
                setLimitTimesUseError(null);
            }
        } else {
            setLimitTimesUseError(null);
        }
    }, [isLimitTimesUse, limitTimesUse]);

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
        setProgramShareLink(earnP.link ?? null);
        if(earnP.limit !== -1) {
            setIsLimitTimesUse(true)
            setLimitTimesUse(`${earnP.limit}`);
            setLimitTimeUnit(earnP.limit_reset_loop)
        }
        if(earnP.requirement !== "") {
            const requirement = earnP.requirement.split('/');
            if(!vipProgram.status) {
                setIsVipLimit(true);
            }
            setTierLimit(requirement[1])
            setVipLimit(requirement[0])
        }
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
    }, [actionData]);

    const timesLimitUnit = [
        {label: 'lifetime', value: 'lifetime'},
        {label: 'day', value: 'day'},
        {label: 'month', value: 'month'},
        {label: 'year', value: 'year'},
    ];

    const tierTierOption = vipTier.map((item) => {
        return {
            label: item.name,
            value: item.id,
        }
    });
    tierTierOption.push({
        label: 'None',
        value: ''
    })

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
                                                        Customer Eligibility
                                                    </Text>
                                                    <Checkbox
                                                        label="Limit the number of times customer can use this earn program"
                                                        onChange={handleIsLimitTimeUseChange}
                                                        checked={isLimitTimesUse}
                                                    >
                                                    </Checkbox>
                                                    {isLimitTimesUse ? (
                                                    <InlineStack gap="400" wrap={false}>
                                                        <div style={{
                                                            width: '80%'
                                                        }}>
                                                            <TextField
                                                                label='Limit time use'
                                                                labelHidden
                                                                autoComplete='off'
                                                                value={limitTimesUse}
                                                                onChange={handleLimitTimesUseChange}
                                                                error={limitTimesUseError}
                                                                type='number'
                                                                suffix="per"
                                                            >
                                                            </TextField>
                                                        </div>
                                                        <div style={{
                                                            width: '20%'
                                                        }}>
                                                            <Select
                                                                label="Unit"
                                                                labelHidden
                                                                options={timesLimitUnit}
                                                                onChange={handleLimitTimeUnitChange}
                                                                value={limitTimeUnit}
                                                            >
                                                            </Select>
                                                        </div>
                                                    </InlineStack>
                                                    ) : null}
                                                    <Tooltip active content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                        ) : null}
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
                                                        Customer Eligibility
                                                    </Text>
                                                    <Tooltip active content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
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
                                                        Customer Eligibility
                                                    </Text>
                                                    <Checkbox
                                                        label="Limit the number of times customer can use this earn program"
                                                        onChange={handleIsLimitTimeUseChange}
                                                        checked={isLimitTimesUse}
                                                    >
                                                    </Checkbox>
                                                    {isLimitTimesUse ? (
                                                        <InlineStack gap="400" wrap={false}>
                                                            <div style={{
                                                                width: '80%'
                                                            }}>
                                                                <TextField
                                                                    label='Limit time use'
                                                                    labelHidden
                                                                    autoComplete='off'
                                                                    value={limitTimesUse}
                                                                    onChange={handleLimitTimesUseChange}
                                                                    error={limitTimesUseError}
                                                                    type='number'
                                                                    suffix="per"
                                                                >
                                                                </TextField>
                                                            </div>
                                                            <div style={{
                                                                width: '20%'
                                                            }}>
                                                                <Select
                                                                    label="Unit"
                                                                    labelHidden
                                                                    options={timesLimitUnit}
                                                                    onChange={handleLimitTimeUnitChange}
                                                                    value={limitTimeUnit}
                                                                >
                                                                </Select>
                                                            </div>
                                                        </InlineStack>
                                                    ) : null}
                                                    <Tooltip active content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
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
                                                        Customer Eligibility
                                                    </Text>
                                                    <Tooltip active content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
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
