import styles from "./FullPageLoader.module.scss";
import logo from "public/images/logo.png";
import Image from "next/image";

export default function FullPageLoader() {
  return (
    // ignore the warning
    <div className="relative grid h-[100dvh] h-screen w-full place-items-center">
      <div className={styles.spinner}>
        <div className={styles.spinner1}></div>
      </div>
      <Image src={logo} alt="Logo of Padosi" width={40} height={40} className={styles.imageGlow} />
    </div>
  );
}
