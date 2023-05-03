import { useLayoutContext } from "@/lib/contexts/layout-context";
import Head from "next/head";
import { TopNav } from "../TopNav";
import { BottomNav } from "../BottomNav";
import { useUserContext } from "@/lib/contexts/user-context";
import FullPageLoader from "../FullPageLoader/FullPageLoader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { hideNavbar, navbarTitle, noLayout } = useLayoutContext();
  const { loading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading)
      if (router.pathname === "/home") {
        setTimeout(() => {
          window.scrollTo(0, 882);
          console.log("scrolling to", 882);
        }, 0);
      }
  }, [router.pathname, loading]);

  return (
    <>
      <Head>
        <title>Padosi</title>
        <meta name="description" content="Padosi - Connecting People, One Neighbour at a Time" />
        {/* <meta name="viewport" content="viewport-fit=cover" /> */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {noLayout ? (
        children
      ) : (
        <>
          {!hideNavbar && (
            <header className="hidden md:block">
              <TopNav title={navbarTitle} />
            </header>
          )}
          <main className="pb-12 md:pt-16">{children}</main>
          {!hideNavbar && (
            <footer className="md:hidden">
              <BottomNav active={navbarTitle} />
            </footer>
          )}
        </>
      )}
      <div className="bg-radial fixed top-0 -z-10 min-h-screen w-screen"></div>
    </>
  );
}
