import { json } from 'express';
import * as puppeteer from 'puppeteer';

export const extractVideoRoute = async (req: any, res: any) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const videoLink = await page.evaluate(() => {
      const video = document.querySelector('video source, video[src], [data-video-src]');
      return video?.getAttribute('src') || video?.getAttribute('data-video-src') || null;
    });

    if (videoLink) {
      // Handle relative URLs
      const absoluteUrl = new URL(videoLink, url).toString();
      return res.json({ videoLink: absoluteUrl });
    } else {
      return res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error('Error extracting video link:', error);
    return res.status(500).json({ error: 'Failed to extract video link' });
  } finally {
    await browser.close();
  }
};
