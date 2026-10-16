import type { APIRoute } from 'astro';
import { getAllOrganizers, getEventsByOrganizer, type Organizer } from '../../../utils/events';
import { generateOrganizerSquareImage } from '../../../utils/og-image';

export async function getStaticPaths() {
  const organizers = getAllOrganizers();
  return organizers.map((organizer) => ({
    params: { id: organizer.id },
    props: {
      organizer,
      events: getEventsByOrganizer(organizer.id),
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { organizer, events } = props as { organizer: Organizer; events: any[] };
  const pngData = await generateOrganizerSquareImage(organizer, events);

  return new Response(pngData, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
