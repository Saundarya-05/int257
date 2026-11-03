import Link from "next/link";

// Each module owner can add their own link here (tell the team first).
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/internships", label: "Internships" },
  { href: "/internships/new", label: "Add internship" },
];

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-blue-700">
          P24
        </Link>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-gray-700 hover:text-blue-700">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
