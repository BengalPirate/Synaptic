import { useState, useEffect } from "react";
import {
  databases,
  appwriteConfig,
  account,
} from "../../lib/appwrite/config.ts";
import { ID } from "appwrite";
import { ArrowLeft } from "react-feather";
import { useParams } from "react-router-dom";
import "../../../styles/room.css";

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

const Room = () => {
  const { id } = useParams();
  const [messagesIds, setMessagesIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [userId, setUserId] = useState("");

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

  const handleSubmit = async () => {
    e.preventDefault();

    let payload = {
      body: messageBody,
      userId: userId,
    };
    let response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      ID.unique(),
      payload
    );
  };

  const getRoomMessagesIds = async () => {
    if (id) {
      try {
        const userRoom = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomsCollectionId,
          id
        );
        console.log("ROOM: ", userRoom);

        setMessagesIds(userRoom.messages);
      } catch (error) {
        console.log("ERROR RECEIVING ROOM: ", error);
      }
    }
  };

  const getMessages = async () => {
    try {
      const roomMessages = await Promise.all(
        messagesIds.map(async (id) => {
          return await getMessagesDocumentById(id);
        })
      );
      console.log("ROOM MESSAGES: ", roomMessages);
      setMessages(roomMessages);
    } catch (error) {
      console.log("ERROR FETCHING MESSAGES: ", error);
    }
  };

  return (
    <main className="container">
      <div className="room--container">
        <div>
          <div className="chat-box">
            {messages.map((message) => (
              <div
                key={message.$id}
                className={`message--wrapper ${
                  message.sender_id === userId ? "my-message" : "other-message"
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

            <div className="message--wrapper my-message">
              <div className="message--header">
                <small className="message-timestamp">time stamp</small>
              </div>

              <div className="message--body">
                <span>Hello World</span>
              </div>
            </div>

            <div className="message--wrapper other-message">
              <div className="message--header">
                <small className="message-timestamp">time stamp</small>
              </div>

              <div className="message--body">
                <span>Hello World</span>
              </div>
            </div>
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
            <input className="btn btn--secondary" type="submit" value="Send" />
          </div>
        </form>
      </div>
    </main>
  );
};
export default Room;
