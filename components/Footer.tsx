import Link from "next/link";

const quickLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/routes", label: "Routes" },
  { href: "/admin/analytics", label: "Analytics" },
  
];

export default function Footer() {
  return (
    <footer className="bg-[#004aad] text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold mb-3">EcoCruise Admin</h2>
            <p className="text-sm text-gray-200">
              Streamlining campus mobility, operations, and transport insights.
            </p>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-3">Quick Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm hover:underline text-gray-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-300">
            <p>© {new Date().getFullYear()} EcoCruise Technologies</p>
            <p>Built for admins with ♥ in Nsukka.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
