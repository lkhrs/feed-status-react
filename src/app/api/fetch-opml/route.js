/**
* fetch-opml provides an endpoint that:
* - listens for POST requests containing a URL to an OPML file
* - parses the OPML file into an object using opml-to-json
* - iterates through each outline to extract just the outlines with feed URLs
* - returns a JSON object containing the cleaned up list of feeds
* 
* Response preview:
[
  {
    title: "Everything on Luke's Wild Website",
    text: "Everything on Luke's Wild Website",
    xmlurl: 'https://www.lkhrs.com/index.xml',
    htmlurl: 'https://www.lkhrs.com/',
    type: 'rss',
    '#type': 'feed',
    folder: 'Blogs'
  }
]
*/

import { opmlToJSON } from "opml-to-json";

function getFeedUrls(node) {
  let feeds = [];
  if (node.xmlurl) {
    feeds.push(node);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      feeds = feeds.concat(getFeedUrls(child));
    }
  }
  return feeds;
}

export async function POST(request) {
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return Response.json(
      { error: "Parameter is not a string" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`HTTP error while fetching OPML: ${res.status}`);
    const xml = await res.text();
    const json = await opmlToJSON(xml);
    console.log(getFeedUrls(json))
    return Response.json(getFeedUrls(json));
  } catch (err) {
    return Response.json(
      { error: `Error fetching OPML: ${err.message}` },
      { status: 500 },
    );
  }
}
