import {useState, useEffect} from "react";
import { databases, appwriteConfig } from "../../lib/appwrite/config.ts";
import {Query} from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { Link, useParams } from 'react-router-dom';


async function getMessagesDocumentById(id: string) {
    try {
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.messagesCollectionId, id);
        return document;
    } catch (error) {
        console.error(`Error fetching document with ID ${id}:`, error);
        return null; // or handle the error as needed
    }
}

const Messaging = () => {
	const [userRooms, setUserRooms] = useState([])
	const [roomPreviews, setRoomPreviews] = useState([])
	const { user } = useUserContext()
	const { id } = useParams()
	
	useEffect(() => {
		const fetchRooms = async () => {
			try {
				await getUserRooms(); // Then process the messages to update rooms
			} catch (error) {
				console.error("ERROR FETCHING ROOMS: ", error)
			}
		};
		fetchRooms()
	}, [user])

	useEffect(() => {
		const fetchRoomPreviews = async () => {
			try {
				await getRoomPreviews();
			} catch (error) {
				console.error("ERROR FETCHING ROOM PREVIEWS")
			}
		};

		if (userRooms.length > 0){
			fetchRoomPreviews()
		}
	}, [userRooms])


	const getUserRooms = async () => {
		try{
			const userRooms = await databases.listDocuments(
				appwriteConfig.databaseId,
				appwriteConfig.roomsCollectionId,
				[
					Query.contains('user_ids', user.id)
				]
			)
			console.log("USER ROOMS: ", userRooms)
			console.log("USER: ", user)

			setUserRooms(userRooms.documents);
			console.log(userRooms)
		} catch (error) {
			console.log("ERROR RECEIVING ROOMS: ", error)
		}
	}

	const getRoomPreviews = async () => {
		try {
			const roomPreviews = await Promise.all(userRooms.map(async (room) => {
				const lastMessageId = room.messages[room.messages.length - 1]
				console.log("LAST MESSAGE ID: ", lastMessageId)
				if (lastMessageId) {
					return await getMessagesDocumentById(lastMessageId);
				}
				return null;
		}));
			console.log("ROOM PREVIEWS: ", roomPreviews)
			setRoomPreviews(roomPreviews)
		} catch (error) {
			console.log("ERROR FETCHING PREVIEWS: ", error)
		}
	}


	return (
		<main className="container">
			<div className="messaging-container">
				<h1 className="messages-header">Messages</h1>
				{userRooms.map((room) => (
					<Link to={`/room/${room.$id}`} key={room.$id}>
						<div className="room--wrapper">
							<div className="room--header">
								<small className="room--users">{
								room.room_name
								}</small>
							</div>
							<div className="messagePreview--wrapper">
								<span>{roomPreviews.find(p => p?.$id === room.messages[room.messages.length - 1])?.body || ""}</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</main>
	)
}
export default Messaging 
