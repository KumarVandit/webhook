"use client";

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

export default function ConnectPage() {
  const { credentials, connect } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // If already connected, redirect to dashboard
  if (credentials) {
    router.replace("/dashboard/webhooks");
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serverUrl = formData.get("serverUrl") as string;
    const apiKey = formData.get("apiKey") as string;

    if (!(serverUrl && apiKey)) {
      toast.error("Both fields are required.");
      return;
    }

    try {
      new URL(serverUrl);
    } catch {
      toast.error("Invalid server URL format.");
      return;
    }

    setIsPending(true);

    const promise = fetch(
      `/api/webhooks?serverUrl=${encodeURIComponent(serverUrl)}`,
      { headers: { "x-api-key": apiKey } }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Invalid server URL or API key.");
        }
        connect({ serverUrl, apiKey });
        router.push("/dashboard/webhooks");
      })
      .finally(() => setIsPending(false));

    toast.promise(promise, {
      loading: "Verifying credentials...",
      success: "Connected successfully.",
      error: (err) => err.message,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Photon Webhook</CardTitle>
          <CardDescription>
            Connect to your Advanced iMessage Kit server to manage webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input
                id="serverUrl"
                name="serverUrl"
                placeholder="https://your-server.example.com"
                required
                type="url"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                placeholder="your-api-key"
                required
                type="password"
              />
            </div>
            <Button className="mt-2 w-full" disabled={isPending} type="submit">
              {isPending ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
