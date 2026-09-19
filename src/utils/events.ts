import { CURRENT_YEAR, ARCHIVE_YEARS } from '../config/site';

export interface EventItem {
  id: string;
  year: string;
  campusId: string;
  campusName: string;
  name: string;
  image: string;
  tags: {
    date: string[];
    format: string[];
    field: string[];
    features: string[];
  };
  datetime: string;
  place: {
    campus: string;
    room: string;
  };
  description: string;
  accounts?: Record<string, string>;
}

export interface Campus {
  id: string;
  name: string;
}

// Vite's import.meta.glob to load all JSON files under src/data/events/
// eager: true forces Vite to load them immediately instead of dynamic imports
const allDataModules = import.meta.glob('/src/data/events/*/*.json', { eager: true }) as Record<string, any>;

/**
 * Get all campuses defined for a specific year
 */
export function getCampusesByYear(year: string): Campus[] {
  const path = `/src/data/events/${year}/campuses.json`;
  if (allDataModules[path]) {
    return allDataModules[path].default || allDataModules[path];
  }
  return [];
}

/**
 * Get all events for a specific year, aggregated across all campuses
 */
export function getEventsByYear(year: string): EventItem[] {
  const events: EventItem[] = [];
  const prefix = `/src/data/events/${year}/`;
  const campuses = getCampusesByYear(year);

  for (const [path, module] of Object.entries(allDataModules)) {
    if (path.startsWith(prefix) && !path.endsWith('campuses.json')) {
      const campusEvents = module.default || module;
      // Extract campusId from filename (e.g. 'itl.json' -> 'itl')
      const filename = path.split('/').pop() || '';
      const campusId = filename.replace('.json', '');
      const campusName = campuses.find(c => c.id === campusId)?.name || campusId;

      campusEvents.forEach((ev: any) => {
        events.push({
          ...ev,
          year,
          campusId,
          campusName
        });
      });
    }
  }
  
  return events;
}

/**
 * Get all events across all defined years (current and archives)
 */
export function getAllEvents(): EventItem[] {
  const years = [CURRENT_YEAR, ...ARCHIVE_YEARS];
  return years.flatMap(y => getEventsByYear(y));
}
