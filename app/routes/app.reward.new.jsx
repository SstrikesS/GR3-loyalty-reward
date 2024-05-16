import {json, redirect} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {Form, useFetcher, useLoaderData, useSubmit, useNavigate} from "@remix-run/react";
import {
    Autocomplete,
    BlockStack, Box, CalloutCard,
    Card, Checkbox, ContextualSaveBar, DatePicker, Frame,
    Icon,
    InlineGrid, Layout, List,
    Page,
    RadioButton,
    Text,
    TextField
} from "@shopify/polaris";
import {
    convertSnakeString,
    convertToTitleCase,
    isPositiveFloat,
    isStringInteger
} from "../components/helper/helper";
import {useCallback, useEffect, useState} from "react";
import {CalendarIcon, SearchIcon} from "@shopify/polaris-icons";
import {startOfToday} from "date-fns";
import client from "../graphql/client";
import {CREATE_REDEEM_POINT} from "../graphql/mutation";
import {ulid} from 'ulid'

export async function loader({request, params}) {
    const {session, admin} = await authenticate.admin(request);
    const url = new URL(request.url);
    const key = url.searchParams.get('type');

    if (key) {
        url.searchParams.set('type', 'amount_discount');
    }

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

    return json({
        session: session,
        collectsResponse: responseJson.data.collections,
        shop: responseJson.data.shop,
        key: key ?? 'amount_discount',
    });
}

export async function action({request}) {

    const body = await request.json();
    console.log(body);
    try {
        const {data} = await client.mutate({
            mutation: CREATE_REDEEM_POINT,
            variables: {
                input: {
                    store_id: body.store_id,
                    id: ulid(),
                    key: body.key,
                    title: body.title,
                    pointsCost: body.pointsCost,
                    discountValue: body.discountValue,
                    programApply: body.programApply,
                    collections: body.collections,
                    prefixCode: body.prefixCode,
                    combination: body.combination,
                    minimumRequire: body.isSetMinimumRequirement === 'no_required' ? undefined : body.minimumRequire,
                    start_at: body.expiryDate.start,
                    expire_at: body.isRewardExpiry === 'set_expired' ? body.expiryDate.end : undefined,
                }
            }
        })
    } catch (error) {
        console.error(error);
    }

    return redirect(`../program/points`);

}

