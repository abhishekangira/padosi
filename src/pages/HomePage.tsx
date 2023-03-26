import Image from "next/image";
import communityPic from "images/community.webp";
import { Acme } from "next/font/google";

const acme = Acme({
  weight: "400",
  subsets: ["latin"],
});

const tagline = "Padosi helps you connect to your neighbors and community.";

export function HomePage() {
  return (
    <main className="justify-betwewn flex flex-col items-center">
      <section className="grid max-w-lg gap-y-4 text-center lg:text-left">
        <h1 className={`${acme.className} text-4xl`}>Padosi</h1>
        <h2 className="max-w-sm text-center text-xl font-bold text-primary dark:text-primary-light">
          {tagline}
        </h2>
      </section>
      <section className="z-10 flex w-11/12 max-w-sm flex-col gap-y-6">
        <button>Log in with Facebook</button>
        <button>Log in with Google</button>
      </section>
      <div className="absolute bottom-0 h-[35vh] w-[70vw] animate-fade">
        <Image
          src={communityPic}
          alt="logo"
          priority
          fill
          className="object-contain object-bottom"
        />
      </div>
    </main>
  );
}
