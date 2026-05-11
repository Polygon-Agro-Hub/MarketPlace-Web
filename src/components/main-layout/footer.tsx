import Image from "next/image";
import { useEffect, useState } from "react";
import Visa from "../../../public/images/Visa.png";
import MasterCard from "../../../public/images/Mastercard.png";
import Linkedin from "../../../public/icons/linkedin-Footer.png";
import Facebook from "../../../public/icons/Facebook-Footer.png";
import Youtube from "../../../public/icons/Youtube-Footer.png";
import Instagram from "../../../public/icons/Instagram-Footer.png";
import Mail from "../../../public/icons/Mail-Footer.png";
import footer from "../../../public/footer.png";
import Link from "next/link";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="bg-[#191D28] text-white">
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
    </footer>
  );
}

function DesktopFooter() {
  return (
    <div className="mx-auto">
      <div className="flex flex-wrap justify-between items-start px-24 pt-20 pb-10">
        <div className="w-1/4">
          <div className="flex justify-left mb-4">
            <Image
              src={footer}
              alt="MyFarm Logo"
              width={150}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div className="mb-4">
            <div className="flex items-start mb-5">
              <div className="text-[#8492A3] mr-2 mt-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-[#8492A3]">Registered Office :</p>
                <p className="text-sm text-[#8492A3]">
                  No. 14, Sir Baron Jayathilaka Mawatha, Colombo 01.
                </p>
              </div>
            </div>
            <div className="flex items-start mb-5">
              <div className="text-[#8492A3] mr-2 mt-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-[#8492A3]">Cooperate Office :</p>
                <p className="text-sm text-[#8492A3]">
                  No. 46/42, Nawam Mawatha, Colombo 02.
                </p>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="text-[#8492A3] mr-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
              </div>
              <p className="text-sm text-[#8492A3]">+94 770111999</p>
            </div>
          </div>
        </div>

        <div className="w-1/4 pl-32">
          <h3 className="text-2xl text-[#FFFFFF] font-semibold mb-5">
            Quick Links
          </h3>
          <ul>
            <li className="mb-2">
              <a href="/" className="text-[#DBDBDB] hover:text-blue-300">
                Home
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-[#DBDBDB] hover:text-blue-300">
                Privacy Policy
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-[#DBDBDB] hover:text-blue-300">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        <div className="w-1/4 pl-32">
          <h3 className="text-2xl text-[#FFFFFF] font-semibold mb-5">
            My Accounts
          </h3>
          <ul>
            <li className="mb-2">
              <Link
                href="/account"
                className="text-[#DBDBDB] hover:text-blue-300"
              >
                My Account
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/cart" className="text-[#DBDBDB] hover:text-blue-300">
                My Cart
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/history/order"
                className="text-[#DBDBDB] hover:text-blue-300"
              >
                My Order History
              </Link>
            </li>
          </ul>
        </div>

        <div className="w-1/4">
          <div className="flex space-x-4 mb-4">
            <a href="#" className="text-blue-400 hover:text-blue-300">
              <Image
                src={Linkedin}
                alt="LinkedIn"
                className="w-auto h-8 object-cover"
              />
            </a>
            <a
              href="https://www.facebook.com/p/Govimart-61582676188251/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <Image
                src={Facebook}
                alt="Facebook"
                className="w-auto h-8 object-cover"
              />
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300">
              <Image
                src={Youtube}
                alt="Youtube"
                className="w-auto h-8 object-cover"
              />
            </a>
            <a
              href="https://www.instagram.com/govimart/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <Image
                src={Instagram}
                alt="Instagram"
                className="w-auto h-8 object-cover"
              />
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300">
              <Image
                src={Mail}
                alt="Mail"
                className="w-auto h-8 object-cover"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#232732] mt-6 py-3 px-7 flex justify-between items-center">
        <div className="flex">
          <p className="text-sm text-[#DBDBDB]">
            © All rights reserved by Polygon Holdings (Pvt) Ltd
          </p>
          <div className="flex ml-5">
            <Image
              src={Visa}
              alt="Visa"
              className="w-auto h-6 object-cover mr-2"
            />
            <Image
              src={MasterCard}
              alt="MasterCard"
              className="w-auto h-6 object-cover"
            />
          </div>
        </div>
        <div className="flex space-x-6">
          <a
            href="#"
            className="text-sm text-[#DBDBDB] hover:text-white underline"
          >
            Terms & Conditions
          </a>
          <a
            href="#"
            className="text-sm text-[#DBDBDB] hover:text-white underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <div className="mx-auto px-6 pt-8 pb-4">
      {/* Logo — centered */}
      <div className="flex justify-center mb-6">
        <Image
          src={footer}
          alt="MyFarm Logo"
          width={130}
          height={52}
          className="object-contain"
          priority
        />
      </div>

      {/* Address block — centered */}
      <div className="flex flex-col items-center mb-8 space-y-4">
        <div className="flex items-start w-full max-w-xs">
          <div className="text-[#8492A3] mr-2 mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-[#8492A3] text-sm">Registered Office :</p>
            <p className="text-xs text-[#8492A3]">
              No. 14, Sir Baron Jayathilaka Mawatha, Colombo 01.
            </p>
          </div>
        </div>

        <div className="flex items-start w-full max-w-xs">
          <div className="text-[#8492A3] mr-2 mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-[#8492A3] text-sm">Cooperate Office :</p>
            <p className="text-xs text-[#8492A3]">
              No. 46/42, Nawam Mawatha, Colombo 02.
            </p>
          </div>
        </div>

        <div className="flex items-center w-full max-w-xs">
          <div className="text-[#8492A3] mr-2 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <p className="text-xs text-[#8492A3]">+94 77 1666 800</p>
        </div>
      </div>

      {/* Quick Links + My Accounts — two columns, left-aligned headers */}
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-base font-semibold mb-4 text-[#FFFFFF]">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4 text-[#FFFFFF]">
            My Accounts
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/account"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                My Cart
              </Link>
            </li>
            <li>
              <Link
                href="/history/order"
                className="text-sm text-[#DBDBDB] hover:text-blue-300"
              >
                My Order History
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Social icons — centered */}
      <div className="flex justify-center space-x-6 mb-8">
        <a href="#" className="hover:opacity-75">
          <Image src={Linkedin} alt="LinkedIn" width={28} height={28} />
        </a>
        <a
          href="https://www.facebook.com/p/Govimart-61582676188251/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-75"
        >
          <Image src={Facebook} alt="Facebook" width={28} height={28} />
        </a>
        <a href="#" className="hover:opacity-75">
          <Image src={Youtube} alt="Youtube" width={28} height={28} />
        </a>
        <a
          href="https://www.instagram.com/govimart/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-75"
        >
          <Image src={Instagram} alt="Instagram" width={28} height={28} />
        </a>
        <a href="#" className="hover:opacity-75">
          <Image src={Mail} alt="Mail" width={28} height={28} />
        </a>
      </div>

      {/* Bottom bar — copyright left, cards right */}
      <div className="border-t border-[#404451] pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-[#DBDBDB]">
            © All rights reserved by
            <br />
            Polygon Holdings (Pvt) Ltd
          </p>
          <div className="flex items-center gap-1">
            <Image
              src={Visa}
              alt="Visa"
              width={42}
              height={26}
              className="object-contain"
            />
            <Image
              src={MasterCard}
              alt="MasterCard"
              width={42}
              height={26}
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <a
            href="#"
            className="text-xs text-[#DBDBDB] hover:text-white underline"
          >
            Terms & Conditions
          </a>
          <a
            href="#"
            className="text-xs text-[#DBDBDB] hover:text-white underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
