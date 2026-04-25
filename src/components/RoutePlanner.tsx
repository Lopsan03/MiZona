import React, { useEffect, useState } from 'react';
import { MapPinned, Route, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, uiText } from '../i18n';
import { SafeRoutePlan } from '../types';

interface RoutePlannerProps {
  onPlanRoute: (destination: string) => Promise<void>;
  routePlan: SafeRoutePlan | null;
  onClearRoute: () => void;
  loading: boolean;
  error: string | null;
  language: Language;
}

const formatDistance = (distanceMeters: number, language: Language) => {
  const kilometers = distanceMeters / 1000;
  return `${kilometers.toFixed(1)} ${language === 'es' ? 'km' : 'km'}`;
};

const formatDuration = (durationSeconds: number, language: Language) => {
  const minutes = Math.round(durationSeconds / 60);
  if (minutes < 60) {
    return `${minutes} ${language === 'es' ? 'min' : 'min'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}${language === 'es' ? ' min' : ' min'}`;
};

export default function RoutePlanner({
  onPlanRoute,
  routePlan,
  onClearRoute,
  loading,
  error,
  language,
}: RoutePlannerProps) {
  const copy = uiText[language];
  const [destination, setDestination] = useState('');
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const selectedRoute = routePlan?.routes.find((route) => route.id === routePlan.selectedRouteId) ?? null;

  useEffect(() => {
    if (error || routePlan) {
      setMobileExpanded(true);
    }
  }, [error, routePlan]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = destination.trim();
    if (!trimmed) {
      return;
    }

    await onPlanRoute(trimmed);
  };

  return (
    <>
      <div className="fixed top-36 left-3 right-3 z-30 pointer-events-none sm:hidden">
        <div className="glass-card rounded-2xl p-3 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Route size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">{copy.safeRoutePlanner}</span>
            </div>
            {mobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {mobileExpanded && (
            <div className="mt-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <PlannerForm
                copy={copy}
                destination={destination}
                setDestination={setDestination}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                routePlan={routePlan}
                selectedRoute={selectedRoute}
                language={language}
                onClearRoute={onClearRoute}
              />
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-[9.5rem] right-8 z-40 hidden w-[24rem] pointer-events-none sm:block">
        <div className="glass-card rounded-[28px] p-4 shadow-2xl pointer-events-auto max-h-[calc(100vh-11rem)] overflow-y-auto">
          <PlannerForm
            copy={copy}
            destination={destination}
            setDestination={setDestination}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
            routePlan={routePlan}
            selectedRoute={selectedRoute}
            language={language}
            onClearRoute={onClearRoute}
          />
        </div>
      </div>
    </>
  );
}

interface PlannerFormProps {
  copy: (typeof uiText)[Language];
  destination: string;
  setDestination: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
  routePlan: SafeRoutePlan | null;
  selectedRoute: SafeRoutePlan['routes'][number] | null;
  language: Language;
  onClearRoute: () => void;
}

function PlannerForm({
  copy,
  destination,
  setDestination,
  handleSubmit,
  loading,
  error,
  routePlan,
  selectedRoute,
  language,
  onClearRoute,
}: PlannerFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Route size={18} />
        <p className="text-xs font-bold uppercase tracking-[0.24em]">{copy.safeRoutePlanner}</p>
      </div>

      <div className="flex gap-2">
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder={copy.destinationPlaceholder}
          className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/70"
        />
        <button
          type="submit"
          disabled={loading || destination.trim().length < 3}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPinned size={18} />}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {routePlan && selectedRoute && (
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{copy.safestRoute}</p>
              <p className="mt-1 line-clamp-2 font-semibold text-slate-700 dark:text-slate-200">{routePlan.destinationName}</p>
            </div>
            <button
              type="button"
              onClick={onClearRoute}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{copy.routeEta}</p>
              <p className="mt-1 font-semibold text-emerald-900 dark:text-emerald-100">{formatDuration(selectedRoute.durationSeconds, language)}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-3 py-2 dark:bg-sky-950/30">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">{copy.routeDistance}</p>
              <p className="mt-1 font-semibold text-sky-900 dark:text-sky-100">{formatDistance(selectedRoute.distanceMeters, language)}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {selectedRoute.blockedHighCount} {copy.redZonesAvoided}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {selectedRoute.cautionCount} {copy.orangeZonesNearRoute}
            </span>
          </div>
        </div>
      )}
    </form>
  );
}