"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faShieldHalved,
  faCalendarDays,
  faClock,
  faCircleInfo,
  faEnvelope,
  faPhone,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

/* ----------------------------- Small helpers ----------------------------- */

// Shared gradient + bottom border
const BLUE_GRADIENT =
  "bg-[linear-gradient(to_bottom,#EEF2FF_60%,#F8FAFC,#F8FAFC)] border-b border-[#E2E8F0]";

// White section card with number badge + title
function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center min-w-[28px] h-[24px] px-1.5 rounded-md bg-[#D1FAE5] text-[#047857] text-[11px] font-bold">
          {number}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// Intro sentence under a section title
function Intro({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base leading-relaxed text-[#64748B] mb-4">
      {children}
    </p>
  );
}

// Sub heading with a blue dot (A. Key Defined Terms)
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
      <h3 className="text-lg font-bold text-[#0F172A]">{children}</h3>
    </div>
  );
}

// Light grey term card (title is optional)
function TermCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-4 ${className}`}
    >
      {title && (
        <h4 className="text-[15px] font-bold text-[#0F172A] mb-1.5">{title}</h4>
      )}
      <div className="text-sm leading-relaxed text-[#64748B]">{children}</div>
    </div>
  );
}

// Bullet used inside the payment methods card
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
      <span>{children}</span>
    </li>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FC] pb-16">
      {/* Go Back */}
      <div className="px-6 pt-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2 text-base font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ width: 14 }} />
          Go Back
        </button>
      </div>

      {/* Header */}
      <div className="px-6 mt-10">
        <header className={`${BLUE_GRADIENT} rounded-3xl px-6 sm:px-8 py-8`}>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-[#4F46E5]">
            <FontAwesomeIcon icon={faShieldHalved} style={{ width: 12 }} />
            Official Policy Document
          </span>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B0F1A]">
            Terms &amp; Conditions for Polygon
          </h1>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[13px] text-gray-600">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="text-gray-500"
                style={{ width: 13 }}
              />
              Effective Date :{" "}
              <b className="text-[#0F172A]">September 22, 2026</b>
            </span>
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[13px] text-gray-600">
              <FontAwesomeIcon
                icon={faClock}
                className="text-[#10B981]"
                style={{ width: 13 }}
              />
              Last Updated :{" "}
              <b className="text-[#0F172A]">September 22, 2026</b>
            </span>
          </div>

          <p className="mt-6 text-[17px] leading-relaxed text-[#0F172A]">
            Welcome to Polygon. These Terms and Conditions (“Terms”) govern your
            access to and use of the Polygon mobile application (the “App”) and
            the services provided through it (collectively, the “Services”).
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-[#0F172A]">
            <b>Polygon Holdings PVT Ltd (“Polygon,” “we,” “our,” or “us”)</b>{" "}
            operates the Polygon mobile application, located at No. 46/42, Nawam
            Mawatha, Colombo 02, Sri Lanka. By registering for an account,
            accessing, or using the App, you agree to be bound by these Terms.
            If you do not agree to these Terms, you must not use the App. Your
            use of the App is also governed by our Privacy Policy, which is
            incorporated into these Terms by reference.
          </p>
        </header>
      </div>

      {/* Sections */}
      <div className="px-6 mt-8 space-y-8">
        {/* 01 */}
        <Section number="01" title="Definitions">
          <Intro>
            In these Terms, the following capitalized terms have the meanings
            set forth below:
          </Intro>
          <SubHeading>A. Key Defined Terms</SubHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="“App”">
              Refers to the Polygon mobile software application made available
              via iOS App Store and other authorized platforms.
            </TermCard>
            <TermCard title="“User, you, or your”">
              Refers to any registered individual or business entity that
              browses, orders, or interacts through the App.
            </TermCard>
            <TermCard title="“Products”">
              Refers to fresh vegetables, farm fruits, essentials, curated
              subscription boxes, and packaged goods sold via the platform.
            </TermCard>
            <TermCard title="“Polygon Wallet”">
              An integrated in-app stored value system enabling instant refunds,
              loyalty credits, and seamless checkout payments.
            </TermCard>
          </div>
        </Section>

        {/* 02 */}
        <Section number="02" title="Eligibility & Accounts">
          <Intro>
            Users must register a verified personal profile to make purchases,
            redeem vouchers, and manage active deliveries.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="2.1 Age Requirement">
              You must be at least 18 years of age (or legal age of majority in
              your jurisdiction) to enter into binding purchase contracts.
            </TermCard>
            <TermCard title="2.2 Account Types & Verification">
              You agree to provide true, accurate, and up-to-date mobile contact
              information and residential address during onboarding.
            </TermCard>
            <TermCard title="2.3 Account Security">
              You are solely responsible for maintaining the confidentiality of
              your credentials and all activities occurring under your account.
            </TermCard>
            <TermCard title="2.4 Account Deletion">
              You may request the deletion of your account and personal profile
              at any time through the App settings or by contacting customer
              support.
            </TermCard>
          </div>
        </Section>

        {/* 03 */}
        <Section number="03" title="Location Services & Delivery">
          <Intro>
            Polygon utilizes location telemetry and designated service hubs to
            ensure items arrive fresh and on schedule.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="3.1 Location Data">
              Real-time GPS permissions are requested to match your address with
              our nearest fulfillment hub and calculate live driver ETA.
            </TermCard>
            <TermCard title="3.2 City Selection">
              Orders are bound to designated regional coverage zones. Ensure you
              select your current residential municipal boundary accurately.
            </TermCard>
          </div>

          <div className="mt-4 flex items-start gap-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg px-4 py-3">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="text-[#059669] mt-0.5 shrink-0"
              style={{ width: 14 }}
            />
            <p className="text-sm text-[#064E3B] leading-relaxed">
              <b>Please Note:</b> As stated inside the App: You must carefully
              select your current city during your first order,{" "}
              <b className="underline text-[#047857]">
                as you will not be able to change it until after your first
                successful delivery.
              </b>
            </p>
          </div>
        </Section>

        {/* 04 */}
        <Section number="04" title="Products & Pricing">
          <Intro>
            We pride ourselves on direct farm-to-table quality, accurate
            grading, and transparent pricing across all listed lines.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <TermCard title="4.1 Sourcing & Freshness">
              Farm produce weight and sizing can naturally vary. Polygon
              guarantees weight ranges within standard industry margins.
            </TermCard>
            <TermCard title="4.2 Pricing Structure">
              Prices are displayed in Sri Lankan Rupees (LKR) and include
              applicable taxes unless specifically delineated at final checkout.
            </TermCard>
            <TermCard title="4.3 Catalog Accuracy">
              In the event of an unintended typographical pricing mistake,
              Polygon reserves the right to cancel or amend unfulfilled orders.
            </TermCard>
          </div>
        </Section>

        {/* 05 */}
        <Section number="05" title="Payments">
          <Intro>
            Polygon offers flexible and secure checkout methods for quick and
            hassle-free grocery procurement.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <TermCard title="5.1 Accepted Payment Methods">
              <ul className="space-y-2">
                <Bullet>
                  <b className="text-[#0F172A]">Cash on Delivery (COD)</b> upon
                  doorstep handover.
                </Bullet>
                <Bullet>
                  <b className="text-[#0F172A]">Cash on Pickup</b> from
                  authorized Distribution Centres.
                </Bullet>
                <Bullet>
                  <b className="text-[#0F172A]">
                    Online Cards (Visa &amp; Mastercard)
                  </b>{" "}
                  processed via Payments.lk.
                </Bullet>
                <Bullet>
                  <b className="text-[#0F172A]">Polygon Wallet</b> using
                  available in-app balance.
                </Bullet>
              </ul>
            </TermCard>
            <TermCard title="5.2 Payment Gateway Fee">
              Third-party payment gateways (e.g., Payments.lk) may apply
              standard bank merchant convenience or settlement surcharges.
            </TermCard>
            <TermCard title="5.3 Fraud Prevention">
              We maintain real-time automated fraud detection. Questionable or
              unverified card transactions will be held or refunded immediately.
            </TermCard>
          </div>
        </Section>

        {/* 06 */}
        <Section number="06" title="Refunds, Returns & Wallet">
          <Intro>
            Due to the perishable nature of agricultural produce, special refund
            and claim guidelines apply to maintain food safety standards.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="6.1 Refund Method">
              Approved quality claims are credited immediately back to your
              Polygon Wallet or reversed to your card within 5–7 business days.
            </TermCard>
            <TermCard title="6.2 Cancellations & Handling Fees">
              Orders already packed or out for delivery may not be cancelled
              without an applicable restocking and perishability deduction fee.
            </TermCard>
            <TermCard title="6.3 Wallet Expiration & Fees">
              Polygon Wallet funds never expire and bear zero inactivity or
              maintenance fees while your account remains active.
            </TermCard>
            <TermCard title="6.4 Chargebacks & Disputes">
              Please contact our support hotline regarding discrepancies prior
              to raising formal bank payment disputes to expedite resolutions.
            </TermCard>
          </div>
        </Section>

        {/* 07 */}
        <Section number="07" title="Intellectual Property">
          <Intro>
            All proprietary rights, software code, graphic elements, trademarks,
            and service names are protected under Sri Lankan and international
            IP law.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="7.1 Proprietary Ownership">
              All rights, title, and interest in the App, including logos,
              visual interface, and algorithms belong solely to Polygon
              Holdings (Pvt) Ltd.
            </TermCard>
            <TermCard title="7.2 Limited End-User License">
              We grant you a personal, revocable, non-exclusive,
              non-transferable license to install and run the App strictly for
              personal grocery ordering.
            </TermCard>
          </div>
        </Section>

        {/* 08 */}
        <Section number="08" title="User Conduct & Prohibited Activities">
          <Intro>
            You agree to utilize Polygon in complete compliance with applicable
            laws, ethical trading principles, and respectful community
            standards.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="Prohibited Conduct">
              You may not engage in reverse engineering, fraudulent promotion
              claims, multiple account exploitation, harassment of delivery
              agents, or data scraping.
            </TermCard>
            <TermCard title="Enforcement & Suspension">
              Polygon reserves the unconditional right to suspend, terminate, or
              ban accounts caught abusing discount vouchers or fabricating
              refund incidents.
            </TermCard>
          </div>
        </Section>

        {/* 09 */}
        <Section number="09" title="Liability & Warranties">
          <Intro>
            Please review the following disclaimers regarding service uptime,
            operational guarantees, and liability limits.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <TermCard title="9.1 Indemnification">
              You agree to defend, indemnify, and hold harmless Polygon against
              claims, damages, and expenses arising from your violation of these
              terms.
            </TermCard>
            <TermCard title="9.2 Disclaimer of Warranties">
              The App and products are provided “as is” without warranties of
              uninterrupted uptime or error-free availability.
            </TermCard>
            <TermCard title="9.3 Limitation of Liability">
              Polygon’s total cumulative liability for any verified claim shall
              not exceed the total price paid by you for the specific affected
              order.
            </TermCard>
          </div>
        </Section>

        {/* 10 */}
        <Section number="10" title="Governing Law & Disputes">
          <Intro>
            These Terms are construed in accordance with the legal framework and
            commercial statutes of the Democratic Socialist Republic of Sri
            Lanka.
          </Intro>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TermCard title="10.1 Applicable Jurisdiction">
              Any legal proceedings, actions, or court enforcement arising out of
              these Terms shall be instituted exclusively in courts in Colombo,
              Sri Lanka.
            </TermCard>
            <TermCard title="10.2 Amicable Resolution">
              Parties agree to seek an informal resolution in good faith via
              direct customer arbitration prior to filing formal litigation.
            </TermCard>
          </div>
        </Section>

        {/* 11 */}
        <Section number="11" title="Modifications to Terms">
          <Intro>
            We may update or amend our Terms &amp; Conditions periodically to
            reflect regulatory adjustments, technological updates, or new
            feature rollouts.
          </Intro>
          <TermCard>
            Substantial revisions will be announced via in-app push notification
            or banner updates. Continued use of the App following any update
            constitutes full acceptance of revised terms.
          </TermCard>
        </Section>

        {/* 12 */}
        <Section number="12" title="Contact Us">
          <Intro>
            If you have questions, feedback, or legal inquiries regarding these
            Terms and Conditions, please contact us at:
          </Intro>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <a
              href="mailto:info@polygon.lk"
              className="flex items-center justify-center gap-2 bg-[#020617] text-white text-sm font-medium rounded-xl py-3.5 hover:bg-[#0F172A] transition-colors"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-[#10B981]"
                style={{ width: 14 }}
              />
              info@polygon.lk
            </a>
            <a
              href="tel:0114313433"
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#0F172A] text-sm font-medium rounded-xl py-3.5 hover:bg-gray-50 transition-colors"
            >
              <FontAwesomeIcon
                icon={faPhone}
                className="text-[#10B981]"
                style={{ width: 14 }}
              />
              011 431 3433
            </a>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-[#F8FAFC] border border-gray-100 rounded-xl px-4 py-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#0F172A]">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-[#10B981]"
                style={{ width: 16 }}
              />
            </span>
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                Physical Office
              </div>
              <div className="text-sm sm:text-base font-semibold text-[#0F172A]">
                No. 46/42, Nawam Mawatha, Colombo 02, Sri Lanka
              </div>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}