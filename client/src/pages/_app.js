import '@/styles/reset.css'
import '@/styles/globals.css'
import {AuthorizationProvider} from "@/providers/AuthorizationProvider/AuthorizationProvider";

export default function App({ Component, pageProps }) {
  return (
    <>
      <AuthorizationProvider>
        <Component {...pageProps} />
      </AuthorizationProvider>
    </>
  )
}
