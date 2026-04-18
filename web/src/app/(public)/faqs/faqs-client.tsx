"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Question {
  q: string;
  a: string;
}

interface Section {
  category: string;
  questions: Question[];
}

export function FaqsClient({ faqs }: { faqs: Section[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8">
      {faqs.map((section) => (
        <div key={section.category}>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[var(--accent)] rounded-full inline-block" />
            {section.category}
          </h2>
          <div className="space-y-2">
            {section.questions.map((faq, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = !!openItems[key];
              return (
                <div
                  key={i}
                  className="bg-[var(--surface)] rounded-lg border overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm sm:text-base text-[var(--text-secondary)] border-t bg-[var(--surface-muted)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
