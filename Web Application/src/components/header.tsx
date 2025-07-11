"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header({ username }: { username?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fungsi untuk menentukan apakah tautan aktif
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Fungsi untuk menangani logout
  const handleLogout = async () => {
    // Hapus cookies (misalnya token, session, dll)

    await fetch("/api/logout");
    // Cookies lain yang perlu dihapus bisa ditambahkan di sini

    // Redirect ke halaman login
    router.push("/login");

    // Tutup modal
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard" className="text-white text-xl font-bold">
            CostPredict
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/dashboard"
              className={`text-white font-medium ${
                isActive("/dashboard")
                  ? "border-b-2 border-white pb-1"
                  : "hover:border-b-2 hover:border-white/70 hover:pb-1 transition-all"
              }`}
            >
              Predict
            </Link>
            <Link
              href="/icd"
              className={`text-white font-medium ${
                isActive("/icd")
                  ? "border-b-2 border-white pb-1"
                  : "hover:border-b-2 hover:border-white/70 hover:pb-1 transition-all"
              }`}
            >
              ICD
            </Link>

          </nav>

          <div className="relative">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {username || "User"}
            </button>

            {/* Logout Modal */}
            {showLogoutModal && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowLogoutModal(false)}
        ></div>
      )}
    </header>
  );
}
