"use client";

import { useMemo, useState } from "react";

interface ContributionHeatmapProps {
  data: Record<string, number> | null;
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number): string {
  if (count === 0) return "var(--bg-tertiary)";
  if (count <= 2) return "rgba(37, 99, 235, 0.2)";
  if (count <= 5) return "rgba(37, 99, 235, 0.4)";
  if (count <= 9) return "rgba(37, 99, 235, 0.7)";
  return "var(--kf-blue)";
}

function generateWeeks(): Array<Array<{ date: string; dayOfWeek: number }>> {
  const today = new Date();
  const weeks: Array<Array<{ date: string; dayOfWeek: number }>> = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let currentWeek: Array<{ date: string; dayOfWeek: number }> = [];

  for (let i = 0; i <= 370; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    if (date > today) break;

    const dow = date.getDay();
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push({
      date: date.toISOString().split("T")[0],
      dayOfWeek: dow,
    });
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks.slice(-52);
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const weeks = useMemo(() => generateWeeks(), []);
  const calendarData = data || {};

  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, colIdx) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], col: colIdx });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  const cellSize = 11;
  const cellGap = 2;
  const labelWidth = 28;
  const headerHeight = 16;

  return (
    <div className="overflow-x-auto">
      <svg
        width={labelWidth + weeks.length * (cellSize + cellGap)}
        height={headerHeight + 7 * (cellSize + cellGap)}
        className="text-text-muted"
      >
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={labelWidth + col * (cellSize + cellGap)}
            y={10}
            fontSize={9}
            fill="currentColor"
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((day, i) => (
          day ? (
            <text
              key={i}
              x={0}
              y={headerHeight + i * (cellSize + cellGap) + cellSize - 2}
              fontSize={9}
              fill="currentColor"
            >
              {day}
            </text>
          ) : null
        ))}

        {/* Cells */}
        {weeks.map((week, colIdx) =>
          week.map((day) => {
            const count = calendarData[day.date] || 0;
            const x = labelWidth + colIdx * (cellSize + cellGap);
            const y = headerHeight + day.dayOfWeek * (cellSize + cellGap);

            return (
              <rect
                key={day.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(count)}
                className="transition-opacity hover:opacity-80"
                onMouseEnter={(e) => {
                  const formatted = new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  setTooltip({
                    text: `${count} contribution${count !== 1 ? "s" : ""} on ${formatted}`,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        )}
      </svg>

      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded bg-bg-primary border border-border text-xs text-text-primary shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
