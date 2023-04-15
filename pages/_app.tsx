import "../src/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Lexend_Deca } from "next/font/google";
import { UserContextProvider } from "@/lib/contexts/user-context";
import { LayoutContextProvider } from "@/lib/contexts/layout-context";
import { Layout } from "@/components/Layout/Layout";

const font = Lexend_Deca({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <UserContextProvider>
        <LayoutContextProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LayoutContextProvider>
      </UserContextProvider>
    </>
  );
}
