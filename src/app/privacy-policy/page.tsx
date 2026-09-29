"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronLeft,
  faShieldHalved,
  faCalendarDays,
  faClock,
  faUser,
  faImage,
  faLocationDot,
  faCircleCheck,
  faBagShopping,
  faCreditCard,
  faMobileScreen,
  faChartSimple,
  faEnvelope,
  faPhone,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

/* ----------------------------- Small helpers ----------------------------- */

// Shared gradient + bottom border (Linear Gradient: #EEF2FF 60%, #F8FAFC, #F8FAFC | 1px bottom #E2E8F0)
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
        <span className="flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-md bg-[#D1FAE5] text-[#047857] text-[11px] font-bold">
          {number}
        </span>
        <h2 className="text-2xl font-bold text-[#0F172A]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// Light indigo panel that wraps groups of small cards
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${BLUE_GRADIENT} rounded-2xl p-5 sm:p-6`}>{children}</div>
  );
}

// Small white info card (optional icon)
function InfoCard({
  icon,
  dot,
  title,
  children,
  className = "",
}: {
  icon?: IconDefinition;
  dot?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl px-4 pt-4 pb-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="text-[#10B981]"
            style={{ width: 12, height: 12 }}
          />
        )}
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
        <h4 className="text-[13px] font-bold text-[#0F172A]">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-[#64748B]">{children}</p>
    </div>
  );
}

// Sub heading with purple dot (A. / B.)
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
      <h3 className="text-base font-bold text-[#0F172A]">{children}</h3>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FC] pb-16">
      {/* Go Back */}
      <div className="px-6 pt-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ width: 12 }} />
          Go Back
        </button>
      </div>

      {/* Header */}
      <div className="px-6 mt-10">
        <header className={`${BLUE_GRADIENT} rounded-3xl px-6 sm:px-8 py-8`}>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-[10px] font-semibold text-[#4F46E5]">
            <FontAwesomeIcon icon={faShieldHalved} style={{ width: 10 }} />
            Official Policy Document
          </span>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B0F1A]">
            Privacy Policy for Polygon
          </h1>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[11px] text-gray-600">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="text-gray-500"
                style={{ width: 11 }}
              />
              Effective Date :{" "}
              <b className="text-[#0F172A]">September 22, 2026</b>
            </span>
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[11px] text-gray-600">
              <FontAwesomeIcon
                icon={faClock}
                className="text-[#10B981]"
                style={{ width: 11 }}
              />
              Last Updated :{" "}
              <b className="text-[#0F172A]">September 22, 2026</b>
            </span>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-[#0F172A]">
            <b>Polygon Holdings PVT Ltd</b> (“we,” “our,” or “us”) operates the
            Polygon mobile application (the “App”).
            <br />
            We are committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our App. Please read this Privacy Policy
            carefully. By downloading, accessing, or using the App, you agree to
            the collection and use of information in accordance with this
            policy.
          </p>
        </header>
      </div>

      {/* Sections */}
      <div className="px-6 mt-8 space-y-8">
        {/* 01 */}
        <Section number="01" title="Information We Collect">
          <p className="text-sm leading-relaxed text-[#64748B] mb-6">
            We collect several types of information to provide and improve our
            services to you, specifically to facilitate the ordering and
            delivery of fresh fruits, vegetables, and curated packages.
          </p>

          <div className="space-y-5">
            <Panel>
              <SubHeading>A. Personal Data Provided by You</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <InfoCard icon={faUser} title="Account Information">
                  When you register, we collect your name, mobile number, and
                  email address.
                </InfoCard>
                <InfoCard icon={faImage} title="Profile Data">
                  We may collect your profile picture and package preferences.
                </InfoCard>
              </div>

              <div className="mt-4 bg-white border border-gray-100 rounded-xl px-4 pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-[#10B981]"
                    style={{ width: 11 }}
                  />
                  <h4 className="text-[13px] font-bold text-[#0F172A]">
                    Address &amp; Location Data
                  </h4>
                </div>
                <p className="text-xs text-[#64748B] mb-3">
                  We collect your selected city and specific delivery
                  addresses.
                </p>
                <div className="flex items-start gap-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg px-3 py-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1FAE5] shrink-0">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-[#059669]"
                      style={{ width: 12 }}
                    />
                  </span>
                  <div className="text-xs text-[#064E3B] leading-relaxed">
                    <div className="font-bold">Please Note :</div>
                    As stated inside the App: You must carefully select your
                    current city,{" "}
                    <b className="text-[#047857]">
                      as you will not be able to change it until after your
                      first successful delivery.
                    </b>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <InfoCard
                  icon={faBagShopping}
                  title="Transaction Data"
                  className="min-h-[118px]"
                >
                  Details about the products you purchase, your cart contents
                  (Ala Carte items, Packages), and order history.
                </InfoCard>
                <InfoCard
                  icon={faCreditCard}
                  title="Payment Information"
                  className="min-h-[118px]"
                >
                  If you choose to pay via credit card, your payment details are
                  processed by our secure third-party payment gateways. We do
                  not store your full credit card details on our servers. If you
                  choose Cash on Delivery (COD), we record the transaction
                  amount and delivery status.
                </InfoCard>
              </div>
            </Panel>

            <Panel>
              <SubHeading>B. Automatically Collected Data</SubHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
                <InfoCard icon={faMobileScreen} title="Device Information">
                  We may collect information about your mobile device, including
                  the hardware model, operating system version, and unique
                  device identifiers.
                </InfoCard>
                <InfoCard icon={faChartSimple} title="Usage Data">
                  Information on how you interact with the App, such as which
                  categories you browse (Veggies, Fruits, Cereal), search
                  queries, and notification interactions.
                </InfoCard>
              </div>
            </Panel>
          </div>
        </Section>

        {/* 02 */}
        <Section number="02" title="How We Use Your Information">
          <p className="text-sm text-[#64748B] mb-4">
            We use the collected information for various purposes, including
            to:
          </p>
          <Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <InfoCard
                dot
                title="Process and Fulfill Orders"
                className="min-h-[100px]"
              >
                To process your purchases, manage your &quot;My Cart,&quot; and
                facilitate either Pickup from Centre or Delivery to your
                Location.
              </InfoCard>
              <InfoCard
                dot
                title="Manage Your Account"
                className="min-h-[100px]"
              >
                To manage your profile, update passwords, track your Credit
                Balance, and manage saved addresses.
              </InfoCard>
              <InfoCard
                dot
                title="Communicate with You"
                className="min-h-[118px]"
              >
                To send you order updates, OTPs, and notifications regarding
                order processing, delivery status, and &quot;Action
                Required&quot; alerts for package finalization.
              </InfoCard>
              <InfoCard
                dot
                title="Improve Our Services"
                className="min-h-[118px]"
              >
                To understand how users interact with the App so we can enhance
                our product offerings, pricing, and user experience.
              </InfoCard>
              <InfoCard
                dot
                title="Security"
                className="md:col-span-2 min-h-[86px]"
              >
                To verify your identity, prevent fraud, and ensure the security
                of our App (e.g., enforcing strong password creation).
              </InfoCard>
            </div>
          </Panel>
        </Section>

        {/* 03 */}
        <Section number="03" title="Disclosure of Your Information">
          <p className="text-sm text-[#64748B] mb-4">
            We do not sell your personal data. We may share your information in
            the following situations:
          </p>
          <Panel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <InfoCard title="Service Providers" className="min-h-[104px]">
                We share your delivery address and contact number with our
                delivery drivers to fulfill your order.
              </InfoCard>
              <InfoCard title="Payment Processors" className="min-h-[104px]">
                We share necessary transaction data with credit card processing
                partners to complete your purchase.
              </InfoCard>
              <InfoCard title="Legal Requirements" className="min-h-[104px]">
                We may disclose your information if required to do so by law or
                in response to valid requests by public authorities.
              </InfoCard>
            </div>
          </Panel>
        </Section>

        {/* 04 */}
        <Section number="04" title="Location Data">
          <p className="text-sm leading-relaxed text-[#475569] mb-3">
            Polygon requires access to your location to determine if you are
            within our delivery zones and to provide accurate delivery
            estimates.
          </p>
          <p className="text-sm leading-relaxed text-[#475569]">
            You can enable or disable location services at any time through your
            mobile device settings. However, disabling location services may
            prevent you from using certain features, such as selecting your
            delivery city or receiving deliveries.
          </p>
        </Section>

        {/* 05 */}
        <Section number="05" title="Security of Your Data">
          <p className="text-sm leading-relaxed text-[#475569]">
            We use administrative, technical, and physical security measures to
            protect your personal information. We require strong passwords (a
            mix of letters, numbers, and symbols) and store your data on secure
            servers. While we strive to protect your data, no method of
            transmission over the internet is 100% secure.
          </p>
        </Section>

        {/* 06 */}
        <Section number="06" title="Your Rights and Choices">
          <p className="text-sm text-[#64748B] mb-4">
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <Panel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <InfoCard title="Access and Update" className="min-h-[120px]">
                You can review and update your personal information (including
                password and saved addresses) directly through the
                &quot;My Account&quot; section of the App.
              </InfoCard>
              <InfoCard title="Delete Account" className="min-h-[120px]">
                You may request the deletion of your account and personal data
                by contacting us. Please note that we may retain certain
                transaction records as required by law.
              </InfoCard>
              <InfoCard title="Notifications" className="min-h-[120px]">
                You can manage your alert preferences via your device&apos;s
                notification settings.
              </InfoCard>
            </div>
          </Panel>
        </Section>

        {/* 07 */}
        <Section number="07" title="Children's Privacy">
          <p className="text-sm leading-relaxed text-[#475569]">
            Our App is not intended for use by children under the age of 13 (or
            16 in certain jurisdictions). We do not knowingly collect personally
            identifiable information from children. If we discover that a child
            has provided us with personal information, we will delete it
            immediately.
          </p>
        </Section>

        {/* 08 */}
        <Section number="08" title="Changes to This Privacy Policy">
          <p className="text-sm leading-relaxed text-[#475569]">
            We may update our Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. We will notify you of any changes by posting the
            new Privacy Policy on this page and updating the &quot;Last
            Updated&quot; date.
          </p>
        </Section>

        {/* 09 */}
        <Section number="09" title="Contact Us">
          <p className="text-sm text-[#64748B] mb-4">
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us at:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <a
              href="mailto:info@polygon.lk"
              className="flex items-center justify-center gap-2 bg-[#020617] text-white text-xs font-medium rounded-xl py-3 hover:bg-[#0F172A] transition-colors"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-[#10B981]"
                style={{ width: 12 }}
              />
              info@polygon.lk
            </a>
            <a
              href="tel:0114313433"
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#0F172A] text-xs font-medium rounded-xl py-3 hover:bg-gray-50 transition-colors"
            >
              <FontAwesomeIcon
                icon={faPhone}
                className="text-[#10B981]"
                style={{ width: 12 }}
              />
              011 431 3433
            </a>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-[#F8FAFC] border border-gray-100 rounded-xl px-4 py-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0F172A]">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-[#10B981]"
                style={{ width: 14 }}
              />
            </span>
            <div>
              <div className="text-[10px] font-semibold tracking-wide text-[#64748B] uppercase">
                Physical Office
              </div>
              <div className="text-xs font-semibold text-[#0F172A]">
                No. 46/42, Nawam Mawatha, Colombo 02, Sri Lanka
              </div>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}