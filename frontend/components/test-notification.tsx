'use client';

import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function TestNotification() {
  const { isConnected, sendTestNotification } = useWebSocket();
  const [variant, setVariant] = useState('default');

  const sendNotification = () => {
    sendTestNotification(
      `Test notification with ${variant} variant at ${new Date().toLocaleTimeString()}`,
      variant
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={variant} onValueChange={setVariant}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="destructive">Error</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={sendNotification}>
          Send Test Notification
        </Button>
      </div>
    </div>
  );
}