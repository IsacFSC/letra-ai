import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EscalaClient from "@/app/schedule/EscalaClient";

export default async function SchedulePage() {
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  return (
    <EscalaClient />
  );
}