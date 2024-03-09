/**
 * @swagger
 * definitions:
 *   SocketData:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       age:
 *         type: number
 *   ChatData:
 *     type: object
 *     properties:
 *       receiverId:
 *         type: number
 *       conversationId:
 *         type: string
 *       text:
 *         type: string
 *   ChatStatusData:
 *     type: object
 *     properties:
 *       conversationId:
 *         type: string
 *       inConversation:
 *         type: boolean
 *       isLeaved:
 *         type: boolean
 *   NotificationData:
 *     $ref: '#/definitions/Notification'
 *   MessageData:
 *     $ref: '#/definitions/Message'
 */

/**
 * @swagger
 * /emit-notification:
 *   post:
 *     summary: Emit a notification
 *     description: Emits a notification to the specified user.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             senderId:
 *               type: number
 *             receiverUsername:
 *               type: string
 *             type:
 *               type: string
 *             metadata:
 *               type: object
 *     responses:
 *       200:
 *         description: Notification emitted successfully
 */

/**
 * @swagger
 * /msg-send:
 *   post:
 *     summary: Send a message
 *     description: Sends a message to the specified receiver.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ChatData'
 *     responses:
 *       200:
 *         description: Message sent successfully
 */

/**
 * @swagger
 * /mark-notifications-as-seen:
 *   post:
 *     summary: Mark notifications as seen
 *     description: Marks notifications as seen for the user.
 *     responses:
 *       200:
 *         description: Notifications marked as seen successfully
 */

/**
 * @swagger
 * /chat-opened:
 *   post:
 *     summary: Notify chat opened
 *     description: Notifies that a chat has been opened.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             conversationId:
 *               type: string
 *             contactId:
 *               type: number
 *     responses:
 *       200:
 *         description: Chat opened notification sent successfully
 */

/**
 * @swagger
 * /chat-closed:
 *   post:
 *     summary: Notify chat closed
 *     description: Notifies that a chat has been closed.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             conversationId:
 *               type: string
 *             contactId:
 *               type: number
 *     responses:
 *       200:
 *         description: Chat closed notification sent successfully
 */

/**
 * @swagger
 * /notification-receive:
 *   post:
 *     summary: Receive notification
 *     description: Receives a new notification.
 *     responses:
 *       200:
 *         description: Notification received successfully
 *         schema:
 *           type: object
 *           properties:
 *             notificationId:
 *               type: number
 *             content:
 *               type: string
 *             isSeen:
 *               type: boolean
 *             type:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             metadata:
 *               type: object
 *             notificationFrom:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: number
 *                 imageUrl:
 *                   type: string
 *                 username:
 *                   type: string
 *                 jobtitle:
 *                   type: string
 *                 name:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 followersCount:
 *                   type: number
 *                 followingsCount:
 *                   type: number
 *                 isMuted:
 *                   type: boolean
 *                 isBlocked:
 *                   type: boolean
 *                 isFollowed:
 *                   type: boolean
 */

/**
 * @swagger
 * /msg-receive:
 *   post:
 *     summary: Receive message
 *     description: Receives a new message.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/MessageData'
 *     responses:
 *       200:
 *         description: Message received successfully
 */

/**
 * @swagger
 * /msg-redirect:
 *   post:
 *     summary: Receive redirected message
 *     description: Receives a message that was redirected back.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/MessageData'
 *     responses:
 *       200:
 *         description: Redirected message received successfully
 */

/**
 * @swagger
 * /status-of-contact:
 *   post:
 *     summary: Update contact status
 *     description: Updates the status of a contact in a conversation.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ChatStatusData'
 *     responses:
 *       200:
 *         description: Contact status updated successfully
 */
