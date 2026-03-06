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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
            {section.category}
          </h2>
          <div className="space-y-2">
            {section.questions.map((faq, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = !!openItems[key];
              return (
                <div
                  key={i}
                  className="bg-white rounded-lg border overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm sm:text-base text-gray-600 border-t bg-gray-50 pt-3">
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
