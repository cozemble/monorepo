import { useSWR } from 'sswr';
import { Readable, derived, get, writable } from 'svelte/store';

import { Writable } from 'svelte/store';

import type { UseCompletionOptions, RequestOptions } from '../shared/types';
import { createChunkDecoder } from '../shared/utils';

export type UseCompletionHelpers = {
  /** The current completion result */
  completion: Readable<string>;
  /** The error object of the API request */
  error: Readable<undefined | Error>;
  /**
   * Send a new prompt to the API endpoint and update the completion state.
   */
  complete: (
    prompt: string,
    options?: RequestOptions,
  ) => Promise<string | null | undefined>;
  /**
   * Abort the current API request but keep the generated tokens.
   */
  stop: () => void;
  /**
   * Update the `completion` state locally.
   */
  setCompletion: (completion: string) => void;
  /** The current value of the input */
  input: Writable<string>;
  /**
   * Form submission handler to automattically reset input and append a user message
   * @example
   * ```jsx
   * <form onSubmit={handleSubmit}>
   *  <input onChange={handleInputChange} value={input} />
   * </form>
   * ```
   */
  handleSubmit: (e: any) => void;
  /** Whether the API request is in progress */
  isLoading: Readable<boolean | undefined>;
};

let uniqueId = 0;

const store: Record<string, any> = {};

export function useCompletion({
  api = '/api/completion',
  id,
  initialCompletion = '',
  initialInput = '',
  credentials,
  headers,
  body,
  onResponse,
  onFinish,
  onError,
}: UseCompletionOptions = {}): UseCompletionHelpers {
  // Generate an unique id for the completion if not provided.
  const completionId = id || `completion-${uniqueId++}`;

  const key = `${api}|${completionId}`;
  const {
    data,
    mutate: originalMutate,
    isLoading: isSWRLoading,
  } = useSWR<string>(key, {
    fetcher: () => store[key] || initialCompletion,
    fallbackData: initialCompletion,
  });

  const loading = writable<boolean>(false);

  // Force the `data` to be `initialCompletion` if it's `undefined`.
  data.set(initialCompletion);

  const mutate = (data: string) => {
    store[key] = data;
    return originalMutate(data);
  };

  // Because of the `fallbackData` option, the `data` will never be `undefined`.
  const completion = data as Writable<string>;

  const error = writable<undefined | Error>(undefined);

  let abortController: AbortController | null = null;
  async function triggerRequest(prompt: string, options?: RequestOptions) {
    try {
      loading.set(true);
      abortController = new AbortController();

      // Empty the completion immediately.
      mutate('');

      const res = await fetch(api, {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          ...body,
          ...options?.body,
        }),
        headers: {
          ...headers,
          ...options?.headers,
        },
        signal: abortController.signal,
        credentials,
      }).catch(err => {
        throw err;
      });

      if (onResponse) {
        try {
          await onResponse(res);
        } catch (err) {
          throw err;
        }
      }

      if (!res.ok) {
        throw new Error(
          (await res.text()) || 'Failed to fetch the chat response.',
        );
      }

      if (!res.body) {
        throw new Error('The response body is empty.');
      }

      let result = '';
      const reader = res.body.getReader();
      const decoder = createChunkDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // Update the chat state with the new message tokens.
        result += decoder(value);
        mutate(result);

        // The request has been aborted, stop reading the stream.
        if (abortController === null) {
          reader.cancel();
          break;
        }
      }

      if (onFinish) {
        onFinish(prompt, result);
      }

      abortController = null;
      return result;
    } catch (err) {
      // Ignore abort errors as they are expected.
      if ((err as any).name === 'AbortError') {
        abortController = null;
        return null;
      }

      if (onError && error instanceof Error) {
        onError(error);
      }

      error.set(err as Error);
    } finally {
      loading.set(false);
    }
  }

  const complete: UseCompletionHelpers['complete'] = async (
    prompt: string,
    options?: RequestOptions,
  ) => {
    return triggerRequest(prompt, options);
  };

  const stop = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  const setCompletion = (completion: string) => {
    mutate(completion);
  };

  const input = writable(initialInput);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const inputValue = get(input);
    if (!inputValue) return;
    return complete(inputValue);
  };

  const isLoading = derived(
    [isSWRLoading, loading],
    ([$isSWRLoading, $loading]) => {
      return $isSWRLoading || $loading;
    },
  );

  return {
    completion,
    complete,
    error,
    stop,
    setCompletion,
    input,
    handleSubmit,
    isLoading,
  };
}
