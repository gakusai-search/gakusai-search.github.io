import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import type { EventItem } from './events';

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generateEventOgImage(event: EventItem): Promise<Uint8Array> {
  const fontData = getFontData();

  const eventName = escapeHtml(event.name || '');
  const campusName = escapeHtml(event.campusName || event.place?.campus || '');
  const organizerName = escapeHtml(event.organizerName || '');
  const roomName = escapeHtml(event.place?.room || '');
  const dateText = escapeHtml(event.tags?.date?.join(' / ') || event.datetime || '');
  const tags = [
    ...(event.tags?.field || []),
    ...(event.tags?.features || []).slice(0, 3),
  ].map(escapeHtml);

  const tagsHtml = tags
    .map(
      (tag) => `
        <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.22); border: 1.5px solid rgba(255, 255, 255, 0.4); padding: 6px 16px; border-radius: 9999px; font-size: 24px; font-weight: 600;">
          <span>#${tag}</span>
        </div>`
    )
    .join('');

  const organizerHtml = organizerName
    ? `<div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; opacity: 0.95; width: 100%;">
         <span style="margin-right: 8px;">出展:</span>
         <span>${organizerName}</span>
       </div>`
    : '';

  const campusHtml = campusName
    ? `<div style="display: flex; justify-content: center; font-size: 28px; font-weight: 500; opacity: 0.92; letter-spacing: 0.5px; text-align: center;">
         <span>${campusName}</span>
       </div>`
    : '';

  const dateHtml = dateText
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.18); padding: 8px 18px; border-radius: 10px;">
         <span style="font-size: 20px; opacity: 0.85; font-weight: 700;">日時</span>
         <span>${dateText}</span>
       </div>`
    : '';

  const roomHtml = roomName
    ? `<div style="display: flex; flex-direction: row; align-items: center; gap: 10px; background: rgba(0,0,0,0.18); padding: 8px 18px; border-radius: 10px;">
         <span style="font-size: 20px; opacity: 0.85; font-weight: 700;">場所</span>
         <span>${roomName}</span>
       </div>`
    : '';

  const rawHtml = `
    <div
      style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; box-sizing: border-box; padding: 56px 64px; background: linear-gradient(90deg, #FF1B13, #FF914D); color: #ffffff; position: relative; overflow: hidden; font-family: 'Noto Sans JP';"
    >
      <!-- background decoration -->
      <div
        style="position: absolute; right: -80px; bottom: -80px; width: 360px; height: 360px; border-radius: 9999px; background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%);"
      ></div>
      <div
        style="position: absolute; left: 40%; top: -100px; width: 400px; height: 400px; border-radius: 9999px; background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%);"
      ></div>

      <!-- header -->
      <div
        style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; z-index: 1;"
      >
        <div style="display: flex; flex-direction: row; align-items: center; gap: 16px;">
          <div
            style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.24); color: #ffffff; font-weight: 700; font-size: 20px; padding: 6px 14px; border-radius: 6px;"
          >
            <span>${escapeHtml(event.year)}年度</span>
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
          style="font-size: 64px; font-weight: 800; line-height: 1.2; margin: 0; padding: 0; text-align: center;"
        >
          ${eventName}
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

  const vnode = html(rawHtml);

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
