import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql"
import { schema } from "./schema.server";
import { resolver } from "./resolver.server";

export default function GraphQLServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: resolver,
        graphiql: true,
    }))
    const port = process.env.PORT || 4000;
    const host = process.env.HOST || 'localhost';
    const protocol = process.env.PROTOCOL || 'http';

    app.listen(port, () => {
        console.log(`Server is running on ${protocol}://${host}:${port}/graphql`);
    });
}
