import { ApolloClient, InMemoryCache } from "@apollo/client";

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

export default client;