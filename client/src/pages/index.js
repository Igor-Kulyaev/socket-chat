import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {decryptToken, USER_IP} from "@/utils/encryption";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // const encryptedToken = localStorage.getItem('token');
    // const decryptedToken = encryptedToken ? decryptToken(encryptedToken, USER_IP.IP_ADDRESS) : null;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/auth");
    } else {
      router.push("/chat");
    }
  }, []);

  return null;
}
