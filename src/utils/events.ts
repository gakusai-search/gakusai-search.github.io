import { CURRENT_YEAR, ARCHIVE_YEARS } from '../config/site';

export interface EventItem {
  id: string;
  year: string;
  campusId: string;
  campusName: string;
  name: string;
  image: string;
  tags: {
    campus?: string[];
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

// vite's import.meta.glob to load all JSON files under src/data/events/
// eager: true forces Vite to load them immediately instead of dynamic imports
const allDataModules = import.meta.glob('/src/data/events/*/*.json', { eager: true }) as Record<string, any>;

/**
 * get all campuses defined for a specific year
 */
export function getCampusesByYear(year: string): Campus[] {
  const path = `/src/data/events/${year}/campuses.json`;
  if (allDataModules[path]) {
    return allDataModules[path].default || allDataModules[path];
  }
  return [];
}

/**
 * get all events for a specific year, aggregated across all campuses
 */
export function getEventsByYear(year: string): EventItem[] {
  const events: EventItem[] = [];
  const prefix = `/src/data/events/${year}/`;
  const campuses = getCampusesByYear(year);

  for (const [path, module] of Object.entries(allDataModules)) {
    if (path.startsWith(prefix) && !path.endsWith('campuses.json')) {
      const campusEvents = module.default || module;
      // extract campusId from filename (e.g. 'itl.json' -> 'itl')
      const filename = path.split('/').pop() || '';
      const campusId = filename.replace('.json', '');
      const campusName = campuses.find(c => c.id === campusId)?.name || campusId;

      campusEvents.forEach((ev: any) => {
        const campusTags =
          Array.isArray(ev.tags?.campus) && ev.tags.campus.length > 0
            ? ev.tags.campus
            : [campusName];

        events.push({
          ...ev,
          year,
          campusId,
          campusName,
          tags: {
            ...ev.tags,
            campus: campusTags,
            date: Array.isArray(ev.tags?.date) ? ev.tags.date : [],
            format: Array.isArray(ev.tags?.format) ? ev.tags.format : [],
            field: Array.isArray(ev.tags?.field) ? ev.tags.field : [],
            features: Array.isArray(ev.tags?.features) ? ev.tags.features : [],
          },
          place: {
            ...ev.place,
            campus: ev.place?.campus || campusName,
            room: ev.place?.room || "",
          },
        });
      });
    }
  }

  return events;
}

/**
 * get all events across all defined years (current and archives)
 */
export function getAllEvents(): EventItem[] {
  const years = [...new Set([CURRENT_YEAR, ...ARCHIVE_YEARS])];
  return years.flatMap(y => getEventsByYear(y));
}
