import {Button, Flex} from "antd";
import {LeftOutlined} from "@ant-design/icons";

export default function RewardList({page, setPage}) {

    const navigateToMain = () => {
        setPage('main-page');
    }

    return (
      <Flex gap="middle">
          <div>
              <Flex gap="small" justify="flex-start" align="center">
                  <Button type="text" icon={<LeftOutlined/>} onClick={navigateToMain} style={{display: 'flex'}}></Button>
                  <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Rewards</p>
              </Flex>
          </div>

      </Flex>
    );
}
