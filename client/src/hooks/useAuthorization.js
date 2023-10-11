import {useContext} from "react";
import {AuthorizationContext} from "@/providers/AuthorizationContext/AuthorizationContext";

export function useAuthorization() {
  return useContext(AuthorizationContext);
}
