import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user || !user.password) {
                    throw new Error('Invalid credentials')
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials')
                }

                return user
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.subscriptionStatus = (user as any).subscriptionStatus
                token.image = user.image
            }

            // Allow updating name and image through session.update()
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name
                if (session.image !== undefined) token.image = session.image
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token.email) {
                // Fetch fresh user data from database on every session request
                // This ensures subscription status is always current
                const freshUser = await prisma.user.findUnique({
                    where: { email: token.email as string },
                    select: {
                        id: true,
                        role: true,
                        subscriptionStatus: true,
                        image: true,
                    },
                })

                if (freshUser) {
                    (session.user as any).id = freshUser.id;
                    (session.user as any).role = freshUser.role;
                    (session.user as any).subscriptionStatus = freshUser.subscriptionStatus;
                    (session.user as any).image = freshUser.image;
                } else {
                    // Fallback to token data if user not found
                    (session.user as any).id = token.id;
                    (session.user as any).role = token.role;
                    (session.user as any).subscriptionStatus = token.subscriptionStatus;
                    (session.user as any).image = token.image;
                }
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
