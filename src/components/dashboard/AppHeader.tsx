import { CredentialsSettings } from "@/components/dashboard/CredentialsSettings";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

export function AppHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-secondary bg-primary px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
            <div className="flex items-center gap-1">
                <CredentialsSettings />
                <ThemeToggle />
            </div>
        </header>
    );
}
