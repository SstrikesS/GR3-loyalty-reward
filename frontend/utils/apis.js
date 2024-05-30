export const apiLink = window.location.protocol + "//" + window.location.host + '/apps/frontends';

export const testFetch = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/testApi`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin":'*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data",error);
        return null;
    }
}

export const getEarnPoint = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/earnPoints`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin":'*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data",error);
        return null;
    }
}

export const getRedeemPoint = async () => {
    try {
        const response = await fetch(`${apiLink}/frontend/redeemPoints`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin":'*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data",error);
        return null;
    }
}

