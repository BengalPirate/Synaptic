import { ID, Query } from 'appwrite';
import Cookies from 'js-cookie';
import { INewUser } from "@/types";
import { account, appwriteConfig, avatars, databases } from './config';

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        })

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        ) 

        return newUser;
    } catch (error) {
        console.error("Error saving user to database:", error);
        throw error;
    }
}

export async function signInAccount(user: { email: string; password: string; }) {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);

        // Set session token as a cookie
        Cookies.set('session', session.$id, { secure: true, sameSite: 'Strict' });

        return session;
    } catch (error){
        console.error("Error signing in account:", error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const sessionId = Cookies.get('session');
        if (!sessionId) throw new Error("No session found");

        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("No current account");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser) throw new Error("No current user");

        return currentUser.documents[0];
    } catch (error) {
        console.error("Error getting current user:", error);
        throw error;
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current")

        return session;
    } catch (error) {
        console.log(error);
    }
}