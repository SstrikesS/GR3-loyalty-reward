import {Button, Flex, message, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined, RightOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {createReward, getCustomer, getRedeemPoint} from "@/utils/apis";

export default function RedeemPoint({page, setPage, setCustomer}) {
    const [isFetching, setIsFetching] = useState(true);
    const [isGetting, setIsGetting] = useState(false);
    const [redeemP, setRedeemP] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const redeemPoint =  async (id) => {
        setIsGetting(true);
        const response = await createReward(id);
        if(response?.success === true) {
            messageApi.open({
                type: 'success',
                content: 'Success',
            });
             getCustomer().then((response) => {
                setCustomer(response);
            })
        } else {
            messageApi.open({
                type: 'error',
                content: 'Error',
            });
        }
        setIsGetting(false);
    }

    useEffect(() => {
        if(page === 'redeem-point')
            getRedeemPoint().then(
                (response) => {
                    setRedeemP(response);
                    setIsFetching(false);
                }
            )
    }, [page])

    return (
        <Flex gap="middle" vertical>
            {contextHolder}
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setIsFetching(true);
                        setPage('main-page');

                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Redeem
                        Points</p>
                </Flex>
            </div>
            {isFetching ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : (
                redeemP.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>
                        <Flex gap="small" justify="flex-start" align="center">
                            <div style={{
                                width: "80%"
                            }}>
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
                                            margin : '0'
                                        }}>{item.title}</p>
                                        <p style={{
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex',
                                            margin : '0'
                                        }}>
                                            {item.pointsCost} Points exchange for {item.discountValue}{item.key === 'amount_discount' ? '$' : '%'}
                                        </p>
                                    </div>
                                </Flex>
                            </div>
                            <div style={{
                                width: "15%"
                            }}>
                                <Flex gap="small" justify="flex-end" align="center">
                                    <div style={{
                                        width: "10%"
                                    }}>
                                        {isGetting ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> :
                                            <Button type="text" icon={<RightOutlined/>} onClick={() => {redeemPoint(item.id).then()}}
                                                    style={{display: 'flex'}}></Button>
                                        }

                                    </div>
                                </Flex>
                            </div>
                        </Flex>

                    </div>
                ))
            )}
        </Flex>
    );
}
