import jwt from "jsonwebtoken";
import StoreModel from '~/models/store.model';
import EarnPointModel from "~/models/earnPoint.model";

export const verifyToken = async (bearerToken) => {
    if (!bearerToken) {
        throw new Error('You have to provide bearer token on the request headers');
    } else {
        const token = bearerToken.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        console.log('DECODED: ', decoded);
        if (!decoded) {
            throw new Error('Invalid access token');
        }
        return true;
    }
}

export const resolver = {
    hello: () => {
        return "Hello World";
    },
    getStoreByID: async ({input}, request) => {
        return StoreModel.findOne({_id: input.id, accessToken: input.accessToken});
    },
    getEarnPoint: async ({input}, request) => {
        return EarnPointModel.findOne({id: input.id});
    },
    getEarnPoints: async (request) => {
        return EarnPointModel.find();
    }
}
