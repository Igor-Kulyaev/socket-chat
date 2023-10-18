import Head from 'next/head'
import {ProtectedRoute} from "@/providers/router/ProtectedRoute";
import ClosableSnackbar from "@/shared/ui/Snackbar/ClosableSnackbar";
import {AppBar} from "@/widgets/AppBar/AppBar";
import {Drawer} from "@/widgets/Drawer/Drawer";
import Box from "@mui/material/Box";
import {drawerWidth} from "@/shared/constants/constants";
import {Chip, CircularProgress, FormHelperText, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import InfiniteScroll from "react-infinite-scroll-component";
import {ChatMessage} from "@/entities/ChatMessage/ChatMessage";
import {useCallback, useEffect, useRef, useState} from "react";
import {useAuthorization} from "@/hooks/useAuthorization";
import api from "@/shared/api";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {messageSchema} from "@/shared/schemas/schemas";
import {debounce} from "lodash";
import {useRouter} from "next/router";

const PreviousMessagesLoader = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: "center", marginBottom: "20px" }}>
      <CircularProgress sx={{color: "#faf4cb"}} />
    </Box>
  )
}

export default function Chat() {
  const {authUser, setAuthUser, socket, setSocket} = useAuthorization();
  const [usersList, setUsersList] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recipient, setRecipient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const latestMessageRef = useRef();
  const [error, setError] = useState("");
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(messageSchema),
  });

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
      console.log('error at getting chat messages', error);
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

  const debouncedScrollToLatestMessage = useCallback(
    debounce(() => {
      if (latestMessageRef.current) {
        latestMessageRef.current.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 300),
    []
  );

  const onSubmit = async (data) => {
    if (recipient) {
      const formData = {
        message: data.message,
        to: recipient
      }
      socket.emit('message', formData, (error, savedMessage) => {
        if (error) {
          setError(error);
        } else {
          setMessages(prev => [savedMessage, ...prev]);
          debouncedScrollToLatestMessage();
        }
      });
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
      })
      socket.on("disconnect", () => {
        router.push("/expired-session");
      })
      socket.on("users-list", (data) => {
        setUsersList(data);
      })
      return () => socket.disconnect(true);
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
          <Box sx={{
            margin: "10px",
            marginLeft: `${drawerWidth + 10}px`,
          }}>
            {recipient && (
              <>
                <Box>
                  <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <Chip label={`You are chatting with ${recipient.firstName} ${recipient.lastName}`} color="primary" />
                    <Button variant="contained" color="inherit" onClick={closeChat}>Close chat</Button>
                  </Box>
                </Box>
                <div id="scrollableDiv" style={{ height: "65vh", overflow: "auto",
                  display: "flex",
                  flexDirection: "column-reverse" }}>
                  {!!messages.length && (
                    <InfiniteScroll
                      dataLength={messages.length}
                      next={fetchMoreData}
                      inverse={true}
                      hasMore={hasMore}
                      style= {{
                        display: "flex",
                        flexDirection: "column-reverse"
                      }}
                      loader={<PreviousMessagesLoader />}
                      scrollableTarget="scrollableDiv"
                    >
                      <div style={{width: "100%", height: "10px", marginTop: "20px"}} ref={latestMessageRef}/>
                      {messages.map((message, index) => (
                        <ChatMessage key={message._id} message={message} recipient={recipient} />
                      ))}
                    </InfiniteScroll>
                  )}
                </div>
                <Box
                  sx={{
                    marginTop: "auto",
                    height: "20vh",
                    display: "flex",
                    justifyContent: "center",
                    padding: "20px"
                  }}
                >
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{display: "flex", justifyContent: "center"}}>
                      <TextField
                        label="Message"
                        multiline
                        rows={5}
                        variant="filled"
                        {...register("message")}
                        sx={{
                          width: "450px",
                          backgroundColor: "#ecfefa",
                          borderRadius: "5px"
                        }}
                      />
                      <Button variant="contained" type="submit" sx={{marginLeft: "25px"}}>Send</Button>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "start"}}>
                      {errors.message?.message && <FormHelperText sx={{color: "#faf4cb"}}>{errors.message?.message}</FormHelperText>}
                    </Box>
                  </form>
                </Box>
              </>
            )}
          </Box>
          {/*<Chat*/}
          {/*  recipient={recipient}*/}
          {/*  closeChat={closeChat}*/}
          {/*  messages={messages}*/}
          {/*  fetchMoreData={fetchMoreData}*/}
          {/*  hasMore={hasMore}*/}
          {/*  setError={setError}*/}
          {/*  setMessages={setMessages}*/}
          {/*/>*/}
        </Box>
      </ProtectedRoute>
    </>
  )
}
