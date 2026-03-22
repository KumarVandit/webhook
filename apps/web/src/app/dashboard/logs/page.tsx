"use client";

import { RefreshCw } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";

interface LogEntry {
  id: string;
  webhookUrl: string;
  event: string;
  statusCode: number | null;
  success: boolean;
  error: string | null;
  duration: number;
  createdAt: string;
}

export default function LogsPage() {
  const { credentials } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!credentials) {
      return;
    }
    try {
      const res = await fetch(
        `/api/logs?serverUrl=${encodeURIComponent(credentials.serverUrl)}`,
        { headers: { "x-api-key": credentials.apiKey } }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch logs.");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load logs."
      );
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setLoading(true);
    fetchLogs();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center w-full justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Delivery Logs</CardTitle>
              <CardDescription>
                Recent webhook delivery attempts. Use these logs to debug
                delivery issues.
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LogsTableContent loading={loading} logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}

function LogsTableContent({
  loading,
  logs,
}: {
  loading: boolean;
  logs: LogEntry[];
}) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
        Loading logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
        No delivery logs yet. Logs will appear here once events are forwarded to
        your webhook endpoints.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Webhook</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant="outline">{log.event}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate font-mono text-xs">
                {log.webhookUrl}
              </TableCell>
              <TableCell>
                <StatusBadge
                  statusCode={log.statusCode}
                  success={log.success}
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {log.duration}ms
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(log.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs">
                {log.error ?? "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({
  success,
  statusCode,
}: {
  success: boolean;
  statusCode: number | null;
}) {
  if (success) {
    return (
      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400" variant="outline">
        {statusCode ?? "OK"}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      {statusCode ?? "ERR"}
    </Badge>
  );
}
