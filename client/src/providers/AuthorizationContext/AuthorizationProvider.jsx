import {useState} from "react";
import {AuthorizationContext} from "@/providers/AuthorizationContext/AuthorizationContext";

export function AuthorizationProvider({children}) {
  const [authUser, setAuthUser] = useState(null);

  return (
    <AuthorizationContext.Provider value={{ authUser, setAuthUser}}>
      {children}
    </AuthorizationContext.Provider>
  )
}
