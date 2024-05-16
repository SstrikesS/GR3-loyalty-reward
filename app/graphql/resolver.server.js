import jwt from "jsonwebtoken";
import PointModel from "~/models/point.model";
import EarnPointModel from "~/models/earnPoint.model";
import RedeemPointModel from "~/models/redeemPoint.model";

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
    getRedeemPoints: async ({input}, request) => {
      return RedeemPointModel.find({id: input.id}, null, {
          new: true
      });
    },
    getPointProgram: async ({input}, request) => {
        return PointModel.findOne({id: input.id}, null, {returnDocument: "after", new: true}).lean();
    },

    createRedeemPoint: async ({input}, request) => {
        return RedeemPointModel.create({
            ...input,
            status: true,
        });
    },

    updateEarnPoint: async ({input}, request) => {
        const {id, key, name, link, type, reward_points, icon, status} = input;
        return EarnPointModel.findOneAndUpdate({
            id: id,
            key: key
        }, {
            type: type ?? undefined,
            icon: icon ?? undefined,
            name: name,
            link: link ?? undefined,
            reward_points: reward_points,
            status: status,
        }, {
            returnDocument: "after",
            new: true
        })
    }
}
