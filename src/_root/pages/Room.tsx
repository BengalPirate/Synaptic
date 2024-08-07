import React, {useState, useEffect} from "react";
import { databases, appwriteConfig} from "../../lib/appwrite/config.ts";
import { ID } from 'appwrite' 
import { useLocation } from "react-router-dom";

const Room = () => {

	const [messages, setMessages] = useState([]);
	const [messageBody, setMessageBody] = useState('')
	const location = useLocation()
	const room = location.state

	useEffect(() => {
		getMessages()
	}, [messages])

	const handleSubmit = async () => {
		e.preventDefault()
		
		let payload = {
			body: messageBody
		}
		let response = await databases.createDocument(
							appwriteConfig.databaseId, 
							appwriteConfig.messagesCollectionId,
							ID.unique(),
							data
						)
	}

	const getMessages = async () => {
		setMessages(room.messages)
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
                <form onSubmit={handleSubmit} id="message--form">
                    <div>
                        <textarea
                            required
                            maxLength="1000"
                            placeholder="Please enter your message"
                            onChange={(e) => {setMessageBody(e.target.value)}}
                            value={messageBody}
                        ></textarea>
                    </div>
                    <div className="send-btn--wrapper">
                        <input className='btn btn--secondary' type="submit" value="Send"/>
                    </div>
                </form>
			</div>
		</main>
	)
}
export default Room
