import { auth } from "@/lib/firebase";
import { UserType } from "@/lib/hooks/useUser";
import { useUserContext } from "@/lib/user-context";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

async function handleSubmitWithPassword(
  type: "Sign In" | "Sign Up",
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
  displayName?: string
) {
  const firebaseFunction =
    type === "Sign In" ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
  return await firebaseFunction(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      if (type === "Sign Up") {
        await updateProfile(user, { displayName });
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      console.log(
        "🚀 ~ file: useLoginWidget.ts:27 ~ handleSubmitWithPassword ~ errorCode:",
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
  email: "",
  password: false,
  confirmPassword: false,
  displayName: false,
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
      setErrors(defaultErrors);

      const email = (event.currentTarget as HTMLFormElement).email.value;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      let password = "";
      let displayName = "";

      if (!emailRegex.test(email)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Please enter a valid email" }));
        return;
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
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
          displayName = (event.currentTarget as HTMLFormElement).displayName.value;
          if (!displayName) {
            setErrors((prevErrors) => ({ ...prevErrors, displayName: true }));
            return;
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, displayName: false }));
          }
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
        const errorCode = await handleSubmitWithPassword(
          formView,
          email,
          password,
          setLoading,
          displayName
        );
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
        } else if (errorCode === "auth/email-already-in-use") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Sorry, this email is already in use",
          }));
        }
      }
    },
    [formView]
  );

  return { handleSubmit, formView, setFormView, errors, loading };
}
