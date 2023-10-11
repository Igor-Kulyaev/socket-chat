import {useEffect, useState} from "react";
import {ChatSkeleton} from "@/components/ChatSkeleton";
import { useRouter } from 'next/router'
import axios from "axios";
import api from "@/utils/api";
import { io } from "socket.io-client";
import Button from "@mui/material/Button";
import {AppBar, Divider, Drawer, IconButton, List, Modal, Toolbar} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {decryptToken, USER_IP} from "@/utils/encryption";
import {useAuthorization} from "@/hooks/useAuthorization";

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

export const ProtectedRoute = ({children}) => {
  const [verificationStatus, setVerificationStatus] = useState(TOKEN_VERIFICATION_STATUS.initial);
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const {authUser, setAuthUser} = useAuthorization();

  useEffect(() => {
    const verifyAccessToken = async () => {
      try {
        console.log('ip address', USER_IP.IP_ADDRESS);
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
        console.log('socket at front-end connected');
      })
      socket.on("message", (data) => {
        console.log('received data from backend', data);
      })
      socket.on("disconnect", () => {
        router.push("/expired-session");
      })
      socket.on("users-list", (data) => {
        console.log('data', data);
        setUsersList(data);
      })
      return () => socket.disconnect(true);
    }

  }, [socket]);

  console.log('socket', socket);

  const emitMessage = async () => {
    socket.emit('message', "Hello world");
  }

  const logout = () => {
    if (socket) {
      socket.emit('logout');
      localStorage.removeItem("token");
    }
  }

  const renderContent = (status) => {
    switch(status) {
      case TOKEN_VERIFICATION_STATUS.initial: {
        return <ChatSkeleton/>
      }
      case TOKEN_VERIFICATION_STATUS.verified: {
        return (
          <Box>
            {/*<Button variant="contained" onClick={emitMessage}>Emit message</Button>*/}
            <AppBar position="static">
              <Toolbar style={{ justifyContent: 'flex-end' }}>
                <Button color="inherit" onClick={logout}>Logout</Button>
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
                  <ListItem key={index} disablePadding>
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