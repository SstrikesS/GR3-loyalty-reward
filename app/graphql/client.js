import {ApolloClient, InMemoryCache} from "@apollo/client";
import {HELLO_QUERY} from "./query";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    ssrMode: true,
    uri: 'http://localhost:4000/graphql',
});

/**
 *
 * @param {*} token // Token without prefix Bearer
 */
export const isAuthenticated = async (token) => {

}

export const helloWorld = async () => {
    return await client.query({
        query: HELLO_QUERY,
    });
};

export default client;
