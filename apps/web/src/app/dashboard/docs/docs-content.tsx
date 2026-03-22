"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocsContentProps {
  highlightedPayload: string;
  highlightedSnippets: Record<string, string>;
  languages: { id: string; label: string }[];
}

export function DocsContent({
  highlightedPayload,
  highlightedSnippets,
  languages,
}: DocsContentProps) {
  const [activeTab, setActiveTab] = useState(languages[0]?.id ?? "typescript");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Payload Format</CardTitle>
          <CardDescription>
            Your endpoint receives a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              POST
            </code>{" "}
            for every iMessage event. The body is JSON with an{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              event
            </code>{" "}
            name and a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              data
            </code>{" "}
            object typed as{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              MessageResponse
            </code>{" "}
            from{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              @photon-ai/advanced-imessage-kit
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="shiki-container overflow-x-auto rounded-md border border-zinc-200 bg-muted p-4 font-mono text-xs leading-relaxed dark:border-zinc-800"
            dangerouslySetInnerHTML={{ __html: highlightedPayload }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verify Incoming Requests</CardTitle>
          <CardDescription>
            Every request includes{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              X-Photon-Signature
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              X-Photon-Timestamp
            </code>{" "}
            headers. Use your signing secret to verify authenticity before
            processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs onValueChange={setActiveTab} value={activeTab}>
            <TabsList>
              {languages.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {languages.map(({ id }) => (
              <TabsContent key={id} value={id}>
                <div
                  className="shiki-container overflow-x-auto rounded-md border border-zinc-200 bg-muted p-4 font-mono text-xs leading-relaxed dark:border-zinc-800"
                  dangerouslySetInnerHTML={{
                    __html: highlightedSnippets[id] ?? "",
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
          <CardDescription>
            All event types that can be delivered to your webhook endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.map((event) => (
              <div
                className="rounded-md border border-zinc-200 px-3 py-2 font-mono text-xs dark:border-zinc-800"
                key={event}
              >
                {event}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const EVENTS = [
  "new-message",
  "updated-message",
  "message-send-error",
  "chat-read-status-changed",
  "group-name-change",
  "participant-added",
  "participant-removed",
  "participant-left",
  "group-icon-changed",
  "group-icon-removed",
  "typing-indicator",
  "new-server",
  "server-update",
  "server-update-downloading",
  "server-update-installing",
  "ft-call-status-changed",
  "new-findmy-location",
  "scheduled-message-created",
  "scheduled-message-updated",
  "scheduled-message-deleted",
  "scheduled-message-sent",
  "scheduled-message-error",
];
