"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Zap, Users, GitMerge, Mail, FileText, Briefcase, Bolt, BarChart2, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/market", label: "Market Intel", icon: BarChart2 },
  { href: "/suppliers", label: "Suppliers", icon: Zap },
  { href: "/seekers", label: "Seekers", icon: Users },
  { href: "/matches", label: "Match Engine", icon: GitMerge },
  { href: "/outreach", label: "Outreach", icon: Mail },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/fee-calc", label: "Fee Calculator", icon: Calculator },
  { href: "/pipeline", label: "Pipeline", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-gray-950 border-r border-gray-800 text-gray-100">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <Bolt className="h-6 w-6 text-yellow-400" />
        <div>
          <p className="font-bold text-sm leading-tight text-white">PowerMatch</p>
          <p className="text-[10px] text-gray-400 leading-tight">PPA Broker Platform</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Guidance tool only. Verify all data & contacts. Engage licensed counsel.
        </p>
      </div>
    </aside>
  );
}
