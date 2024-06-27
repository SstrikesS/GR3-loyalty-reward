import {Button, Flex, DatePicker, message, Spin} from "antd";
import {LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useState} from "react";
import {updateCustomer} from "@/utils/apis";

export default function EditDate({customer, setCustomer, page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [isUpdate, setIsUpdate] = useState(false);
    const [date, setDate] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const onChange = (date) => {
        setDate(date);
    };

    const changeDateOfBirth = async () => {
        setIsUpdate(true);
        setCustomer((prevState) => { return {...prevState, date_of_birth: date.toISOString()}});
        updateCustomer(date.toISOString()).then((r) => {
            if(r.success) {
                messageApi.open({
                    type: 'success',
                    content: 'Success',
                });
            } else {
                messageApi.open({
                    type: 'error',
                    content: 'Error',
                });
            }
            setIsUpdate(false);
        })

    }

    return (
        <Flex gap="middle" vertical>
            {contextHolder}
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
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Birthday
                        Rewards</p>
                </Flex>
            </div>
            <div>
                <p style={{
                    fontSize: "12px",
                    textAlign: "center",
                    display: 'flex',
                    margin: '0'
                }}>
                    We want to celebrate your birthday! Make sure you let us know at least one month in advance —
                    otherwise, you'll have to wait until next year.
                </p>
            </div>
            <div>
                <Flex justify="center" align="center">
                    <DatePicker onChange={onChange} month={new Date().getMonth()} year={new Date().getFullYear()}/>
                </Flex>
            </div>
            <div>
                <Flex justify="center" align="center">
                {isUpdate ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> :
                    <Button type="primary" onClick={ () => {changeDateOfBirth().then()} } block>
                        Save date
                    </Button>
                }
                </Flex>
            </div>
        </Flex>
    )
}
