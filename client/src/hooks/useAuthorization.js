import {useContext} from "react";
import {AuthorizationContext} from "@/providers/AuthorizationProvider/AuthorizationContext";

export function useAuthorization() {
  return useContext(AuthorizationContext);
}
