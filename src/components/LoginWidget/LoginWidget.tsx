import { useState } from "react";

export function LoginWidget() {
  const [formView, setFormView] = useState<"login" | "signup" | "forgotPassword">("login");
  const message =
    formView === "login"
      ? "Welcome Back!"
      : formView === "signup"
      ? "Join The Neighborhood!"
      : "Reset Password";
  return (
    <>
      <div className="tabs">
        <a
          className={`tab-lifted tab tab-lg ${formView === "login" ? "tab-active" : ""}`}
          onClick={() => setFormView("login")}
        >
          Login
        </a>
        <a
          className={`tab-lifted tab tab-lg ${formView === "signup" ? "tab-active" : ""}`}
          onClick={() => setFormView("signup")}
        >
          Sign Up
        </a>
      </div>
      <div className="card-compact card rounded-none rounded-b-2xl rounded-tr-2xl bg-black bg-opacity-20 text-neutral-content shadow-xl backdrop-blur-sm sm:card-normal lg:card-side">
        <div className="card-body">
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
          <div className={`form-control ${formView === "login" ? "hidden" : ""}`}>
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input type="password" placeholder="confirm password" className="input" />
          </div>
          <button className="btn-primary no-animation btn mt-6" type="submit">
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
