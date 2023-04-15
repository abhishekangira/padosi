import { DocumentReference } from "firebase/firestore";
import { Dispatch, useState } from "react";

const hideAfterDelay = (setError: Dispatch<unknown>) => {
  setTimeout(() => {
    setError(null);
  }, 3000);
};

export function useMutation(
  firebaseFnCallback: (data: {}, id?: any) => Promise<DocumentReference<{}>>
): [(...args: [{}, any?]) => void, boolean, null | unknown] {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (error) hideAfterDelay(setError);

  const mutate = async (...args: [{}, any?]) => {
    setIsLoading(true);
    try {
      await firebaseFnCallback(...args);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setIsLoading(false);
    }
  };

  return [mutate, isLoading, error];
}
