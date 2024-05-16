import {Button, Flex, theme, Divider} from "antd";
import {RightOutlined} from "@ant-design/icons";

export default function MainPage({page, setPage}) {

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

    return (
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
                        <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>
                            Your rewards
                        </p>
                        <p style={{fontWeight: "light", fontSize: "12px", textAlign: "center", display: 'flex'}}>
                            You don't have any rewards yet.
                        </p>
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
                        <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>
                            Earn Points
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
                        <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>
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
                        <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>
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
                        <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>
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
