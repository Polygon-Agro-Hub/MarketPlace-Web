
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInvoice, getOrderDetails } from '@/services/retail-order-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = (pdfFonts as any).vfs;
import { Suspense } from 'react'
// Define interfaces based on the API responses
export interface InvoiceItem {
  id: number;
  name: string;
  unitPrice: string;
  quantity: string;
  unit: string;
  amount: string;
  image?: string;
  packageDetails?: {
    packageId: number;
    productTypeId: number;
    typeName: string;
    qty: number;
  }[];
}

interface BillingInfo {
  title: string;
  fullName: string;
  buildingType: string;
  houseNo: string;
  street: string;
  city: string;
  phone: string;
}

interface PickupInfo {
  centerId?: string;
  centerName: string;
  contact01: string;
  address: {
    street: string;
    city: string;
    district: string;
    province: string;
    country: string;
    zipCode: string;
  };
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  scheduledDate: string;
  deliveryMethod: string;
  paymentMethod: string;
  amountDue: string;
  familyPackItems: InvoiceItem[];
  additionalItems: InvoiceItem[];
  familyPackTotal: string;
  additionalItemsTotal: string;
  deliveryFee: string;
  grandTotal: string;
  discount: string;
  billingInfo: BillingInfo;
  pickupInfo?: PickupInfo;
}

function formatDateTime(dateTimeStr: string, type: 'date' | 'time' = 'date'): string {
  if (!dateTimeStr || dateTimeStr === 'N/A') return 'N/A';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    if (type === 'time' && dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return dateTimeStr.slice(0, 5);
    }
    return 'N/A';
  }
  if (type === 'time') {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      timeStyle: 'short',
    });
  }
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'medium',
  });
}

