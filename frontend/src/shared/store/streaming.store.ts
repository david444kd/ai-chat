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
  appendContent: (chunk: string) => void;
  updateOptimisticMessages: (updater: (msgs: Message[]) => Message[]) => void;
  stopStreaming: () => void;
}

export const useStreamingStore = create<StreamingStore>((set, get) => ({
  streamingState: "idle",
  streamingContent: "",
  abortController: null,
  optimisticMessages: [],

  setStreaming: (partial) => set(partial),
  appendContent: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  updateOptimisticMessages: (updater) =>
    set((s) => ({ optimisticMessages: updater(s.optimisticMessages) })),
  stopStreaming: () => get().abortController?.abort(),
}));
