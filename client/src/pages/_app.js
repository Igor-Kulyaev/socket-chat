import '@/styles/reset.css'
import '@/styles/globals.css'
import {USER_IP} from "@/utils/encryption";

fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => USER_IP.IP_ADDRESS = data.ip);

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
