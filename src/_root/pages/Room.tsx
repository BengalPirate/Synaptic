import { useState, useEffect } from "react";
import {
  databases,
  appwriteConfig,
  account,
} from "../../lib/appwrite/config.ts";
import { ID } from "appwrite";
import { ArrowLeft, MoreVertical } from "react-feather";
import { Link, useParams } from "react-router-dom";
import "../../../styles/room.css";
import { useUserContext } from "@/context/AuthContext";

async function getMessagesDocumentById(id: string) {
  try {
    const document = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      id
    );
    return document;
  } catch (error) {
    console.error(`Error fetching document with ID ${id}:`, error);
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
  };

const Room = () => {
  const { id } = useParams();
  const { user } = useUserContext()
  const [messagesIds, setMessagesIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState({});
  const [messageBody, setMessageBody] = useState("");
  const [userId, setUserId] = useState("");
  const [otherUsernames, setOtherUsernames] = useState([]);	


  // console.log(id);

  useEffect(() => {
    const fetchRoom = async () => {
      console.log("FETCHING ROOM MESSAGES...");
      try {
        await getRoomMessagesIds();
      } catch (error) {
        console.error("ERROR FETCHING ROOM: ", error);
      }
    };
    fetchRoom();
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (error) {
        console.error("ERROR FETCHING USER: ", error);
      }
    };
    fetchUser();
  }, []);

  console.log(userId);

  useEffect(() => {
    const fetchRoomMessages = async () => {
      try {
        await getMessages();
      } catch (error) {
        console.error("ERROR FETCHING ROOM MESSAGES");
      }
    };
    fetchRoomMessages();
  }, [messagesIds]);
  
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

		await updateRoomMessages(createMessageResponse)

		console.log("MESSAGE CREATE RESPONSE: ", createMessageResponse)
		
		setMessages([...messages, createMessageResponse])

		console.log("UPDATED MESSAGES: ", messages)

		setMessageBody('');

		let roomPayload = {
			room_name: room.room_name,
			user_ids: room.user_ids,
			messages: [...room.messages, createMessageResponse.$id]
		}

		console.log("ROOM PAYLOAD: ", roomPayload)

		try {
			const roomUpdateResponse = await databases.updateDocument(
				appwriteConfig.databaseId,
				appwriteConfig.roomsCollectionId,
				room!.$id,
				roomPayload
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
			const fetchedUsers = await Promise.all(room.user_ids.map( async (id) => {
				return await getUserDocumentById(id)
			}))
			const otherFetchedUsers = fetchedUsers.filter(fetchedUser => fetchedUser.username !== user.username)
			console.log("OTHER USERS: ", otherFetchedUsers)
			const otherUsernamesToBeSet = otherFetchedUsers.map(fetchedUser => fetchedUser.username);
			console.log("OTHER USERNAMES: ", otherUsernamesToBeSet)
			setOtherUsernames(otherUsernamesToBeSet)
		} catch (error) {
			console.log("ERROR FETCHING OTHER USERS", error)
		}
	}

	const updateRoomMessages = async (newMessage) => {
		setRoom(prevRoom => ({
			...prevRoom,
			messages: [...prevRoom.messages, newMessage.$id]
		}));
	};
  
  return (
    <main className="container">
      <div className="room--format">
        <div className="room--container">
          <div className="room--header">
            <div className="back-arrow">
              <Link to={`/messaging`}>
                <ArrowLeft />
              </Link>
            </div>
            <div className="room--users">Tester789</div>
            <div className="more-options">
              <MoreVertical></MoreVertical>
            </div>
          </div>
          <div>
            <div className="chat-box">
              {messages.map((message) => (
                <div
                  key={message.$id}
                  className={`message--wrapper ${
                    message.sender_id === userId
                      ? "other-message"
                      : "my-message"
                  }`}
                >
                  <div className="message--header">
                    <small className="message-timestamp">
                      {message.$createdAt}
                    </small>
                  </div>

                  <div className="message--body">
                    <span>{message.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} id="message--form">
            <div id="textarea--container">
              <textarea
                required
                id="message--input"
                maxLength="1000"
                placeholder="Please enter your message"
                onChange={(e) => {
                  setMessageBody(e.target.value);
                }}
                value={messageBody}
              ></textarea>
            </div>
            <div className="send-btn--wrapper">
              <input
                className="btn btn--secondary"
                type="submit"
                value="Send"
              />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
export default Room;

