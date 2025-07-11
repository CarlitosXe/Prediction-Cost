import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Login ",
  description: "Login for Cost Prediction App",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Header /> */}
      <div className="flex flex-1">
        <Toaster position="top-right" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
