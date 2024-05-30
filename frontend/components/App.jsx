import {useEffect, useState} from "react";
import {Spinner} from '@shopify/polaris';
import LoginPage from "~/components/LoginPage";
import MainPage from "~/components/MainPage";
import LayoutPage from "../components/Layout";
import RewardList from "../components/RewardList";
import EarnPoint from "../components/EarnPoint";
import RedeemPoint from "./RedeemPoint";

export default function App({home}) {
    const modal = document.getElementById("major-popup-parent");
    const [customer, setCustomer] = useState(null);
    const [shop, setShop] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState('main-page');

    useEffect(() => {
        if (window.shopifyCustomer.id !== "") {
            setCustomer(window.shopifyCustomer);
        } else {
            setPage( 'login-page');
        }

        if (window.shop) {
            setShop(window.shop);
        }

        setIsLoading(false);
    }, []);

    const PopupHandler = () => {
        if (modal.style.display !== "block") {
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
                    <div><Spinner accessibilityLabel="Loading" size="large"></Spinner></div>
                </div>
            </div>
        )
    }
    const loginPageComponent = <LoginPage shop={shop}></LoginPage>;
    const mainPageComponent = <MainPage page={page} setPage={setPage}></MainPage>;
    const rewardListComponent = <RewardList page={page} setPage={setPage}></RewardList>;
    const earnPointComponent = <EarnPoint page={page} setPage={setPage}></EarnPoint>
    const redeemPointComponent = <RedeemPoint page={page} setPage={setPage}></RedeemPoint>

    return (
        <div className="tw-text-5xl tw-text-red-600">
            <button id="major-popup-button" onClick={PopupHandler}></button>
            <div id="major-popup-parent">
                <div id="login-page" className={`popup-page ${page === 'login-page' ? 'active' : ''}`}>
                    <LayoutPage customer={customer} shop={shop} childComponent={loginPageComponent}/>
                </div>
                <div id="main-page" className={`popup-page ${page === 'main-page' ? 'active' : ''}`}>
                    <LayoutPage customer={customer} shop={shop} childComponent={mainPageComponent}/>
                </div>
                <div id="reward-list" className={`popup-page ${page === 'reward-list' ? 'active' : ''}`}>
                    <LayoutPage customer={customer} shop={shop} childComponent={rewardListComponent}/>
                </div>
                <div id="earn-point" className={`popup-page ${page === 'earn-point' ? 'active' : ''}`}>
                    <LayoutPage customer={customer} shop={shop} childComponent={earnPointComponent}/>
                </div>
                <div id="redeem-point" className={`popup-page ${page === 'redeem-point' ? 'active' : ''}`}>
                    <LayoutPage customer={customer} shop={shop} childComponent={redeemPointComponent}/>
                </div>
            </div>
        </div>
    );
}
