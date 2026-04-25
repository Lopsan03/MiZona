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
import WalletModal from './components/WalletModal';
import { Incident } from './types';
import { MOCK_INCIDENTS, generateRandomIncident } from './mockData';

function AppContent() {
  const { wallet } = useWallet();
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Filters
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [activeTime, setActiveTime] = useState<TimeFilter>('24h');

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to center of NYC mock area
          setUserLocation([40.75, -73.98]);
        }
      );
    }
  }, []);

  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newIncident = generateRandomIncident();
      setIncidents(prev => [newIncident, ...prev]);
    }, 45000); // Every 45 seconds as requested

    return () => clearInterval(interval);
  }, []);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Type Filter
      if (activeType === 'high' && incident.severity !== 'high') return false;
      if (activeType === 'confirmed' && incident.confidence !== 'confirmed') return false;
      
      // Time Filter
      const timeLimit = {
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000
      }[activeTime];
      
      if (Date.now() - incident.timestamp > timeLimit) return false;
      
      return true;
    });
  }, [incidents, activeType, activeTime]);

  const handleReportSubmit = (data: any) => {
    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type,
      severity: data.severity,
      confidence: 'pending',
      description: data.description,
      lat: userLocation ? userLocation[0] : 40.75,
      lng: userLocation ? userLocation[1] : -73.98,
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
      />

      <TopBar onConnectClick={() => setIsWalletModalOpen(true)} />
      
      <FilterBar 
        activeType={activeType} 
        setActiveType={setActiveType}
        activeTime={activeTime}
        setActiveTime={setActiveTime}
      />

      <FloatingUI 
        count={filteredIncidents.length} 
        onReportClick={() => setIsReportOpen(true)}
        onConnectClick={() => setIsWalletModalOpen(true)}
      />

      <IncidentPanel 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)}
        onConfirm={handleConfirmIncident}
      />

      <ReportForm 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
        onConnectClick={() => setIsWalletModalOpen(true)}
      />

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProvider>
  );
}
