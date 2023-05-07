import { signInWithRedirect } from "firebase/auth";
import { auth, provider } from "@/lib/firebase/firebase";
import { BsGoogle } from "react-icons/bs";
import { useLoginWidget, FormViewType } from "./useLoginWidget";

export function LoginWidget() {
  const { handleSubmit, formView, setFormView, errors, loading } = useLoginWidget();

  let message;
  switch (formView) {
    case "Sign In":
      message = "Welcome Back!";
      break;
    case "Sign Up":
      message = "Join The Neighborhood!";
      break;
    case "forgotPassword":
      message = "Don't Worry We'll Get You Back In";
      break;
    default:
      message = "";
  }
  return (
    <>
      <div className="tabs">
        {["Sign In", "Sign Up"].map((tab) => (
          <button
            className={`tab-lifted tab tab-lg ${formView === tab ? "tab-active" : ""}`}
            onClick={() => setFormView(tab as FormViewType)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-glass card rounded-none rounded-b-2xl rounded-tr-2xl sm:card-normal lg:card-side">
        <div className="card-body">
          <h2 className="card-title">{message}</h2>
          <form className="form-control" onSubmit={handleSubmit}>
            {formView === "Sign Up" && (
              <>
                <div className="form-control">
                  <label htmlFor="displayName" className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    placeholder="Raj Malhotra"
                    className="input"
                  />
                  <label className="label min-h-8">
                    {errors.displayName && (
                      <span className="label-text-alt text-error">{errors.displayName}</span>
                    )}
                  </label>
                </div>
              </>
            )}
            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="rajmalhotra@cringe.com"
                className="input"
              />
              <label className="label min-h-8">
                {errors.email && <span className="label-text-alt text-error">{errors.email}</span>}
              </label>
            </div>
            {formView !== "forgotPassword" && (
              <div className="form-control">
                <label htmlFor="password" className="label">
                  <span className="label-text">Password</span>
                  {formView === "Sign In" && (
                    <button
                      type="button"
                      className="link-hover link-primary link select-text text-sm"
                      onClick={() => setFormView("forgotPassword")}
                    >
                      Forgot Password
                    </button>
                  )}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  placeholder="********"
                />
                <label className="label min-h-8">
                  {errors.password && (
                    <span className="label-text-alt text-error">
                      The password must be atleast 6 characters long
                    </span>
                  )}
                </label>
              </div>
            )}
            {formView === "Sign Up" && (
              <div className="form-control">
                <label htmlFor="confirmPassword" className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="input"
                  placeholder="********"
                />
                <label className="label min-h-8">
                  {errors.confirmPassword && (
                    <span className="label-text-alt text-error">Passwords do not match</span>
                  )}
                </label>
              </div>
            )}
            <div className="form-control mt-4">
              <button className={`${loading ? "loading" : ""} btn-primary btn`}>
                {loading ? "Loading" : formView === "forgotPassword" ? "Reset Password" : formView}
              </button>
              <label className="label min-h-8 justify-center">
                {errors.server && (
                  <span className="label-text-alt text-error">{errors.server}</span>
                )}
              </label>
            </div>
          </form>

          {formView !== "forgotPassword" && (
            <>
              <div className="divider -mt-1">OR</div>
              <button
                className="btn-outline btn gap-2"
                onClick={() => signInWithRedirect(auth, provider)}
              >
                <BsGoogle />
                {formView} with Google
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
