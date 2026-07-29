"use client";

import { useEffect, useState } from "react";
import { Droplets02, MarkerPin01, ThermometerCold, Trash01, Wind02, X } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CARD_MAX_HEIGHT_CLASS } from "@/components/dashboard/cardLayout";
import { DragHandle } from "@/components/dashboard/DragHandle";
import type { DragHandleProps } from "@/components/dashboard/SortableCard";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { WeatherLocationSearchBox } from "@/components/weather/WeatherLocationSearchBox";
import { useWeather } from "@/hooks/useWeather";
import { showToast } from "@/lib/toast/toastStore";
import { describeWeatherCode } from "@/lib/weather/weatherCode";
import type { WeatherCardConfig } from "@/types/domain";

interface WeatherCardProps {
    card: WeatherCardConfig;
    dragHandleProps: DragHandleProps;
    onUpdate: (patch: Partial<Omit<WeatherCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemove: () => void;
}

function formatDayLabel(date: string): string {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
}

export function WeatherCard({ card, dragHandleProps, onUpdate, onRemove }: WeatherCardProps) {
    const [isChangingLocation, setIsChangingLocation] = useState(!card.locationId);

    const location = card.latitude !== null && card.longitude !== null ? { latitude: card.latitude, longitude: card.longitude } : null;
    const { forecast, status } = useWeather(location);

    useEffect(() => {
        if (status === "error") {
            showToast({ variant: "error", title: "Couldn't load weather", description: card.locationName ?? undefined });
        } else if (status === "stale-error") {
            showToast({
                variant: "warning",
                title: "Live update failed",
                description: card.locationName ? `Showing last known weather for ${card.locationName}` : "Showing last known weather",
            });
        }
    }, [status, card.locationName]);

    const openChangeLocation = () => setIsChangingLocation(true);

    return (
        <div className={`flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary_alt ${CARD_MAX_HEIGHT_CLASS}`}>
            <div className="flex shrink-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <DragHandle {...dragHandleProps} />
                    <h2 className="truncate text-md font-semibold text-primary" title={card.locationName ?? undefined}>
                        {card.locationName ?? "New weather card"}
                    </h2>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {!isChangingLocation && (
                        <ButtonUtility icon={MarkerPin01} tooltip="Change place" size="sm" color="tertiary" onClick={openChangeLocation} />
                    )}
                    <ButtonUtility icon={Trash01} tooltip="Remove card" size="sm" color="tertiary" onClick={onRemove} />
                </div>
            </div>

            {isChangingLocation ? (
                // Not wrapped in the scrollable region below — the search dropdown is
                // absolutely positioned and would get clipped by overflow-y-auto.
                <div className="mt-4 flex items-start gap-2">
                    <WeatherLocationSearchBox
                        onSelectLocation={(loc) => {
                            onUpdate({ locationId: loc.id, locationName: loc.displayName, latitude: loc.latitude, longitude: loc.longitude });
                            setIsChangingLocation(false);
                        }}
                    />
                    {card.locationId && (
                        <ButtonUtility icon={X} tooltip="Cancel" size="sm" color="tertiary" onClick={() => setIsChangingLocation(false)} />
                    )}
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <>
                        {status === "unconfigured" && <p className="py-6 text-sm text-tertiary">Select a place to start showing weather.</p>}

                        {status === "loading" && (
                            <div className="flex items-center justify-center py-8">
                                <LoadingIndicator size="sm" />
                            </div>
                        )}

                        {status === "error" && <p className="py-6 text-sm text-error-primary">Couldn&apos;t load weather for this place right now.</p>}

                        {(status === "success" || status === "stale-error") && forecast && (
                            <>
                                {status === "stale-error" && (
                                    <p className="mt-2 text-xs text-warning-primary">Showing last known weather — live update failed.</p>
                                )}

                                <div className="mt-3 flex items-center gap-4">
                                    {(() => {
                                        const CurrentIcon = describeWeatherCode(forecast.current.weatherCode).icon;
                                        return <CurrentIcon className="size-12 shrink-0 text-fg-brand-primary" />;
                                    })()}
                                    <div>
                                        <p className="text-3xl font-semibold text-primary">{Math.round(forecast.current.temperature)}°C</p>
                                        <p className="text-sm text-tertiary">{describeWeatherCode(forecast.current.weatherCode).label}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-4 text-xs text-tertiary">
                                    <span className="flex items-center gap-1">
                                        <ThermometerCold className="size-3.5" />
                                        Feels like {Math.round(forecast.current.apparentTemperature)}°C
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Droplets02 className="size-3.5" />
                                        {Math.round(forecast.current.humidity)}%
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Wind02 className="size-3.5" />
                                        {Math.round(forecast.current.windSpeed)} km/h
                                    </span>
                                </div>

                                {forecast.daily.length > 0 && (
                                    <div className="mt-4 grid grid-cols-5 gap-2 border-t border-secondary pt-4">
                                        {forecast.daily.map((day) => {
                                            const DayIcon = describeWeatherCode(day.weatherCode).icon;
                                            return (
                                                <div key={day.date} className="flex flex-col items-center gap-1">
                                                    <p className="text-xs font-medium text-tertiary">{formatDayLabel(day.date)}</p>
                                                    <DayIcon className="size-5 text-fg-quaternary" />
                                                    <p className="text-xs text-primary">{Math.round(day.tempMax)}°</p>
                                                    <p className="text-xs text-tertiary">{Math.round(day.tempMin)}°</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                </div>
            )}
        </div>
    );
}
