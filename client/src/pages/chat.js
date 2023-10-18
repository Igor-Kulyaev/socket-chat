import Head from 'next/head'
import {ProtectedRoute} from "@/providers/router/ProtectedRoute";
import ClosableSnackbar from "@/shared/ui/Snackbar/ClosableSnackbar";
import {AppBar} from "@/widgets/AppBar/AppBar";
import {Drawer} from "@/widgets/Drawer/Drawer";
import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {useAuthorization} from "@/hooks/useAuthorization";
import api from "@/shared/api";
import {useRouter} from "next/router";
import {Chat} from "@/features/Chat/Chat";

export default function ChatPage() {
  const {authUser, socket, setSocket} = useAuthorization();
  const [usersList, setUsersList] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recipient, setRecipient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const openNotifications = (event) => {
    setPopoverAnchorEl(event.currentTarget);
  }

  const logout = () => {
    if (socket) {
      localStorage.removeItem("token");
      socket.emit('logout');
    }
  }

  const closeNotifications = () => {
    setPopoverAnchorEl(null);
    setNotifications([]);
    setNotificationsCount(0);
  }

  const selectRecipient = async (user) => {
    try {
      setMessages([]);
      if (user._id === authUser._id) {
        setRecipient(null);
      } else {
        setRecipient(user);
        const result = await api.get('chat-messages', {
          params: {
            recipientId: user._id,
          }
        });
        setMessages(result.data.messages);
        if (result.data.messages.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      setHasMore(false);
      setError(error?.response?.data?.message || error?.message);
    }
  }

  const fetchMoreData = async () => {
    try {
      const result = await api.get('chat-messages', {
        params: {
          recipientId: recipient._id,
          lastMessageId: messages[messages.length - 1]._id,
        }
      });
      if (result.data.messages.length < 10) {
        setHasMore(false);
      }
      setMessages((prev) => [...prev, ...result.data.messages]);
    } catch (error) {
      setHasMore(false);
      setError(error?.response?.data?.message || error?.message);
    }
  }

  const closeChat = () => {
    setRecipient(null);
  }

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
      })
      socket.on("disconnect", () => {
        setSocket(null);
        router.push("/expired-session");
      })
      socket.on("users-list", (data) => {
        setUsersList(data);
      })
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("users-list");
      }
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        if (recipient && recipient._id === data.userId) {
          setMessages((prev) => [data, ...prev]);
        } else {
          setNotificationsCount(prev => prev + 1)
          setNotifications((prev) => [...prev, data]);
        }
      })
      return () => {
        socket.off("message");
      }
    }
  }, [socket, recipient]);

  return (
    <>
      <Head>
        <title>Socket Chat App</title>
        <meta name="description" content="Socket Chat Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProtectedRoute>
        <Box>
          {error && (
            <ClosableSnackbar message={error} setMessage={setError} severity="error" />
          )}
          <AppBar
            openNotifications={openNotifications}
            notificationsCount={notificationsCount}
            logout={logout}
            popoverAnchorEl={popoverAnchorEl}
            closeNotifications={closeNotifications}
            notifications={notifications}
            usersList={usersList}
          />
          <Drawer usersList={usersList} selectRecipient={selectRecipient} authUser={authUser} />
          <Chat
            recipient={recipient}
            closeChat={closeChat}
            messages={messages}
            fetchMoreData={fetchMoreData}
            hasMore={hasMore}
            setError={setError}
            setMessages={setMessages}
          />
        </Box>
      </ProtectedRoute>
    </>
  )
}
