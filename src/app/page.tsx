import { redirect } from "next/navigation";

/** `/` is only reached when already signed in; others are sent to `/login` by middleware. */
export default function Home() {
  redirect("/dashboard/view");
}
