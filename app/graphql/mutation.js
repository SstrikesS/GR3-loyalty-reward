import {gql} from "@apollo/client";

export const UPDATE_EARN_POINT = gql`
    mutation UpdateEarnPoint($input : UpdateEarnPointInput) {
        updateEarnPoint(input : $input) {
            id
            key
            name
            reward_points
            limit
            requirement
            status
            createdAt
            updatedAt
        }
    }
`;
