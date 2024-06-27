import {
    BlockStack,
    Card,
    Checkbox,
    ContextualSaveBar,
    DropZone,
    Frame,
    Layout,
    Page,
    Text,
    TextField, Thumbnail
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {isStringInteger, isUnsignedFloat} from "../components/helper/helper";
import {authenticate} from "../shopify.server";
import client from "../graphql/client";
import {GET_VIP_PROGRAM, GET_VIP_TIER, GET_VIP_TIERS} from "../graphql/query";
import {parseISO} from "date-fns";
import {json} from "@remix-run/node";
import {CREATE_NEW_TIER, UPDATE_VIP_TIER} from "../graphql/mutation";
import {ulid} from "ulid";
import path from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {NewVipTierCreateHandler, UpdateVipTierHandler} from "../utils/EventTriggerHandler";

export async function loader({request, params}) {
    const {admin} = await authenticate.admin(request);
    const id = params.id;
    let tierData = null;
    const shopData = await admin.graphql(`
        #query
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
    `)

    const shopDataJson = await shopData.json();

    if (id && id !== "new") {
        tierData = await client.query({
            query: GET_VIP_TIER,
            variables: {
                input: {
                    id: id,
                    program_id: shopDataJson.data.shop.id.split('gid://shopify/Shop/')[1],
                }
            },
            fetchPolicy: 'no-cache'
        });

    }

    const tierList = await client.query({
        query: GET_VIP_TIERS,
        variables: {
            input: {
                program_id: shopDataJson.data.shop.id.split('gid://shopify/Shop/')[1],
            }
        },
        fetchPolicy: 'no-cache'
    });

    const response = await client.query({
        query: GET_VIP_PROGRAM,
        variables: {
            input: {
                id: shopDataJson.data.shop.id.split('gid://shopify/Shop/')[1],
            }
        },
        fetchPolicy: 'no-cache'
    });

    return json({
        vipProgram: response.data.getVipProgram,
        tierData: tierData?.data.getVipTier ?? undefined,
        tierList: tierList?.data.getVipTiers,
    });
}

export async function action({request}) {
    const method = request.method;
    const formData = await request.formData();
    const icon = formData.get('icon');
    const id = ulid();
    let fileName = '';
    if (icon && icon instanceof File) {
        const arrayBuffer = await icon.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const publicDir = path.join(process.cwd(), 'public', 'uploads');
        fileName = `${id}${path.extname(icon.name)}`
        const filePath = path.join(publicDir, fileName);

        try {
            await mkdir(publicDir, {recursive: true});
            await writeFile(filePath, buffer);

        } catch (error) {
            console.log('Error: ', error);

            return json({
                success: false,
                message: 'Error'
            })
        }
    }

    if (method === "POST" && fileName.length > 0) {
        const response = await client.mutate({
            mutation: CREATE_NEW_TIER,
            variables: {
                input: {
                    program_id: formData.get('program_id'),
                    id: id,
                    name: formData.get('name'),
                    icon: `/uploads/${fileName}`,
                    milestone_requirement: formData.get('milestone_requirement'),
                    reward: formData.get('reward_type') ? {
                        reward_type: formData.get('reward_type'),
                        points: formData.get('reward_points'),
                        reward_id: undefined,
                    } : undefined,
                    previousTier: formData.get('previousTier') ?? null,
                    nextTier: formData.get('nextTier') ?? null,
                    perks: formData.get('perks') ?? undefined,
                    status: true,
                }
            }
        });
        if (response.data.createNewTier) {
            NewVipTierCreateHandler(id, formData.get('program_id'), formData.get('previousTier') ?? null, formData.get('nextTier') ?? null).then((r) => {
                console.log(`Update tier ${formData.get('previousTier')} and ${formData.get('nextTier')} successfully!`)
            })

            return json({
                success: true,
            })
        } else {
            return json({
                success: false,
                message: 'MongoDB error'
            })
        }
    } else if (method === "PUT") {
        const response = await client.mutate({
            mutation: UPDATE_VIP_TIER,
            variables: {
                input: {
                    program_id: formData.get('program_id'),
                    id: formData.get('id'),
                    name: formData.get('name') ?? undefined,
                    icon: fileName.length > 0 ? `/uploads/${fileName}` : undefined,
                    milestone_requirement: formData.get('milestone_requirement') ?? undefined,
                    reward: formData.get('reward_type') ? {
                        reward_type: formData.get('reward_type'),
                        points: formData.get('reward_points'),
                        reward_id: undefined,
                    } : undefined,
                    previousTier: formData.get('previousTier') ?? null,
                    nextTier: formData.get('nextTier') ?? null,
                    perks: formData.get('perks') ?? undefined,
                }
            }
        });

        if (response.data.updateVipTier) {

            UpdateVipTierHandler(formData.get('id'), formData.get('program_id'), formData.get('oldPreviousTier') ?? null, formData.get('oldNextTier') ?? null,formData.get('previousTier') ?? null, formData.get('nextTier') ?? null).then((r) => {
                console.log(`Update tier ${formData.get('previousTier')}, ${formData.get('nextTier')}, ${formData.get('oldPreviousTier')} and ${formData.get('oldNextTier')} successfully!`)
            })
            return json({
                success: true,
            })
        } else {
            return json({
                success: false,
                message: 'Error: MongoDB error'
            })
        }
    } else {

        return json({
            success: false,
            message: 'Error: Invalid image files'
        })
    }

}


export default function AddNewTier() {
    const {vipProgram, tierData, tierList} = useLoaderData();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);

    const [tierName, setTierName] = useState(tierData ? tierData.name : "");
    const [nameError, setNameError] = useState(null);

    const [milestoneRequire, setMilestoneRequire] = useState(tierData ? tierData.milestone_requirement : "0");
    const [milestoneRequireError, setMilestoneRequireError] = useState(null);

    const [tierIcon, setTierIcon] = useState(null);

    const [tierIconLink, setTierIconLink] = useState("");
    const [nextTier, setNextTier] = useState(null);
    const [previousTier, setPreviousTier] = useState(null);


    const [milestoneRewardCheckbox, setMilestoneRewardCheckbox] = useState({
        add_points: true,
        add_discounts: false
    });

    const [milestoneRewardPoints, setMilestoneRewardPoints] = useState("0");
    const [milestoneRewardPointsError, setMilestoneRewardPointsError] = useState(null);

    const [milestonePerk, setMilestonePerk] = useState("0");
    const [milestonePerkError, setMilestonePerkError] = useState(null);

    const handleNameChange = useCallback((value) => {
        setTierName(value)
        setIsDataChange(true)
    }, [],);

    const handleMilestoneRequireChange = useCallback((value) => {
        setMilestoneRequire(value);
        setIsDataChange(true);
    }, []);

    const handleMilestoneCheckboxChange = useCallback((newCheck, id) => {
        setMilestoneRewardCheckbox(((prevState) => {
            const newState = {...prevState};
            newState[id] = !newState[id];
            return newState;
        }));
        setIsDataChange(true);
    }, []);

    const handleMilestoneRewardPointsChange = useCallback((value) => {
        setMilestoneRewardPoints(value);
        setIsDataChange(true);
    }, [])

    const handleMilestonePerkChange = useCallback((value) => {
        setMilestonePerk(value);
        setIsDataChange(true);
    }, [])

    const handleDropZoneChange = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setTierIcon(acceptedFiles[0]);
            setIsDataChange(true);
        },
        [],);

    useEffect(() => {
        if (tierData) {
            setTierIconLink(tierData.icon);
            if (tierData.reward.length > 0) {
                setMilestoneRewardCheckbox({
                    add_points: true,
                    add_discounts: false,
                });
                setMilestoneRewardPoints(tierData.reward[0].points)
            }
            setMilestonePerk(tierData.perks);
        }
    }, []);

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                if (tierData) {
                    shopify.toast.show('Update vip tier successfully');
                    setIsSubmitting(false);
                } else {
                    shopify.toast.show('Create new tier successfully');
                    setTimeout(() => {
                        navigate('../program/vips');
                    }, 500);
                }
            } else {
                if (tierData) {
                    shopify.toast.show('Failed to update vip tier');
                } else {
                    shopify.toast.show('Failed to create new tier');
                }
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    useEffect(() => {
        if (!isStringInteger(milestoneRequire)) {
            setMilestoneRequireError(`Points must be a number`)
        } else {
            setMilestoneRequireError(null);
            findTierIndex(parseInt(milestoneRequire), tierList);
        }

    }, [milestoneRequire]);

    useEffect(() => {
        if (!isUnsignedFloat(milestonePerk)) {
            setMilestonePerkError('Value must be a number');
        } else if (parseFloat(milestonePerk) > 100) {
            setMilestonePerkError('Value can\'t be greater than 100');
        } else {
            setMilestonePerkError(null);
        }
    }, [milestonePerk]);

    useEffect(() => {
        if (!isStringInteger(milestoneRewardPoints) && milestoneRewardCheckbox.add_points) {
            setMilestoneRewardPointsError('Points must be a number');
        } else {
            setMilestoneRewardPointsError(null);
        }
    }, [milestoneRewardPoints, milestoneRewardCheckbox.add_points])

    useEffect(() => {
        if (tierName.length === 0) {
            setNameError('Tier Name cannot be empty')
        } else {
            setNameError(null);
        }
    }, [tierName])


    const handleSubmit = async () => {
        if (nameError || milestoneRequireError || milestoneRewardPointsError || milestonePerkError) {

            shopify.toast.show("Invalid Input!");
            setIsSubmitting(false);
        } else {
            if (!tierIcon && tierIconLink.length === 0) {
                shopify.toast.show("Tier image is not found");
                setIsSubmitting(false);
            } else {
                const formData = new FormData();
                formData.append('program_id', vipProgram.id)
                formData.append('name', tierName);
                if (tierIcon) {
                    formData.append('icon', tierIcon);
                }
                formData.append('milestone_requirement', milestoneRequire);
                if (milestoneRewardCheckbox.add_points) {
                    formData.append('reward_type', 'add_points');
                    formData.append('reward_points', milestoneRewardPoints);
                }
                formData.append('perks', milestonePerk);
                if(previousTier) {
                    formData.append('previousTier', previousTier.id)
                }
                if(nextTier) {
                    formData.append('nextTier', nextTier.id);
                }
                if (tierData) {
                    formData.append('id', tierData.id);
                    formData.append('oldPreviousTier', tierData.previousTier);
                    formData.append('oldNextTier', tierData.nextTier);
                    submit(formData, {replace: true, method: "PUT", encType: "multipart/form-data"});
                } else {
                    submit(formData, {replace: true, method: "POST", encType: "multipart/form-data"});
                }
            }
        }
    }

    const findTierIndex = (milestone_requirement, tiers) => {

        if (milestone_requirement < parseInt(tiers[0].milestone_requirement)) {

            setPreviousTier(null);
            setNextTier({
                id: tiers[0].id,
                name: tiers[0].name,
                milestone_requirement: tiers[0].milestone_requirement,
            });

            return null;
        }
        for (let i = 0; i < tiers.length; i++) {

            if (milestone_requirement < parseInt(tiers[i].milestone_requirement)) {
                if (tiers[i - 1].id === tierData?.id) {
                    if (tierData?.previousTier) {
                        setPreviousTier({
                            id: tiers[i - 2].id,
                            name: tiers[i - 2].name,
                            milestone_requirement: tiers[i - 2].milestone_requirement,
                        });
                    } else {
                        setPreviousTier(null);
                    }
                } else {
                    setPreviousTier({
                        id: tiers[i - 1].id,
                        name: tiers[i - 1].name,
                        milestone_requirement: tiers[i - 1].milestone_requirement,
                    });
                }

                if (tiers[i].id === tierData?.id) {
                    if (tierData?.nextTier) {
                        setNextTier({
                            id: tiers[i + 1].id,
                            name: tiers[i + 1].name,
                            milestone_requirement: tiers[i].milestone_requirement,
                        })
                    } else {
                        setNextTier(null);
                    }
                } else {
                    setNextTier({
                        id: tiers[i].id,
                        name: tiers[i].name,
                        milestone_requirement: tiers[i].milestone_requirement,
                    })
                }


                return null;
            } else if (milestone_requirement === parseInt(tiers[i].milestone_requirement)) {
                if (milestone_requirement === parseInt(tierData?.milestone_requirement)) {
                    setMilestoneRequireError(null);
                } else {
                    setMilestoneRequireError(`This requirement points has been set to tier ${tiers[i].name}`);
                }


                if (tiers[i].previousTier) {
                    if (tiers[i].previousTier === tierData?.id) {
                        if (tiers[i - 1].previousTier) {
                            setPreviousTier({
                                id: tiers[i - 2].id,
                                name: tiers[i - 2].name,
                                milestone_requirement: tiers[i - 2].milestone_requirement,
                            });
                        } else {
                            setPreviousTier(null);
                        }

                    } else {
                        setPreviousTier({
                            id: tiers[i - 1].id,
                            name: tiers[i - 1].name,
                            milestone_requirement: tiers[i - 1].milestone_requirement,
                        });
                    }

                } else {
                    setPreviousTier(null);
                }

                if (tiers[i].nextTier) {
                    if (tiers[i].nextTier === tierData?.id) {
                        if (tiers[i + 1].nextTier) {
                            setNextTier({
                                id: tiers[i + 2].id,
                                name: tiers[i + 2].name,
                                milestone_requirement: tiers[i + 2].milestone_requirement,
                            });
                        } else {
                            setNextTier(null);
                        }
                    } else {
                        setNextTier({
                            id: tiers[i + 1].id,
                            name: tiers[i + 1].name,
                            milestone_requirement: tiers[i + 1].milestone_requirement,
                        });
                    }

                } else {
                    setNextTier(null);
                }

                return null;
            }
        }
        if(tiers[tiers.length - 1].id === tierData?.id) {
            if(tiers[tiers.length - 1].previousTier) {
                setPreviousTier({
                    id: tiers[tiers.length - 2].id,
                    name: tiers[tiers.length - 2].name,
                    milestone_requirement: tiers[tiers.length - 2].milestone_requirement,
                });
                setNextTier(null);
            } else {
                setPreviousTier(null);
                setNextTier(null);
            }
        } else {
            setPreviousTier({
                id: tiers[tiers.length - 1].id,
                name: tiers[tiers.length - 1].name,
                milestone_requirement: tiers[tiers.length - 1].milestone_requirement,
            });
            setNextTier(null);
        }


        return null;
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
                            navigate("../program/vips");
                        },
                    }}
                ></ContextualSaveBar>
                <div style={{marginTop: "55px"}}>
                    <Page
                        title="VIP Tier"
                        backAction={{content: "Points", url: "../program/vips"}}
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
                                                    Icon
                                                </Text>
                                                <DropZone
                                                    accept="image/*"
                                                    type="image"
                                                    allowMultiple={false}
                                                    onDrop={handleDropZoneChange}
                                                >
                                                    {tierIcon ? (
                                                        <BlockStack gap="500">
                                                            <Thumbnail
                                                                source={window.URL.createObjectURL(tierIcon)}
                                                                alt={tierIcon.alt}
                                                                size="small"
                                                            />
                                                            <div>
                                                                {tierIcon.name}
                                                                <Text variant="bodySm" as="p">
                                                                    {tierIcon.size} bytes
                                                                </Text>
                                                            </div>
                                                        </BlockStack>
                                                    ) : (
                                                        tierIconLink.length > 0 ? (
                                                            <BlockStack gap="500">
                                                                <Thumbnail
                                                                    source={`${window.location.protocol}//${window.location.host}/${tierIconLink}`}
                                                                    alt={tierIconLink.alt}
                                                                    size="small"
                                                                />
                                                            </BlockStack>
                                                        ) : null
                                                    )}
                                                    {tierIcon ? null : <DropZone.FileUpload/>}
                                                </DropZone>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Milestone to achieve tier
                                                </Text>
                                                <TextField
                                                    label={vipProgram.milestone_type === 'earn_points' ? `Points earned since ${parseISO(vipProgram.milestone_start).toLocaleDateString()}` : `Customer total spent since ${parseISO(vipProgram.milestone_start).toLocaleDateString()}`}
                                                    autoComplete="off"
                                                    value={milestoneRequire}
                                                    onChange={handleMilestoneRequireChange}
                                                    error={milestoneRequireError}
                                                    type="number"
                                                    suffix={vipProgram.milestone_type === 'earn_points' ? 'Points' : '$'}
                                                    placeholder={'Example: 200'}
                                                    helpText={`${previousTier ? `Previous Tier: ${previousTier.name} - Milestone Requirement: ${previousTier.milestone_requirement} ${vipProgram.milestone_type === 'earn_points' ? 'Points' : '$'}` : 'Previous Tier: No Tier'}/${nextTier ? `Next Tier: ${nextTier.name} - Milestone Requirement: ${nextTier.milestone_requirement} ${vipProgram.milestone_type === 'earn_points' ? 'Points' : '$'}` : 'Next Tier: No Tier'}`}
                                                >
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Entry Reward
                                                </Text>
                                                <Checkbox
                                                    id="add_points"
                                                    label="Add points"
                                                    onChange={handleMilestoneCheckboxChange}
                                                    checked={milestoneRewardCheckbox.add_points}>
                                                </Checkbox>
                                                <TextField
                                                    disabled={!milestoneRewardCheckbox.add_points}
                                                    label="Points"
                                                    autoComplete="off"
                                                    value={milestoneRewardPoints}
                                                    onChange={handleMilestoneRewardPointsChange}
                                                    error={milestoneRewardPointsError}
                                                    type="number"
                                                    suffix="Points"
                                                    placeholder="Example: 300"
                                                >
                                                </TextField>
                                                <Checkbox
                                                    disabled={true}
                                                    id="add_discounts"
                                                    label="Add discounts"
                                                    onChange={handleMilestoneCheckboxChange}
                                                    checked={milestoneRewardCheckbox.add_discounts}
                                                >
                                                </Checkbox>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Perk
                                                </Text>
                                                <TextField
                                                    label="Customer get bonus when they earns points"
                                                    autoComplete="off"
                                                    value={milestonePerk}
                                                    onChange={handleMilestonePerkChange}
                                                    error={milestonePerkError}
                                                    suffix="%"
                                                >
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Form>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                                <Card>
                                    <Text as="h3" variant="headingMd">Summary</Text>
                                </Card>
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>
        </div>
    )
}
