import React, {useState, useEffect} from "react";
import { databases, appwriteConfig} from "../../../src/lib/appwrite/config.ts";



const Room = () => {

	const [messages, setMessages] = useState([]);
	
	useEffect(() => {
		getMessages()
	}, [])
	const getMessages = async () => {
		console.log(appwriteConfig)
		const response = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.messagesCollectionId
		)
		console.log('RESPONSE: ', response)
		setMessages(response.documents)
	}
	return (
		<main className="container">
			<div className="room--container">
				<div>
					<div>
						{messages.map(message => (
							<div key={message.$id} className="message--wrapper">
								
								<div className="message--header">
									<small className="message-timestamp">{message.$createdAt}</small>
								</div>
		
								<div className="message--body">
									<span>{message.body}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	)
}
export default Room
