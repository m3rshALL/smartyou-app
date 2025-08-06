'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";
import Widget from "./Widget";

function Header() {
    const pathname = usePathname();

    const navItems = [
        { href: "/levels", label: "Уровни", icon: "🎮" },
        { href: "/blockchain", label: "Blockchain", icon: "⛓️" },
        { href: "/leaderboard", label: "Рейтинг", icon: "🏆" },
        { href: "/achievements", label: "Достижения", icon: "🏅" },
        { href: "/certificate", label: "Сертификат", icon: "📜" }
    ];

    return (
        <Container>
            <Widget className="py-4 px-6">
                <div className="flex items-center justify-between">
                    {/* Логотип */}
                    <Link href="/levels" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="text-2xl">🧠</div>
                        <div className="text-2xl font-semibold">Smart You</div>
                    </Link>

                    {/* Навигация */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-700/50 ${
                                    pathname === item.href 
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30' 
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Мобильное меню */}
                    <div className="md:hidden">
                        <div className="text-gray-400">☰</div>
                    </div>
                </div>
            </Widget>
        </Container>
    );
}

export default Header;