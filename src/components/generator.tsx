"use client";

import { useEffect, useRef, useState } from "react";
import { type MockupData, SAMPLE_DATA, renderMockup } from "@/lib/render";

const FIELDS: { key: keyof MockupData; label: string }[] = [
  { key: "action", label: "Action (e.g. Withdrawn, Received)" },
  { key: "amount", label: "Amount" },
  { key: "token", label: "Token symbol" },
  { key: "fiatApprox", label: "Approx. value line" },
  { key: "status", label: "Status" },
  { key: "address", label: "Address" },
  { key: "price", label: "Price" },
  { key: "network", label: "Network" },
  { key: "networkFee", label: "Network fee" },
  { key: "transactionId", label: "Transaction ID" },
  { key: "submittedTime", label: "Submitted time" },
  { key: "referenceNo", label: "Reference no." },
  { key: "clockTime", label: "Status bar clock" },
  { key: "buttonLabel", label: "Button label" },
  { key: "helpLink", label: "Help link text" },
];

const BASE58_CHARACTERS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const HEX_CHARACTERS = "0123456789abcdef";

function createMockAddress() {
  const address = [
    "T",
    BASE58_UPPERCASE.charAt(Math.floor(Math.random() * BASE58_UPPERCASE.length)),
  ];

  while (address.length < SAMPLE_DATA.address.length) {
    address.push(BASE58_CHARACTERS.charAt(Math.floor(Math.random() * BASE58_CHARACTERS.length)));
  }

  return address.join("");
}

function createRandomCharacters(characters: string, length: number) {
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
}

function createMockTransactionId() {
  return `${createRandomCharacters(HEX_CHARACTERS, 5)}...${createRandomCharacters(HEX_CHARACTERS, 5)}`;
}

function createMockReferenceNumber() {
  return String(Math.floor(100_000_000 + Math.random() * 900_000_000));
}

function formatSubmittedTime(date: Date) {
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}

function formatClockTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Generator() {
  const [data, setData] = useState<MockupData>(SAMPLE_DATA);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetDataRef = useRef<MockupData>(SAMPLE_DATA);

  // Generate after hydration so the server and first client render stay in sync.
  useEffect(() => {
    const now = new Date();
    const initialData = {
      ...SAMPLE_DATA,
      address: createMockAddress(),
      transactionId: createMockTransactionId(),
      referenceNo: createMockReferenceNumber(),
      submittedTime: formatSubmittedTime(new Date(now.getTime() - 3 * 60_000)),
      clockTime: formatClockTime(now),
    };
    resetDataRef.current = initialData;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(initialData);
  }, []);

  useEffect(() => {
    if (canvasRef.current) renderMockup(canvasRef.current, data);
  }, [data]);

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transaction-mockup.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 sm:p-8 lg:flex-row">
      <section className="flex-1">
        <h1 className="text-2xl font-semibold">Transaction screen mockup</h1>
        <p className="mt-1 text-sm opacity-70">
          For UI design and layout testing. Every image carries a permanent
          &ldquo;SAMPLE · NOT A REAL TRANSACTION&rdquo; watermark.
        </p>

        <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          {FIELDS.map(({ key, label }) => (
            <label key={key} className={`flex flex-col gap-1 text-sm ${key === "address" ? "sm:col-span-2" : ""}`}>
              <span className="opacity-80">{label}</span>
              <input
                className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                value={data[key]}
                onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              />
            </label>
          ))}
        </form>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={download}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={() => setData(resetDataRef.current)}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="flex justify-center lg:sticky lg:top-8 lg:self-start">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[360px] rounded-[2rem] border border-neutral-800 shadow-xl"
          aria-label="Mockup preview"
        />
      </section>
    </main>
  );
}
