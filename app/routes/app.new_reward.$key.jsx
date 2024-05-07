import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {Form, useFetcher, useLoaderData, useSubmit} from "@remix-run/react";
import {
    Autocomplete,
    BlockStack,
    Card, Checkbox, ContextualSaveBar, DatePicker, Frame,
    Icon,
    InlineGrid,
    Page,
    RadioButton,
    Text,
    TextField
} from "@shopify/polaris";
import {convertToTitleCase, generateRandomString} from "../components/helper/helper";
import {useCallback, useEffect, useState} from "react";
import {SearchIcon} from "@shopify/polaris-icons";
import {addDays, startOfToday} from "date-fns";

export async function loader({request, params}) {
    const {session, admin} = await authenticate.admin(request);

    const response = await admin.graphql(`
        #graphql
            query MyQuery {
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
        key: params.key,
    });
}

export async function action({request}) {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(`
    #graphql
        mutation MyMutation {
          discountCodeBasicCreate(
            basicCodeDiscount: {
                appliesOncePerCustomer: true,
                code: "absdmekqwa-code",
                combinesWith: {
                    shippingDiscounts: true,
                    productDiscounts: false,
                    orderDiscounts: false
                },
                customerGets: {
                    appliesOnOneTimePurchase: true,
                    value: {
                        discountAmount: {
                            amount: "5",
                            appliesOnEachItem: false
                        }
                    },
                    items: {
                        all: true
                    }
                },
                customerSelection: {
                    all: true
                },
                minimumRequirement: {
                    subtotal: {
                        greaterThanOrEqualToSubtotal: "10"
                    }
                },
                title: "Test discount",
                usageLimit: 1,
                startsAt: "2024-04-10T16:00:00.000Z"
            }
          ) {
            codeDiscountNode {
              codeDiscount {
                ... on DiscountCodeBasic {
                  endsAt
                  appliesOncePerCustomer
                  asyncUsageCount
                  createdAt
                  discountClass
                  hasTimelineComment
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      __typename
                      greaterThanOrEqualToSubtotal {
                        amount
                      }
                    }
                  }
                  shortSummary
                  startsAt
                  status
                  summary
                  title
                  updatedAt
                  usageLimit
                }
              }
              id
            }
            userErrors {
              code
              extraInfo
              field
              message
            }
          }
        }
    `);
    const responseJson = await response.json();
    return json ({
        discount: responseJson.data.discountCodeBasicCreate.codeDiscountNode,
    })
}

export default function NewReward() {
    const {key, collectsResponse} = useLoaderData();
    const submit = useSubmit();
    const [lastCursor, setLastCursor] = useState(collectsResponse.edges[collectsResponse.edges.length - 1].cursor);
    const fetcher = useFetcher();
    const [isDataChange, setIsDataChange] = useState(false);
    const [collectOption, setCollectOption] = useState([]);
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [programName, setProgramName] = useState('');
    const [nameError, setNameError] = useState(null);
    const [pointCost, setPointCost] = useState(500);
    const [pointCostError, setPointCostError] = useState(null);
    const [discountValue, setDiscountValue] = useState(5);
    const [discountValueError, setDiscountValueError] = useState(null);
    const [programApply, setProgramApply] = useState('entire_order')
    const [selectedCollection, setSelectedCollection] = useState([]);
    const [inputCollectionValue, setInputCollectionValue] = useState('');
    const [isCollectionLoading, setIsCollectionLoading] = useState(false);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [prefixCode, setPrefixCode] = useState("");
    const [combinationCheckbox, setCombinationCheckbox] = useState([false, false, false]);
    const [minimumRequire, setMinimumRequire] = useState(5);
    const [minimumRequireError, setMinimumRequireError] = useState(null);
    const [isRewardExpiry, setIsRewardExpiry] = useState("no_expired");
    const [{month, year}, setDate] = useState({month: startOfToday().getMonth(), year: startOfToday().getFullYear()})
    const [selectedDate, setSelectedDate] = useState({
        start: startOfToday(),
        end: addDays(startOfToday(), 3),
    });

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
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = collectionOptions.find((collectionOptions) => {
                    return collectionOptions.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });

            setSelectedCollection(selected);
            setInputCollectionValue(selectedValue[0] || '');
        },
        [collectionOptions],
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
        submit({
            name: programName,
            pointCost: pointCost,
            discountValue: discountValue,
            programApply: programApply,
            selectedCollection: selectedCollection,
            code: generateRandomString(12, prefixCode),
            combination: combinationCheckbox,
            minimumRequire: minimumRequire,
            expiryDate: selectedDate,
        }, {replace: true, method: 'POST'})
    };

    const handlePointCostChange = useCallback((value) => {
        setPointCost(Number(value));
        setIsDataChange(true)
    }, [],);
    const handleDiscountValueChange = useCallback((value) => {
        setDiscountValue(Number(value));
        setIsDataChange(true)
    }, [],);
    const handleMinimumRequireChange = useCallback((value) => {
        setMinimumRequire(Number(value));
        setIsDataChange(true)
    }, [],);
    const handlePrefixDiscountChange = useCallback((value) => {
        setPrefixCode(value);
        setIsDataChange(true)
    }, [],);
    const handleCombinationCheckboxChange = useCallback((newChecked, id) => setCombinationCheckbox((prevState) => {
            const newState = [...prevState];
            newState[Number(id)] = !newState[Number(id)];
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

    useEffect(() => {
        if (!isCollectionLoading)
            if (fetcher.data) {
                setLastCursor(fetcher.data.collections.edges[fetcher.data.collections.edges.length - 1].cursor);
                console.log(fetcher.data);
                console.log("Success");
                const updatedOptions = fetcher.data.collections.edges.map(collectEdge => ({
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
                value: collectEdge.node.id,
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
        if (!Number.isInteger(pointCost) || pointCost <= 0) {
            setPointCostError('Point must be a number')

        } else {
            setPointCostError(null);
        }
    }, [pointCost])

    useEffect(() => {
        if (!Number.isInteger(discountValue) || discountValue <= 0) {
            setDiscountValueError('Discount value must be a number')

        } else {
            setDiscountValueError(null);
        }
    }, [discountValue])

    useEffect(() => {
        if (!Number.isInteger(minimumRequire) || minimumRequire <= 0) {
            setMinimumRequireError('Minimum purchase must be a number')

        } else {
            setMinimumRequireError(null);
        }
    }, [minimumRequire])

    const handleNameChange = useCallback((value) => setProgramName(value), [],);

    return (
        <div>
            <Frame>
            {isDataChange ? (

                    <ContextualSaveBar
                        message="Unsaved changes"
                        saveAction={{
                            onAction:  {handleSubmit},
                            loading: false,
                            disabled: false,
                        }}
                        discardAction={{
                            onAction: () => {setIsDataChange(false)},
                        }}
                    ></ContextualSaveBar>

            ) : (
                <></>
            )}
            <Form onSubmit={handleSubmit}>
                <Page
                    title={convertToTitleCase(key)}
                    backAction={{content: "Points", url: "../point_program"}}
                >
                    {key === 'amount_discount' ? (
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
                                        placeholder="Example: Program Name"
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
                                            type="number"
                                            error={discountValueError}
                                            prefix="$"
                                        >
                                        </TextField>
                                    </InlineGrid>
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
                                        id='specific_collection'
                                        onChange={handleProgramApplyChange}
                                        checked={programApply === 'specific_collection'}
                                    >

                                    </RadioButton>
                                    {programApply === 'specific_collection' ? (
                                        <Autocomplete
                                            options={collectionOptions}
                                            selected={selectedCollection}
                                            textField={textField}
                                            onSelect={updateSelection}
                                            willLoadMoreResults={willLoadMoreResults}
                                            onLoadMoreResults={handleLoadMoreResults}
                                            loading={isCollectionLoading}
                                        >

                                        </Autocomplete>
                                    ) : (<></>)
                                    }
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="500">
                                    <Text variant="headingMd" as="h6">
                                        Discount code prefix
                                    </Text>
                                    <Text variant="bodyMd" as="h6">
                                        Add a prefix to discount code
                                    </Text>
                                    <TextField
                                        label="Prefix"
                                        labelHidden autoComplete="off"
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
                                    <Checkbox
                                        id="0"
                                        label="Shipping Discount"
                                        checked={combinationCheckbox[0]}
                                        onChange={handleCombinationCheckboxChange}
                                    >

                                    </Checkbox>
                                    <Checkbox
                                        id="1"
                                        label="Order Discount"
                                        checked={combinationCheckbox[1]}
                                        onChange={handleCombinationCheckboxChange}
                                    >

                                    </Checkbox>
                                    <Checkbox
                                        id="2"
                                        label="Product Discount"
                                        checked={combinationCheckbox[2]}
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
                                    <TextField
                                        label="Minium"
                                        labelHidden
                                        autoComplete="off"
                                        value={minimumRequire}
                                        onChange={handleMinimumRequireChange}
                                        type="Number"
                                        error={minimumRequireError}
                                        prefix="$"
                                    ></TextField>
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="500">
                                    <Text variant="headingMd" as="h6">
                                        Reward expiry
                                    </Text>
                                    <RadioButton
                                        label="No expired"
                                        id="no_expired"
                                        checked={isRewardExpiry === 'no_expired'}
                                        onChange={handleIsRewardExpiryChange}>

                                    </RadioButton>
                                    <RadioButton
                                        label="Set reward expiry"
                                        id="set_expired"
                                        checked={isRewardExpiry === 'set_expired'}
                                        onChange={handleIsRewardExpiryChange}>

                                    </RadioButton>
                                    {isRewardExpiry === 'set_expired' ? (
                                        <DatePicker
                                            month={month}
                                            year={year}
                                            onChange={setSelectedDate}
                                            onMonthChange={handleMonthChange}
                                            selected={selectedDate}
                                            allowRange
                                        >
                                        </DatePicker>

                                    ) : (
                                        <></>
                                    )}
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    ) : (
                        <></>
                    )}
                </Page>
            </Form>
            </Frame>
        </div>
    )
}

