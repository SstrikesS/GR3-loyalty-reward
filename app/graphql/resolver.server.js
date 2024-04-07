import jwt from "jsonwebtoken";
import PointModel from "~/models/point.model";
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
    getEarnPoint: async ({input}, request) => {
        return EarnPointModel.findOne({id: input.id, key: input.key}, null, {
            returnDocument: "after",
            new: true
        }).lean();
    },
    getEarnPoints: async ({input}, request) => {
        return EarnPointModel.find({id: input.id}, null, {
            new: true
        });
    },
    getPointProgram: async ({input}, request) => {
        return PointModel.findOne({id: input.id}, null, {returnDocument: "after", new: true}).lean();
    },
    updateEarnPoint: async ({input}, request) => {
        const {id, key, name, type, reward_points, status} = input;
        return EarnPointModel.findOneAndUpdate({
            id: id,
            key: key
        }, {
            type: type,
            name: name,
            reward_points: reward_points,
            status: status,
        }, {
            returnDocument: "after",
            new: true
        })
    }
}
