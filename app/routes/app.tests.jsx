import {Button, Page, Form, Tag, Combobox, Icon, Listbox, TextContainer, LegacyStack} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useActionData, useLoaderData, useSubmit} from "@remix-run/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {SearchIcon} from "@shopify/polaris-icons";
export async function loader({request}) {
    const {session, admin} = await authenticate.admin(request);

    const response = await admin.graphql(`
    #graphql
        query {
          customers(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
    `)

    const data = await response.json();

    return json({session: session, data: data});

}

export async function action({request}) {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(`
    #graphql
        mutation MyMutation {
          discountCodeBasicCreate(
            basicCodeDiscount: {appliesOncePerCustomer: true, code: "absdmekqwa-code", combinesWith: {shippingDiscounts: true, productDiscounts: false, orderDiscounts: false}, customerGets: {appliesOnOneTimePurchase: true, value: {discountAmount: {amount: "5", appliesOnEachItem: false}}, items: {all: true}}, customerSelection: {all: true}, minimumRequirement: {subtotal: {greaterThanOrEqualToSubtotal: "10"}}, title: "Test discount", usageLimit: 1, startsAt: "2024-04-10T16:00:00.000Z"}
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
export default function AppTests() {
    const {data} = useLoaderData();
    console.log(data);
    // const handleSubmit = () => {
    //     console.log('In');
    //     submit({}, {replace: true, method: 'POST'});
    // }
    //
    // const submit = useSubmit();
    // const actionData = useActionData();
    //
    // const discount = actionData?.discount;
    //
    // useEffect(() => {
    //     if(discount) {
    //         shopify.toast.show('Discount created');
    //         console.log(discount);
    //     }
    // }, [discount]);
    //
    // return (
    //     <Page title="Test Place">
    //         <Form onSubmit={handleSubmit}>
    //             <Button submit>Create an discount</Button>
    //         </Form>
    //
    //     </Page>
    // )
    const deselectedOptions = useMemo(
        () => [
            {value: 'rustic', label: 'Rustic'},
            {value: 'antique', label: 'Antique'},
            {value: 'vinyl', label: 'Vinyl'},
            {value: 'vintage', label: 'Vintage'},
            {value: 'refurbished', label: 'Refurbished'},
        ],
        [],
    );

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputCollectionValue, setInputCollectionValue] = useState('');
    const [options, setOptions] = useState(deselectedOptions);

    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    const updateText = useCallback(
        (value) => {
            setInputCollectionValue(value);

            if (value === '') {
                setOptions(deselectedOptions);
                return;
            }

            const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');
            const resultOptions = deselectedOptions.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptions(resultOptions);
        },
        [deselectedOptions, escapeSpecialRegExCharacters],
    );

    const updateSelection = useCallback(
        (selected) => {
            if (selectedOptions.includes(selected)) {
                setSelectedOptions(
                    selectedOptions.filter((option) => option !== selected),
                );
            } else {
                setSelectedOptions([...selectedOptions, selected]);
            }

            updateText('');
        },
        [selectedOptions, updateText],
    );

    const removeTag = useCallback(
        (tag) => () => {
            const options = [...selectedOptions];
            options.splice(options.indexOf(tag), 1);
            setSelectedOptions(options);
        },
        [selectedOptions],
    );

    const tagsMarkup = selectedOptions.map((option) => (
        <Tag key={`option-${option}`} onRemove={removeTag(option)}>
            {option}
        </Tag>
    ));

    const optionsMarkup =
        options.length > 0
            ? options.map((option) => {
                const {label, value} = option;

                return (
                    <Listbox.Option
                        key={`${value}`}
                        value={value}
                        selected={selectedOptions.includes(value)}
                        accessibilityLabel={label}
                    >
                        {label}
                    </Listbox.Option>
                );
            })
            : null;

    return (
        <div style={{height: '225px'}}>
            <Combobox
                allowMultiple
                activator={
                    <Combobox.TextField
                        prefix={<Icon source={SearchIcon} />}
                        onChange={updateText}
                        label="Search tags"
                        labelHidden
                        value={inputCollectionValue}
                        placeholder="Search tags"
                        autoComplete="off"
                    />
                }
            >
                {optionsMarkup ? (
                    <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
                ) : null}
            </Combobox>
            <TextContainer>
                <LegacyStack>{tagsMarkup}</LegacyStack>
            </TextContainer>
        </div>
    );
}
