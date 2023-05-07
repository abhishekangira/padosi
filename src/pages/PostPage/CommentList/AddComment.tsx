import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/utils/trpc";
import { useUserContext } from "@/lib/contexts/user-context";

export function AddComment({ postId, postCuid }: { postId: number; postCuid: string }) {
  const trpcUtils = trpc.useContext();
  const [text, setText] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUserContext();

  const {
    mutate: addCommentMutation,
    isLoading: addCommentLoading,
    isError: addCommentError,
  } = trpc.comment.add.useMutation({
    onSuccess: async () => {
      setText("");
      textRef.current?.blur();
      return [trpcUtils.comment.getInfinite.invalidate(), trpcUtils.post.get.invalidate()];
    },
  });

  useEffect(() => {
    const textArea = textRef.current! as HTMLTextAreaElement;
    if (!textArea) return;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
  }, [text, textRef]);

  const handleSubmit = () => {
    if (!user || !postId) return;
    addCommentMutation({
      authorId: user?.id,
      content: text,
      postId,
      postCuid,
    });
  };

  const handleCancel = () => {
    setText("");
    textRef.current?.blur();
  };

  return (
    <div className="relative flex-col flex">
      <textarea
        ref={textRef}
        className="peer textarea-ghost textarea resize-none overflow-hidden pl-20 text-base focus:bg-inherit focus:outline-none"
        maxLength={500}
        placeholder="Any Comments?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && text) {
            event.preventDefault();
            handleSubmit();
          } else if (event.key === "Escape") {
            handleCancel();
          }
        }}
      />
      <div className="avatar absolute top-1 left-3">
        <div className="relative h-12 mask mask-squircle sm:h-14">
          <Image
            src={user?.photo || "/images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 56px, 48px"
          />
        </div>
      </div>
      <div
        className={`self-end p-2 gap-2 focus:flex active:flex peer-focus:flex ${
          text ? "flex" : "hidden"
        }`}
      >
        <button onClick={handleCancel} disabled={text.trim().length === 0} className={`btn-sm btn`}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className={`btn-sm btn btn-primary ${addCommentLoading ? "loading" : ""} `}
        >
          Comment
        </button>
      </div>

      {!!false && (
        <div className="alert alert-error shadow-lg active:hidden">
          <div>
            🙁
            <span>There was an error adding your comment</span>
          </div>
        </div>
      )}
    </div>
  );
}
