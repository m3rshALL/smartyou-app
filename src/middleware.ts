import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const name = request.cookies.get("name")?.value;
    const pathname = request.nextUrl.pathname;

    // Если есть имя и пользователь на главной странице, редиректим на /levels
    if (name && pathname === "/") {
        return NextResponse.redirect(new URL("/levels", request.url));
    }

    // Если нет имени и пользователь НЕ на главной, редиректим на /
    if (!name && pathname !== "/") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.svg|logo.png|icons/|sounds/|music/|skins/).*)",
    ],
};