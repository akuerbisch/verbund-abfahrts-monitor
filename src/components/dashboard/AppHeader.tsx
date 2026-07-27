import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

export function AppHeader() {
    return (
        <header className="flex items-center justify-between border-b border-secondary bg-primary px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
            <ThemeToggle />
        </header>
    );
}
