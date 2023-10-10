import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Button from '@mui/material/Button';
import api from "@/utils/api";
import {useRouter} from "next/router";
import {ProtectedRoute} from "@/components/ProtectedRoute";
import {useEffect} from "react";
import {decryptToken, encryptToken, USER_IP} from "@/utils/encryption";

const inter = Inter({ subsets: ['latin'] })

export default function Chat() {
  const router = useRouter();
  const logout = async () => {
    try {
      const result = await api.post('logout');
      console.log('result', result);
      localStorage.removeItem("token");
      await router.push("/auth");
    } catch (error) {
      console.log('error', error);
      localStorage.removeItem("token");
    }
  }

  const checkRefresh = async () => {
    try {
      const result = await api.get('protected');
      console.log('result for protected', result)
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    const encryptedToken = encryptToken(localStorage.getItem("token"), USER_IP.IP_ADDRESS);
    console.log('encryptedToken', encryptedToken);
    const decryptedToken = decryptToken(encryptedToken, 'test');
    console.log('decryptedToken', decryptedToken);
  }, []);

  return (
    <ProtectedRoute>
      <Head>
        <title>Socket Chat App</title>
        <meta name="description" content="Socket Chat Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Button variant="contained" onClick={logout}>Logout</Button>
        <Button variant="contained" onClick={checkRefresh}>Check refresh</Button>
        This is chat page
      </main>
    </ProtectedRoute>
  )
}
