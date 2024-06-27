import {
    Button,
    Form,
    DropZone,
    Thumbnail, Text, BlockStack
} from "@shopify/polaris";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useSubmit} from "@remix-run/react";
import {useCallback, useState} from "react";

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
    const {admin} = await authenticate.admin(request);
    const response = await admin.graphql(`
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
        }`)

    const shopData = await response.json();

    const createAppDataMetafieldMutation = await admin.graphql(
        `#graphql
          mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafieldsSetInput) {
              metafields {
                id
                namespace
                key
                value
                createdAt
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
            variables: {
                "metafieldsSetInput": [
                    {
                        "namespace": "customer.test_namespace",
                        "key": "test_api_key_1",
                        "type": "single_line_text_field",
                        "value": "aS1hbS1hLXNlY3JldC1hcGkta2V5Cg==",
                        "ownerId": shopData.data.shop.id
                    }
                ]
            }
        }
    );
    return json({
        success: true,
    })
}

export default function AppTests() {
    const submit = useSubmit();
    const [image, setImage] = useState(null);
    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('image', image);

        submit(formData, {replace: true, method: 'POST', encType: "multipart/form-data"})
    }

    const handleDropZoneChange = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => setImage(acceptedFiles[0]),
        [],);

    return (
        <Form onSubmit={handleSubmit}>
            <Thumbnail
                source={window.location.protocol + "//" + window.location.host + "/uploads/bronze-medal.png"}
                alt=""
            />
            <DropZone
                accept="image/*"
                type="image"
                allowMultiple={false}
                onDrop={handleDropZoneChange}
            >
                {image ? (
                    <BlockStack gap="500">
                        <Thumbnail
                            source={window.URL.createObjectURL(image)}
                            alt={image.alt}
                            size="small"
                        />
                        <div>
                            {image.name}
                            <Text variant="bodySm" as="p">
                                {image.size} bytes
                            </Text>
                        </div>
                    </BlockStack>
                ) : null}
                {image ? null : <DropZone.FileUpload/>}
            </DropZone>
            <Button onClick={handleSubmit}>Test</Button>
        </Form>
    )
}
