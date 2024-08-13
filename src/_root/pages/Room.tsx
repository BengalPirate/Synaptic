import {useState, useEffect} from "react";
import { databases, appwriteConfig} from "../../lib/appwrite/config.ts";
import { ID } from 'appwrite' 
import { useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";


async function getMessagesDocumentById(id: string) {
    try {
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.messagesCollectionId, id);
        return document;
    } catch (error) {
        console.error(`ERROR FETCHING MESSAGES DOCUMENT ${id}: `, error);
        return null; // or handle the error as needed
    }
}

async function getUserDocumentById(id: string) {
    try {
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, id);
        return document;
    } catch (error) {
        console.error(`ERROR FETCHING USER DOCUMENT ${id}: `, error);
        return null; // or handle the error as needed
    }
}

async function getRoomDocumentById(id: string) {
    try {
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, id);
        return document;
    } catch (error) {
        console.error(`ERROR FETCHING USER DOCUMENT ${id}: `, error);
        return null; // or handle the error as needed
    }
}


const Room = () => {
	const { id } = useParams()
	const { user } = useUserContext()
	const [messagesIds, setMessagesIds] = useState([]);
	const [messages, setMessages] = useState([]);
	const [room, setRoom] = useState();
	const [messageBody, setMessageBody] = useState('')
	const [otherUsernames, setOtherUsernames] = useState([]);
	

	useEffect(() => {
		const fetchRoom = async () => {
			console.log("FETCHING ROOM MESSAGES...")
			try {
				await getRoomMessagesIds()
			} catch (error) {
				console.error("ERROR FETCHING ROOM: ", error)
			}
		}
		fetchRoom()
	}, [id])

	useEffect(() => {
		const fetchRoomMessages = async () => {
			try {
				await getMessages()
			} catch (error) {
				console.error("ERROR FETCHING ROOM MESSAGES")
			}
		}
		fetchRoomMessages()
	}, [messagesIds])

	useEffect(() => {
		const fetchOtherUsernames = async () => {
			console.log("SETTING OTHER USERS...")
			try {
				await setOtherUsers()
			} catch (error) {
				console.error("ERROR FETCHING ROOM: ", error)
			}
		}
		fetchOtherUsernames()
	}, [room])


	const handleSubmit = async (e) => {
		e.preventDefault()

		const otherUserIds = room!.user_ids.filter(id => id !== user.id)
		const newMessageId = ID.unique()
		
		updateRoomMessages(messageBody)

		console.log("OTHER USERNAMES FOR MESSAGE PAYLOAD: ", otherUsernames)
		console.log("MESSAGE BODY: ", messageBody)
		let messagePayload = {
			sender_username: user.username,
			sender_id: user.id,
			body: messageBody,
			receiver_usernames: otherUsernames,
			receiver_ids: otherUserIds,
			room_id: room.$id
		}
		
		let createMessageResponse = await databases.createDocument(
							appwriteConfig.databaseId, 
							appwriteConfig.messagesCollectionId,
							newMessageId,
							messagePayload
		)

		console.log("MESSAGE CREATE RESPONSE: ", createMessageResponse)
		
		setMessages([...messages, createMessageResponse])

		console.log("UPDATES MESSAGES: ", messages)

		setMessageBody('');

		try {
			const roomUpdateResponse = await databases.updateDocument(
				appwriteConfig.databaseId,
				appwriteConfig.roomsCollectionId,
				room!.$id,
				room
			)
			console.log("ROOM UPDATE RESPONSE: ", roomUpdateResponse)
		} catch (error) {
			console.log("ERROR UPDATING ROOM MESSAGES: ", error)
		}

		
	}

	const getRoomMessagesIds = async () => {
		console.log("ROOM ID: ", id)
		if (id){
			try{
				const userRoom = await databases.getDocument(
					appwriteConfig.databaseId,
					appwriteConfig.roomsCollectionId,
					id
				)
				console.log("ROOM: ", userRoom)

				setMessagesIds(userRoom.messages);
				setRoom(userRoom);
			} catch (error) {
				console.log("ERROR RECEIVING ROOM: ", error)
			}
		}
	}

	const getMessages = async () => {
		try {
			const roomMessages = await Promise.all(messagesIds.map( async (id) => {
				return await getMessagesDocumentById(id)
			}))
			console.log("ROOM MESSAGES: ", roomMessages)
			setMessages(roomMessages)
		} catch (error) {
			console.log("ERROR FETCHING MESSAGES: "	, error)
		}
	}

	const setOtherUsers = async () => {
		try {
			const otherUsers = await Promise.all(room.user_ids.map( async (id) => {
				return await getUserDocumentById(id)
			}))
			console.log("USERS: ", otherUsers)
			otherUsernames = otherUsers.map(user => user.username);
			console.log("OTHER USERNAMES: ", otherUsernames)
			setOtherUsernames(otherUsernames)
		} catch (error) {
			console.log("ERROR FETCHING OTHER USERS", error)
		}
	}

	const updateRoomMessages = (newMessage) => {
		setRoom(room => ({
			...room,
			messages: [...room!.messages, newMessage]
		}));
	};

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
