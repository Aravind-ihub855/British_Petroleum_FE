"use client";
import React, { useEffect, useState } from "react";

export default function GlobalTooltip() {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

  useEffect(() => {
    // Auto-convert standard title attributes to data-tooltip to avoid default browser tooltip
    const convertTitles = () => {
      document.querySelectorAll("[title]").forEach((el) => {
        const title = el.getAttribute("title");
        if (title) {
          el.setAttribute("data-tooltip", title);
          el.removeAttribute("title");
          // Add cursor-help class to elements with tooltips for user convenience
          if (!el.classList.contains("cursor-help") && !el.classList.contains("cursor-pointer")) {
            el.classList.add("cursor-help");
          }
        }
      });
    };

    // Initial run
    convertTitles();

    // Observe DOM mutations to convert titles on dynamically rendered components
    const observer = new MutationObserver((mutations) => {
      convertTitles();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-tooltip]");
      if (target) {
        const text = target.getAttribute("data-tooltip");
        if (text) {
          const rect = target.getBoundingClientRect();
          // Use client coordinates for a fixed positioned container
          setTooltip({
            text,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            visible: true,
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-tooltip]");
      if (target) {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    // Also close on scroll or click to avoid floating tooltips
    const handleClose = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleClose, { passive: true });
    document.addEventListener("click", handleClose);

    return () => {
      observer.disconnect();
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleClose);
      document.removeEventListener("click", handleClose);
    };
  }, []);

  if (!tooltip.visible || !tooltip.text) return null;

  return (
    <div
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }}
      className="fixed z-[99999] -translate-x-1/2 -translate-y-full bg-blue-500 text-white text-[11px] font-semibold rounded-lg px-3 py-1.5 shadow-lg max-w-[280px] pointer-events-none transition-all duration-150 animate-fadeIn"
    >
      <div className="text-center whitespace-pre-line leading-relaxed">{tooltip.text}</div>
      {/* Little triangle pointer at the bottom */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-500"></div>
    </div>
  );
}
