import { Badge } from "@/components/ui/badge";

export function TicketStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return <Badge variant="info">Open</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="warning">In Progress</Badge>;
    case "WAITING_ON_CLIENT":
      return <Badge variant="purple">Waiting on You</Badge>;
    case "RESOLVED":
      return <Badge variant="default">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "URGENT":
      return <Badge variant="destructive">Urgent</Badge>;
    case "HIGH":
      return <Badge variant="warning">High</Badge>;
    case "MEDIUM":
      return <Badge variant="secondary">Medium</Badge>;
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}
