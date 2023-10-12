import {useEffect, useRef, useState} from "react";
import {ChatSkeleton} from "@/components/ChatSkeleton";
import { useRouter } from 'next/router'
import api from "@/utils/api";
import { io } from "socket.io-client";
import Button from "@mui/material/Button";
import {AppBar, Chip, Divider, Drawer, IconButton, List, Modal, TextField, Toolbar} from "@mui/material";
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useAuthorization} from "@/hooks/useAuthorization";
import {useForm} from "react-hook-form";
import {format} from "date-fns";

const TOKEN_VERIFICATION_STATUS = {
  initial: "initial",
  verified: "verified",
  notVerified: "notVerfied",
}

const drawerWidth = 240;

const RedirectForNotVerified = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth");
  }, []);

  return null;
}

const ChatMessage = ({message, recipient}) => {
  const isMessageFromRecipient = message.userId === recipient._id;

  return (
    <Box sx={{
      backgroundColor: "#faf4cb",
      borderRadius: "10px",
      width: "50%",
      ...(!isMessageFromRecipient ? { marginLeft: 'auto' } : {}),
      }}
    >
      <Box sx={{display: 'flex', padding: "10px"}}>
        <PersonPinIcon color="warning"/>
        <Typography sx={{marginLeft: "20px"}}>{isMessageFromRecipient ? recipient.username : "Me"}</Typography>
      </Box>
      <Typography sx={{marginLeft: "20px"}}>{format(new Date(message.createdAt), 'MMM-dd-yyyy HH:mm')}</Typography>
      <Typography paragraph sx={{ padding: "10px" }}>
        {message.message}
      </Typography>
    </Box>
  )
}

const NotificationMessage = ({notification, isLastNotification, users}) => {
  const sender = users.find((user) => user._id === notification.userId);
  return(
    <>
      <Box sx={{padding: "10px", maxWidth: "300px"}}>
        <Box sx={{display: 'flex'}}>
          <PersonPinIcon color="primary"/>
          <Typography>{sender.username}</Typography>
          <Typography sx={{marginLeft: "20px"}}>{format(new Date(notification.createdAt), 'MMM-dd-yyyy HH:mm')}</Typography>
          <Divider />
        </Box>
        <Typography>{notification.message}</Typography>
      </Box>
      {!isLastNotification && <Divider />}
    </>
  )
}

