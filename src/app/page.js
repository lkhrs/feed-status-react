"use client";

import { useState } from "react";
import { Feeds } from "./components/Feeds";

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");
  const [opmlUrl, setOpmlUrl] = useState("");

  const handleInput = (event) => setInputUrl(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputUrl) setOpmlUrl(inputUrl);
  };

  return (
    <div className="min-h-screen p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl">Feed Status</h1>
        <form
          className="flex flex-col gap-4 items-center sm:items-start"
          onSubmit={handleSubmit}
        >
          <label htmlFor="opmlUrlInput" className="text-sm font-medium">
            Enter OPML URL:
          </label>
          <input
            id="opmlUrlInput"
            type="url"
            placeholder="http://example.com/feed.opml"
            className="border border-gray-300 rounded-md p-2 w-full sm:w-auto"
            value={inputUrl}
            onChange={handleInput}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md px-4 py-2"
          >
            Load Feeds
          </button>
        </form>
        <Feeds opmlUrl={opmlUrl} />
      </main>
    </div>
  );
}
