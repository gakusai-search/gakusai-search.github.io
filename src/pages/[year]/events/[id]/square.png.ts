import type { APIRoute } from 'astro';
import { getAllEvents, type EventItem } from '../../../../utils/events';
import { generateEventSquareImage } from '../../../../utils/og-image';

export async function getStaticPaths() {
  const allEvents = getAllEvents();
  return allEvents.map((event) => ({
    params: { year: event.year, id: event.id },
    props: { event },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { event } = props as { event: EventItem };
  const pngData = await generateEventSquareImage(event);

  return new Response(pngData, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
