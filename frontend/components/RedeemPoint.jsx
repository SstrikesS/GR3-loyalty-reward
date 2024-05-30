import {Button, Flex, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getRedeemPoint} from "../utils/apis";

export default function RedeemPoint({page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [redeemP, setRedeemP] = useState([]);

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

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
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setIsFetching(true);
                        setPage('main-page');

                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Earn
                        Point</p>

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
                                width: "15%"
                            }}>
                                <img alt="" src={item.icon}/>
                            </div>
                            <div style={{
                                width: "75%"
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
                                }}>{item.pointsCost} exchange for {item.discountValue}</p>
                            </div>
                        </Flex>
                    </div>
                ))
            )}
        </Flex>
    );
}
