import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/auth");
    } else {
      router.push("/chat");
    }
  }, []);

  return null;
}
