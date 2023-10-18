import {useEffect, useState} from "react";
import {ChatSkeleton} from "@/widgets/PageSkeletons/ChatSkeleton";
import { io } from "socket.io-client";
import {useAuthorization} from "@/hooks/useAuthorization";
import {RedirectComponent} from "@/shared/ui/RedirectComponent/RedirectComponent";
import api from "@/shared/api";

const TOKEN_VERIFICATION_STATUS = {
  initial: "initial",
  verified: "verified",
  notVerified: "notVerfied",
}

export const ProtectedRoute = ({children}) => {
  const [verificationStatus, setVerificationStatus] = useState(TOKEN_VERIFICATION_STATUS.initial);
  const {setAuthUser, setSocket} = useAuthorization();

  useEffect(() => {
    const verifyAccessToken = async () => {
      try {
        const result = await api.get('verify-token');
        setAuthUser(result.data.user);
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

  const renderContent = (status) => {
    switch(status) {
      case TOKEN_VERIFICATION_STATUS.initial: {
        return <ChatSkeleton/>
      }
      case TOKEN_VERIFICATION_STATUS.verified: {
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