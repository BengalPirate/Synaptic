import React, {useState, useEffect} from "react";
import { databases, appwriteConfig} from "../../../src/lib/appwrite/config.ts";



const Room = () => {

	useEffect(() => {
		getMessages()
	}, [])
	const getMessages = async () => {
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.messagesCollectionId
		)
		console.log('RESPONSE: ', response)
	}
	return (
		<div>
			ROOM
		</div>
	)
}
export default Room
