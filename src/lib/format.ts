export function rupiah(n: number | null | undefined): string {
  return "Rp" + (n ?? 0).toLocaleString("id-ID");
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function statusColor(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-green-500";
    case "PENDING":
      return "bg-yellow-500";
    case "EXPIRED":
    case "FAILED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}
