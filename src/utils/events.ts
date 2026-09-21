import { CURRENT_YEAR, ARCHIVE_YEARS } from '../config/site';
import rawOrganizers from '../data/organizers.json';

export interface Organizer {
  id: string;
  name: string;
  description?: string;
  accounts?: Record<string, string>;
}

export interface EventItem {
  id: string;
  year: string;
  campusId: string;
  campusName: string;
  name: string;
  organizerId: string;
  organizerName: string;
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
 * get all organizers from master
 */
export function getAllOrganizers(): Organizer[] {
  return rawOrganizers as Organizer[];
}

/**
 * get organizer by id
 */
export function getOrganizerById(id: string): Organizer | undefined {
  return getAllOrganizers().find(o => o.id === id);
}

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

        const organizerId = ev.organizerId || 'unknown';
        const organizerObj = getOrganizerById(organizerId);
        const organizerName = organizerObj?.name || ev.organizer || organizerId;

        events.push({
          ...ev,
          year,
          campusId,
          campusName,
          organizerId,
          organizerName,
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

/**
 * get all events by a specific organizer across all years and campuses
 * sorted by year descending, and then by event name ascending within the same year
 */
export function getEventsByOrganizer(organizerId: string): EventItem[] {
  const allEvents = getAllEvents();
  return allEvents
    .filter(e => e.organizerId === organizerId)
    .sort((a, b) => {
      // 1. in descending year order
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      // 2. within the same year, in ascending order by event name
      return a.name.localeCompare(b.name, 'ja');
    });
}

/**
 * get all organizers along with their events count and events list
 */
export function getOrganizersWithEvents(): { organizer: Organizer; events: EventItem[] }[] {
  const organizers = getAllOrganizers();
  return organizers.map(organizer => ({
    organizer,
    events: getEventsByOrganizer(organizer.id),
  }));
}


