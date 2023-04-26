import { useUserContext } from "@/lib/contexts/user-context";
import { addPost } from "@/lib/firebase/posts";
import { useApi } from "@/lib/hooks/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoc } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export function NewPost({ maxLength = 500 }) {
  const { user } = useUserContext();
  console.log(user, "user");

  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();
  const {
    mutate: addPostMutation,
    isLoading: addPostLoading,
    isError: addPostError,
  } = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      setText("");
      return queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  useEffect(() => {
    const textArea = textareaRef.current! as HTMLTextAreaElement;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
  }, [text]);

  const handleChange = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement;
    setText(target.value);
  };
  return (
    <div className="relative hidden flex-col border-b border-b-sky-900 pb-4 sm:flex">
      <textarea
        ref={textareaRef}
        className="auto-expand-textarea peer textarea-ghost textarea w-full resize-none overflow-hidden p-3 pl-24 text-base focus:bg-inherit focus:outline-none"
        maxLength={maxLength}
        placeholder="What's up in the neighborhood?"
        value={text}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!user) return;
            const { geoHash, location, displayName, username, registerUsername, photoURL, uid } =
              user;
            addPostMutation({
              text,
              geoHash,
              location,
              displayName,
              username: username || registerUsername,
              photoURL,
              uid,
            });
          }
        }}
      />
      <div className="avatar absolute top-0 left-3">
        <div className="relative h-12 rounded-full sm:h-16">
          <Image
            src={user?.photoURL || "/images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <button
        onClick={() => {
          if (!user) return;
          const { geoHash, location, displayName, username, registerUsername, photoURL, uid } =
            user;
          addPostMutation({
            text,
            geoHash,
            location,
            displayName,
            username: username || registerUsername,
            photoURL,
            uid,
          });
        }}
        disabled={text.length === 0}
        className={`btn-ghost btn-sm btn text-primary ${
          addPostLoading ? "loading" : "hidden"
        } self-end focus:inline-flex active:inline-flex peer-focus:inline-flex`}
      >
        Post
      </button>
      {!!addPostError && (
        <div className="alert alert-error shadow-lg active:hidden">
          <div>
            🙁
            <span>There was an error adding your post</span>
          </div>
        </div>
      )}
    </div>
  );
}
