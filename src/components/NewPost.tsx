import { useUserContext } from "@/lib/contexts/user-context";
import { addPost } from "@/lib/firebase/posts";
import { useApi } from "@/lib/hooks/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoc } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export function NewPost({ maxLength = 1000 }) {
  const { user } = useUserContext();

  const [showTitleInput, setShowTitleInput] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const textRef = useRef(null);
  const titleRef = useRef(null);
  const queryClient = useQueryClient();
  const {
    mutate: addPostMutation,
    isLoading: addPostLoading,
    isError: addPostError,
  } = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      setText("");
      setTitle("");
      return queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  useEffect(() => {
    const textAreas = [
      textRef.current! as HTMLTextAreaElement,
      titleRef.current! as HTMLTextAreaElement,
    ];
    textAreas.forEach((textArea) => {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    });
  }, [text, title]);

  const handleChange = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement;
    if (target.id === "postTitle") setTitle(target.value);
    else setText(target.value);
  };
  return (
    <div className="relative hidden flex-col border-b border-b-sky-900 pb-4 sm:flex">
      <textarea
        ref={titleRef}
        value={title}
        id="postTitle"
        onChange={handleChange}
        maxLength={150}
        className={`peer textarea pl-24 resize-none overflow-hidden textarea-ghost focus:bg-inherit focus:outline-none sm:text-lg font-bold ${
          showTitleInput ? "block" : "hidden"
        }`}
        placeholder="Your catchy title"
      />
      <textarea
        ref={textRef}
        className="peer textarea-ghost textarea resize-none overflow-hidden pl-24 text-base focus:bg-inherit focus:outline-none"
        maxLength={maxLength}
        placeholder="What's up in the neighborhood?"
        value={text}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && text) {
            event.preventDefault();
            if (!user) return;
            const { geoHash, location, displayName, username, registerUsername, photoURL, uid } =
              user;
            addPostMutation({
              text,
              title: showTitleInput ? title : "",
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
      <div className="self-end hidden focus:flex active:flex peer-focus:flex">
        <button
          className="btn btn-sm capitalize"
          onClick={() => {
            setShowTitleInput((prev) => !prev);
            textRef.current?.focus();
          }}
        >
          {showTitleInput ? "Remove Title" : "Add Title"}
        </button>
        <button
          onClick={() => {
            if (!user) return;
            const { geoHash, location, displayName, username, registerUsername, photoURL, uid } =
              user;
            addPostMutation({
              text,
              title: showTitleInput ? title : "",
              geoHash,
              location,
              displayName,
              username: username || registerUsername,
              photoURL,
              uid,
            });
          }}
          disabled={text.length === 0}
          className={`btn-ghost btn-sm btn text-primary ${addPostLoading ? "loading" : ""} `}
        >
          Post
        </button>
      </div>

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
