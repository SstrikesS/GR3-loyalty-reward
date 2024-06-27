import {useEffect, useState} from "react";
import LoginPage from "~/components/LoginPage";
import MainPage from "~/components/MainPage";
import LayoutPage from "../components/Layout";
import RewardList from "../components/RewardList";
import EarnPoint from "../components/EarnPoint";
import RedeemPoint from "./RedeemPoint";
import {getCustomer} from "@/utils/apis";
import Reward from "@/components/Reward";
import {LoadingOutlined} from "@ant-design/icons";
import {Spin} from "antd";
import EditDate from "@/components/EditDate";

export default function App({home}) {
    const modal = document.getElementById("major-popup-parent");
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState('main-page');
    useEffect(() => {
        if (window.shopifyCustomer.id !== "") {
            getCustomer().then((response) => {
                setCustomer(response);
                setIsLoading(false);
            })
        } else {
            setPage('login-page');
            setIsLoading(false);
        }
    }, []);
    // useEffect(() => {
    //     if (window.shopifyCustomer.id !== "") {
    //         getCustomer().then((response) => {
    //             setCustomer(response);
    //             setIsLoading(false);
    //         })
    //     }
    // }, [page]);
    const PopupHandler = () => {
        if (modal?.style?.display !== "block") {
            modal.style.display = "block";
        } else {
            modal.style.display = "none";
        }
    };
    if (isLoading) {
        return (
            <div className="tw-text-5xl tw-text-red-600">
                <button id="major-popup-button" onClick={PopupHandler}></button>
                <div id="major-popup-parent">
                    <div><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
                </div>
            </div>
        )
    }
    const loginPageComponent = <LoginPage shop={window.shop}></LoginPage>;
    const mainPageComponent = <MainPage customer={customer} page={page} setPage={setPage}></MainPage>;
    const rewardListComponent = <RewardList page={page} setPage={setPage}></RewardList>;
    const earnPointComponent = <EarnPoint customer={customer} page={page} setPage={setPage}></EarnPoint>
    const redeemPointComponent = <RedeemPoint page={page} setPage={setPage} setCustomer={setCustomer}></RedeemPoint>
    const rewardIDComponent = <Reward page={page} setPage={setPage}></Reward>
    const editDateOfBirth = <EditDate customer={customer} setCustomer={setCustomer} page={page} setPage={setPage}/>

    return (
        <div className="tw-text-5xl tw-text-red-600">
            <button id="major-popup-button" onClick={PopupHandler}></button>
            <div id="major-popup-parent">
                {page === 'login-page' ?
                    <div id="login-page" className={`popup-page ${page === 'login-page' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={loginPageComponent}/>
                    </div>: null
                }
                {page === 'main-page' ?
                    <div id="main-page" className={`popup-page ${page === 'main-page' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={mainPageComponent}/>
                    </div> : null
                }
                {page === 'reward-list' ?
                    <div id="reward-list" className={`popup-page ${page === 'reward-list' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={rewardListComponent}/>
                    </div> : null}
                {page === 'earn-point' ?
                    <div id="earn-point" className={`popup-page ${page === 'earn-point' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={earnPointComponent}/>
                    </div> : null
                }
                {page === 'redeem-point' ?
                    <div id="redeem-point" className={`popup-page ${page === 'redeem-point' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={redeemPointComponent}/>
                    </div>: null
                }
                {page === 'reward-id' ?
                    <div id="reward-id" className={`popup-page ${page === 'reward-id' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={rewardIDComponent}/>
                    </div> :null
                }
                {page === 'happy-birthday' ?
                    <div id="happy-birthday" className={`popup-page ${page === 'happy-birthday' ? 'active' : ''}`}>
                        <LayoutPage customer={customer} shop={window.shop} childComponent={editDateOfBirth}/>
                    </div>: null
                }

            </div>
        </div>
    );
}
