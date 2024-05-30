import {
    Badge,
    BlockStack, Box, Button,
    Card, EmptySearchResult, InlineStack,
    Page, ResourceItem, ResourceList, SkeletonBodyText, SkeletonDisplayText, SkeletonThumbnail, Text, TextField,
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {authenticate} from "../shopify.server";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import client from "../graphql/client";
import {GET_CUSTOMERS} from "../graphql/query";

const GLOBAL_QUERY_LIMIT = 8;

export async function loader({request}) {
    const {admin} = await authenticate.admin(request);
    const url = new URL(request.url);
    let sort = url.searchParams.has('sort') ? url.searchParams.get('sort') : 'points_earn';
    let limit = url.searchParams.has('limit') ? parseInt(url.searchParams.get('limit')) : GLOBAL_QUERY_LIMIT;
    let page = url.searchParams.has('page') ? parseInt(url.searchParams.get('page')) : undefined;
    let reverse = url.searchParams.has('reverse') ? url.searchParams.get('reverse') : 'false';
    if (reverse === 'false') {
        reverse = 1
    } else if (reverse === 'true') {
        reverse = -1
    } else {
        reverse = undefined;
    }
    let skip = page && limit ? limit * (page - 1) : undefined;

    const shopResponse = await admin.graphql(
        `#graphql
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
    const shopResponseJson = await shopResponse.json();
    const shop_id = shopResponseJson.data.shop.id.split('gid://shopify/Shop/')[1];

    const res = await client.query({
        query: GET_CUSTOMERS,
        variables: {
            input: {
                sort: sort,
                reverse: reverse,
                program_id: shop_id,
                limit: limit,
                skip: skip,
            }
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    });

    const query = res.data.getCustomers.customers.map(customer => `id:${customer.id}`).join(' OR ')

    const response = await admin.graphql(`
    #graphql
        query MyQuery {
             customers(first: ${GLOBAL_QUERY_LIMIT}, query: "${query}") {
                edges {
                  node {
                    id
                    email
                    displayName
                    lastName
                    firstName
                    state
                    image {
                      url
                      src
                      altText
                    }
                  }
                }
              }
        }
    `);
    const responseJson = await response.json();
    const shopifyMap = new Map(responseJson.data.customers.edges.map(item => [item.node.id, item.node]));
    const customerData = res.data.getCustomers.customers.map(item1 => {
        const item2 = shopifyMap.get(`gid://shopify/Customer/${item1.id}`);
        return item2 ? {...item1, ...item2} : item1;
    });

    return json({
        shopDomain: shopResponseJson.data.shop.myshopifyDomain.split('.myshopify.com')[0],
        data: customerData,
        page_info: res.data.getCustomers.pageInfo
    });
}

