# Socket Events Documentation

This document outlines the various events emitted and received by the WebSocket server implemented in the SocketService class.

## Events Emitted by Client

### 1. `msg-send`

- **Description:** This event is emitted when a client sends a message.
- **Data Format:**
  ```typescript
  {
  contactId: number,
  conversationId: number,
  text: string,
  }
  ```
- **Response:** The server emits `msg-receive` and `msg-redirect` events to the relevant users.

### 3. `chat-opened`

- **Description:** This event is emitted when a client opens a chat.
- **Data Format:**
  ```typescript
  {
  contactId: number,
  conversationId: number
  }
  ```
- **Response:** The server emits `status-of-contact` event to the relevant user indicating the conversation status.

### 4. `chat-closed`

- **Description:** This event is emitted when a client closes a chat.
- **Data Format:**
  ```typescript
  {
  contactId: number,
  conversationId: number
  }
  ```
- **Response:** The server emits `status-of-contact` event to the relevant user indicating the conversation status.

## Events Received by Client

### 1. `notification-receive`

- **Description:** This event is received when a new notification is received.
- **Data Format:**

  ```typescript
  {
    notificationId: number,
    content: string,
    isSeen: boolean,
    type: string,
    createdAt: string,
    metadata: any,
    notificationFrom: {
      userId: number,
      imageUrl: string,
      username: string,
      jobtitle: string,
      name: string,
      bio: string,
      followersCount: number,
      followingsCount: number,
      isMuted: boolean,
      isBlocked: boolean,
      isFollowed: boolean
    }
  }
  ```

### 2. `msg-receive`

- **Description:** This event is received when a new message is received.
- **Data Format:** Message data.

### 3. `msg-redirect`

- **Description:** This event is received when a message sent by the client is redirected back.
- **Data Format:** Message data.

### 4. `status-of-contact`

- **Description:** This event is received when the status of a contact changes.
- **Data Format:** Contact status data.