function InvoiceView({
  invoice,
  onClose,
  invoiceRef,
}: {
  invoice: InvoiceData | null;
  onClose: () => void;
  invoiceRef: React.RefObject<HTMLDivElement>;
}) {
  if (!invoice) {
    return (
      <div className="w-full p-8">
        <p className="text-red-600 text-center">Loading...</p>
      </div>
    );
  }

  const parseCurrency = (value: string): number => {
    if (value === 'Rs. NaN' || !value) return 0;
    return parseFloat(value.replace('Rs. ', '')) || 0;
  };

  return (
    <div className="w-[794px] mx-auto p-8 bg-white" ref={invoiceRef}>
      <h1 className="text-2xl font-bold text-center" style={{ color: 'rgb(62,32,109)' }}>
        INVOICE
      </h1>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-lg font-semibold">Polygon Holdings (Pvt) Ltd</p>
          <div className="text-sm">
            <p>No. 614, Nawam Mawatha, Colombo 02</p>
            <p>Contact No: +94 112 700 900</p>
            <p>Email Address: info@polygon.lk</p>
          </div>
        </div>
        <div>
          <img
            src="/POLYGON ORIGINAL LOGO.png"
            alt="Polygon Logo"
            width={150}
            height={150}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>{`${invoice.billingInfo.title} ${invoice.billingInfo.fullName}`}</p>
          <p>{`No. ${invoice.billingInfo.houseNo}`}</p>
          <p>{invoice.billingInfo.street}</p>
          <p>{invoice.billingInfo.city}</p>
          <p>{invoice.billingInfo.phone}</p>
          <p className="font-semibold mt-5">Invoice No:</p>
          <p>{invoice.invoiceNumber}</p>
          <p className="font-semibold mt-5">Delivery Method:</p>
          <p>{invoice.deliveryMethod}</p>
          {invoice.deliveryMethod?.toLowerCase() === 'pickup' && invoice.pickupInfo && (
            <div className="mt-3 text-sm">
              <p className="font-semibold">Center: {invoice.pickupInfo.centerName || 'N/A'}</p>
              <p>{`${invoice.pickupInfo.address?.city || 'N/A'}, ${invoice.pickupInfo.address?.district || 'N/A'}`}</p>
              <p>{`${invoice.pickupInfo.address?.province || 'N/A'}, ${invoice.pickupInfo.address?.country || 'N/A'}`}</p>
            </div>
          )}
        </div>
        <div className="text-left ml-49">
          <p className="font-semibold mt-5">Grand Total:</p>
          <p className="font-extrabold">{`Rs. ${parseCurrency(invoice.grandTotal).toFixed(2)}`}</p>
          <p className="font-semibold mt-5">Payment Method:</p>
          <p>{invoice.paymentMethod}</p>
          <p className="font-semibold mt-5">Ordered Date:</p>
          <p>{formatDateTime(invoice.invoiceDate, 'date')}</p>
          <p className="font-semibold mt-5">Scheduled Date:</p>
          <p>{formatDateTime(invoice.scheduledDate, 'date')}</p>
        </div>
      </div>

      <div className="mb-8">
        {invoice.familyPackItems.map((pack, packIndex) => (
          <div key={pack.id} className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">{`${pack.name} (${pack.packageDetails?.length || 0} Items)`}</h2>
              <span className="font-semibold">{pack.amount}</span>
            </div>
            <div className="border-t mb-4 mt-4 border-gray-300" />
            <div className="mb-4 border border-gray-300 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-100 border-gray-300">
                    <th className="p-3 text-left">Index</th>
                    <th className="p-3 text-left">Item Description</th>
                    <th className="p-3 text-left">QTY</th>
                    <th className="p-3 text-left"></th>
                    <th className="p-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {pack.packageDetails && pack.packageDetails.length > 0 ? (
                    pack.packageDetails.map((detail, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="p-5 text-left">{`${index + 1}.`}</td>
                        <td className="p-3 text-left">{detail.typeName}</td>
                        <td className="p-3 text-left">{detail.qty}</td>
                        <td className="p-3 text-left"></td>
                        <td className="p-3 text-left"></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-gray-600">
                        No package details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">{`Additional Items (${invoice.additionalItems.length} Items)`}</h2>
          <span className="font-semibold">{`Rs. ${parseCurrency(invoice.additionalItemsTotal).toFixed(2)}`}</span>
        </div>
        <div className="border-t mb-4 mt-4 border-gray-300" />
        <div className="mb-4 border border-gray-300 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100 border-gray-300">
                <th className="p-3 text-left">Index</th>
                <th className="p-3 text-left">Item Description</th>
                <th className="p-3 text-left">Unit Price (Rs.)</th>
                <th className="p-3 text-left">QTY</th>
                <th className="p-3 text-left">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.additionalItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="p-5 text-left">{`${index + 1}.`}</td>
                  <td className="p-3 text-left">{item.name}</td>
                  <td className="p-3 text-left">{item.unitPrice}</td>
                  <td className="p-3 text-left">{`${item.quantity} ${item.unit}`}</td>
                  <td className="p-3 text-left">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold">Grand Total for all items</h2>
        <div className="border-t mb-4 mt-4 border-gray-300" />
        <table className="w-full text-sm" id="grandTotalTable">
          <tbody>
            <tr>
              <td className="p-2">Family Packs</td>
              <td className="p-2 text-right">{`Rs. ${parseCurrency(invoice.familyPackTotal).toFixed(2)}`}</td>
            </tr>
            <tr>
              <td className="p-2">Additional Items</td>
              <td className="p-2 text-right">{`Rs. ${parseCurrency(invoice.additionalItemsTotal).toFixed(2)}`}</td>
            </tr>
            <tr>
              <td className="p-2">Delivery Fee</td>
              <td className="p-2 text-right">{`Rs. ${parseCurrency(invoice.deliveryFee).toFixed(2)}`}</td>
            </tr>
            <tr className="font-bold border-t-4 border-black">
              <td className="p-4">Grand Total</td>
              <td className="p-2 text-right">{`Rs. ${(
                parseCurrency(invoice.familyPackTotal) +
                parseCurrency(invoice.additionalItemsTotal) +
                parseCurrency(invoice.deliveryFee)
              ).toFixed(2)}`}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm">
        <p className="mb-2 font-bold">Remarks:</p>
        <p className="mb-2">Kindly inspect all goods at the time of delivery to ensure accuracy and condition.</p>
        <p className="mb-2">Polygon does not accept returns under any circumstances.</p>
        <p className="mb-2">Please contact our customer service team within 24 hours of delivery.</p>
        <p className="mb-2">For any assistance, feel free to contact our customer service team.</p>
        <p className="font-semibold text-center italic mt-9">Thank you for shopping with us!</p>
        <p className="text-center italic mt-3">
          WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US
        </p>
        <p className="text-center italic mt-10 text-gray-400">
          -THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-
        </p>
      </div>
    </div>
  );
}

function InvoicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get('orderId');

  const parseCurrency = (value: string): string => {
    if (value === 'Rs. NaN' || !value) return 'Rs. 0.00';
    return value.startsWith('Rs. ') ? value : `Rs. ${value || '0.00'}`;
  };

  // Load pdfmake, vfs_fonts scripts, and logo image
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server

    const loadScripts = async () => {
      try {
        // Check if pdfMake is already loaded
        if (window.pdfMake) {
          console.log('pdfMake already loaded at 05:51 PM +0530, June 09, 2025');
          setPdfMakeLoaded(true);
        } else {
          const loadScript = (src: string, isCritical: boolean): Promise<void> =>
            new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.async = true;
              script.onload = () => {
                console.log(`${src} loaded at 05:51 PM +0530, June 09, 2025`);
                resolve();
              };
              script.onerror = () => {
                console.error(`Failed to load ${src} at 05:51 PM +0530, June 09, 2025`);
                if (isCritical) reject(new Error(`Failed to load ${src}`));
                else resolve();
              };
              document.body.appendChild(script);
            });

          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js', true);
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js', false);
          setPdfMakeLoaded(true);
        }

        // Load logo image as base64
        const img = new Image();
        img.src = '/POLYGON ORIGINAL LOGO.png';
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/png');
            setLogoBase64(base64);
            setImageLoaded(true);
            console.log('Logo image loaded and converted to base64 at 05:51 PM +0530, June 09, 2025');
          }
        };
        img.onerror = () => {
          console.error('Failed to load logo image at 05:51 PM +0530, June 09, 2025');
          setImageLoaded(true); // Proceed even if image fails
        };
      } catch (error) {
        console.error('Error loading scripts at 05:51 PM +0530, June 09, 2025:', error);
        alert('Failed to load PDF library. Please try again later.');
      }
    };

    loadScripts();
  }, []);

  const generatePDF = (invoice: InvoiceData) => {
    const parseNum = (value: string): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      const cleaned = value.replace(/Rs\.?\s?/, '').replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const formatDate = (dateStr: string): string => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium' });
    };

    const familyPackSections = invoice.familyPackItems.map(pack => [
      {
        columns: [
          { text: `${pack.name} (${pack.packageDetails?.length || 0} Items)`, bold: true, fontSize: 9, margin: [0, 8, 0, 4] },
          { text: pack.amount, bold: true, fontSize: 9, alignment: 'right', margin: [0, 8, 0, 4] }
        ]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: '#D7D7D7' }
        ],
        margin: [0, 4, 0, 4]
      },
      {
        table: {
          widths: ['10%', '70%', '20%'],
          body: [
            [
              { text: 'Index', style: 'tableHeader', fillColor: '#F8F8F8' },
              { text: 'Item Description', style: 'tableHeader', fillColor: '#F8F8F8' },
              { text: 'QTY', style: 'tableHeader', fillColor: '#F8F8F8' }
            ],
            ...(pack.packageDetails?.map((detail, i) => [
              `${i + 1}.`,
              detail.typeName,
              detail.qty
            ]) || [])
          ]
        },
        margin: [0, 4, 0, 4],
        layout: {
          fillColor: (row: number) => row === 0 ? '#F8F8F8' : null,
          hLineWidth: (i: number, node: any) => {
            return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
          },
          vLineWidth: (i: number, node: any) => {
            return (i === 0 || i === node.table.widths.length) ? 0.5 : 0;
          },
          hLineColor: () => '#D1D5DB',
          vLineColor: () => '#D1D5DB',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      }
    ]).flat();

    const addCount = invoice.additionalItems.length;
    const addTitle = `Additional Items (${addCount} Items)`;
    const hasPackages = invoice.familyPackItems.length > 0;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [24, 32, 24, 32],
      content: [
        // INVOICE Title
        { text: 'INVOICE', fontSize: 14, bold: true, color: '#3E206D', alignment: 'center', margin: [0, 0, 0, 16] },
        // Company Info and Logo
        {
          columns: [
            [
              { text: 'Polygon Holdings (Private) Ltd', bold: true, fontSize: 11 },
              { text: 'No. 614, Nawam Mawatha, Colombo 02', fontSize: 9 },
              { text: 'Contact No: +94 112 700 900', fontSize: 9 },
              { text: 'info@polygon.lk', fontSize: 9 },
            ],
            [
              { image: 'logo', width: 80, alignment: 'right', margin: [80, 0, 0, 0] }
            ]
          ],
          columnGap: 16,
          margin: [0, 0, 0, 8]
        },
        // Two-column Info
        {
          columns: [
            [
              { text: 'Bill To:', bold: true, fontSize: 9, margin: [0, 8, 0, 2] },
              { text: `${invoice.billingInfo.title} ${invoice.billingInfo.fullName}`, fontSize: 9 },
              { text: `No. ${invoice.billingInfo.houseNo}`, fontSize: 9 },
              { text: invoice.billingInfo.street, fontSize: 9 },
              { text: invoice.billingInfo.city, fontSize: 9 },
              { text: invoice.billingInfo.phone, fontSize: 9 },
              { text: 'Invoice No:', bold: true, fontSize: 9, margin: [0, 8, 0, 2] },
              { text: invoice.invoiceNumber, fontSize: 9 },
              { text: 'Delivery Method:', bold: true, fontSize: 9, margin: [0, 8, 0, 2] },
              { text: invoice.deliveryMethod, fontSize: 9 },
              ...(invoice.deliveryMethod?.toLowerCase() === 'pickup' && invoice.pickupInfo ? [
                { text: `Center: ${invoice.pickupInfo.centerName}`, bold: true, fontSize: 9, margin: [0, 6, 0, 0] },
                { text: `${invoice.pickupInfo.address.city}, ${invoice.pickupInfo.address.district}`, fontSize: 9 },
                { text: `${invoice.pickupInfo.address.province}, ${invoice.pickupInfo.address.country}`, fontSize: 9 }
              ] : [])
            ],
            [
              { text: 'Grand Total:', bold: true, fontSize: 9, margin: [105, 8, 0, 2] },
              { text: `Rs. ${parseNum(invoice.grandTotal).toFixed(2)}`, fontSize: 11, bold: true, margin: [105, 0, 0, 6] },
              { text: 'Payment Method:', bold: true, fontSize: 9, margin: [105, 6, 0, 2] },
              { text: invoice.paymentMethod, fontSize: 9, margin: [105, 0, 0, 6] },
              { text: 'Ordered Date:', bold: true, fontSize: 9, margin: [105, 6, 0, 2] },
              { text: formatDate(invoice.invoiceDate), fontSize: 9, margin: [105, 0, 0, 6] },
              { text: 'Scheduled Date:', bold: true, fontSize: 9, margin: [105, 6, 0, 2] },
              { text: formatDate(invoice.scheduledDate), fontSize: 9, margin: [105, 0, 0, 6] }
            ]
          ],
          columnGap: 16,
          margin: [0, 0, 0, 12]
        },
        // Family Pack Sections
        ...familyPackSections,
        // Additional Items Section
        hasPackages ? { text: '', pageBreak: 'before' } : null,
        {
          columns: [
            { text: addTitle, bold: true, fontSize: 9, margin: [0, 8, 0, 4] },
            { text: `Rs. ${parseNum(invoice.additionalItemsTotal).toFixed(2)}`, bold: true, fontSize: 9, alignment: 'right', margin: [0, 8, 0, 4] }
          ]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: '#D7D7D7' }
          ],
          margin: [0, 4, 0, 4]
        },
        {
          table: {
            widths: ['10%', '40%', '20%', '15%', '15%'],
            body: [
              [
                { text: 'Index', style: 'tableHeader', fillColor: '#F3F4F6' },
                { text: 'Item Description', style: 'tableHeader', fillColor: '#F3F4F6' },
                { text: 'Unit Price (Rs.)', style: 'tableHeader', fillColor: '#F3F4F6' },
                { text: 'QTY', style: 'tableHeader', fillColor: '#F3F4F6' },
                { text: 'Amount (Rs.)', style: 'tableHeader', fillColor: '#F3F4F6' }
              ],
              ...invoice.additionalItems.map((it, i) => [
                `${i + 1}.`,
                it.name,
                it.unitPrice,
                `${it.quantity} ${it.unit}`,
                it.amount
              ])
            ]
          },
          margin: [0, 4, 0, 4],
          layout: {
            fillColor: (row: number) => row === 0 ? '#F8F8F8' : null,
            hLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
            },
            vLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.widths.length) ? 0.5 : 0;
            },
            hLineColor: () => '#D1D5DB',
            vLineColor: () => '#D1D5DB',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        },
        // Grand Total Table
        {
          text: 'Grand Total for all items',
          bold: true,
          fontSize: 9,
          margin: [0, 12, 0, 4]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: '#D7D7D7' }
          ],
          margin: [0, 4, 0, 4]
        },
        {
          table: {
            widths: ['80%', '20%'],
            body: [
              [
                { text: 'Family Packs', fontSize: 9 },
                { text: `Rs. ${parseNum(invoice.familyPackTotal).toFixed(2)}`, fontSize: 9, alignment: 'right' }
              ],
              [
                { text: 'Additional Items', fontSize: 9 },
                { text: `Rs. ${parseNum(invoice.additionalItemsTotal).toFixed(2)}`, fontSize: 9, alignment: 'right' }
              ],
              [
                { text: 'Delivery Fee', fontSize: 9 },
                { text: `Rs. ${parseNum(invoice.deliveryFee).toFixed(2)}`, fontSize: 9, alignment: 'right' }
              ],
              [
                { text: 'Total', bold: true, fontSize: 9 },
                {
                  text: `Rs. ${(
                    parseNum(invoice.familyPackTotal) +
                    parseNum(invoice.additionalItemsTotal) +
                    parseNum(invoice.deliveryFee)
                  ).toFixed(2)}`,
                  bold: true,
                  fontSize: 9,
                  alignment: 'right'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return i === node.table.body.length - 1 ? 2 : 0;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i: number, node: any) {
              return i === node.table.body.length - 1 ? 'black' : 'white';
            },
            paddingLeft: function () {
              return 6;
            },
            paddingRight: function () {
              return 6;
            },
            paddingTop: function () {
              return 4;
            },
            paddingBottom: function () {
              return 4;
            }
          },
          margin: [0, 0, 0, 12]
        },
        // Remarks
        {
          text: [
            { text: 'Remarks:\n', bold: true, fontSize: 9 },
            { text: 'Kindly inspect all goods at the time of delivery to ensure accuracy and condition.\n', fontSize: 9 },
            { text: 'Polygon does not accept returns under any circumstances.\n', fontSize: 9 },
            { text: 'Please report any issues or discrepancies within 24 hours of delivery to ensure prompt attention.\n', fontSize: 9 },
            { text: 'For any assistance, feel free to contact our customer service team.', fontSize: 9 }
          ],
          margin: [0, 6, 0, 6]
        },
        // Footer
        { text: 'Thank you for shopping with us!', italics: true, alignment: 'center', fontSize: 9, margin: [0, 10, 0, 2] },
        { text: 'WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US', italics: true, alignment: 'center', fontSize: 9 },
        { text: '-THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-', italics: true, alignment: 'center', color: 'gray', fontSize: 8, margin: [0, 8, 0, 0] }
      ].filter(item => item !== null), // Remove null from pageBreak if not needed
      images: { logo: logoBase64 || '' },
      defaultStyle: { font: 'Roboto', fontSize: 9 },
      styles: {
        tableHeader: { bold: true, fontSize: 9 }
      }
    };

    pdfMake.createPdf(docDefinition).download(`invoice_${invoice.invoiceNumber}.pdf`);
  };

  const fetchInvoice = async (orderId: string): Promise<void> => {
    if (!token) {
      console.error('No token available at 05:51 PM +0530, June 09, 2025');
      setSelectedInvoice(null);
      setLoading(false);
      return;
    }

    try {
      setSelectedInvoice(null);
      const data = await getInvoice(token, orderId);
      const orderDetails = await getOrderDetails(token, orderId);
      console.log('Invoice Response at 05:51 PM +0530, June 09, 2025:', data);
      console.log('Order Details for Discount at 05:51 PM +0530, June 09, 2025:', orderDetails);

      if (data.status && data.invoice) {
        const apiInvoice = data.invoice.invoice || data.invoice;
        const additionalItemsDiscount = orderDetails.additionalItemsData?.reduce((sum: number, item: any) => {
          const qty = parseFloat(item.quantity || '1');
          const discount = parseFloat(item.discount || '0');
          return sum + (discount * qty);
        }, 0) || 0;
        const totalDiscount = parseFloat(orderDetails.order?.discount || '0') + additionalItemsDiscount;

        const familyPackTotal = parseFloat(apiInvoice.familyPackTotal?.replace('Rs. ', '') || '0');
        const additionalItemsTotal = parseFloat(apiInvoice.additionalItemsTotal?.replace('Rs. ', '') || '0');
        const deliveryFee = parseFloat(apiInvoice.deliveryFee?.replace('Rs. ', '') || '0');
        const grandTotal = (familyPackTotal + additionalItemsTotal + deliveryFee - totalDiscount).toFixed(2);

        const invoiceData: InvoiceData = {
          invoiceNumber: apiInvoice.invoiceNumber || 'N/A',
          invoiceDate: apiInvoice.invoiceDate || 'N/A',
          scheduledDate: apiInvoice.scheduledDate || 'N/A',
          deliveryMethod: apiInvoice.deliveryMethod || 'N/A',
          paymentMethod: apiInvoice.paymentMethod || 'N/A',
          amountDue: parseCurrency(apiInvoice.amountDue),
          familyPackItems: apiInvoice.familyPackItems?.map((item: any) => ({
            id: item.id ?? 0,
            name: item.name || 'Unknown',
            unitPrice: parseCurrency(item.unitPrice),
            quantity: item.quantity || '1',
            unit: item.unit || 'units',
            amount: parseCurrency(item.amount),
            packageDetails: item.packageDetails?.map((detail: any) => ({
              packageId: detail.packageId,
              productTypeId: detail.productTypeId,
              typeName: detail.typeName,
              qty: detail.qty
            })) || []
          })) || [],
          additionalItems: apiInvoice.additionalItems?.map((item: any) => ({
            id: item.id ?? 0,
            name: item.name || 'Unknown',
            unitPrice: parseCurrency(item.unitPrice),
            quantity: item.quantity || '1',
            unit: item.unit || 'units',
            amount: parseCurrency(item.amount),
            image: item.image || undefined,
          })) || [],
          familyPackTotal: parseCurrency(apiInvoice.familyPackTotal),
          additionalItemsTotal: parseCurrency(apiInvoice.additionalItemsTotal),
          deliveryFee: parseCurrency(apiInvoice.deliveryFee),
          discount: totalDiscount > 0 ? `Rs. ${totalDiscount.toFixed(2)}` : 'Rs. 0.00',
          grandTotal: `Rs. ${grandTotal}`,
          billingInfo: {
            title: apiInvoice.billingInfo?.title || 'N/A',
            fullName: apiInvoice.billingInfo?.fullName || 'N/A',
            buildingType: apiInvoice.billingInfo?.buildingType || 'N/A',
            houseNo: apiInvoice.billingInfo?.houseNo || 'N/A',
            street: apiInvoice.billingInfo?.street || 'N/A',
            city: apiInvoice.billingInfo?.city || 'N/A',
            phone: apiInvoice.billingInfo?.phone || 'N/A',
          },
          pickupInfo: apiInvoice.pickupInfo
            ? {
              centerId: apiInvoice.pickupInfo.centerId ?? undefined,
              centerName: apiInvoice.pickupInfo.centerName || 'N/A',
              contact01: apiInvoice.pickupInfo.contact01 || 'N/A',
              address: {
                street: apiInvoice.pickupInfo.address?.street || 'N/A',
                city: apiInvoice.pickupInfo.address?.city || 'N/A',
                district: apiInvoice.pickupInfo.address?.district || 'N/A',
                province: apiInvoice.pickupInfo.address?.province || 'N/A',
                country: apiInvoice.pickupInfo.address?.country || 'N/A',
                zipCode: apiInvoice.pickupInfo.address?.zipCode || 'N/A',
              },
            }
            : undefined,
        };

        if (
          parseFloat(invoiceData.amountDue.replace('Rs. ', '')) !==
          parseFloat(invoiceData.grandTotal.replace('Rs. ', ''))
        ) {
          console.warn('Amount due and grand total mismatch at 05:51 PM +0530, June 09, 2025:', invoiceData);
        }

        setSelectedInvoice(invoiceData);

        if (imageLoaded && pdfMakeLoaded) {
          setTimeout(() => {
            if (invoiceData) {
              generatePDF(invoiceData);
            } else {
              console.error('No invoice data available for PDF generation at 05:51 PM +0530, June 09, 2025');
              alert('Failed to generate PDF. Invoice data not available.');
            }
          }, 500);
        }
      } else {
        console.error('Invalid invoice data received at 05:51 PM +0530, June 09, 2025:', data);
        setSelectedInvoice(null);
        alert('Invalid invoice data received. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching invoice at 05:51 PM +0530, June 09, 2025:', error);
      setSelectedInvoice(null);
      alert('Failed to fetch invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && imageLoaded && pdfMakeLoaded) {
      fetchInvoice(orderId);
    } else if (!orderId) {
      setLoading(false);
      alert('No order ID provided.');
    }
  }, [orderId, token, imageLoaded, pdfMakeLoaded]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 p-6">
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => router.push('/history/order')}
          invoiceRef={invoiceRef as any}
        />
      </main>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading invoice data...</div>}>
      <InvoicePageContent />
    </Suspense>
  );
}