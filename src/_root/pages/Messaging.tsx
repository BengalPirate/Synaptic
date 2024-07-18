import React, {useState, useEffect} from "react";
import { databases, appwriteConfig} from "../../../src/lib/appwrite/config.ts";



const Room = () => {

	const [messages, setMessages] = useState([]);
	
	useEffect(() => {
		getMessages()
	}, [])
	const getMessages = async () => {
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.messagesCollectionId
		)
		console.log('RESPONSE: ', response)
		setMessages(response.documents)
	}
	return (
		<div>
			<div>
				{messages.map(message => (
					<div key={message.$id}>
						<div>
							<span>{message.body}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
export default Room
