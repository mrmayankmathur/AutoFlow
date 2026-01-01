import React, { useCallback } from "react";
import { useReactFlow, Panel } from "@xyflow/react";

const PAN_AMOUNT = 50; // Pixels to move per click

// Simple SVG Icons for arrows
const ArrowUp = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const ArrowDown = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ArrowLeft = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ArrowRight = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const CenterIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const NavigationControls = () => {
  const { getViewport, setViewport, fitView } = useReactFlow();

  const pan = useCallback(
    (dx: number, dy: number) => {
      const { x, y, zoom } = getViewport();
      setViewport({ x: x + dx, y: y + dy, zoom });
    },
    [getViewport, setViewport]
  );

  const btnClass =
    "flex items-center justify-center size-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded shadow-sm transition-colors text-gray-600 dark:text-gray-300";

  return (
    <Panel position="bottom-right" className="flex flex-col gap-1 pb-4 pr-4">
      {/* Top Row */}
      <div className="flex justify-center">
        <button
          className={btnClass}
          onClick={() => pan(0, PAN_AMOUNT)}
          title="Pan Up"
        >
          <ArrowUp />
        </button>
      </div>

      {/* Middle Row */}
      <div className="flex gap-1">
        <button
          className={btnClass}
          onClick={() => pan(PAN_AMOUNT, 0)}
          title="Pan Left"
        >
          <ArrowLeft />
        </button>

        <button
          className={btnClass}
          onClick={() => fitView({ padding: 0.2, duration: 200 })}
          title="Fit View"
        >
          <CenterIcon />
        </button>

        <button
          className={btnClass}
          onClick={() => pan(-PAN_AMOUNT, 0)}
          title="Pan Right"
        >
          <ArrowRight />
        </button>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-center">
        <button
          className={btnClass}
          onClick={() => pan(0, -PAN_AMOUNT)}
          title="Pan Down"
        >
          <ArrowDown />
        </button>
      </div>
    </Panel>
  );
};
