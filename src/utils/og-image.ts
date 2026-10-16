import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import type { EventItem, Organizer } from './events';

let fontDataCache: Buffer | null = null;

function getFontData(): Buffer {
  if (!fontDataCache) {
    const boldPath = path.resolve(process.cwd(), 'assets/fonts/NotoSansJP-Bold.otf');
    const variablePath = path.resolve(
      process.cwd(),
      'assets/fonts/NotoSansJP-VariableFont_wght.ttf'
    );
    const fontPath = fs.existsSync(boldPath) ? boldPath : variablePath;
    fontDataCache = fs.readFileSync(fontPath);
  }
  return fontDataCache;
}

/**
 * unescape any HTML entities potentially already present in the source data back to plain text
 */
function normalizeText(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * escape special characters (e.g., <, >) to prevent HTML tag syntax breakage before passing to satori-html (ultrahtml)
 */
function escapeForHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * satori-html parser does not decode HTML entities (e.g., &amp;, &lt;) inside text nodes
 * decode these HTML entities in the VNode tree by traversing it recursively
 */
function decodeVNodeText(node: any): any {
  if (!node) return node;
  if (typeof node === 'string') {
    return node
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
  if (Array.isArray(node)) {
    return node.map(decodeVNodeText);
  }
  if (typeof node === 'object' && node.props) {
    if (node.props.children !== undefined) {
      node.props.children = decodeVNodeText(node.props.children);
    }
  }
  return node;
}

function truncateText(str: string, maxLen: number): string {
  if (!str) return '';
  const normalized = str.replace(/\r?\n+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen - 1) + '…';
}

function getTitleFontSize(len: number): string {
  if (len > 32) return '42px';
  if (len > 24) return '50px';
  if (len > 18) return '56px';
  return '64px';
}

export async function generateEventOgImage(event: EventItem): Promise<Uint8Array> {
  const fontData = getFontData();

  const rawEventName = normalizeText(event.name || '');
  const eventName = truncateText(rawEventName, 45);
  const campusName = normalizeText(event.campusName || event.place?.campus || '');
  const organizerName = normalizeText(event.organizerName || '');
  const roomName = normalizeText(event.place?.room || '');
  const dateText = normalizeText(event.tags?.date?.join(' / ') || event.datetime || '');
  const yearText = normalizeText(event.year || '');

  // limit tags to less than 12 to prevent layout breakage
  const rawTags = [
    ...(event.tags?.field || []),
    ...(event.tags?.features || []),
  ];
  const tags = [...new Set(rawTags)].slice(0, 12).map(normalizeText);

  // font size adjustment based on character count to prevent overflow
  const titleFontSize = getTitleFontSize(eventName.length);

  const tagsHtml = tags
    .map(
      (tag) => `
        <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.22); border: 1.5px solid rgba(255, 255, 255, 0.4); padding: 6px 16px; border-radius: 9999px; font-size: 24px; font-weight: 600;">
          <span>#${escapeForHtml(tag)}</span>
        </div>`
    )
    .join('');

  const organizerHtml = organizerName
    ? `<div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; opacity: 0.95; width: 100%;">
         <span style="margin-right: 8px;">出展:</span>
         <span>${escapeForHtml(organizerName)}</span>
       </div>`
    : '';

  const campusHtml = campusName
    ? `<div style="display: flex; justify-content: center; font-size: 28px; font-weight: 500; opacity: 0.92; letter-spacing: 0.5px; text-align: center;">
         <span>${escapeForHtml(campusName)}</span>
       </div>`
    : '';

  const dateHtml = dateText
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.18); padding: 8px 18px; border-radius: 10px;">
         <span style="font-size: 20px; opacity: 0.85; font-weight: 700;">日時</span>
         <span>${escapeForHtml(dateText)}</span>
       </div>`
    : '';

  const roomHtml = roomName
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.18); padding: 8px 18px; border-radius: 10px;">
         <span style="font-size: 20px; opacity: 0.85; font-weight: 700;">場所</span>
         <span>${escapeForHtml(roomName)}</span>
       </div>`
    : '';

  const rawHtml = `
    <div
      style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; box-sizing: border-box; padding: 56px 64px; background: linear-gradient(90deg, #FF1B13, #FF914D); color: #ffffff; position: relative; overflow: hidden; font-family: 'Noto Sans JP';"
    >
      <!-- header -->
      <div
        style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; z-index: 1;"
      >
        <div style="display: flex; flex-direction: row; align-items: center; gap: 16px;">
          <div
            style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.24); color: #ffffff; font-weight: 700; font-size: 20px; padding: 6px 14px; border-radius: 6px;"
          >
            <span>${escapeForHtml(yearText)}年度</span>
          </div>
        </div>

        <div
          style="display: flex; align-items: center; font-size: 20px; font-weight: 700; opacity: 0.85; letter-spacing: 0.5px;"
        >
          <span>gakusai-search.github.io</span>
        </div>
      </div>

      <!-- main content -->
      <div
        style="display: flex; flex-direction: column; gap: 16px; width: 100%; z-index: 1; align-items: center;"
      >
        <!-- event name -->
        <h1
          style="font-size: ${titleFontSize}; font-weight: 800; line-height: 1.2; margin: 0; padding: 0; text-align: center;"
        >
          ${escapeForHtml(eventName)}
        </h1>

        <!-- organizer & campus info -->
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;"
        >
          ${organizerHtml}
          ${campusHtml}
        </div>

        <!-- date & place -->
        <div
          style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 28px; font-size: 26px; font-weight: 600; margin-top: 4px; width: 100%;"
        >
          ${dateHtml}
          ${roomHtml}
        </div>
      </div>

      <!-- footer -->
      <div
        style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; z-index: 1;"
      >
        <div
          style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 12px; max-width: 1000px;"
        >
          ${tagsHtml}
        </div>
      </div>
    </div>
  `;

  const vnode = decodeVNodeText(html(rawHtml));


  const svg = await satori(vnode as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render().asPng();
  return pngData;
}

function getOrganizerTitleFontSize(len: number): string {
  if (len > 28) return '44px';
  if (len > 20) return '52px';
  return '64px';
}

export async function generateOrganizerOgImage(
  organizer: Organizer,
  events: EventItem[] = []
): Promise<Uint8Array> {
  const fontData = getFontData();

  const rawOrganizerName = normalizeText(organizer.name || '');
  const organizerName = truncateText(rawOrganizerName, 36);

  const rawDescription = normalizeText(organizer.description || '');
  const description = truncateText(rawDescription, 90);
  const descFontSize = description.length > 55 ? '30px' : '34px';
  const eventCount = events.length;

  const titleFontSize = getOrganizerTitleFontSize(organizerName.length);

  const descriptionHtml = description
    ? `<p style="font-size: ${descFontSize}; font-weight: 500; line-height: 1.5; opacity: 0.95; margin: 0; padding: 0 20px; max-width: 1040px; text-align: center;">
         ${escapeForHtml(description)}
       </p>`
    : '';

  const eventsCountHtml =
    eventCount > 0
      ? `<div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; margin-top: 6px;">
           <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.22); padding: 8px 22px; border-radius: 10px;">
             <span style="font-size: 19px; opacity: 0.85; font-weight: 700;">出展企画</span>
             <span>${eventCount} 件</span>
           </div>
         </div>`
      : '';

  const rawHtml = `
    <div
      style="display: flex; flex-direction: column; width: 1200px; height: 630px; box-sizing: border-box; padding: 56px 64px; background: linear-gradient(90deg, #FF1B13, #FF914D); color: #ffffff; position: relative; overflow: hidden; font-family: 'Noto Sans JP';"
    >
      <!-- header -->
      <div
        style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; z-index: 1;"
      >
        <div style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.28); color: #ffffff; font-weight: 700; font-size: 20px; padding: 6px 16px; border-radius: 6px;">
          <span>企画者紹介</span>
        </div>

        <div
          style="display: flex; align-items: center; font-size: 20px; font-weight: 700; opacity: 0.85; letter-spacing: 0.5px;"
        >
          <span>gakusai-search.github.io</span>
        </div>
      </div>

      <!-- main content (headerより下の領域の高さ方向中央) -->
      <div
        style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 20px; width: 100%; z-index: 1; flex: 1;"
      >
        <h1
          style="font-size: ${titleFontSize}; font-weight: 800; line-height: 1.25; margin: 0; padding: 0; text-align: center;"
        >
          ${escapeForHtml(organizerName)}
        </h1>

        ${descriptionHtml}
        ${eventsCountHtml}
      </div>
    </div>
  `;

  const vnode = decodeVNodeText(html(rawHtml));

  const svg = await satori(vnode as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  return resvg.render().asPng();
}

/**
 * load local or remote image and convert to Base64 data URL for satori
 */
async function getImageBase64(imagePath?: string): Promise<string | null> {
  if (!imagePath) return null;
  if (imagePath.startsWith('data:')) return imagePath;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      const res = await fetch(imagePath);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const contentType = res.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Failed to fetch remote image:', imagePath, e);
    }
    return null;
  }

  try {
    const cleanPath = imagePath.replace(/^\//, '');
    const fullPath = path.resolve(process.cwd(), 'public', cleanPath);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
      const buffer = fs.readFileSync(fullPath);
      return `data:image/${mime};base64,${buffer.toString('base64')}`;
    }
  } catch (e) {
    console.warn('Failed to load local image for card:', imagePath, e);
  }
  return null;
}

/**
 * generate 1:1 square share image for event (1200x1200)
 * - top: event.image (image-relative) with year badge
 * - bottom: Event info with title, organizer, campus, datetime, room, tags (no URL element)
 */
export async function generateEventSquareImage(event: EventItem): Promise<Uint8Array> {
  const fontData = getFontData();

  const rawEventName = normalizeText(event.name || '');
  const eventName = truncateText(rawEventName, 45);
  const campusName = normalizeText(event.campusName || event.place?.campus || '');
  const organizerName = normalizeText(event.organizerName || '');
  const roomName = normalizeText(event.place?.room || '');
  const dateText = normalizeText(event.tags?.date?.join(' / ') || event.datetime || '');
  const yearText = normalizeText(event.year || '');

  // Base64 image of event.image (image-relative)
  const imageBase64 =
    (await getImageBase64(event.image)) ||
    (await getImageBase64('/img/events/events_hero_example.png'));

  // limit tags to 6 to fit nicely with larger typography
  const rawTags = [
    ...(event.tags?.field || []),
    ...(event.tags?.features || []),
  ];
  const uniqueTags = [...new Set(rawTags)].map(normalizeText);
  const maxTags = 6;
  const isTagsTruncated = uniqueTags.length > maxTags;
  const tags = uniqueTags.slice(0, maxTags);

  const titleFontSize =
    eventName.length > 30 ? '60px' : eventName.length > 18 ? '70px' : '80px';

  const tagsHtml = tags
    .map(
      (tag) => `
        <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.24); border: 2px solid rgba(255, 255, 255, 0.5); padding: 10px 24px; border-radius: 9999px; font-size: 30px; font-weight: 700;">
          <span>#${escapeForHtml(tag)}</span>
        </div>`
    )
    .join('');

  const moreTagsHtml = isTagsTruncated
    ? `<div style="display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; opacity: 0.92; padding: 0 6px;">
         <span>など</span>
       </div>`
    : '';

  const organizerHtml = organizerName
    ? `<div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 38px; font-weight: 700; opacity: 0.95; width: 100%;">
         <span style="margin-right: 12px; opacity: 0.85;">出展:</span>
         <span>${escapeForHtml(organizerName)}</span>
       </div>`
    : '';

  const campusHtml = campusName
    ? `<div style="display: flex; justify-content: center; font-size: 32px; font-weight: 600; opacity: 0.92; letter-spacing: 0.5px; text-align: center;">
         <span>${escapeForHtml(campusName)}</span>
       </div>`
    : '';

  const yearHtml = yearText
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.24); padding: 12px 28px; border-radius: 14px;">
         <span style="font-size: 34px; font-weight: 700;">${escapeForHtml(yearText)}年度</span>
       </div>`
    : '';

  const dateHtml = dateText
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 12px; background: rgba(0,0,0,0.24); padding: 12px 28px; border-radius: 14px;">
         <span style="font-size: 26px; opacity: 0.85; font-weight: 700;">日時</span>
         <span style="font-size: 34px; font-weight: 700;">${escapeForHtml(dateText)}</span>
       </div>`
    : '';

  const roomHtml = roomName
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 12px; background: rgba(0,0,0,0.24); padding: 12px 28px; border-radius: 14px;">
         <span style="font-size: 26px; opacity: 0.85; font-weight: 700;">場所</span>
         <span style="font-size: 34px; font-weight: 700;">${escapeForHtml(roomName)}</span>
       </div>`
    : '';

  const rawHtml = `
    <div
      style="display: flex; flex-direction: column; width: 1200px; height: 1200px; box-sizing: border-box; background: linear-gradient(135deg, #FF1B13 0%, #FF914D 100%); color: #ffffff; position: relative; overflow: hidden; font-family: 'Noto Sans JP';"
    >
      <!-- Top: image-relative with 16:9 ratio and surrounding margins (800x450) -->
      <div
        style="display: flex; width: 1200px; padding: 48px 0 0; justify-content: center; box-sizing: border-box;"
      >
        <div
          style="display: flex; width: 800px; height: 450px; border-radius: 20px; overflow: hidden; background-color: #1a1a1a; box-shadow: 0 16px 40px rgba(0,0,0,0.28);"
        >
          <img id="hero-img" src="" width="800" height="450" style="width: 800px; height: 450px;" />
        </div>
      </div>

      <!-- Bottom: Event Info content with large legible typography -->
      <div
        style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: 1200px; height: 702px; box-sizing: border-box; padding: 32px 64px 48px; position: relative; z-index: 1;"
      >
        <!-- Event Name -->
        <h1
          style="font-size: ${titleFontSize}; font-weight: 800; line-height: 1.25; margin: 0; padding: 0; text-align: center; max-width: 1080px;"
        >
          ${escapeForHtml(eventName)}
        </h1>

        <!-- Organizer & Campus Info -->
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;"
        >
          ${organizerHtml}
          ${campusHtml}
        </div>

        <!-- Year & Date & Place in one row -->
        <div
          style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; width: 100%;"
        >
          ${yearHtml}
          ${dateHtml}
          ${roomHtml}
        </div>

        <!-- Tags -->
        <div
          style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; max-width: 1080px;"
        >
          ${tagsHtml}
          ${moreTagsHtml}
        </div>
      </div>
    </div>
  `;

  const vnode = decodeVNodeText(html(rawHtml));

  // Inject image base64 into the VNode props directly to avoid satori-html regex bottleneck
  if (imageBase64) {
    const injectImage = (node: any) => {
      if (!node) return;
      if (node.props && node.props.id === 'hero-img') {
        node.props.src = imageBase64;
        return;
      }
      if (Array.isArray(node.props?.children)) {
        node.props.children.forEach(injectImage);
      } else if (node.props?.children) {
        injectImage(node.props.children);
      }
    };
    injectImage(vnode);
  }

  const svg = await satori(vnode as any, {
    width: 1200,
    height: 1200,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  return resvg.render().asPng();
}

/**
 * generate 1:1 square share image for organizer (1200x1200)
 */
export async function generateOrganizerSquareImage(
  organizer: Organizer,
  events: EventItem[] = []
): Promise<Uint8Array> {
  const fontData = getFontData();

  const rawOrganizerName = normalizeText(organizer.name || '');
  const organizerName = truncateText(rawOrganizerName, 36);

  const rawDescription = normalizeText(organizer.description || '');
  const description = truncateText(rawDescription, 120);
  const descFontSize = description.length > 70 ? '46px' : '52px';
  const eventCount = events.length;

  const titleFontSize =
    organizerName.length > 24 ? '80px' : organizerName.length > 16 ? '92px' : '104px';

  const descriptionHtml = description
    ? `<p style="font-size: ${descFontSize}; font-weight: 500; line-height: 1.65; opacity: 0.95; margin: 0; padding: 0 20px; max-width: 1060px; text-align: center;">
         ${escapeForHtml(description)}
       </p>`
    : '';

  const eventsCountHtml =
    eventCount > 0
      ? `<div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 42px; font-weight: 700; margin-top: 16px;">
           <div style="display: flex; flex-direction: row; align-items: center; gap: 18px; background: rgba(0,0,0,0.24); padding: 16px 44px; border-radius: 20px;">
             <span style="font-size: 30px; opacity: 0.85; font-weight: 700;">出展企画</span>
             <span>${eventCount} 件</span>
           </div>
         </div>`
      : '';

  const rawHtml = `
    <div
      style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 1200px; height: 1200px; box-sizing: border-box; padding: 100px 72px; background: linear-gradient(135deg, #FF1B13 0%, #FF914D 100%); color: #ffffff; position: relative; overflow: hidden; font-family: 'Noto Sans JP';"
    >
      <!-- Main Content (Centered, no header badge) -->
      <div
        style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 52px; width: 100%; z-index: 1;"
      >
        <h1
          style="font-size: ${titleFontSize}; font-weight: 800; line-height: 1.25; margin: 0; padding: 0; text-align: center; max-width: 1080px;"
        >
          ${escapeForHtml(organizerName)}
        </h1>

        ${descriptionHtml}
        ${eventsCountHtml}
      </div>
    </div>
  `;

  const vnode = decodeVNodeText(html(rawHtml));

  const svg = await satori(vnode as any, {
    width: 1200,
    height: 1200,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  return resvg.render().asPng();
}
