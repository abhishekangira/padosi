import { useUserContext } from "@/lib/contexts/user-context";
import { addPost } from "@/lib/firebase/posts";
import { useApi } from "@/lib/hooks/useApi";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export function NewPost({ maxLength = 500 }) {
  const { user } = useUserContext();
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const [addPostMutation, { loading: addPostLoading, error: addPostError }] = useApi<"mutation">(
    "mutation",
    addPost
  );

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
      />
      <div className="avatar absolute top-0 left-3">
        <div className="relative h-12 rounded-full sm:h-16">
          <Image
            src="https://picsum.photos/101"
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <button
        onClick={() => {
          addPostMutation({ text });
          setText("");
        }}
        disabled={text.length === 0}
        className={`btn-ghost btn-sm btn text-primary ${
          addPostLoading ? "loading" : "hidden"
        } self-end focus:block active:block peer-focus:block`}
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
