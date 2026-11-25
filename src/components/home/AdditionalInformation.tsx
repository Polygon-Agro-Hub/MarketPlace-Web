import React, { useState } from "react";
import { Phone, Plus, X } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Choose what you love",
    description:
      "Search for an ingredient, pick a weight or start with a ready-made basket.",
  },
  {
    id: 2,
    title: "Make it work around your day",
    description:
      "Choose a delivery city, home delivery or pickup, and a date and time slot.",
  },
  {
    id: 3,
    title: "Check everything before you finish",
    description:
      "See your items, delivery fee and total together. Review once more before completing the preview.",
  },
];

const FAQS: FaqItem[] = [
  {
    id: 1,
    question: "Can I browse before creating an account?",
    answer:
      "Absolutely. You can fill your basket, customize vegetable portions down to 250g, and check real-time hub availability with zero sign-up friction. An account is only requested when finalizing dispatch addresses.",
  },
  {
    id: 2,
    question: "How much does delivery cost?",
    answer:
      "Delivery fees depend on your city and the delivery option you choose. You will see the exact fee in your basket summary before you complete your order.",
  },
  {
    id: 3,
    question: "How do you ensure zero plastic in transit?",
    answer:
      "We pack produce in reusable and compostable materials, and our dispatch team avoids single-use plastic at every step of the journey.",
  },
  {
    id: 4,
    question: "What happens if produce doesn't match expectation?",
    answer:
      "Contact our logistics desk and we will arrange a replacement or refund for any item that does not meet your expectations.",
  },
];

const AdditionalInformation: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* ===== Top: How it works ===== */}
        <div className="px-5 sm:px-6 md:px-10 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start border-b border-gray-200 lg:border-b-0">
          {/* Left */}
          <div className="max-w-md lg:max-w-md w-full">
            <p className="text-[11px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-emerald-700 uppercase">
              From your screen to your kitchen
            </p>
            <h2 className="mt-2 md:mt-3 text-[26px] leading-[1.15] md:text-4xl font-bold md:leading-tight text-gray-900">
              Shopping should feel this simple.
            </h2>
            <p className="mt-3 md:mt-4 text-sm text-gray-500 leading-relaxed">
              A clear basket, a convenient time and no guessing about the next
              step.
              <br className="hidden md:block" /> A few thoughtful details make
              all the difference.
            </p>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-5 lg:gap-0">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 md:gap-4 lg:py-5 ${
                  index !== STEPS.length - 1
                    ? "lg:border-b lg:border-gray-200"
                    : ""
                } ${index === 0 ? "lg:pt-0" : ""}`}
              >
                <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white text-sm md:text-base font-semibold">
                  {step.id}
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Bottom: FAQ ===== */}
        <div className="px-5 sm:px-6 md:px-10 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          {/* Left */}
          <div className="max-w-lg w-full">
            <p className="text-[11px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-emerald-700 uppercase">
              Transparent operations
            </p>
            <h2 className="mt-2 md:mt-3 text-[26px] leading-[1.15] md:text-4xl font-bold md:leading-tight text-gray-900">
              Common questions, straight answers.
            </h2>
            <p className="mt-3 md:mt-4 text-sm text-gray-500 leading-relaxed">
              Need a quick update about a scheduled morning harvest run or
              customized delivery windows? Our logistics desk is active daily.
            </p>

            {/* Helpline card */}
            <a
              href="tel:+94114313433"
              className="mt-5 md:mt-6 flex items-center gap-4 rounded-[28px] md:rounded-full border border-indigo-100 bg-white px-4 md:px-5 py-4 md:py-3.5 shadow-[0_8px_24px_rgba(99,102,241,0.08)] transition hover:shadow-[0_8px_28px_rgba(99,102,241,0.15)]"
            >
              <div className="flex h-12 w-12 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <Phone className="h-5 w-5 md:h-4 md:w-4 text-[#FF4421]" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                  Polygon direct helpline
                </p>
                <p className="mt-0.5 text-sm md:text-base font-bold text-gray-900">
                  Call +94 11 431 3433
                </p>
              </div>
            </a>
          </div>

          {/* Right: accordion */}
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl md:rounded-[28px] border border-indigo-100 bg-white shadow-[0_8px_24px_rgba(99,102,241,0.08)] transition-shadow overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 md:px-5 py-4 text-left cursor-pointer focus:outline-none"
                  >
                    <h3 className="flex-1 text-sm md:text-base font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-emerald-800">
                      {isOpen ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-gray-100 px-4 md:px-5 py-4">
                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalInformation;
