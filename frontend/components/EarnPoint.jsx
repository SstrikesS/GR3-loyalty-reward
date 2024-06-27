import {Button, Flex, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getEarnPoint} from "@/utils/apis";

export default function EarnPoint({customer, page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [earnP, setEarnP] = useState([]);

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        if (page === 'earn-point')
            getEarnPoint().then(
                (response) => {
                    setEarnP(response);
                    setIsFetching(false);
                }
            )
    }, [page])

    return (
        <Flex gap="middle" vertical>
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setIsFetching(true);
                        setPage('main-page');
                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Earn
                        Points</p>

                </Flex>
            </div>
            {isFetching ? (
                <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
            ) : (
                earnP.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>
                        {item.key === 'happy_birthday' ? (
                            <Flex gap="small" justify="flex-start" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src={item.icon}/>
                                </div>
                                <div style={{
                                    width: "65%"
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                        textAlign: "center",
                                        display: 'flex',
                                        margin: '0'
                                    }}>{item.name}</p>
                                    <p style={{
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex',
                                        margin: '0'
                                    }}>
                                        {`Get ${item.reward_points} points`}
                                    </p>

                                </div>
                                {!customer.date_of_birth ? (
                                    <div style={{
                                        width: "15%"
                                    }}>
                                        <Flex gap="small" justify="flex-end" align="center">
                                            <Button type="primary" onClick={() => {
                                                setPage('happy-birthday')
                                            }} style={{display: 'flex'}}>Edit Date</Button>
                                        </Flex>
                                    </div>
                                ) : null}
                            </Flex>
                        ) : (
                            <Flex gap="small" justify="flex-start" align="center">
                                <div style={{
                                    width: "15%"
                                }}>
                                    <img alt="" src={item.icon}/>
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
                                    }}>{item.name}</p>
                                    <p style={{
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex',
                                        margin: '0'
                                    }}>{item.sub_key === 'money_spent' ? `Get ${item.reward_points} points every 1$ spent` :
                                        `Get ${item.reward_points} points`}
                                    </p>
                                    {item.limit !== -1 && item.limit ? (
                                        <p style={{
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex',
                                            margin: '0'
                                        }}>
                                            {`${(() => {
                                                const value = customer.program_limit.find(value => value.program_type === item.key);
                                                return value ? item.limit - value.used : 0;
                                            })()} time(s) left. Reset in next ${item.limit_reset_loop}`}
                                        </p>
                                    ): null}
                                </div>
                            </Flex>
                        )}
                    </div>
                ))
            )}
        </Flex>
    );
}
