import {Button, Flex, Spin, theme} from "antd";
import {CopyOutlined, LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getReward} from "@/utils/apis";

export default function Reward({page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [reward, setReward] = useState(null);
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        if (page === 'reward-id') {
            getReward(window.customer_reward_id).then((r) => {
                setReward(r);
                setIsFetching(false)
            })
        }
    }, [page]);

    return (
        <Flex gap="middle" vertical>
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setIsFetching(true);
                        setPage('reward-list');
                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Reward</p>
                </Flex>
            </div>
            {isFetching ? (
                <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
            ) : (
                <div
                    style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Flex gap="small" vertical>
                        <Flex gap="small" justify="flex-start" align="center">
                            <div style={{
                                width: "15%"
                            }}>
                                <img src="https://cdn-icons-png.flaticon.com/32/1288/1288575.png" alt=""/>
                            </div>
                            <div style={{
                                width: "80%"
                            }}>
                                <p style={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    textAlign: "center",
                                    display: 'flex',
                                    margin: '0'
                                }}>{reward.title}</p>
                                <p style={{
                                    fontSize: "12px",
                                    textAlign: "center",
                                    display: 'flex',
                                    margin: '0'
                                }}>
                                    {reward.type === `DiscountAmount` ? `$${reward.value} off discount` :
                                        reward.type === 'DiscountPercentage' ? `${reward.value * 100}% off discount` : ''}
                                </p>
                            </div>
                        </Flex>
                        <Flex justify="center" align="center">
                            <p style={{
                                fontSize: "12px",
                                textAlign: "center",
                                display: 'flex',
                                margin: '0'
                            }}>
                                Use this discount code on your next order!
                            </p>
                        </Flex>
                        <div style={{
                            width: '100%',
                            height: '50px',
                            borderRadius: '10px',
                            borderColor: 'black',
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                        }}>
                            <Flex gap='small' justify="center" align="center">
                                <p style={{
                                    fontSize: "18px",
                                    textAlign: "center",
                                    display: 'flex',
                                    margin: '10px 10px',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '75%',
                                }}>
                                    {reward.code}
                                </p>
                                <Button icon={<CopyOutlined/>} onClick={() => navigator.clipboard.writeText(reward.code)}></Button>
                            </Flex>
                        </div>
                        <Flex justify="center" align="center">
                            <Button type="primary" block>
                                Apply Code
                            </Button>
                        </Flex>
                    </Flex>
                </div>
            )}
        </Flex>
    )
}
