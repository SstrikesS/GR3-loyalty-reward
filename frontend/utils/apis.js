export const apiLink = window.location.protocol + "//" + window.location.host + '/apps/loyalty-app-api';

export const testFetch = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/testApi`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getEarnPoint = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/earnPoints`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getRedeemPoint = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/redeemPoints`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getCustomer = async () => {
    console.log(apiLink);
    try {
        const response = await fetch(`${apiLink}/frontend/customer`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getVipProgram = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/program/vip`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getVipTiers = async () => {
    try{
        const response = await fetch(`${apiLink}/frontend/program/tiers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getVipTier = async (id) => {
    try{
        const response = await fetch(`${apiLink}/frontend/program/tier?tier_id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}
export const getRewards = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/rewards`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getReward = async (id) => {
    try {
        const response = await fetch(`${apiLink}/frontend/reward/get?reward_id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const createReward = async (id) => {
    try {
        const response = await fetch(`${apiLink}/frontend/reward/new?redeem_program_id=${id}`, {
            method: "POST",
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const updateCustomer = async (dob) => {
    try {
        const response = await fetch(`${apiLink}//frontend/customer/update?dob=${dob}`, {
            method: "PUT",
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