export default function NewReward() {
    const {key, collectsResponse, shop} = useLoaderData();
    const submit = useSubmit();
    const [lastCursor, setLastCursor] = useState(collectsResponse.edges[collectsResponse.edges.length - 1].cursor);
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const [isDataChange, setIsDataChange] = useState(false);
    const [collectOption, setCollectOption] = useState([]);
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [programName, setProgramName] = useState('');
    const [nameError, setNameError] = useState(null);
    const [pointCost, setPointCost] = useState("500");
    const [pointCostError, setPointCostError] = useState(null);
    const [discountValue, setDiscountValue] = useState("5");
    const [discountValueError, setDiscountValueError] = useState(null);
    const [programApply, setProgramApply] = useState('entire_order')
    const [selectedCollection, setSelectedCollection] = useState([]);
    const [inputCollectionValue, setInputCollectionValue] = useState('');
    const [isCollectionLoading, setIsCollectionLoading] = useState(false);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [prefixCode, setPrefixCode] = useState("");
    const [combinationCheckbox, setCombinationCheckbox] = useState({
        order: false,
        product: false,
        shipping: false,
    });
    const [minimumRequire, setMinimumRequire] = useState("5");
    const [minimumRequireError, setMinimumRequireError] = useState(null);
    const [isRewardExpiry, setIsRewardExpiry] = useState("no_expired");
    const [{month, year}, setDate] = useState({month: startOfToday().getMonth(), year: startOfToday().getFullYear()})
    const [selectedDate, setSelectedDate] = useState({
        start: startOfToday(),
        end: startOfToday(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isSetMinimumRequirement, setIsSetMinimumRequirement] = useState('no_required');

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
            // const selectedValue = selected.map((selectedItem) => {
            //     const matchedOption = collectionOptions.find((collectionOptions) => {
            //         return collectionOptions.value.match(selectedItem);
            //     });
            //     return matchedOption && matchedOption.label;
            // });

            setSelectedCollection(selected);
            // setInputCollectionValue(selectedValue[0] || '');
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
            store_id: shop.id.split('gid://shopify/Shop/')[1],
            title: programName,
            key: key,
            pointsCost: pointCost,
            discountValue: discountValue,
            programApply: programApply,
            collections: selectedCollection,
            prefixCode: prefixCode ?? undefined,
            combination: combinationCheckbox,
            isSetMinimumRequirement: isSetMinimumRequirement,
            minimumRequire: minimumRequire,
            isRewardExpiry: isRewardExpiry,
            expiryDate: selectedDate
        });
        submit(data, {replace: true, method: 'POST', encType: "application/json"})
    };

    const handlePointCostChange = useCallback((value) => {
        setPointCost(value);
        setIsDataChange(true)
    }, [],);
    const handleDiscountValueChange = useCallback((value) => {
        setDiscountValue(value);
        setIsDataChange(true)

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
            console.log(lastCursor);
            fetcher.load(`../../api/collects?limit=25&cursor=${lastCursor}`);
            const interval = setInterval(() => {
                if (fetcher.state === 'idle' && !fetcher.data) {
                    console.log(fetcher.data);
                    console.log('Fetching data...');
                }
            }, 1000)

            setTimeout(() => {
                clearInterval(interval)
                setIsCollectionLoading(false);
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [willLoadMoreResults, isCollectionLoading]);

    const removeFromSelectedCollection = (indexToRemove) => {
        const updatedCollection = [...selectedCollection];
        updatedCollection.splice(indexToRemove, 1);
        setSelectedCollection(updatedCollection);
    };

    useEffect(() => {
        if (!isCollectionLoading)
            if (fetcher.data) {
                setLastCursor(fetcher.data.collections.edges[fetcher.data.collections.edges.length - 1].cursor);
                console.log(fetcher.data);
                console.log("Success");
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
                console.log(collectOption)
            }
    }, [isCollectionLoading]);

    useEffect(() => {
        if (collectsResponse.edges.length > 0) {
            const updatedOptions = collectsResponse.edges.map(collectEdge => ({
                value: collectEdge.node.id.split('gid://shopify/Collection/')[1],
                cursor: collectEdge.cursor,
                label: collectEdge.node.title,
            }));
            setCollectOption(updatedOptions);
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

    const handleNameChange = useCallback((value) => setProgramName(value), [],);

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
                            console.log('IN');
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
                                                                suffix="$"
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
                                                    ) : (
                                                        <></>
                                                    ))}

                                            </BlockStack>
                                        </Card>
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
                                                    {
                                                        selectedCollection.map((selectedItem, index) => {
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
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Discount code
                                                </Text>
                                                <TextField
                                                    label="Add a prefix to discount code"
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
                                        {/*<Card>*/}
                                        {/*    <BlockStack gap="500">*/}
                                        {/*        <Text variant="headingMd" as="h6">*/}
                                        {/*            Status*/}
                                        {/*        </Text>*/}
                                        {/*        <RadioButton*/}
                                        {/*            label="Active"*/}
                                        {/*            id="active"*/}
                                        {/*            onChange={programStatusHandler}*/}
                                        {/*            checked={programStatus === 'active'}*/}
                                        {/*        ></RadioButton>*/}
                                        {/*        <RadioButton*/}
                                        {/*            label="Disable"*/}
                                        {/*            id="disable"*/}
                                        {/*            onChange={programStatusHandler}*/}
                                        {/*            checked={programStatus === 'disable'}*/}
                                        {/*        ></RadioButton>*/}
                                        {/*    </BlockStack>*/}
                                        {/*</Card>*/}
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
                                            {/*<Box paddingInlineStart="400">*/}
                                            {/*    {discountCode.length === 0 ? (*/}
                                            {/*        <Text variant="bodyMd" as="h6">*/}
                                            {/*            No prefix discount code set*/}
                                            {/*        </Text>*/}

                                            {/*    ) : (*/}
                                            {/*        <InlineStack wrap={false}>*/}
                                            {/*            <Text variant="headingMd" as="h5" truncate>*/}
                                            {/*                {prefixCode + discountCode}*/}
                                            {/*            </Text>*/}
                                            {/*            <Button size="micro" variant='plain' id="discountCode-button"*/}
                                            {/*                    icon={ClipboardIcon} onClick={async () => {*/}
                                            {/*                await navigator.clipboard.writeText(prefixCode + discountCode);*/}
                                            {/*            }}></Button>*/}
                                            {/*        </InlineStack>*/}
                                            {/*    )}*/}
                                            {/*</Box>*/}
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
                                                <List.Item>{parseFloat(discountValue).toFixed(2)}$ off apply
                                                    to <strong>{programApply === 'specific_collections' ? selectedCollection.length : null} {convertSnakeString(programApply)} </strong>
                                                </List.Item>
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
                                                    from <strong>{selectedDate.start === startOfToday() ? 'today' :
                                                    selectedDate.start.toDateString()}</strong> {isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? 'until ' : null}
                                                    <strong>{isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? selectedDate.end.toDateString() : null}</strong>
                                                </List.Item>
                                            </List>
                                        </BlockStack>
                                    </Card>
                                </BlockStack>
                            </Layout.Section>
                        </Layout>
                    </Page>

                </div>

            </Frame>
        </div>
    )
}

