import { userRoleRespType } from "@/actions/onboarding";
import { useState } from "react";
import { toast } from "sonner";

export function useFetch<TData, TArgs extends unknown[]>(
  cb: (...args: TArgs) => Promise<TData>,
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  async function fn(...args: TArgs) {
    setLoading(true);
    try {
      const result = await cb(...args);
      setData(result);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return { data, setData, loading, error, fn };
}
