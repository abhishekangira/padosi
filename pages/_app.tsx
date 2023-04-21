import "../src/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Lexend_Deca } from "next/font/google";
import { UserContextProvider } from "@/lib/contexts/user-context";
import { LayoutContextProvider } from "@/lib/contexts/layout-context";
import { Layout } from "@/components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const font = Lexend_Deca({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <LayoutContextProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          </LayoutContextProvider>
        </UserContextProvider>
      </QueryClientProvider>
    </>
  );
}
