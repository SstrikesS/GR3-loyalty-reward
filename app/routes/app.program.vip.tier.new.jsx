import {BlockStack, Card, Checkbox, ContextualSaveBar, Frame, Layout, Page, Text, TextField} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {Form, useNavigate} from "@remix-run/react";

export default function AddNewTier() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);

    const [tierName, setTierName] = useState("");
    const [nameError, setNameError] = useState(null);

    const handleNameChange = useCallback((value) => {
        setTierName(value)
        setIsDataChange(true)
    }, [],);


    useEffect(() => {
        if (tierName.length === 0) {
            setNameError('Tier Name cannot be empty')
        } else {
            setNameError(null);
        }
    }, [tierName])


    const handleSubmit = async () => {


    }

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
                        title="VIP Tier"
                        backAction={{content: "Points", url: "../program/points"}}
                    >
                        <Layout>
                            <Layout.Section variant="oneHalf">
                                <Form onSubmit={handleSubmit}>
                                    <BlockStack gap="500">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Tier Name
                                                </Text>
                                                <TextField
                                                    value={tierName}
                                                    onChange={handleNameChange}
                                                    error={nameError}
                                                    placeholder={`Example: Gold`}
                                                    autoComplete="off"
                                                    label="">
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Milestone to achieve tier
                                                </Text>
                                                <Checkbox label=""></Checkbox>

                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Form>
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>

        </div>

)


}
