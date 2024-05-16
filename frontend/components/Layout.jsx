import {Button, Flex, Layout, Space, theme} from "antd";

export default function LayoutPage({customer, childComponent, shop}) {
    const {Header, Content, Footer} = Layout;
    const modal = document.getElementById("major-popup-parent");
    const PopupClose = function () {
        modal.style.display = "none";
    }

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();
    return (
        <Layout style={{position: "relative"}}>
            {customer ? (
                <Header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px'
                }}>
                    <div style={{position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex'}}>
                        <Button ghost size="small" shape="circle" display="flex"
                                onClick={PopupClose}>&#x00d7;</Button>
                    </div>
                    <Flex gap="small">
                        <div>
                            <p style={{
                                color: '#ffffff',
                                lineHeight: '21px',
                                textOverflow: "ellipsis",
                                whiteSpace: 'nowrap',
                                width: "200px",
                                overflow: 'hidden'
                            }}>
                                Welcome {customer.name}!
                            </p>
                        </div>
                        <div>
                            <p style={{color: '#ffffff', lineHeight: '21px', whiteSpace: 'nowrap'}}>
                                2500000 Points
                            </p>
                        </div>
                    </Flex>
                </Header>
            ) : (
                <Header style={{
                    position: 'sticky',
                    top: 0,
                    height: 100,
                    zIndex: 10,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px'
                }}>
                    <div style={{position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex'}}>
                        <Button ghost size="small" shape="circle" display="flex"
                                onClick={PopupClose}>&#x00d7;</Button>
                    </div>
                    <Space direction="vertical" size="small" style={{display: "flex"}} align="baseline">
                        <h3 style={{color: '#ffffff', lineHeight: '0px'}}>
                            Welcome to
                        </h3>
                        <h2 style={{
                            color: '#ffffff',
                            lineHeight: '17px',
                            textOverflow: "ellipsis",
                            whiteSpace: 'nowrap',
                            width: "250px",
                            overflow: 'hidden'
                        }}>
                            {shop.name}
                        </h2>
                    </Space>
                </Header>
            )}
            <Content style={{padding: '10px'}}>
                {customer ? (
                    <div style={{minHeight: 458}}>
                        {childComponent}
                    </div>
                ) : (
                    <div style={{minHeight: 422}}>
                        {childComponent}
                    </div>
                )}
            </Content>
            <Footer style={{ textAlign: 'center', background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    Loyalty Reward Program ©{new Date().getFullYear()} Created by SstrikesS
            </Footer>
        </Layout>
    )
}
