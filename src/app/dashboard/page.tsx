import { auth } from "@/lib/auth";
import { getUserSongs } from "@/app/actions/song-actions";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  const initialSongs = await getUserSongs();

  return (
    <DashboardClient 
      user={{ email: user.email }} 
      initialSongs={initialSongs.map(s => ({ ...s, id: s.id.toString() }))} 
    />
  );
}
