import {Button, Page, Form} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useActionData, useSubmit} from "@remix-run/react";
import {useCallback, useEffect} from "react";
export async function loader({request}) {
    const {session} = await authenticate.admin(request);

    return json({session: session});

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
    const handleSubmit = () => {
        console.log('In');
        submit({}, {replace: true, method: 'POST'});
    }

    const submit = useSubmit();
    const actionData = useActionData();

    const discount = actionData?.discount;

    useEffect(() => {
        if(discount) {
            shopify.toast.show('Discount created');
            console.log(discount);
        }
    }, [discount]);

    return (
        <Page title="Test Place">
            <Form onSubmit={handleSubmit}>
                <Button submit>Create an discount</Button>
            </Form>

        </Page>
    )
}
