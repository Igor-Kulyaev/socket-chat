import {useCallback, useEffect, useRef, useState} from "react";
import {ChatSkeleton} from "@/widgets/PageSkeletons/ChatSkeleton";
import { useRouter } from 'next/router'
import { io } from "socket.io-client";
import api from "@/shared/api";
import Button from "@mui/material/Button";
import {
  Chip,
  CircularProgress,
  Divider,
  FormHelperText,
  IconButton,
  List,
  TextField,
  Toolbar
} from "@mui/material";
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
import InfiniteScroll from "react-infinite-scroll-component";
import {debounce} from "lodash";
import {yupResolver} from "@hookform/resolvers/yup";
import ClosableSnackbar from "@/shared/ui/Snackbar/ClosableSnackbar";
import {messageSchema} from "@/shared/schemas/schemas";
import {ChatMessage} from "@/entities/ChatMessage/ChatMessage";
import {RedirectComponent} from "@/shared/ui/RedirectComponent/RedirectComponent";
import {NotificationMessage} from "@/entities/NotificationMessage/NotificationMessage";
import {AppBar} from "@/widgets/AppBar/AppBar";
import {drawerWidth} from "@/shared/constants/constants";
import {Drawer} from "@/widgets/Drawer/Drawer";

const TOKEN_VERIFICATION_STATUS = {
  initial: "initial",
  verified: "verified",
  notVerified: "notVerfied",
}
// const PreviousMessagesLoader = () => {
//   return (
//     <Box sx={{ display: 'flex', justifyContent: "center", marginBottom: "20px" }}>
//       <CircularProgress sx={{color: "#faf4cb"}} />
//     </Box>
//   )
// }

