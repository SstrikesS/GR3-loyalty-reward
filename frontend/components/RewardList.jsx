import {Button, Flex, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined, RightOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getRewards} from "@/utils/apis";

export default function RewardList({page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [reward, setReward] = useState([]);
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        if(page === 'reward-list') {
            getRewards().then(
                (response) => {
                    setReward(response);
                    console.log(response)
                    setIsFetching(false);
                }
            )
        }
    }, [page]);

    return (
      <Flex gap="middle" vertical>
          <div>
              <Flex gap="small" justify="flex-start" align="center">
                  <Button
                      type="text"
                      icon={<LeftOutlined/>}
                      onClick={() => {
                          setIsFetching(true);
                          setPage('main-page')
                      }}
                      style={{display: 'flex'}}>
                  </Button>
                  <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Rewards</p>
              </Flex>
          </div>
          {isFetching ? (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          ): (
              reward.map((item, index) => (
                  <div
                    key={index}
                    style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                  >
                      <Flex gap="small" justify="flex-start" align="center">
                          <div style={{
                              width: "80%"
                          }}>
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
                                      }}>{item.title}</p>
                                      <p style={{
                                          fontSize: "12px",
                                          textAlign: "center",
                                          display: 'flex',
                                          margin: '0'
                                      }}>
                                          {item.type === `DiscountAmount` ? `$${item.value} off discount` :
                                              item.type === 'DiscountPercentage' ? `${item.value * 100}% off discount` : ''}
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
                                      <Button type="text" icon={<RightOutlined/>} onClick={() => {setPage('reward-id'); window.customer_reward_id = item.reward_id.split('gid://shopify/DiscountCodeNode/')[1]}} style={{display: 'flex'}}></Button>
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
