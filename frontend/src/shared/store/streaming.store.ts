import { create } from "zustand";
import type { Message } from "@/entities/message/model/types";

export type StreamingState = "idle" | "connecting" | "streaming" | "error";
export const STREAMING_PLACEHOLDER_ID = "__streaming__";

interface StreamingStore {
  streamingState: StreamingState;
  streamingContent: string;
  abortController: AbortController | null;
  optimisticMessages: Message[];

  setStreaming: (
    partial: Partial<
      Pick<
        StreamingStore,
        "streamingState" | "streamingContent" | "abortController" | "optimisticMessages"
      >
    >
  ) => void;
  stopStreaming: () => void;
}

export const useStreamingStore = create<StreamingStore>((set, get) => ({
  streamingState: "idle",
  streamingContent: "",
  abortController: null,
  optimisticMessages: [],

  setStreaming: (partial) => set(partial),
  stopStreaming: () => get().abortController?.abort(),
}));