export const ProtectedRoute = ({children}) => {
  const [verificationStatus, setVerificationStatus] = useState(TOKEN_VERIFICATION_STATUS.initial);
  // const [socket, setSocket] = useState(null);
  // const router = useRouter();
  // const [usersList, setUsersList] = useState([]);
  const {authUser, setAuthUser, socket, setSocket} = useAuthorization();
  // const { register, handleSubmit, watch, formState: { errors } } = useForm({
  //   resolver: yupResolver(messageSchema),
  // });
  // const [recipient, setRecipient] = useState(null);
  // const [notificationsCount, setNotificationsCount] = useState(0);
  // const [notifications, setNotifications] = useState([]);
  // const [messages, setMessages] = useState([]);
  // const latestMessageRef = useRef();
  // const firstMessageRef = useRef();
  // const scrollRef = useRef();
  // const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  // const [hasMore, setHasMore] = useState(false);
  // const [displayType, setDisplayType] = useState("box") // "box" or "infinite-scroll"\
  // const [error, setError] = useState("");

  // const openNotifications = (event) => {
  //   setPopoverAnchorEl(event.currentTarget);
  // };

  // const closeNotifications = () => {
  //   setPopoverAnchorEl(null);
  //   setNotifications([]);
  //   setNotificationsCount(0);
  // };

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

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("connect", () => {
  //     })
  //     socket.on("disconnect", () => {
  //       router.push("/expired-session");
  //     })
  //     socket.on("users-list", (data) => {
  //       setUsersList(data);
  //     })
  //     return () => socket.disconnect(true);
  //   }
  // }, [socket]);
  //
  // useEffect(() => {
  //   if (socket) {
  //     socket.on("message", (data) => {
  //       if (recipient && recipient._id === data.userId) {
  //         setMessages((prev) => [data, ...prev]);
  //       } else {
  //         setNotificationsCount(prev => prev + 1)
  //         setNotifications((prev) => [...prev, data]);
  //       }
  //     })
  //     return () => {
  //       socket.off("message");
  //     }
  //   }
  // }, [socket, recipient]);

  // const logout = () => {
  //   if (socket) {
  //     localStorage.removeItem("token");
  //     socket.emit('logout');
  //   }
  // }

//   const debouncedScrollToLatestMessage = useCallback(
//     debounce(() => {
//       if (latestMessageRef.current) {
//         latestMessageRef.current.scrollIntoView({
//           behavior: 'smooth',
//         });
//       }
//     }, 300),
// []
//   );

  // const onSubmit = async (data) => {
  //   if (recipient) {
  //     const formData = {
  //       message: data.message,
  //       to: recipient
  //     }
  //     socket.emit('message', formData, (error, savedMessage) => {
  //       if (error) {
  //         setError(error);
  //       } else {
  //         scrollRef.current = "bottom";
  //         setMessages(prev => [savedMessage, ...prev]);
  //         debouncedScrollToLatestMessage();
  //       }
  //     });
  //   }
  // }

  // const selectRecipient = async (user) => {
  //   try {
  //     setMessages([]);
  //     if (user._id === authUser._id) {
  //       setRecipient(null);
  //     } else {
  //       setRecipient(user);
  //       const result = await api.get('chat-messages', {
  //         params: {
  //           recipientId: user._id,
  //         }
  //       });
  //       scrollRef.current = "bottom";
  //       setMessages(result.data.messages);
  //       if (result.data.messages.length < 10) {
  //         setHasMore(false);
  //       } else {
  //         setHasMore(true);
  //       }
  //       console.log('result.data.messages', result.data.messages);
  //     }
  //   } catch (error) {
  //     setHasMore(false);
  //     setError(error?.response?.data?.message || error?.message);
  //     console.log('error at getting chat messages', error);
  //   }
  // }

  // const fetchMoreData = async () => {
  //   console.log('fetchMoreData')
  //   try {
  //     const result = await api.get('chat-messages', {
  //       params: {
  //         recipientId: recipient._id,
  //         lastMessageId: messages[messages.length - 1]._id,
  //       }
  //     });
  //     if (result.data.messages.length < 10) {
  //       setHasMore(false);
  //     }
  //     setMessages((prev) => [...prev, ...result.data.messages]);
  //   } catch (error) {
  //     setHasMore(false);
  //     setError(error?.response?.data?.message || error?.message);
  //     console.log('Error at fetching more data', error);
  //   }
  // }

  // const closeChat = () => {
  //   setRecipient(null);
  // }

  const renderContent = (status) => {
    switch(status) {
      case TOKEN_VERIFICATION_STATUS.initial: {
        return <ChatSkeleton/>
      }
      case TOKEN_VERIFICATION_STATUS.verified: {
        // return (
        //   <Box>
        //     {error && (
        //       <ClosableSnackbar message={error} setMessage={setError} severity="error" />
        //     )}
        //     <AppBar
        //       openNotifications={openNotifications}
        //       notificationsCount={notificationsCount}
        //       logout={logout}
        //       popoverAnchorEl={popoverAnchorEl}
        //       closeNotifications={closeNotifications}
        //       notifications={notifications}
        //       usersList={usersList}
        //     />
        //     <Drawer usersList={usersList} selectRecipient={selectRecipient} authUser={authUser} />
        //     <Box sx={{
        //       margin: "10px",
        //       marginLeft: `${drawerWidth + 10}px`,
        //     }}>
        //       {recipient && (
        //         <>
        //           <Box>
        //             <Box sx={{display: "flex", justifyContent: "space-between"}}>
        //               <Chip label={`You are chatting with ${recipient.firstName} ${recipient.lastName}`} color="primary" />
        //               <Button variant="contained" color="inherit" onClick={closeChat}>Close chat</Button>
        //             </Box>
        //           </Box>
        //           <div id="scrollableDiv" style={{ height: "65vh", overflow: "auto",
        //             display: "flex",
        //             flexDirection: "column-reverse" }}>
        //             {!!messages.length && (
        //               <InfiniteScroll
        //                 dataLength={messages.length}
        //                 next={fetchMoreData}
        //                 inverse={true}
        //                 hasMore={hasMore}
        //                 style= {{
        //                   display: "flex",
        //                   flexDirection: "column-reverse"
        //                 }}
        //                 loader={<PreviousMessagesLoader />}
        //                 scrollableTarget="scrollableDiv"
        //               >
        //                 <div style={{width: "100%", height: "10px", marginTop: "20px"}} ref={latestMessageRef}/>
        //                 {messages.map((message, index) => (
        //                   <ChatMessage key={message._id} message={message} recipient={recipient} />
        //                 ))}
        //               </InfiniteScroll>
        //             )}
        //           </div>
        //           <Box
        //             sx={{
        //               marginTop: "auto",
        //               height: "20vh",
        //               display: "flex",
        //               justifyContent: "center",
        //               padding: "20px"
        //             }}
        //           >
        //             <form onSubmit={handleSubmit(onSubmit)}>
        //               <Box sx={{display: "flex", justifyContent: "center"}}>
        //                 <TextField
        //                   label="Message"
        //                   multiline
        //                   rows={5}
        //                   variant="filled"
        //                   {...register("message")}
        //                   sx={{
        //                     width: "450px",
        //                     backgroundColor: "#ecfefa", // Set background color
        //                     borderRadius: "5px"
        //                   }}
        //                 />
        //                 <Button variant="contained" type="submit" sx={{marginLeft: "25px"}}>Send</Button>
        //               </Box>
        //               <Box sx={{display: "flex", justifyContent: "start"}}>
        //                 {errors.message?.message && <FormHelperText sx={{color: "#faf4cb"}}>{errors.message?.message}</FormHelperText>}
        //               </Box>
        //             </form>
        //           </Box>
        //         </>
        //       )}
        //     </Box>
        //   </Box>
        // )
        return (
          <>
            {children}
          </>
        )
      }
      case TOKEN_VERIFICATION_STATUS.notVerified: {
        return <RedirectComponent path={"/auth"} />
      }
    }
  }
  return (
    <>
      {renderContent(verificationStatus)}
    </>
  )
}