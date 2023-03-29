import styles from "./HomePage.module.scss";
import { Acme, Dancing_Script } from "next/font/google";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { LoginWidget } from "components/LoginWidget/LoginWidget";

const acme = Acme({
  weight: "400",
  subsets: ["latin"],
});

const dancing_script = Dancing_Script({
  subsets: ["latin"],
});

export function HomePage() {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      <main className="isolate grid h-screen grid-cols-2 grid-rows-[auto_1rem] place-items-center px-8 pb-2">
        <section className="grid gap-2">
          <h1
            className={`${acme.className} text-primary md:text-5xl lg:text-7xl`}
          >
            Padosi
          </h1>
          <h2
            className={`${dancing_script.className} animate-fade whitespace-nowrap font-bold md:text-3xl lg:text-5xl`}
          >
            <span>Connecting People,</span>
            <br />
            <span>One Neighbor at a Time</span>
          </h2>
        </section>
        <section>
          <LoginWidget />
        </section>
        <footer className="col-span-full text-primary-light">
          Privacy Policy
        </footer>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className={styles.stars}></div>
          <div className={styles.stars2}></div>
          <div className={styles.stars3}></div>
        </div>
      </main>
    </>
  );
}
