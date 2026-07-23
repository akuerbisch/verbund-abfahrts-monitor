"use client";

import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { useHasMounted } from "@/hooks/useHasMounted";

export function ThemeToggle() {
    const hasMounted = useHasMounted();
    const { resolvedTheme, setTheme } = useTheme();

    if (!hasMounted) {
        return <ButtonUtility icon={Sun} tooltip="Toggle theme" size="sm" color="tertiary" isDisabled />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <ButtonUtility
            icon={isDark ? Sun : Moon01}
            tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
            size="sm"
            color="tertiary"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        />
    );
}
