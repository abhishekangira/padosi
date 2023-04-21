import { DocumentData } from "firebase/firestore";
import { Dispatch, useEffect, useState } from "react";

const hideAfterDelay = (setError: Dispatch<unknown>) => {
  setTimeout(() => {
    setError(null);
  }, 3000);
};

let dataCount: number;

type QueryReturn = {
  data: DocumentData[];
  loading: boolean;
  error: unknown;
  fetchMore: Function;
  hasMore: boolean;
};
type MutationAndLazyQueryReturn = [Function, { data: unknown; loading: boolean; error: unknown }];

export function useApi<T = "query" | "lazy-query" | "mutation">(
  type: T,
  firebaseFnCallback: Function,
  autoHideError = true
): T extends "query" ? QueryReturn : MutationAndLazyQueryReturn {
  const [loading, setLoading] = useState(type === "query" ? true : false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<DocumentData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  let hasQueryRun = false;

  if (error && autoHideError) hideAfterDelay(setError);

  const run = (...args: [{}?, string?]) => {
    console.log("running");

    if (!hasQueryRun) setLoading(true);
    firebaseFnCallback(...args)
      .then((res: { data: DocumentData[]; dataCount: number }) => {
        dataCount = res?.dataCount;
        setLoading(false);
        setData((prev) => [...prev, ...res.data]);
      })
      .catch((error: unknown) => {
        console.error(error);
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (type === "query" && !hasQueryRun) {
      run();
      hasQueryRun = true;
    }
  }, []);

  useEffect(() => {
    if (dataCount) setHasMore(data.length < dataCount);
  }, [data]);

  return (type === "query"
    ? { data, loading, error, fetchMore: run, hasMore }
    : [run, { data, loading, error }]) as unknown as T extends "query"
    ? QueryReturn
    : MutationAndLazyQueryReturn;
}
