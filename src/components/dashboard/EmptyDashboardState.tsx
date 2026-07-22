import { Bus } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export function EmptyDashboardState() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-xl py-16 text-center">
            <FeaturedIcon icon={Bus} color="gray" theme="light" size="lg" />
            <div className="flex flex-col gap-1">
                <p className="text-md font-semibold text-primary">No stops saved yet</p>
                <p className="max-w-xs text-sm text-tertiary">Search for a bus or tram stop above to add its live departure board here.</p>
            </div>
        </div>
    );
}
