import {useState} from "react";
import {AuthorizationContext} from "@/providers/AuthorizationProvider/AuthorizationContext";

export function AuthorizationProvider({children}) {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);

  return (
    <AuthorizationContext.Provider value={{ authUser, setAuthUser, socket, setSocket}}>
      {children}
    </AuthorizationContext.Provider>
  )
}