export default function CustomerPage() {
    const {data, page_info, shopDomain} = useLoaderData();
    const fetcher = useFetcher();
    const [customerData, setCustomerData] = useState(data);
    const [pageInfo, setPageInfo] = useState(page_info);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(true);
    const [sortValue, setSortValue] = useState('points_balance-ASC');
    const [queryValue, setQueryValue] = useState('');
    const sortValueChangeHandler = useCallback((newValue) => {
        setSortValue(newValue);
        const sort = newValue.split('-');
        const reverse = sort[1] === 'DESC';
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${page}`)
        setIsFetching(true);

    }, []);

    const handleNextPage = () => {
        const sort = sortValue.split('-');
        const reverse = sort[1] === 'DESC';
        const newPage = page + 1
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${newPage}`)
        setIsFetching(true);
        setPage((prevState) => {
            return (prevState + 1)
        })
    }

    const handlePreviousPage = () => {
        const sort = sortValue.split('-');
        const reverse = sort[1] === 'DESC';
        const newPage = page - 1
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${newPage}`)
        setIsFetching(true);
        setPage((prevState) => {
            return (prevState - 1)
        })
    }

    useEffect(() => {
        if (fetcher.data) {
            console.log('fetcher data: ', fetcher.data);
            if (fetcher.data.data) {
                setCustomerData(fetcher.data.data);
            }
            if (fetcher.data.page_info) {
                setPageInfo(fetcher.data.page_info);
            }
            setIsFetching(false);
        }
    }, [fetcher.data])

    useEffect(() => {
        if (!customerData || customerData.length > 0) {
            setIsFetching(false)
        }
    }, [customerData]);


    const emptyStateMarkup =
        <EmptySearchResult
            title={'No customers yet'}
            description={'Try changing the filters or search term'}
            withIllustration
        />

    const fetchStateMarkup = <InlineStack gap="200" align='left'>
        <Box style={{
            width: '100%'
        }}>
            <InlineStack gap="200" align='center'>
                <Box width="10%">
                    <SkeletonThumbnail/>
                </Box>
                <Box width='75%' paddingBlock='200'>
                    <SkeletonBodyText/>
                </Box>
                <Box width="10%" paddingBlock='400'>
                    <SkeletonDisplayText/>
                </Box>
            </InlineStack>
        </Box>
    </InlineStack>

    return (
        <Page title="Customer">
            <Card>
                <BlockStack gap="100">
                    <TextField
                        label="Search"
                        autoComplete="off"
                    >
                    </TextField>
                    {isFetching ?
                        <BlockStack gap="200">
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                        </BlockStack>
                        :
                        <ResourceList
                            emptyState={emptyStateMarkup}
                            items={customerData}
                            showHeader={true}
                            sortValue={sortValue}
                            sortOptions={[
                                {label: 'Most Points', value: 'points_balance-DESC'},
                                {label: 'Less Points', value: 'points_balance-ASC'},
                                {label: 'Most Points Earn', value: 'points_earn-DESC'},
                                {label: 'Less Points Earn', value: 'points_earn-ASC'},
                            ]}
                            onSortChange={sortValueChangeHandler}
                            pagination={{
                                hasNext: pageInfo.hasNextPage,
                                hasPrevious: pageInfo.hasPreviousPage,
                                type: 'table',
                                label: `${page}`,
                                onNext: handleNextPage,
                                onPrevious: handlePreviousPage,
                            }}
                            renderItem={(item) => {
                                const media = <img style={{
                                    width: "32px", height: "32px"
                                }} src={item.image.src} alt={item.image.altText}/>;
                                return (
                                    <InlineStack gap="200" align='left'>
                                        <Box style={{
                                            width: '80%'
                                        }}>
                                            <ResourceItem
                                                id={item.id}
                                                url="#"
                                                media={media}
                                                accessibilityLabel={`View details for ${item.displayName}`}
                                            >
                                                <InlineStack gap="200" align='center'>
                                                    <Box width="30%">
                                                        <Text variant="bodyMd" fontWeight="bold" as="h6" truncate>
                                                            {item.displayName}
                                                        </Text>
                                                        <Text as="h6" variant="bodyMd" truncate>
                                                            {item.email}
                                                        </Text>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <InlineStack align='center'>
                                                            {item.state === 'DISABLED' ?
                                                                <Badge tone="info">Guest</Badge> :
                                                                item.state === 'ENABLED' ?
                                                                    <Badge tone="success">Member</Badge> :
                                                                    <Badge tone="critical">Unknown</Badge>
                                                            }
                                                        </InlineStack>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <Text as="h6" variant="bodyMd" alignment="center">
                                                            {item.points_balance} Points
                                                        </Text>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <Text as="h6" variant="bodyMd" alignment="center">
                                                            {item.points_earn} Points
                                                        </Text>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <Text as="h6" variant="bodyMd" alignment="center">
                                                            {item.points_spent} Points
                                                        </Text>
                                                    </Box>
                                                </InlineStack>
                                            </ResourceItem>
                                        </Box>
                                        <Box width="15%" paddingBlock='400'>
                                            <InlineStack align='center'>
                                                <a href={`https://admin.shopify.com/store/${shopDomain}/customers/${item.id.split(`gid://shopify/Customer/`)[1]}`} target="_blank" rel="noopener noreferrer">
                                                    <Button >View on Shopify</Button>
                                                </a>
                                            </InlineStack>
                                        </Box>
                                    </InlineStack>
                                )
                            }}
                        >
                        </ResourceList>
                    }
                </BlockStack>
            </Card>
        </Page>
    )
}
