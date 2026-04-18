import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface AsyncActionOptions<TResult> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export function useAsyncAction() {
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async <TResult>(
      action: () => Promise<TResult>,
      options?: AsyncActionOptions<TResult>
    ): Promise<TResult | undefined> => {
      setIsRunning(true);

      try {
        const result = await action();

        if (options?.successMessage) {
          toast.success(options.successMessage);
        }

        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, options?.errorMessage ?? '操作失败'));
        options?.onError?.(error);
        return undefined;
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  return {
    isRunning,
    run,
  };
}
