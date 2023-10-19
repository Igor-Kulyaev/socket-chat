## Project description

Full-stack chat application created with Express and MongoDB at backend, and Next.js at frontend.
Socket.io is used for client-server communication.

## Functionality
- User can register an account.
- User can login.
- User can logout.
- Access and Refresh JWT tokens are used for authorization.
- Socket connection is established for authorized users.
- User can get paginated message history with infinite scroll.
- User can send messages to other users.
- If the recipient is online, he will receive either notification of new message or a message if the chat conversation is open.
- User receives dynamic list of all users with online/offline status.
- User can logout.
- When user logins in another tab or browser, his previous socket connection expires.
- Possible errors at API calls or at socket events are displayed in closable toast.

## Run application

To run application, you need installed MongoDB database locally.

Open two terminals and run app in dev mode

```bash
cd server
npm start
```

```bash
cd client
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser to display application.



https://github.com/Igor-Kulyaev/socket-chat/assets/90397740/03af8564-a591-48bc-98ae-0ca7009fa59e



## Video
<video src="https://github.com/Igor-Kulyaev/socket-chat/blob/f354f92977106a9f0823aee1dae1b06cbb016b87/video.mp4" width="320" height="240" controls></video>
