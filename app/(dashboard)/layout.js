import Link from "next/link";
import NavBar from "../_components/NavBar";

export default function DashboardLayout({ children }) {
  return (
    <>
      <NavBar/>
      <main className="p-4">{children}</main>
    </>
  );
}
