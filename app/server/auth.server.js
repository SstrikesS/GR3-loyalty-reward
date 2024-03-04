import bcrypt from "bcryptjs";
import AdminServer from "./admin.server";
import { getInfoData } from "~/utils";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { COOKIE_NAME } from "~/constants/string.constant";

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SESSION_SECRET is not set");
}

export const storage = createCookieSessionStorage({
    cookie: {
        name: COOKIE_NAME,
        secure: process.env.NODE_ENV === 'production',
        secrets: [SECRET_KEY],
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
        httpOnly: true,
    },
});

export const createUserSession = async (userId, redirectTo) => {
    const session = await storage.getSession();
    session.set('userId', userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        }
    })
}

export const requireUserId = async (request, redirectTo) => {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId) {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/?${searchParams}`);
    }
    return userId;
}

const getUserSession = (request) => {
    return storage.getSession(request.headers.get("Cookie"));
}

async function getUserId(request) {
    const session = await getUserSession(request);
    const userId = session.get('userId');
    if (!userId || typeof userId !== "string") {
        return null;
    }
    return userId;
}

export async function getUser(request) {
    const userId = await getUserId(request);
    if (typeof userId !== "string") {
        return null;
    }

    try {
        const admin = await AdminServer.getAdmin({ filter: { _id: userId } });
        if (admin) {
            return getInfoData({ fields: ['username', 'email'], object: admin })
        } else {
            return logout(request);
        }
    } catch {
        throw logout(request);
    }
}

export async function logout(request) {
    const session = await getUserSession(request);
    return redirect('/', {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    });
}

class AuthServer {
    static async signup(payload) {
        try {
            const { username, password, confirmedPassword, email } = payload;
            if (password !== confirmedPassword) {
                return {
                    error: 'Password and confirmedPassword must be matched'
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const existedAdmin = await AdminServer.getAdmin({
                filter: {
                    username: username
                }
            });

            if (existedAdmin) {
                return {
                    error: 'Username is existed'
                }
            }

            const newAdmin = await AdminServer.createAdmin({ username, password: hashedPassword, email });
            return getInfoData({ fields: ['username', 'email'], object: newAdmin });
        } catch {
            return {
                error: 'Error when sign up in auth server'
            }
        }
    }

    static async login({ username, password }) {
        const existedAdmin = await AdminServer.getAdmin({
            filter: {
                username: username,
            }
        });

        if (!existedAdmin) {
            return {
                error: 'Username is not existed'
            };
        }

        const isCorrectPassword = await bcrypt.compare(password, existedAdmin.password);
        if (!isCorrectPassword) {
            return {
                error: 'Password is incorrect'
            };
        }

        return createUserSession(existedAdmin._id, '/admin');
    }
}

export default AuthServer;