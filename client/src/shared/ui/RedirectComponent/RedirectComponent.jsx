import {useRouter} from "next/router";
import {useEffect} from "react";

export const RedirectComponent = ({path}) => {
  const router = useRouter();

  useEffect(() => {
    router.push(path);
  }, []);

  return null;
}
