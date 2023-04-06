import "../src/styles/globals.css";
import type { AppProps } from "next/app";
import { PT_Sans } from "next/font/google";
import { UserContextProvider } from "@/lib/user-context";

const font = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <UserContextProvider>
        <Component {...pageProps} />
      </UserContextProvider>
    </>
  );
}
