import React, { useEffect, useRef, useState } from "react";

export function NewPost({ maxLength = 500, ...props }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [text]);

  const handleChange = (event) => {
    setText(event.target.value);
  };
  return (
    <div className="relative py-3 sm:mx-auto sm:max-w-xl">
      <div className="to-light-blue-500 absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-cyan-400 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
      <div className="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
        <h1 className="mb-6 text-center text-2xl font-semibold">New Tweet</h1>
        <textarea
          ref={textareaRef}
          className="auto-expand-textarea w-full resize-none overflow-hidden rounded border p-3"
          maxLength={maxLength}
          value={text}
          onChange={handleChange}
          {...props}
        />
      </div>
    </div>
  );
}
