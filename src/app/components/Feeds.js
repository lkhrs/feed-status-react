/**
 * Feeds table component
 * Runs clientside
 * Fetches and displays a list of feeds and their statuses
 *
 * Props:
 * - opmlUrl - the URL to the OPML file
 *
 * Usage:
 * <Feeds opmlUrl="https://example.com/feeds.opml" />
 */

"use client";

import { useEffect, useState } from "react";

async function checkFeedStatus(url) {
  const res = await fetch("/api/fetch-feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch feed status");
  }
  return res.json();
}

export function Feeds({ opmlUrl }) {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!opmlUrl) return;
    setLoading(true);
    setError("");
    setFeeds([]);
    fetch("/api/fetch-opml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: opmlUrl }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        // Set initial status
        setFeeds(
          data.map((feed) => ({
            loading: true,
            ok: null,
            status: "",
            lastEntry: null,
            entries: null,
            ...feed,
          })),
        );

        for (let i = 0; i < data.length; i++) {
          const feed = data[i];
          try {
            const url = feed.xmlurl;
            if (!url) throw new Error("Feed URL missing");
            const status = await checkFeedStatus(url);
            setFeeds((prev) =>
              prev.map((feed, feedId) =>
                feedId === i
                  ? {
                      ...feed,
                      ...status,
                      loading: false,
                    }
                  : feed,
              ),
            );
          } catch (err) {
            setFeedStatuses((prev) =>
              prev.map((feed, feedId) =>
                feedId === i
                  ? {
                      ...feed,
                      ok: false,
                      status: "",
                      error: err.message,
                      loading: false,
                    }
                  : feed,
              ),
            );
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load feeds");
        setLoading(false);
      });
  }, [opmlUrl]);

  if (loading && !feeds.length) return <p>Loading feeds…</p>;
  if (error) return <p>{error}</p>;
  if (!feeds.length) return <p>No feeds found in OPML file.</p>;

  return (
    <table className="table w-full">
      <thead className="table-header-group">
        <tr className="table-row">
          <th className="table-cell text-left">Status</th>
          <th className="table-cell text-left">Title</th>
          <th className="table-cell text-left">Last Published Date</th>
          <th className="table-cell text-left">Item Count</th>
        </tr>
      </thead>
      <tbody className="table-row-group">
        {feeds.map((feed, i) => (
          <tr
            className={
              "table-row border-b" +
              (feed.loading ? " bg-yellow-100" : "") +
              (!feed.ok ? " bg-red-100" : "")
            }
            key={i}
          >
            <td className="table-cell w-2/12 py-2">
              {feed.loading
                ? "⏳"
                : feed.ok === true
                  ? "✅"
                  : feed.ok === false
                    ? `❌ ${feed.status || feed.error || ""}`
                    : ""}
            </td>
            <td className="table-cell w-6/12 py-2">
              <a
                href={feed.htmlurl || feed.xmlurl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {feed.title || feed.xmlurl}
              </a>
            </td>
            <td className="table-cell w-2/12 py-2">
              {feed.loading
                ? "Loading…"
                : feed.lastEntry
                  ? new Date(feed.lastEntry).toLocaleString()
                  : "—"}
            </td>
            <td className="table-cell w-2/12 py-2">
              {feed.loading
                ? "Loading…"
                : feed.entries !== null && feed.entries !== undefined
                  ? feed.entries
                  : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
