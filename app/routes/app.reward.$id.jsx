import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {Form, useActionData, useFetcher, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {
    Autocomplete,
    BlockStack,
    Box,
    CalloutCard,
    Card,
    Checkbox,
    ContextualSaveBar,
    DatePicker,
    Frame,
    Icon,
    InlineGrid,
    Layout,
    List,
    Page,
    RadioButton,
    Text,
    TextField
} from "@shopify/polaris";
import {convertSnakeString, convertToTitleCase, isPositiveFloat, isStringInteger} from "../components/helper/helper";
import {useCallback, useEffect, useState} from "react";
import {CalendarIcon, SearchIcon} from "@shopify/polaris-icons";
import {parseISO, startOfToday} from "date-fns";
import client from "../graphql/client";
import {GET_REDEEM_POINT} from "../graphql/query";
import {NewRedeemPoint} from "./api.reward.new";
import {UpdateRedeemPoint} from "./api.reward.edit";

export async function loader({request, params}) {
    const {session, admin} = await authenticate.admin(request);
    const url = new URL(request.url);
    let key = url.searchParams.get('type');
    const id = params.id;
    let icon;

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
              collections(first: 25) {
                edges {
                  node {
                    id
                    title
                  }
                  cursor
                }
              }
            }
        `);
    const responseJson = await response.json();
    let redeemData = null;
    if (id && id !== "new") {
        redeemData = await client.query({
            query: GET_REDEEM_POINT,
            variables: {
                input: {
                    id: id,
                    program_id: responseJson.data.shop.id.split('gid://shopify/Shop/')[1]
                }
            }
        })
        key = redeemData.key;
    }

    const collections = responseJson.data.collections.edges.map(collectEdge => ({
        value: collectEdge.node.id.split('gid://shopify/Collection/')[1],
        cursor: collectEdge.cursor,
        label: collectEdge.node.title,
    }));

    switch (key) {
        case "amount_discount" :
            icon = 'https://cdn-icons-png.flaticon.com/32/1611/1611179.png';
            break;
        case "percentage_off":
            icon = 'https://cdn-icons-png.flaticon.com/32/879/879757.png';
            break;
        case "free_shipping":
            icon = 'https://cdn-icons-png.flaticon.com/32/709/709790.png';
            break;
        default:
            key = "amount_discount";
            icon = 'https://cdn-icons-png.flaticon.com/32/1611/1611179.png';
            break;
    }

    if (key) {
        url.searchParams.set('type', 'amount_discount');
    }

    return json({
        session: session,
        collectsResponse: collections,
        collectionLastCursor: responseJson.data.collections.edges[responseJson.data.collections.edges.length - 1].cursor,
        shop: responseJson.data.shop,
        key: redeemData ? redeemData.data.getRedeemPoint.key : key,
        icon: redeemData ? redeemData.data.getRedeemPoint.icon : icon,
        redeemData: redeemData ? redeemData.data.getRedeemPoint : null,
    });
}

export async function action({request}) {
    const method = request.method;
    if (method === "POST") {
        console.log("New");
        return await NewRedeemPoint(request);
    } else if (method === "PUT") {
        console.log("Update");
        return await UpdateRedeemPoint(request);
    } else {
        json({
            action: 'failed',
        })
    }
}

export default function NewReward() {
    const {key, collectsResponse, shop, redeemData, collectionLastCursor, icon} = useLoaderData();
    const submit = useSubmit();
    const [lastCursor, setLastCursor] = useState(collectionLastCursor);
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const actionData = useActionData();
    const [isDataChange, setIsDataChange] = useState(false);
    const [collectOption, setCollectOption] = useState(collectsResponse);
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [programName, setProgramName] = useState(redeemData ? redeemData.title : '');
    const [nameError, setNameError] = useState(null);
    const [pointCost, setPointCost] = useState(redeemData ? redeemData.pointsCost : "500");
    const [pointCostError, setPointCostError] = useState(null);
    const [discountValue, setDiscountValue] = useState(redeemData ? redeemData.discountValue : "5");
    const [discountValueError, setDiscountValueError] = useState(null);
    const [programApply, setProgramApply] = useState(redeemData ? redeemData.programApply : 'entire_order')
    const [selectedCollection, setSelectedCollection] = useState([]);
    const [inputCollectionValue, setInputCollectionValue] = useState('');
    const [isCollectionLoading, setIsCollectionLoading] = useState(false);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [isAddPrefixCode, setsIsAddPrefixCode] = useState(redeemData ? !!redeemData.prefixCode : true);
    const [prefixCode, setPrefixCode] = useState(redeemData ? redeemData.prefixCode ? redeemData.prefixCode : "" : "");
    const [programStatus, setProgramStatus] = useState(redeemData ? redeemData.status ? 'active' : 'disable' : 'disable');
    const [isSetShippingRates, setIsSetShippingRates] = useState(redeemData ? redeemData.isSetShippingRates ? redeemData.isSetShippingRates : true : true);
    const [combinationCheckbox, setCombinationCheckbox] = useState(redeemData ? redeemData.combination : {
        order: false,
        product: false,
        shipping: false,
    });
    const [minimumRequire, setMinimumRequire] = useState(redeemData ? redeemData.minimumRequire ? redeemData.minimumRequire : "5" : "5");
    const [minimumRequireError, setMinimumRequireError] = useState(null);
    const [isRewardExpiry, setIsRewardExpiry] = useState(redeemData ? parseISO(redeemData.expire_at).valueOf() !== parseISO(redeemData.start_at).valueOf() ? "set_expired" : "no_expired" : "no_expired");
    const [{month, year}, setDate] = useState({month: startOfToday().getMonth(), year: startOfToday().getFullYear()})
    const [selectedDate, setSelectedDate] = useState(redeemData ? {
        start: parseISO(redeemData.start_at),
        end: redeemData.end ? parseISO(redeemData.expire_at) : parseISO(redeemData.start_at),
    } : {
        start: startOfToday(),
        end: startOfToday(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSetMinimumRequirement, setIsSetMinimumRequirement] = useState(redeemData ? redeemData.minimumRequireType : 'no_required');
    const updateText = useCallback(
        (value) => {
            setInputCollectionValue(value);

            if (value === '') {
                setCollectionOptions(collectOption);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = collectOption.filter((collectionOptions) =>
                collectionOptions.label.match(filterRegex),
            );
            setCollectionOptions(resultOptions);
        },
        [collectOption],
    );

    const updateSelection = useCallback(
        (selected) => {
            setSelectedCollection(selected);
        },
        [],
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label="Collection"
            value={inputCollectionValue}
            prefix={<Icon source={SearchIcon} tone="base"/>}
            placeholder="Search"
            autoComplete="off"
        />
    );

    const handleSubmit = async () => {
        const data = JSON.stringify({
            program_id: shop.id.split('gid://shopify/Shop/')[1],
            id: redeemData ? redeemData.id ? redeemData.id : undefined : undefined,
            title: programName,
            key: key,
            icon: icon,
            pointsCost: pointCost,
            discountValue: isSetShippingRates ? discountValue : "0",
            isSetShippingRates: isSetShippingRates,
            programApply: programApply,
            collections: selectedCollection,
            prefixCode: isAddPrefixCode ? prefixCode : undefined,
            isAddPrefixCode: isAddPrefixCode,
            combination: combinationCheckbox,
            isSetMinimumRequirement: isSetMinimumRequirement,
            minimumRequire: isRewardExpiry ? minimumRequire : undefined,
            isRewardExpiry: isRewardExpiry,
            expiryDate: selectedDate,
            status: programStatus,
        });
        if (redeemData) {
            submit(data, {replace: true, method: 'PUT', encType: "application/json"})
        } else {
            submit(data, {replace: true, method: 'POST', encType: "application/json"})
        }
    };

    const handlePointCostChange = useCallback((value) => {
        setPointCost(value);
        setIsDataChange(true)
    }, [],);
    const handleDiscountValueChange = useCallback((value) => {
        setDiscountValue(value);
        setIsDataChange(true)

    }, [],);
    const programStatusHandler = useCallback((_, newValue) => {
        setProgramStatus(newValue);
        setIsDataChange(true);
    }, [],);
    const handleMinimumRequireChange = useCallback((value) => {
        setMinimumRequire(value);
        setIsDataChange(true)
    }, [],);
    const handlePrefixDiscountChange = useCallback((value) => {
        setPrefixCode(value);
        setIsDataChange(true)
    }, [],);
    const handleCombinationCheckboxChange = useCallback((newChecked, id) => setCombinationCheckbox((prevState) => {
            const newState = {...prevState};
            newState[id] = !newState[id]
            setIsDataChange(true);
            return newState;
        }),
        [],
    );
    const handleMonthChange = useCallback(
        (month, year) => {
            setDate({month, year});
            setIsDataChange(true)
        },
        [],
    );
    const handleProgramApplyChange = useCallback((_, newValue) => {
        setProgramApply(newValue);
        setIsDataChange(true);
    }, [],);
    const handleIsRewardExpiryChange = useCallback((_, newValue) => {
        setIsRewardExpiry(newValue);
        setIsDataChange(true);
    }, [],);
    const handleChangeIsMinimumRequirementChange = useCallback((_, newValue) => {
        setIsSetMinimumRequirement(newValue);
        setMinimumRequire('');
        setIsDataChange(true);
    }, [],)
    const handleLoadMoreResults = useCallback(() => {
        if (willLoadMoreResults && !isCollectionLoading) {
            setIsCollectionLoading(true);
            fetcher.load(`../../api/collects?limit=25&cursor=${lastCursor}`);
            const interval = setInterval(() => {
                if (fetcher.state === 'idle' && !fetcher.data) {

                }
            }, 1000)

            setTimeout(() => {
                clearInterval(interval)
                setIsCollectionLoading(false);
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [willLoadMoreResults, isCollectionLoading]);


    const handleNameChange = useCallback((value) => {
        setProgramName(value)
        setIsDataChange(true)
    }, [],);

    const removeFromSelectedCollection = (indexToRemove) => {
        const updatedCollection = [...selectedCollection];
        updatedCollection.splice(indexToRemove, 1);
        setSelectedCollection(updatedCollection);
    };

    useEffect(() => {
        if (actionData) {
            if (actionData.action === 'success') {
                if(redeemData) {
                    shopify.toast.show('Updated successfully');
                    setIsSubmitting(false);
                } else {
                    shopify.toast.show('A new redeem way created successfully');

                    setTimeout(() => {
                        navigate('../program/points');
                    }, 500)
                }
            } else {
                if(redeemData) {
                    shopify.toast.show('Failed to update');
                    setIsSubmitting(false);
                } else {
                    shopify.toast.show('Failed to create a new redeem way');
                    setIsSubmitting(false);
                }
            }
        }
    }, [actionData])


    useEffect(() => {
        if (!isCollectionLoading)
            if (fetcher.data) {
                setLastCursor(fetcher.data.collections.edges[fetcher.data.collections.edges.length - 1].cursor);
                const updatedOptions = fetcher.data.collections.edges.map(collectEdge => ({
                    // value: collectEdge.node.id.split('gid://shopify/Collection/')[1],
                    value: collectEdge.node.id,
                    cursor: collectEdge.cursor,
                    label: collectEdge.node.title,
                }));
                setCollectOption((prevOption) => {
                    return [...prevOption, ...updatedOptions]
                })
                if (!fetcher.data.collections.pageInfo.hasNextPage) {
                    setWillLoadMoreResults(false);
                }
            }
    }, [isCollectionLoading]);

    useEffect(() => {
        if (collectOption) {
            setSelectedCollection(redeemData ? redeemData.collections ? redeemData.collections : [] : []);
        }
    }, []);

    useEffect(() => {
        setCollectionOptions(collectOption);
    }, [collectOption]);

    useEffect(() => {
        if (programName.length === 0) {
            setNameError('Program Name cannot be empty')
        } else {
            setNameError(null);
        }
    }, [programName])

    useEffect(() => {
        if (!isStringInteger(pointCost)) {
            setPointCostError('Point must be a number')

        } else {
            setPointCostError(null);
        }
    }, [pointCost])

    useEffect(() => {
        if (!isPositiveFloat(discountValue)) {
            setDiscountValueError('Discount value must be a number')

        } else if (key === 'percentage_off' && parseFloat(discountValue) > 100) {
            setDiscountValueError('Value of percentage can not greater than 100')
        } else {
            setDiscountValueError(null);
        }
    }, [discountValue])

    useEffect(() => {
        if (isSetMinimumRequirement === 'minimum_purchase') {
            if (!isPositiveFloat(minimumRequire)) {
                setMinimumRequireError('Minimum purchase must be a number')

            } else {
                setMinimumRequireError(null);
            }
        } else if (isSetMinimumRequirement === 'minimum_quantity') {
            if (!isStringInteger(minimumRequire)) {
                setMinimumRequireError('Minimum quantity must be a number')

            } else {
                setMinimumRequireError(null);
            }
        }
    }, [minimumRequire, isSetMinimumRequirement])

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
                        title={convertToTitleCase(key)}
                        backAction={{content: "Points", url: "../program/points"}}
                    >
                        <Layout>
                            <Layout.Section variant="oneHalf">
                                <Form onSubmit={handleSubmit}>
                                    <BlockStack gap="500">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Title
                                                </Text>
                                                <TextField
                                                    value={programName}
                                                    onChange={handleNameChange}
                                                    error={nameError}
                                                    placeholder={`Example: ${convertToTitleCase(key)}`}
                                                    autoComplete="off"
                                                    label="">
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Reward value
                                                </Text>
                                                {key === 'amount_discount' ? (
                                                        <InlineGrid gap="500" columns="2">
                                                            <TextField
                                                                label="Points cost"
                                                                autoComplete="off"
                                                                value={pointCost}
                                                                onChange={handlePointCostChange}
                                                                type="number"
                                                                error={pointCostError}
                                                                suffix="points"
                                                            >
                                                            </TextField>
                                                            <TextField
                                                                label="Discount value"
                                                                autoComplete="off"
                                                                value={discountValue}
                                                                onChange={handleDiscountValueChange}
                                                                error={discountValueError}
                                                                suffix={key === "amount_discount" ? "$" : key === "percentage_off" ? "%" : ""}
                                                            >
                                                            </TextField>
                                                        </InlineGrid>
                                                    ) :
                                                    (key === 'percentage_off' ? (
                                                        <InlineGrid gap="500" columns="2">
                                                            <TextField
                                                                label="Points cost"
                                                                autoComplete="off"
                                                                value={pointCost}
                                                                onChange={handlePointCostChange}
                                                                type="number"
                                                                error={pointCostError}
                                                                suffix="points"
                                                            >
                                                            </TextField>
                                                            <TextField
                                                                label="Discount value"
                                                                autoComplete="off"
                                                                value={discountValue}
                                                                onChange={handleDiscountValueChange}
                                                                error={discountValueError}
                                                                suffix="%"
                                                            >
                                                            </TextField>
                                                        </InlineGrid>
                                                    ) : key === "free_shipping" ? (
                                                        <BlockStack gap="500">
                                                            <TextField
                                                                label="Points cost"
                                                                autoComplete="off"
                                                                value={pointCost}
                                                                onChange={handlePointCostChange}
                                                                type="number"
                                                                error={pointCostError}
                                                                suffix="points"
                                                            >
                                                            </TextField>
                                                            <Checkbox
                                                                label="Exclude shipping rates over a certain amount"
                                                                checked={isSetShippingRates}
                                                                onChange={setIsSetShippingRates}
                                                            >
                                                            </Checkbox>
                                                            <TextField
                                                                disabled={!isSetShippingRates}
                                                                label="Discount value"
                                                                labelHidden
                                                                autoComplete="off"
                                                                value={discountValue}
                                                                onChange={handleDiscountValueChange}
                                                                error={discountValueError}
                                                                suffix="$"
                                                            >
                                                            </TextField>
                                                        </BlockStack>
                                                    ) : (
                                                        <></>
                                                    ))}
                                            </BlockStack>
                                        </Card>
                                        {key !== "free_shipping" ? (
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Applies to
                                                    </Text>
                                                    <RadioButton
                                                        label="Entire order"
                                                        id='entire_order'
                                                        onChange={handleProgramApplyChange}
                                                        checked={programApply === 'entire_order'}
                                                    >
                                                    </RadioButton>
                                                    <RadioButton
                                                        label="Specific collection"
                                                        id='specific_collections'
                                                        onChange={handleProgramApplyChange}
                                                        checked={programApply === 'specific_collections'}
                                                    >
                                                    </RadioButton>
                                                    {programApply === 'specific_collections' ? (
                                                        <Autocomplete
                                                            allowMultiple
                                                            options={collectionOptions}
                                                            selected={selectedCollection}
                                                            textField={textField}
                                                            onSelect={updateSelection}
                                                            willLoadMoreResults={willLoadMoreResults}
                                                            onLoadMoreResults={handleLoadMoreResults}
                                                            loading={isCollectionLoading}
                                                        >
                                                        </Autocomplete>
                                                    ) : null
                                                    }
                                                    <div>
                                                        {selectedCollection.map((selectedItem, index) => {
                                                            const matchedOption = collectionOptions.find((collectionOptions) => {
                                                                return collectionOptions.value.match(selectedItem);
                                                            });
                                                            return (
                                                                <CalloutCard
                                                                    key={index}
                                                                    title={matchedOption.label}
                                                                    primaryAction={{
                                                                        content: 'Remove',
                                                                        onAction: () => removeFromSelectedCollection(index),
                                                                    }}
                                                                    illustration=""
                                                                    onDismiss={() => removeFromSelectedCollection(index)
                                                                    }
                                                                ></CalloutCard>
                                                            );
                                                        })
                                                        }
                                                    </div>
                                                </BlockStack>
                                            </Card>
                                        ) : null
                                        }
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Discount code
                                                </Text>
                                                <Checkbox
                                                    label="Add a prefix to discount code"
                                                    checked={isAddPrefixCode}
                                                    onChange={setsIsAddPrefixCode}
                                                >
                                                </Checkbox>
                                                <TextField
                                                    disabled={!isAddPrefixCode}
                                                    label="Add a prefix to discount code"
                                                    labelHidden
                                                    autoComplete="off"
                                                    placeholder="Example: freeshipping-, 5%off-,..."
                                                    value={prefixCode}
                                                    onChange={handlePrefixDiscountChange}
                                                >
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Combination
                                                </Text>
                                                <Text variant="bodyMd" as="h6">
                                                    This discount can be combined with:
                                                </Text>
                                                <Checkbox
                                                    id="order"
                                                    label="Order Discounts"
                                                    checked={combinationCheckbox.order}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                                <Checkbox
                                                    id="product"
                                                    label="Product Discounts"
                                                    checked={combinationCheckbox.product}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                                <Checkbox
                                                    id="shipping"
                                                    label="Shipping Discounts"
                                                    checked={combinationCheckbox.shipping}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Minimum Requirement
                                                </Text>
                                                <RadioButton
                                                    label="No minimum requirement"
                                                    id="no_required"
                                                    checked={isSetMinimumRequirement === 'no_required'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Minimum quantity of items"
                                                    id="minimum_quantity"
                                                    checked={isSetMinimumRequirement === 'minimum_quantity'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                {isSetMinimumRequirement === 'minimum_quantity' ?
                                                    <TextField
                                                        label="Minium"
                                                        labelHidden
                                                        autoComplete="off"
                                                        value={minimumRequire}
                                                        onChange={handleMinimumRequireChange}
                                                        type="Number"
                                                        error={minimumRequireError}
                                                        helpText="Applies only to selected collections."
                                                    ></TextField> : null}
                                                <RadioButton
                                                    label="Minimum purchase amount ($)"
                                                    id="minimum_purchase"
                                                    checked={isSetMinimumRequirement === 'minimum_purchase'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                {isSetMinimumRequirement === 'minimum_purchase' ?
                                                    <TextField
                                                        label="Minium"
                                                        labelHidden
                                                        autoComplete="off"
                                                        value={minimumRequire}
                                                        onChange={handleMinimumRequireChange}
                                                        error={minimumRequireError}
                                                        prefix="$"
                                                        helpText="Applies only to selected collections."
                                                    ></TextField> : null}
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Active dates
                                                </Text>
                                                <RadioButton
                                                    label="Set reward expiry"
                                                    id="set_expired"
                                                    checked={isRewardExpiry === 'set_expired'}
                                                    onChange={handleIsRewardExpiryChange}>
                                                </RadioButton>
                                                <RadioButton
                                                    label="No expired"
                                                    id="no_expired"
                                                    checked={isRewardExpiry === 'no_expired'}
                                                    onChange={handleIsRewardExpiryChange}>
                                                </RadioButton>
                                                <div>
                                                    <InlineGrid columns={2} gap="500">
                                                        <TextField
                                                            label="Start at"
                                                            autoComplete="off"
                                                            prefix={<Icon source={CalendarIcon}/>}
                                                            role="combobox"
                                                            value={selectedDate.start.toLocaleDateString()}
                                                            readOnly
                                                        >
                                                        </TextField>
                                                        {isRewardExpiry === 'set_expired' ?
                                                            <TextField
                                                                label="End at"
                                                                autoComplete="off"
                                                                prefix={<Icon source={CalendarIcon}/>}
                                                                role="combobox"
                                                                value={selectedDate.end.toLocaleDateString()}
                                                                readOnly
                                                            >
                                                            </TextField> : null}
                                                    </InlineGrid>
                                                    <DatePicker
                                                        month={month}
                                                        year={year}
                                                        selected={selectedDate}
                                                        onMonthChange={handleMonthChange}
                                                        onChange={setSelectedDate}
                                                        disableDatesBefore={startOfToday()}
                                                        allowRange={isRewardExpiry === 'set_expired'}
                                                    ></DatePicker>
                                                </div>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Form>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                                <BlockStack gap='500'>
                                    <Card>
                                        <BlockStack gap="500">
                                            <Text variant="headingMd" as="h6">
                                                Summary
                                            </Text>
                                            <Text variant="headingMd" as="h6">
                                                Title
                                            </Text>
                                            <Box paddingInlineStart="400">
                                                {programName.length === 0 ? (
                                                    <Text variant="bodyMd" as="h5">
                                                        No title set
                                                    </Text>
                                                ) : (
                                                    <Text variant="headingMd" as="h6" truncate>
                                                        {programName}
                                                    </Text>
                                                )}
                                            </Box>
                                            <Text variant="headingMd" as="h6">
                                                Detail
                                            </Text>
                                            <List>
                                                {key === "discount_value" || key === "percentage_off" ? (
                                                    <List.Item><strong>{parseFloat(discountValue).toFixed(2)}</strong>{key === "discount_value" ? "$" : key === "percentage_off" ? "%" : ""} off
                                                        apply
                                                        to <strong>{programApply === 'specific_collections' ? selectedCollection.length : null} {convertSnakeString(programApply)} </strong>
                                                    </List.Item>
                                                ) : key === "free_shipping" ? (
                                                    <List.Item><strong>Free shipping</strong> off entire
                                                        order{isSetShippingRates ? `, applies to shipping rates under ${discountValue}$` : null}
                                                    </List.Item>
                                                ) : null}

                                                <List.Item>
                                                    {!combinationCheckbox.shipping && !combinationCheckbox.product && !combinationCheckbox.order ?
                                                        'Can’t combine with other discounts' : 'Can combine with'
                                                    }
                                                    <List>
                                                        {combinationCheckbox.order ?
                                                            <List.Item><strong>Order
                                                                Discounts</strong></List.Item> : null}
                                                        {combinationCheckbox.product ? <List.Item><strong>Product
                                                            Discounts</strong></List.Item> : null}
                                                        {combinationCheckbox.shipping ? <List.Item><strong>Shipping
                                                            Discounts</strong></List.Item> : null}
                                                    </List>
                                                </List.Item>
                                                <List.Item>
                                                    {isSetMinimumRequirement === 'no_required' ? 'No minimum purchase requirement' :
                                                        isSetMinimumRequirement === 'minimum_purchase' ? `Minimum purchase of ${parseFloat(minimumRequire).toFixed(2)}$` :
                                                            isSetMinimumRequirement === 'minimum_quantity' ? `Minimum quantity of ${minimumRequire} item(s)` : null
                                                    }
                                                </List.Item>
                                                <List.Item>
                                                    Active
                                                    from <strong>{selectedDate.start.valueOf() === startOfToday().valueOf() ? 'Today' :
                                                    selectedDate.start.toDateString()}</strong> {isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? 'until ' : null}
                                                    <strong>{isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? selectedDate.end.toDateString() : null}</strong>
                                                </List.Item>
                                            </List>
                                        </BlockStack>
                                    </Card>
                                    {redeemData ? (
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Status
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
                                    ) : null}
                                </BlockStack>
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>
        </div>
    )
}

