import {Button, Flex, theme, Divider, Spin, Progress} from "antd";
import {LoadingOutlined, RightOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getRewards, getVipProgram, getVipTier, getVipTiers} from "@/utils/apis";

export default function MainPage({customer, page, setPage}) {
    const [reward, setReward] = useState([]);
    const [vipProgram, setVipProgram] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [tier, setTier] = useState(null);

    const [nextTier, setNextTier] = useState(null);
    useEffect(() => {
        setIsFetching(true);
        if (page === 'main-page') {
            getRewards().then(
                (response) => {
                    setReward(response);
                    getVipProgram().then(
                        (response) => {
                            setVipProgram(response);
                            getVipTiers().then(res => {
                                if (customer.vip_tier_index) {
                                    getVipTier(customer.vip_tier_index).then(r => {
                                            setTier(r);
                                            const next = res.find(item => item.id === r.nextTier);
                                            setNextTier(next);
                                            setIsFetching(false);
                                        }
                                    )
                                } else {
                                    setNextTier(res[0]);
                                    setIsFetching(false);
                                }
                            });
                        }
                    )
                }
            );
        }
    }, [page]);
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const navigateToRewardList = () => {
        setPage('reward-list');
    }

    const navigateToEarnPoint = () => {
        setPage('earn-point');
    }

    const navigateToRedeemPoint = () => {
        setPage('redeem-point');
    }

    const navigateToReferral = () => {
        setPage('referral-page');
    }

    const navigateToUserActivity = () => {
        setPage('user-activity');
    }
    if (page === 'main-page') {
        return (
            <div>
                {isFetching ? (
                    <Flex justify='center' align='center'>
                        <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
                    </Flex>
                ) : (
                    <Flex gap="middle" vertical>
                        <div style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>
                            <Flex gap="small" justify="flex-end" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src="https://cdn-icons-png.flaticon.com/32/548/548427.png"/>
                                </div>
                                <div style={{
                                    width: "75%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        Your rewards
                                    </p>
                                    {customer.reward.length > 0 ? (
                                        <p style={{
                                            fontWeight: "light",
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex'
                                        }}>
                                            You have {reward.length} rewards available!
                                        </p>
                                    ) : (
                                        <p style={{
                                            fontWeight: "light",
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex'
                                        }}>
                                            You don't have any rewards yet!
                                        </p>
                                    )}

                                </div>
                                <div style={{
                                    width: "10%"
                                }}>
                                    <Button type="text" icon={<RightOutlined/>} onClick={navigateToRewardList}
                                            style={{display: 'flex'}}></Button>
                                </div>
                            </Flex>
                        </div>

                        <div style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>
                            <Flex gap="small" justify="flex-end" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src="https://cdn-icons-png.flaticon.com/32/8829/8829756.png"/>
                                </div>
                                <div style={{
                                    width: "75%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        Earn Point
                                    </p>
                                </div>
                                <div style={{
                                    width: "10%"
                                }}>
                                    <Button type="text" icon={<RightOutlined/>} onClick={navigateToEarnPoint}
                                            style={{display: 'flex'}}></Button>
                                </div>
                            </Flex>
                            <Divider style={{
                                display: 'block',
                                margin: '0 0'
                            }}/>
                            <Flex gap="small" justify="flex-end" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src="https://cdn-icons-png.flaticon.com/32/4221/4221657.png"/>
                                </div>
                                <div style={{
                                    width: "75%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        Redeem Points
                                    </p>
                                </div>
                                <div style={{
                                    width: "10%"
                                }}>
                                    <Button type="text" icon={<RightOutlined/>} onClick={navigateToRedeemPoint}
                                            style={{display: 'flex'}}></Button>
                                </div>
                            </Flex>
                            <Divider style={{
                                display: 'block',
                                margin: '0 0'
                            }}/>
                            <Flex gap="small" justify="flex-end" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src="https://cdn-icons-png.flaticon.com/32/14806/14806431.png"/>
                                </div>
                                <div style={{
                                    width: "75%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        Referral
                                    </p>
                                </div>
                                <div style={{
                                    width: "10%"
                                }}>
                                    <Button type="text" icon={<RightOutlined/>} onClick={navigateToReferral}
                                            style={{display: 'flex'}}></Button>
                                </div>
                            </Flex>
                        </div>
                        {vipProgram.status === true ? (
                            <div style={{
                                padding: "6px 24px",
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}>
                                <Flex gap="small" vertical>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        {tier ? tier.name : 'No Vip Tier'}
                                    </p>
                                    {nextTier ?
                                        <Progress
                                            size="small"
                                            status="active"
                                            percent={parseInt(customer.vip_points[vipProgram.milestone_type]) / parseInt(nextTier.milestone_requirement) * 100}/>
                                        : <Progress status="active" percent={100}/>
                                    }
                                    {nextTier ?
                                        <p style={{
                                            fontWeight: "light",
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex'
                                        }}>
                                            Earn more {parseInt(nextTier.milestone_requirement) - parseInt(customer.vip_points[vipProgram.milestone_type])} {vipProgram.milestone_type === 'money_spent' ? '$' : 'Points'} to get tier {nextTier.name}
                                        </p>
                                        : null
                                    }


                                </Flex>


                            </div>
                        ) : null}

                        <div style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>

                            <Flex gap="small" justify="flex-end" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src="https://cdn-icons-png.flaticon.com/32/2961/2961948.png"/>
                                </div>
                                <div style={{
                                    width: "75%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        Your activity
                                    </p>
                                </div>
                                <div style={{
                                    width: "10%"
                                }}>
                                    <Button type="text" icon={<RightOutlined/>} onClick={navigateToUserActivity}
                                            style={{display: 'flex'}}></Button>
                                </div>
                            </Flex>
                        </div>
                    </Flex>
                )
                }
            </div>
        )
    } else {
        return (
            <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
        )
    }
}
