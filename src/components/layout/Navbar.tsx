'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SyncStatus } from "@/components/ui/SyncStatus";
import Image from "next/image";

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-4 left-4 right-4 sm:left-8 sm:right-8 z-50 h-16 rounded-2xl glass shadow-apple transition-all duration-300">
            <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                {/* Left: Branding */}
                <Link href="/" className="flex items-center  group">
                    <div className="p-2 -brand rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-foreground tracking-tight leading-none group-hover:text-teal-600 transition-colors">AquaLedger</span>
                    </div>
                </Link>

                {/* Center: Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                    <Link
                        href="/"
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                            pathname === "/" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-teal-600 hover:bg-white/50"
                        )}
                    >
                        Logbook
                    </Link>
                    <Link
                        href="/inventory"
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                            pathname === "/inventory" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-teal-600 hover:bg-white/50"
                        )}
                    >
                        Inventory
                    </Link>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-4">
                    <SyncStatus variant="inline" />
                </div>
            </div>
        </nav>
    );
}
