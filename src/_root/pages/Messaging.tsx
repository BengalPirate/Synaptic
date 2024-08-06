import React, { useState, useEffect } from "react";
import { databases, appwriteConfig } from "../../lib/appwrite/config.ts";
import { Query } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import "../../../styles/messaging.css";
import { Edit } from "react-feather";
import { set } from "react-hook-form";
import { IMessage, IRoom } from "../../types/index.ts";

// Function to check if a map contains an object with the specific set of tags
function containsObjectWithMatchSet(
  map: Map<number, IRoom>,
  matchSet: Set<string>
): [boolean, number] {
  let count: number = 0;
  for (const obj of map.values()) {
    if (isEqualSet(obj.userIds, matchSet)) {
      return [true, count];
    }
    count++;
  }
  return [false, -1];
}

// Helper function to check if two sets are equal
function isEqualSet(setA: Set<string>, setB: Set<string>): boolean {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

const Messaging = () => {
  const [userMessages, setUserMessages] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const [roomCount, setRoomCount] = useState(0);
  const { user } = useUserContext();

  /*Set state for create-room to false */
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUserMessages(); // Ensure messages are fetched first
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    getUserRooms(); // Then process the messages to update rooms
  }, [userMessages]);

  const roomCountIncrement = () => {
    setRoomCount(roomCount + 1);
  };

  const resetRoomCount = () => {
    setRoomCount(0);
  };

  const roomCountDecrement = () => {
    setRoomCount(roomCount - 1);
  };

  const getUserMessages = async () => {
    try {
      const userMessageSends = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [Query.equal("sender_id", user.id)]
      );
      console.log("USER MESSAGE SENDS: ", userMessageSends);

      const userMessageReceives = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [Query.contains("receiver_ids", user.id)]
      );
      console.log("USER MESSAGE RECEIVES: ", userMessageReceives);
      const allMessages = [
        ...(Array.isArray(userMessageSends.documents)
          ? userMessageSends.documents
          : [userMessageSends.documents]),
        ...(Array.isArray(userMessageReceives.documents)
          ? userMessageReceives.documents
          : [userMessageReceives.documents]),
      ];
      console.log("ALL MESSAGES: ", allMessages);
      setUserMessages(allMessages);
    } catch (error) {
      console.log("ERROR RECEIVING MESSAGES: ", error);
    }
  };

  const getUserRooms = () => {
    console.log("USER MESSAGES: ", userMessages);
    let rooms: Map<number, IRoom> = new Map();
    for (let message of userMessages) {
      const message_ids: Set<string> = new Set([
        ...message.receiver_ids,
        message.sender_id,
      ]);
      let isRoom: boolean;
      let roomKey: number;
      [isRoom, roomKey] = containsObjectWithMatchSet(rooms, message_ids);
      if (!isRoom) {
        rooms.set(roomCount, { userIds: message_ids, messages: [message] });
        roomCountIncrement();
      } else {
        let roomOfInterest = rooms.get(roomKey);
        roomOfInterest!.messages.push(message);
        rooms.set(roomKey, roomOfInterest!);
      }
    }
    console.log("ROOMS: ", rooms);
    resetRoomCount();
    setUserRooms(Array.from(rooms.entries()));
  };

  return (
    <main className="container">
      <div className="messaging-container">
        <div className="header-container">
          <div className="messages-header">
            <h1>Messages</h1>
          </div>
          <div className="message-actions">
            <Edit className="create-room" onClick={() => setOpenPopup(true)}>
              Create Room
            </Edit>
          </div>
        </div>

        {userRooms.map(([room_num, room]) => (
          <div key={room_num} className="room--wrapper">
            <div className="room--header">
              <small className="room--users">{room.userIds}</small>
            </div>
            <div className="messagePreview--wrapper">
              <span>{room.messages[room.messages.length - 1].body}</span>
            </div>
          </div>
        ))}
      </div>

      {openPopup && (
        <div className="overlay" id="overlay">
          <div className="create-room-popup">
            <div className="flex-row flex-between">
              <h2 className="form-header">Create Room</h2>
              <button onClick={() => setOpenPopup(false)}>X</button>
            </div>

            <form action="create-room">
              <div className="create-room-form">
                <p>Add users to your chat room</p>

                <div className="textbox-container">
                  <input
                    type="text"
                    id="add-users"
                    placeholder="user1, user2, ..."
                    className="textbox"
                  />
                  <span className="tooltip">List users separated by comma</span>
                </div>

                <div>
                  <input
                    type="text"
                    name="first-message"
                    id="first-message"
                    placeholder="What would you like to say?"
                    className="textbox"
                  />
                </div>
                <button id="room-submit">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default Messaging;
