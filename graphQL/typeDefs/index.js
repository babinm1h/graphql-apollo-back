import { gql } from "apollo-server";
import { GraphQLUpload } from "graphql-upload"


export const typeDefs = gql`

scalar Upload

type Comment{
    id:ID!
    user:User
    body:String!
    post:Post
    createdAt:String!
}

type User{
    id:ID!
    createdAt:String!
    avatar:String!
    background:String
    username:String!
    email:String!
    password:String!
    comments:[Comment]
    likes:[String]
    token:String
    posts:[Post]
}

type Post{
    id:ID!
    createdAt:String!
    body:String!
    user:User
    likes:[String]
    comments:[Comment]
    likesCount:Int!
    commentsCount:Int!
}



input RegisterInput{
    username:String!
    password:String!
    confirmPassword:String!
    email:String!
},


type Query{
    getPosts:[Post]
    getPost(postId:ID!):Post

    getUser(userId:String!):User!
}


type Mutation {
    register(input:RegisterInput):User!
    login(email:String!,password:String!):User!
    getAuth:User
    sendLink(email:String!):String
    changePassword(secretLink:String!,password:String!):String!
    
    createPost(body:String!):Post!
    deletePost(postId:String!):String!

    createComment(postId:String!, body:String):Comment!
    deleteComment(commentId:String!,postId:String!):Post!

    likePost(postId:String!):Post!
    unlikePost(postId:String!):Post!

    uploadAvatar(file:Upload!):Boolean!
    uploadBackground(file:Upload!):Boolean!
},


type Subscription{
    newPost:Post!
}

`