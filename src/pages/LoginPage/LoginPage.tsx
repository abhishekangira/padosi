import styles from "./LoginPage.module.scss";
import { Acme, Dancing_Script } from "next/font/google";
import { LoginWidget } from "@/pages/LoginPage/LoginWidget/LoginWidget";
import logo from "public/images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useLayout } from "@/lib/hooks/useLayout";

const acme = Acme({
  weight: "400",
  subsets: ["latin"],
});

const dancing_script = Dancing_Script({
  subsets: ["latin"],
});

export function LoginPage() {
  useLayout({ noLayout: true });
  return (
    <div className="isolate flex min-h-screen flex-col">
      <main className="relative grid flex-grow grid-rows-[12rem_auto_auto] place-items-center gap-8 md:grid-cols-2 md:grid-rows-[auto_auto] md:px-8">
        <section className="mt-8 grid gap-2 self-start text-center md:mt-[35vh]">
          <div className="flex items-baseline justify-center">
            <div className="relative h-36 sm:w-[4.5rem] sm:h-[4.5rem]">
              <Image src={logo} alt="logo of Padosi" fill sizes="(min-width: 640px) 192px, 112px" />
            </div>
            <h1 className={`font-bold text-5xl text-primary lg:text-7xl -ml-1 sm:-ml-[13px]`}>
              adosi
            </h1>
          </div>
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

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className={styles.stars}></div>
          <div className={styles.stars2}></div>
          <div className={styles.stars3}></div>
        </div>
      </main>
      <footer className="bg-glass footer place-items-center gap-y-4 self-end p-4 text-neutral-content">
        <div className="grid-flow-col items-center md:justify-self-start">
          <Image src={logo} alt="Logo of Padosi" width={30} height={30} />
          <p>Padosi © 2023 - All right reserved</p>
        </div>
        <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <Link className="link-hover link-primary link" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="link-hover link-primary link" href="/terms-of-use">
            Terms of Use
          </Link>
        </div>
      </footer>
    </div>
  );
}
