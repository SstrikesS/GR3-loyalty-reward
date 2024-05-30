import {Button, Flex, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getEarnPoint} from "../utils/apis";

export default function EarnPoint({page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [earnP, setEarnP] = useState([]);

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        if(page === 'earn-point')
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
                        Point</p>

                </Flex>
            </div>
            {isFetching ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : (
                earnP.map((item, index) => (
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
                                    }}>{item.name}</p>
                                    <p style={{
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex',
                                        margin : '0'
                                    }}>{item.reward_points}</p>
                            </div>
                        </Flex>
                    </div>
                ))
            )}
        </Flex>
    );
}
