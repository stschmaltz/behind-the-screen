import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set the content type to HTML
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    // Read the static HTML file
    const filePath = path.join(process.cwd(), 'pages', 'downtime-static.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // Send the HTML content
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error serving downtime page:', error);
    res
      .status(500)
      .send('<html><body><h1>Error loading page</h1></body></html>');
  }
}
