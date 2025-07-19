import * as puppeteer from 'puppeteer';

export const extractVideoMiddleware = (req: any, res: any, next: any) => {
  if (!req.originalUrl.startsWith('/api/extract')) {
    return next();
  }

  let body = '';
  req.on('data', (chunk: any) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    const { url } = JSON.parse(body);

    if (!url) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'URL is required' }));
    }

    let browser;
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const videoLink = await page.evaluate(() => {
        const video = document.querySelector('video source, video[src], [data-video-src]');
        const src = video?.getAttribute('src') || video?.getAttribute('data-video-src');
        return src ? new URL(src, document.baseURI).href : null;
      });

      if (videoLink) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ videoLink }));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Video not found' }));
      }
    } catch (error) {
      console.error('Error extracting video link:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to extract video link' }));
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
};
