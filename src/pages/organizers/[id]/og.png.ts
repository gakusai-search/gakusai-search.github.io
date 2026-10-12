import type { APIRoute } from 'astro';
import { getAllOrganizers, getEventsByOrganizer, type Organizer, type EventItem } from '../../../utils/events';
import { generateOrganizerOgImage } from '../../../utils/og-image';

export async function getStaticPaths() {
  const allOrganizers = getAllOrganizers();
  return allOrganizers.map((organizer) => ({
    params: { id: organizer.id },
    props: {
      organizer,
      events: getEventsByOrganizer(organizer.id),
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { organizer, events } = props as { organizer: Organizer; events: EventItem[] };
  const pngData = await generateOrganizerOgImage(organizer, events);

  return new Response(pngData, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
