import styles from "./HomePage.module.scss";
import { Acme, Dancing_Script } from "next/font/google";
import { LoginWidget } from "@/components/LoginWidget/LoginWidget";

const acme = Acme({
  weight: "400",
  subsets: ["latin"],
});

const dancing_script = Dancing_Script({
  subsets: ["latin"],
});

export function HomePage() {
  return (
    <>
      <main className="isolate grid grid-rows-[12rem_auto_2rem] place-items-center md:grid-cols-2 md:grid-rows-[auto_1rem] md:px-8 md:pb-2">
        <section className="grid gap-2 text-center">
          <h1 className={`${acme.className} text-5xl text-primary lg:text-7xl`}>Padosi</h1>
          <h2
            className={`${dancing_script.className} animate-fade whitespace-nowrap text-3xl font-bold lg:text-5xl`}
          >
            <span>Connecting People,</span>
            <br />
            <span>One Neighbor at a Time</span>
          </h2>
        </section>
        <section className="w-full max-w-md self-start px-4 sm:mt-16">
          <LoginWidget />
        </section>
        <footer className="col-span-full text-primary-light">Privacy Policy</footer>

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className={styles.stars}></div>
          <div className={styles.stars2}></div>
          <div className={styles.stars3}></div>
        </div>
      </main>
    </>
  );
}
