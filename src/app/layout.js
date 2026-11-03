import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "P24 – Is This Internship Real?",
  description: "Find internships, spot fake offers and learn from seniors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
