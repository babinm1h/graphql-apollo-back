import dotenv from "dotenv"
dotenv.config()
import { ApolloServer } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import mongoose from "mongoose"
import { resolvers } from "./graphQL/resolvers/index.js"
import { typeDefs } from "./graphQL/typeDefs/index.js"
import { makeExecutableSchema } from "@graphql-tools/schema"
import express from "express"
import { createServer } from 'http'
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from "ws"
import { graphqlUploadExpress } from "graphql-upload"


const PORT = process.env.PORT || 7777
const app = express()
app.use(graphqlUploadExpress())

const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers })


const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
})


const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
    cors: {
        origin: [`http://localhost:3000/`, `https://studio.apollographql.com`],
        credentials: true
    },
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ]
})
await server.start();
server.applyMiddleware({ app });



const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        httpServer.listen(PORT, () => console.log(`${PORT} started`))
    } catch (err) {
        console.log(err);
    }
}
start()