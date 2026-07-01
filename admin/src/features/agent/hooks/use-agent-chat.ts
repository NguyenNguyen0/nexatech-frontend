/* eslint-disable react-hooks/rules-of-hooks -- useAgentChat is only ever
 * called from AgentPageContent, which only mounts inside CopilotKitProvider
 * (see index.tsx). The try/catch below guards against useAgent()/
 * useCopilotKit() throwing at that call site (e.g. agent not yet
 * registered), not against a missing provider.
 */
import { useCallback } from "react";
import { useAgent } from "@copilotkit/react-core/v2/headless";
import { useCopilotKit } from "@copilotkit/react-core/v2";
import { v4 as uuidv4 } from "uuid";
import type { AbstractAgent } from "@ag-ui/client";
import type { Message } from "@ag-ui/core";

export type AgentChatBridge =
  | {
      agent: AbstractAgent;
      sendMessage: (content: string) => Promise<void>;
      stopGeneration: () => void;
      isReady: true;
    }
  | {
      agent: null;
      sendMessage: (content: string) => Promise<void>;
      stopGeneration: () => void;
      isReady: false;
    };

export function useAgentChat(): AgentChatBridge {
  try {
    const { agent } = useAgent();
    const { copilotkit } = useCopilotKit();

    // copilotkit.runAgent (not agent.runAgent directly) is what keeps
    // CopilotKitCore's React subscribers in sync — calling agent.runAgent()
    // directly runs the underlying AG-UI stream fine, but React never finds
    // out isRunning changed or new messages arrived, so the UI looks stuck
    // on the loading indicator forever even though the backend responded.
    const sendMessage = useCallback(
      async (content: string) => {
        agent.addMessage({
          id: uuidv4(),
          role: "user",
          content,
        } as Message);
        await copilotkit.runAgent({ agent });
      },
      [agent, copilotkit],
    );

    const stopGeneration = useCallback(() => {
      agent.abortRun();
    }, [agent]);

    return { agent, sendMessage, stopGeneration, isReady: true };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[AgentChat] CopilotKit unavailable", error);
    }

    return {
      agent: null,
      sendMessage: async () => undefined,
      stopGeneration: () => undefined,
      isReady: false,
    };
  }
}
