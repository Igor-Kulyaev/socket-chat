import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter();
  // const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push("/auth");
    } else {
      router.push("/chat");
    }
  }, []);

  return null;
}
