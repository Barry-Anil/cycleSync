import { NextAuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db";

export const authOptions : NextAuthOptions ={
    adapter: DrizzleAdapter(db),
    providers:[
        GoogleProvider({
            clientId : process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ]
}

