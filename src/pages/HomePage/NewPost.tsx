import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export function NewPost({ maxLength = 1000 }) {
  const { user } = useUserContext();

  const [showTitleInput, setShowTitleInput] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const trpcUtils = trpc.useContext();
  const {
    mutate: addPostMutation,
    isLoading: addPostLoading,
    isError: addPostError,
  } = trpc.post.create.useMutation({
    onSuccess: async (post) => {
      setText("");
      setTitle("");
      setShowTitleInput(false);
      textRef.current?.blur();
      const modalCheckbox = document.getElementById("my-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
      return trpcUtils.post.getInfinite.invalidate();
    },
  });

  const handleSubmit = () => {
    if (!user) return;
    const { id } = user;
    addPostMutation({
      authorId: id,
      title: title.trim() || null,
      content: text.trim(),
    });
  };

  const handleCancel = () => {
    setText("");
    setTitle("");
    textRef.current?.blur();
    setShowTitleInput(false);
  };

  useEffect(() => {
    const textArea = titleRef.current! as HTMLTextAreaElement;
    if (!textArea) return;
    if (showTitleInput) textArea.focus();
  }, [titleRef, showTitleInput]);

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
    <div className="relative flex-col flex">
      <textarea
        ref={titleRef}
        value={title}
        id="postTitle"
        onChange={handleChange}
        maxLength={150}
        className={`peer textarea textarea-sm pl-24 resize-none overflow-hidden textarea-ghost focus:bg-inherit focus:outline-none sm:text-lg font-bold ${
          showTitleInput ? "block" : "hidden"
        }`}
        placeholder="Your catchy title"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && text && title) {
            event.preventDefault();
            handleSubmit();
          } else if (event.key === "Escape") {
            handleCancel();
          }
        }}
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
            handleSubmit();
          } else if (event.key === "Escape") {
            handleCancel();
          }
        }}
      />
      <div className="avatar absolute top-0 left-3">
        <div className="relative h-12 mask mask-squircle sm:h-16">
          <Image
            src={user?.photo || "/images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <div
        className={`self-end gap-2 focus:flex active:flex peer-focus:flex ${
          text || title ? "flex" : "hidden"
        }`}
      >
        <button
          className="btn btn-sm"
          onClick={() => {
            setShowTitleInput((prev) => {
              if (prev) textRef.current?.focus();
              return !prev;
            });
            setTitle("");
          }}
        >
          {showTitleInput ? "Remove Title" : "Add Title"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className={`btn-primary btn-sm btn ${addPostLoading ? "loading" : ""} `}
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
