import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import avatar from "public/images/avatar.png";
import { useUserContext } from "@/lib/contexts/user-context";
import { FiEdit2 } from "react-icons/fi";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/router";
import { debouncedCheckUsernameExists } from "../SetLocationPage/SetLocationPage";
import { BiCheck, BiLoader, BiX } from "react-icons/bi";
import { endsWithNonAlphabet } from "../LoginPage/LoginWidget/useLoginWidget";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";

export function EditProfilePage() {
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const trpcUtils = trpc.useContext();
  const [errors, setErrors] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<{
    value: string;
    state: "loading" | "unavailable" | "available" | null;
  }>({ value: user?.username || "", state: null });
  const [dpUrl, setDpUrl] = useState<string | null>(null);
  const [bioText, setBioText] = useState(user?.bio || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess(data) {
      setUser(data);
      trpcUtils.user.get.invalidate();
      setLoading(false);
      router.push(`/${data.username}`);
    },
  });
  const { refetch: checkUsername } = trpc.user.get.useQuery(
    { username: username.value },
    { enabled: false }
  );

  useEffect(() => {
    if (!bioRef.current) return;
    const textArea = bioRef.current;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
  }, [bioText]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    setErrors({});
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement,
      name = form.displayName.value.trim(),
      bio = form.bio.value.trim(),
      tagline = form.tagline.value.trim(),
      photoFile = fileInputRef.current?.files?.[0];
    if (!name) {
      setErrors((prev: any) => ({ ...prev, name: "Name cannot be empty" }));
      return setLoading(false);
    } else if (endsWithNonAlphabet(name)) {
      setErrors((prev: any) => ({
        ...prev,
        displayName: "Name cannot end with a non-alphabet character",
      }));
      return setLoading(false);
    }

    // else if (!email) {
    //   setErrors((prev: any) => ({ ...prev, email: "Email cannot be empty" }));
    //   return setLoading(false);
    // } else if (!emailRegex.test(email)) {
    //   setErrors((prev: any) => ({ ...prev, email: "Invalid email" }));
    //   return setLoading(false);
    // }

    if (username.state === "available" || username.value === user?.username) {
      checkUsername().then(async (res) => {
        if (res.data && res.data.id !== user?.id) {
          setUsername((prev) => ({ ...prev, state: "unavailable" }));
          setErrors((prev: any) => ({
            ...prev,
            username: "Username taken",
          }));
        } else {
          let photo = user?.photo;
          if (photoFile) {
            const storageRef = ref(storage, `users/${user?.id}/dp`);
            await uploadBytes(storageRef, photoFile).then((snapshot) => {
              console.log("Uploaded a blob or file!", snapshot);
            });
            photo = await getDownloadURL(storageRef);
          }
          updateUser({
            id: user?.id!,
            name,
            username: username.value,
            bio,
            tagline,
            photo,
          });
        }
      });
    }
  };
  return (
    <form className="form-control max-w-3xl mx-auto px-4 py-8" onSubmit={handleSubmit}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          const maxSize = 1000000;
          if (file) {
            if (file.size > maxSize) {
              alert("File size too large. Max size is 1MB");
              return;
            }
            setDpUrl(URL.createObjectURL(file));
          }
        }}
      />
      <div
        className="avatar relative self-center cursor-pointer"
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        <span className="sm:text-xl absolute inset-3/4 z-10 btn btn-primary btn-sm sm:btn-md btn-circle border-none">
          <FiEdit2 />
        </span>
        <div className="relative h-28 sm:h-52 mask mask-squircle bg-secondary">
          <Image
            src={dpUrl || user?.photo || avatar}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 192px, 112px"
          />
        </div>
      </div>
      <div className="form-control">
        <label htmlFor="displayName" className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          id="displayName"
          defaultValue={user?.name}
          maxLength={30}
          placeholder="Raj Malhotra"
          className="input sm:w-1/2"
        />
        <label className="label min-h-8">
          {errors.displayName && (
            <span className="label-text-alt text-error">{errors.displayName}</span>
          )}
        </label>
      </div>
      {/* <div className="form-control">
        <label htmlFor="email" className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          id="email"
          defaultValue={user?.email}
          maxLength={100}
          placeholder="rj@radio.com"
          className="input sm:w-1/2"
        />
        <label className="label min-h-8">
          {errors.email && <span className="label-text-alt text-error">{errors.email}</span>}
        </label>
      </div> */}
      <div className="form-control">
        <label htmlFor="username" className="label">
          <span className="label-text">Username</span>
        </label>
        <div className="grid grid-cols-[1fr_1rem] sm:w-1/2">
          <input
            type="text"
            id="username"
            value={username.value}
            maxLength={20}
            onChange={async (e) => {
              setUsername({ value: e.target.value, state: "loading" });
              if (e.target.value.trim() === user?.username)
                return setUsername({ value: e.target.value, state: null });
              debouncedCheckUsernameExists(e.target.value, setUsername, checkUsername, setErrors);
            }}
            placeholder="simmiddlj"
            className="input"
          />
          <div className="text-xl text-primary grid place-items-center px-2">
            {username.state === "loading" && <BiLoader className="animate-spin" />}
            {username.state === "available" && <BiCheck className="text-success" />}
            {username.state === "unavailable" && <BiX className="text-error" />}
          </div>
        </div>
        <label className="label min-h-8">
          {errors.username && <span className="label-text-alt text-error">{errors.username}</span>}
        </label>
      </div>
      <div className="form-control">
        <label htmlFor="tagline" defaultValue={user?.tagline || ""} className="label">
          <span className="label-text">Tagline</span>
        </label>
        <input
          type="text"
          id="tagline"
          defaultValue={user?.tagline || ""}
          placeholder="My awesome tagline"
          maxLength={50}
          className="input"
        />
        <label className="label min-h-8">
          {errors.tagline && <span className="label-text-alt text-error">{errors.tagline}</span>}
        </label>
      </div>
      <div className="form-control">
        <label htmlFor="bio" className="label">
          <span className="label-text">Bio</span>
        </label>
        <textarea
          id="bio"
          ref={bioRef}
          value={bioText}
          maxLength={500}
          onChange={(e) => {
            setBioText(e.target.value);
          }}
          placeholder="Something about me"
          className="textarea h-20 overflow-y-hidden text-base"
        />
        <label className="label min-h-8">
          {errors.bio && <span className="label-text-alt text-error">{errors.bio}</span>}
        </label>
      </div>
      <button type="submit" className={`btn btn-primary btn-outline ${loading ? "loading" : ""}`}>
        Save Changes
      </button>
    </form>
  );
}
