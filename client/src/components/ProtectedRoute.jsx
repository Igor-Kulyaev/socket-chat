import {useEffect, useState} from "react";
import {GeneralSkeleton} from "@/components/GeneralSkeleton";
import { useRouter } from 'next/router'
import api from "@/utils/api";
import { io } from "socket.io-client";
import Button from "@mui/material/Button";
import {NewConnectionModal} from "@/components/NewConnectionModal";
import {Modal} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const TOKEN_VERIFICATION_STATUS = {
  initial: "initial",
  verified: "verified",
  notVerified: "notVerfied",
}

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
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  useEffect(() => {
    const verifyAccessToken = async () => {
      try {
        const result = await api.get('verify-token');
        console.log('result for verification', result);
        setVerificationStatus(TOKEN_VERIFICATION_STATUS.verified);
      } catch (error) {
        localStorage.removeItem("token");
        setVerificationStatus(TOKEN_VERIFICATION_STATUS.notVerified);
      }
    }

    const connectSocket = async () => {
      if (localStorage.getItem("token")) {
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
        handleOpen();
      })
      return () => socket.disconnect(true);
    }

  }, [socket]);

  console.log('socket', socket);

  const emitMessage = async () => {
    socket.emit('message', "Hello world");
  }

  const renderContent = (status) => {
    switch(status) {
      case TOKEN_VERIFICATION_STATUS.initial: {
        return <GeneralSkeleton/>
      }
      case TOKEN_VERIFICATION_STATUS.verified: {
        return (
          <>
            <Button variant="contained" onClick={emitMessage}>Emit message</Button>
            <div>
              <Button onClick={handleOpen}>Open modal</Button>
              <Modal
                open={open}
              >
                <Box sx={style}>
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                    Oops...
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    You have started a new session in separate tab.
                  </Typography>
                </Box>
              </Modal>
            </div>
          {children}
          </>
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