/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, IncidentType, Severity } from '../types';
import rawCrimeCsv from './datos-2026-04-25 (1).csv?raw';

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
};

const mapDelitoToType = (delito: string): IncidentType => {
  const normalized = normalizeText(delito);

  if (/(arma|homicidio|feminicidio|secuestro|balaceo|disparo)/.test(normalized)) {
    return 'weapon';
  }

  if (/(robo|asalto|extorsion|fraude|despojo)/.test(normalized)) {
    return 'robbery';
  }

  if (/(alumbrado|luz|iluminacion)/.test(normalized)) {
    return 'lighting';
  }

  if (/(abuso|acoso|violencia|amenaza|lesion|sospech)/.test(normalized)) {
    return 'suspicious';
  }

  return 'other';
};

const mapDelitoToSeverity = (delito: string): Severity => {
  const normalized = normalizeText(delito);
  return /(arma|homicidio|feminicidio|secuestro|robo|asalto|violacion)/.test(normalized)
    ? 'high'
    : 'medium';
};

const buildDescription = (row: Record<string, string>): string => {
  const parts = [
    row.delito ? `Delito: ${row.delito}` : '',
    row.colonia ? `Colonia: ${row.colonia}` : '',
    row.municipio ? `Municipio: ${row.municipio}` : '',
    row.fecha ? `Fecha: ${row.fecha}` : '',
    row.hora && row.hora !== 'N.D.' ? `Hora: ${row.hora}` : '',
  ].filter(Boolean);

  return parts.join(' | ');
};

const parseIncidentTimestamp = (fecha: string, hora: string): number => {
  if (!fecha) {
    return Date.now();
  }

  const safeHour = hora && hora !== 'N.D.' ? hora : '12:00';
  const timestamp = Date.parse(`${fecha}T${safeHour}:00`);

  return Number.isNaN(timestamp) ? Date.now() : timestamp;
};

const filterByMostRecentMonth = (incidents: Incident[]): Incident[] => {
  if (incidents.length === 0) {
    return incidents;
  }

  const validTimestamps = incidents
    .map((incident) => incident.timestamp)
    .filter((timestamp) => Number.isFinite(timestamp));

  if (validTimestamps.length === 0) {
    return incidents;
  }

  const latestTimestamp = Math.max(...validTimestamps);
  const latestDate = new Date(latestTimestamp);
  const latestYear = latestDate.getFullYear();
  const latestMonth = latestDate.getMonth();

  return incidents.filter((incident) => {
    const incidentDate = new Date(incident.timestamp);
    return incidentDate.getFullYear() === latestYear && incidentDate.getMonth() === latestMonth;
  });
};

const parseCsvToIncidents = (csvContent: string): Incident[] => {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => normalizeText(header));
  const incidents: Incident[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);

    if (values.length !== headers.length) {
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] ?? '';
    });

    const lng = Number.parseFloat(row.x);
    const lat = Number.parseFloat(row.y);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    const delito = row.delito || 'Incidente registrado';
    incidents.push({
      id: `gdl-${index}`,
      type: mapDelitoToType(delito),
      severity: mapDelitoToSeverity(delito),
      confidence: 'confirmed',
      description: buildDescription(row),
      lat,
      lng,
      timestamp: parseIncidentTimestamp(row.fecha, row.hora),
      reporter: {
        address: 'DATOS-GOB-JAL',
        reputation: 100,
      },
      confirmations: 1,
      similarNearby: 0,
    });
  }

  return filterByMostRecentMonth(incidents);
};

export const GUADALAJARA_CENTER: [number, number] = [20.6736, -103.344];

export const CSV_INCIDENTS: Incident[] = parseCsvToIncidents(rawCrimeCsv);
