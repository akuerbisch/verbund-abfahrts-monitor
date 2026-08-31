import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Theme } from "@/providers/theme";
import { cx } from "@/utils/cx";
import "@/styles/globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Departure Board",
    description: "Live bus and tram departures for your saved stops",
    // Read by useAutoReloadOnDeploy as the baseline build id — kept in sync with
    // the X-Build-Id header set in next.config.ts, both from the same env var.
    other: { "build-id": process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <Theme>{children}</Theme>
            </body>
        </html>
    );
}
