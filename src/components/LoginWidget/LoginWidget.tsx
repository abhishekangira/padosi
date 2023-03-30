import { useState, useRef, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";
import { signInWithRedirect } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

type FormView = "Sign In" | "Sign Up" | "forgotPassword";

export function LoginWidget() {
  const [formView, setFormView] = useState<FormView>("Sign In");
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  let message;
  switch (formView) {
    case "Sign In":
      message = "Welcome Back!";
      break;
    case "Sign Up":
      message = "Join The Neighborhood!";
      break;
    case "forgotPassword":
      message = "Reset Password";
      break;
    default:
      message = "";
  }
  return (
    <>
      <div className="tabs">
        {["Sign In", "Sign Up"].map((tab) => (
          <a
            className={`tab-lifted tab tab-lg ${
              formView === tab ? "tab-active !bg-black/10 backdrop-blur-sm" : ""
            }`}
            onClick={() => setFormView(tab as FormView)}
            key={tab}
          >
            {tab}
          </a>
        ))}
      </div>
      <div className="card rounded-none rounded-b-2xl rounded-tr-2xl bg-black/10 text-neutral-content shadow-xl backdrop-blur-sm sm:card-normal lg:card-side">
        <div className="card-body" ref={parent}>
          <h2 className="card-title">{message}</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input type="email" placeholder="email" className="input" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input type="password" placeholder="password" className="input" />
          </div>
          {formView === "Sign Up" && (
            <div className={`form-control`}>
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input type="password" placeholder="confirm password" className="input" />
            </div>
          )}
          <button
            className="btn-primary no-animation btn mt-6"
            type="submit"
            onClick={() => signInWithRedirect(auth, provider)}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
