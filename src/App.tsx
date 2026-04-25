/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import MapComponent from './components/MapComponent';
import TopBar from './components/TopBar';
import FilterBar, { FilterType, TimeFilter } from './components/FilterBar';
import FloatingUI from './components/FloatingUI';
import IncidentPanel from './components/IncidentPanel';
import ReportForm from './components/ReportForm';
import RoutePlanner from './components/RoutePlanner';
import LandingPage from './components/LandingPage';
import { PrivyProvider } from '@privy-io/react-auth';
import { Language, uiText } from './i18n';
import { publishIncidentToMonad, fetchBlockchainIncidents, convertBlockchainIncidentsToApp } from './blockchain/incidentRegistry';
import { Incident, SafeRoutePlan } from './types';
import { CSV_INCIDENTS, GUADALAJARA_CENTER } from './data/incidentsFromCsv';
import { buildSafeRoutePlan } from './routing/safeRoute';

interface AppContentProps {
  onBackToLanding: () => void;
}

function AppContent({ onBackToLanding }: AppContentProps) {
  const { wallet, connect, getEthereumProvider } = useWallet();
  const [incidents, setIncidents] = useState<Incident[]>(CSV_INCIDENTS);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [routePlan, setRoutePlan] = useState<SafeRoutePlan | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  // Filters
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [activeTime, setActiveTime] = useState<TimeFilter>('all');

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationReady(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fall back to Guadalajara center so the form still works.
          setLocationReady(true);
        },
        { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
      );
    } else {
      setLocationReady(true);
    }
  }, []);

  // Fetch blockchain incidents on mount
  useEffect(() => {
    const loadBlockchainIncidents = async () => {
      try {
        const blockchainIncidents = await fetchBlockchainIncidents();
        const convertedIncidents = convertBlockchainIncidentsToApp(blockchainIncidents);
        // Merge blockchain incidents with CSV incidents, avoiding duplicates by ID
        setIncidents(prev => {
          const csvIds = new Set(prev.map(i => i.id));
          const blockchainOnly = convertedIncidents.filter(i => !csvIds.has(i.id));
          return [...prev, ...blockchainOnly];
        });
      } catch (error) {
        console.error('Failed to load blockchain incidents:', error);
      }
    };

    loadBlockchainIncidents();
  }, []);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Type Filter
      if (activeType === 'high' && incident.severity !== 'high') return false;
      if (activeType === 'confirmed' && incident.confidence !== 'confirmed') return false;
      
      // Time Filter
      const timeLimit = {
        'all': Number.POSITIVE_INFINITY,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000
      }[activeTime];
      
      if (Date.now() - incident.timestamp > timeLimit) return false;
      
      return true;
    });
  }, [incidents, activeType, activeTime]);

  const handlePlanRoute = async (destination: string) => {
    const copy = uiText[language];
    const origin = userLocation ?? GUADALAJARA_CENTER;

    if (!origin) {
      setRouteError(copy.routeNeedsLocation);
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      const nextPlan = await buildSafeRoutePlan(origin, destination, filteredIncidents);
      setRoutePlan(nextPlan);
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.routeErrorDefault;
      setRouteError(message || copy.routeErrorDefault);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleReportSubmit = async (data: { type: Incident['type']; severity: Incident['severity']; description: string }) => {
    const lat = userLocation ? userLocation[0] : GUADALAJARA_CENTER[0];
    const lng = userLocation ? userLocation[1] : GUADALAJARA_CENTER[1];

    if (!wallet.address) {
      throw new Error('Connect a wallet before reporting an incident.');
    }

    const ethereumProvider = await getEthereumProvider();

    if (!ethereumProvider) {
      throw new Error('No wallet provider is available for signing. Reconnect your wallet and try again.');
    }

    await publishIncidentToMonad({
      type: data.type,
      severity: data.severity,
      description: data.description,
      lat,
      lng,
      language,
      reporterAddress: wallet.address as `0x${string}`,
      ethereumProvider,
    });

    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type,
      severity: data.severity,
      confidence: 'pending',
      description: data.description,
      lat,
      lng,
      timestamp: Date.now(),
      reporter: {
        address: wallet.address || '0xUNKNOWN',
        reputation: wallet.reputation
      },
      confirmations: 0,
      similarNearby: 0
    };
    
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleConfirmIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          confirmations: inc.confirmations + 1,
          confidence: inc.confirmations + 1 >= 5 ? 'confirmed' : inc.confidence
        };
      }
      return inc;
    }));
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <MapComponent 
        incidents={filteredIncidents} 
        onIncidentClick={setSelectedIncident}
        userLocation={userLocation}
        defaultCenter={GUADALAJARA_CENTER}
        routePlan={routePlan}
      />

      <TopBar
        onConnectClick={connect}
        language={language}
        onLanguageToggle={() => setLanguage((current) => current === 'en' ? 'es' : 'en')}
      />
      
      <FilterBar 
        activeType={activeType} 
        setActiveType={setActiveType}
        activeTime={activeTime}
        setActiveTime={setActiveTime}
        language={language}
      />

      <FloatingUI 
        count={filteredIncidents.length} 
        onReportClick={() => setIsReportOpen(true)}
        onConnectClick={connect}
        language={language}
      />

      <RoutePlanner
        onPlanRoute={handlePlanRoute}
        routePlan={routePlan}
        onClearRoute={() => {
          setRoutePlan(null);
          setRouteError(null);
        }}
        loading={routeLoading}
        error={routeError}
        language={language}
      />

      <button
        onClick={onBackToLanding}
        className="fixed left-4 top-36 z-45 rounded-full border border-slate-300/60 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-800 shadow-lg backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:bg-slate-900 sm:left-8 sm:top-[8.75rem]"
      >
        Volver al inicio
      </button>

      <IncidentPanel 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)}
        onConfirm={handleConfirmIncident}
        language={language}
      />

      <ReportForm 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
        onConnectClick={connect}
        userLocation={userLocation}
        locationReady={locationReady}
        language={language}
      />
    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email', 'google'],
        appearance: { theme: 'light', accentColor: '#0f172a' },
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <ThemeProvider>
        <WalletProvider>
          {showLanding ? (
            <LandingPage onEnterApp={() => setShowLanding(false)} />
          ) : (
            <AppContent onBackToLanding={() => setShowLanding(true)} />
          )}
        </WalletProvider>
      </ThemeProvider>
    </PrivyProvider>
  );
}
