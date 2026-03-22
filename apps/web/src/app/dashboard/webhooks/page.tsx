"use client";

import { Check, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";

interface WebhookRow {
  createdAt: string;
  id: string;
  serverUrl: string;
  webhookUrl: string;
}

export default function WebhooksPage() {
  const { credentials } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WebhookRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!credentials) {
      return;
    }
    try {
      const res = await fetch(
        `/api/webhooks?serverUrl=${encodeURIComponent(credentials.serverUrl)}`,
        { headers: { "x-api-key": credentials.apiKey } }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch webhooks.");
      }
      const data = await res.json();
      setWebhooks(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load webhooks."
      );
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/webhooks/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete webhook.");
      }
      toast.success("Webhook deleted.");
      setDeleteTarget(null);
      fetchWebhooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("Webhook ID copied.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registered Webhooks</CardTitle>
          <CardDescription>
            All webhook endpoints registered for your server. Create new
            webhooks or manage existing ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookTableContent
            copiedId={copiedId}
            loading={loading}
            onCopyId={handleCopyId}
            onDelete={setDeleteTarget}
            webhooks={webhooks}
          />
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={!!deleteTarget}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot
              be undone. Events will no longer be delivered to this endpoint.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="rounded-md bg-muted p-3 font-mono text-sm">
              {deleteTarget.webhookUrl}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={deleting}
              onClick={handleDelete}
              variant="destructive"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WebhookTableContent({
  loading,
  webhooks,
  copiedId,
  onCopyId,
  onDelete,
}: {
  loading: boolean;
  webhooks: WebhookRow[];
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onDelete: (wh: WebhookRow) => void;
}) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
        Loading webhooks...
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
        <p>No webhooks registered yet.</p>
        <Button asChild size="sm" variant="outline">
          <a href="/dashboard/create">Create your first webhook</a>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Webhook URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {webhooks.map((wh) => (
          <TableRow key={wh.id}>
            <TableCell className="max-w-xs truncate font-mono text-sm">
              {wh.webhookUrl}
            </TableCell>
            <TableCell>
              <Badge variant="default">Active</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(wh.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCopyId(wh.id)}>
                    {copiedId === wh.id ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(wh)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
