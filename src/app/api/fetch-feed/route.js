/**
* fetch-feed provides an endpoint that:
* - listens for POST requests containing a URL to an RSS feed
* - uses rss-parser to parse each feed into an object
* - returns an object containing:
*   - the feed URL
*   - the number of entries
*   - the date of the last entry
*   - boolean for 200 OK HTTP status
*   - error message if any
*
* Response preview:
{
  url: 'https://www.lkhrs.com/index.xml',
  entries: 2,
  lastEntry: 'Sat, 10 May 2025 07:50:33 -0500',
  ok: true,
  error: undefined
}
*/

import Parser from "rss-parser";

export async function POST(request) {
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return Response.json(
      { error: `Parameter is not a string: ${url}` },
      { status: 400 },
    );
  }

  let entries = 0;
  let lastEntry;
  let ok = false;
  let error;

  let parser = new Parser({
    defaultRSS: 2.0,
  });
  try {
     const feed = await parser.parseURL(url);
     entries = feed.items.length;
     lastEntry = feed.items[0]?.pubDate ?? null;
     ok = true;
   } catch (err) {
     ok = false;
     error = err.message || String(err);
   }
  
  let response = {
    url,
    entries,
    lastEntry,
    ok,
    error,
  };
  console.log(response)
  return Response.json(response);
}
