// app/icd/layout.tsx
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import { SessionPayload } from "@/lib/session";

export default async function IcdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Server-side kode untuk ambil user dari token
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    // Debug - cek nilai token
    console.log("Token value:", token);

    let user = null;
    if (token) {
      try {
        user = await decrypt(token);
        // Debug - cek hasil decrypt
        console.log("Decrypted user:", user);
      } catch (error) {
        console.error("Error decrypting token:", error);
      }
    }
    const username = typeof user?.name === "string" ? user.name : undefined;

    //Redirect jika user tidak terautentikasi
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      redirect("/login");
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {user && <Header username={username} />}

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in DashboardLayout:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Terjadi kesalahan saat memuat dashboard.</p>
      </div>
    );
  }
}