export const ProtectedRoute = ({children}) => {
  const [verificationStatus, setVerificationStatus] = useState(TOKEN_VERIFICATION_STATUS.initial);
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const {authUser, setAuthUser} = useAuthorization();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [recipient, setRecipient] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const latestMessageRef = useRef();
  const firstMessageRef = useRef();
  const scrollRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);

  const openPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
    setNotifications([]);
    setNotificationsCount(0);
  };

  useEffect(() => {
    const verifyAccessToken = async () => {
      try {
        const result = await api.get('verify-token');
        console.log('result for verification', result);
        setAuthUser(result.data.user);
        setVerificationStatus(TOKEN_VERIFICATION_STATUS.verified);
      } catch (error) {
        console.log('error for verification', error);
        localStorage.removeItem("token");
        setVerificationStatus(TOKEN_VERIFICATION_STATUS.notVerified);
      }
    }

    const connectSocket = async () => {
      if (localStorage.getItem("token")) {
        // const decryptedToken = decryptToken(localStorage.getItem("token"), USER_IP.IP_ADDRESS);
        const socket = io('http://localhost:5000', {
          transports: ['websocket'],
          auth: {
            token: localStorage.getItem("token")
          },
        });
        setSocket(socket);
      }
    }
    verifyAccessToken().then(() => connectSocket());
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
      })
      socket.on("disconnect", () => {
        // router.push("/expired-session");
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
          setMessages((prev) => [...prev, data]);
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

  const logout = () => {
    if (socket) {
      socket.emit('logout');
      localStorage.removeItem("token");
    }
  }

  const onSubmit = async (data) => {
    if (recipient) {
      const formData = {
        message: data.message,
        to: recipient
      }
      socket.emit('message', formData, (savedMessage) => {
        scrollRef.current = "bottom";
        setMessages(prev => [...prev, savedMessage]);
      });
    }
  }

  useEffect(() => {
    switch (scrollRef.current) {
      case "top": {
        return;
      }
      case "bottom": {
        if (latestMessageRef.current) {
          latestMessageRef.current.scrollIntoView({
            behavior: 'smooth',
          });
        }
        return;
      }
      default: {
        return;
      }
    }

  }, [messages]);

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
        scrollRef.current = "bottom";
        setMessages(result.data.messages);
        console.log('result.data.messages', result.data.messages);
      }
    } catch (error) {
      console.log('error at getting chat messages', error);
    }

  }

  const closeChat = () => {
    setRecipient(null);
  }

  const renderContent = (status) => {
    switch(status) {
      case TOKEN_VERIFICATION_STATUS.initial: {
        return <ChatSkeleton/>
      }
      case TOKEN_VERIFICATION_STATUS.verified: {
        return (
          <Box>
            <AppBar position="static">
              <Toolbar style={{ justifyContent: 'flex-end' }}>
                <Box>
                  <IconButton onClick={openPopover}>
                    <Badge badgeContent={notificationsCount} color="secondary">
                      <NotificationsActiveIcon sx={{color: "white"}} />
                    </Badge>
                  </IconButton>
                  <Button color="inherit" onClick={logout}>Logout</Button>
                </Box>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={closePopover}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {notifications.length
                    ? notifications.map((notification) => <NotificationMessage key={notification._id} notification={notification} users={usersList} />)
                    : (
                      <Box sx={{padding: "10px", maxWidth: "300px"}}>
                        <Typography>There are no notifications for you now.</Typography>
                      </Box>
                    )}
                </Popover>
              </Toolbar>
            </AppBar>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Toolbar>
                <Typography variant="h6" noWrap component="div">
                  Socket Chat App
                </Typography>
              </Toolbar>
              <Divider />
              <List>
                {usersList.map((user, index) => (
                  <ListItem key={index} disablePadding onClick={() => selectRecipient(user)}>
                    <ListItemButton>
                      <ListItemIcon>
                        <AccountCircleIcon color={user.online ? "success" : "error"}/>
                      </ListItemIcon>
                      <ListItemText primary={`${user.firstName} ${user.lastName} ${user._id === authUser._id ? "(You)" : ""}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>
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
                  <Box
                    sx={{
                      margin: "10px",
                      height: "65vh",
                      overflow: "auto",
                    }}
                  >
                    {messages.map(message => <ChatMessage key={message._id} message={message} recipient={recipient} />)}
                    <div style={{width: "100%", height: "10px", marginTop: "20px"}} ref={latestMessageRef}/>
                  </Box>

                  <Box
                    sx={{
                      margin: "10px",
                      height: "20vh",
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px"
                    }}
                  >
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Box sx={{display: "flex", justifyContent: "center"}}>
                        <TextField
                          id="filled-multiline-static"
                          label="Message"
                          multiline
                          rows={5}
                          variant="filled"
                          {...register("message")}
                          sx={{
                            width: "450px",
                            backgroundColor: "#ecfefa", // Set background color
                            borderRadius: "5px"
                          }}
                        />
                        <Button variant="contained" type="submit" sx={{marginLeft: "25px"}}>Send</Button>
                      </Box>
                    </form>
                  </Box>
                </>
              )}
            </Box>
          {/*{children}*/}
          </Box>
        )
      }
      case TOKEN_VERIFICATION_STATUS.notVerified: {
        return <RedirectForNotVerified />
      }
    }
  }
  return (
    <>
      {renderContent(verificationStatus)}
    </>
  )
}