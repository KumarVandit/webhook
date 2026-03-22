"use client";

import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export default function CreateWebhookPage() {
  const { credentials } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [signingSecret, setSigningSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!credentials) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const webhookUrl = formData.get("webhookUrl") as string;

    if (!webhookUrl) {
      toast.error("Webhook URL is required.");
      return;
    }

    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Invalid webhook URL format.");
      return;
    }

    setIsPending(true);

    const promise = fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverUrl: credentials.serverUrl,
        apiKey: credentials.apiKey,
        webhookUrl,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to create webhook.");
        }
        setSigningSecret(data.signingSecret);
        return data;
      })
      .finally(() => setIsPending(false));

    toast.promise(promise, {
      loading: "Creating webhook...",
      success: "Webhook created successfully.",
      error: (err) => err.message,
    });
  };

  const handleCopy = async () => {
    if (!signingSecret) {
      return;
    }
    await navigator.clipboard.writeText(signingSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (signingSecret) {
    return (
      <div className="mx-auto w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Webhook Created</CardTitle>
            <CardDescription>
              Save your signing secret now. You won&apos;t be able to see it
              again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <Label>Signing Secret</Label>
              <div className="relative">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-muted p-3 pr-12 font-mono text-sm dark:border-zinc-800">
                  {signingSecret}
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                  size="icon"
                  variant="ghost"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => router.push("/dashboard/webhooks")}
                variant="outline"
              >
                View Webhooks
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push("/dashboard/docs")}
              >
                Integration Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Webhook</CardTitle>
          <CardDescription>
            Register a new webhook endpoint to receive iMessage events from your
            server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                name="webhookUrl"
                placeholder="https://your-app.example.com/webhook"
                required
                type="url"
              />
              <p className="text-muted-foreground text-xs">
                The HTTPS endpoint where iMessage events will be delivered via
                POST requests signed with HMAC-SHA256.
              </p>
            </div>
            <Button className="mt-2" disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create Webhook"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
