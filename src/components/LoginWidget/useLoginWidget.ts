import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

async function handleSubmitWithPassword(
  type: "Sign In" | "Sign Up",
  email: string,
  password: string,
  setLoading: (loading: boolean) => void
) {
  const firebaseFunction =
    type === "Sign In" ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
  return await firebaseFunction(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      console.log(
        "🚀 ~ file: useLoginWidget.ts:27 ~ handleSignInWithPassword ~ errorCode:",
        errorCode
      );
      return errorCode;
    })
    .finally(() => {
      setLoading(false);
    });
}

export type FormViewType = "Sign In" | "Sign Up" | "forgotPassword";

export const defaultErrors = {
  email: false,
  password: false,
  confirmPassword: false,
  server: "",
};

export function useLoginWidget() {
  const [formView, setFormView] = useState<FormViewType>("Sign In");
  const [errors, setErrors] = useState(defaultErrors);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrors(defaultErrors);
  }, [formView]);

  const handleSubmit = useCallback(
    async function submitForm(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      console.log("handleSubmit");
      setErrors(defaultErrors);

      const email = (event.currentTarget as HTMLFormElement).email.value;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      let password = "";

      if (!emailRegex.test(email)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: true }));
        return;
      } else {
        console.log("Valid email");
        setErrors((prevErrors) => ({ ...prevErrors, email: false }));
      }

      if (formView !== "forgotPassword") {
        password = (event.currentTarget as HTMLFormElement).password.value;
        if (password.length < 6) {
          setErrors((prevErrors) => ({ ...prevErrors, password: true }));
          return;
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, password: false }));
        }
        if (formView === "Sign Up") {
          const confirmPassword = (event.currentTarget as HTMLFormElement).confirmPassword.value;
          if (password !== confirmPassword) {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: true }));
            return;
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: false }));
          }
        }
      }

      setLoading(true);
      if (formView === "forgotPassword") {
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (err) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: "Sorry, we could not find a user with this email",
          }));
        } finally {
          setLoading(false);
        }
      } else {
        const errorCode = await handleSubmitWithPassword(formView, email, password, setLoading);
        if (errorCode === "auth/wrong-password") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: "Please enter the correct password",
          }));
        } else if (errorCode === "auth/user-not-found") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: "Sorry, we could not find a user with this email",
          }));
        }
      }
    },
    [formView]
  );

  return { handleSubmit, formView, setFormView, errors, loading };
}
