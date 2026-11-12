import { db } from "@/lib/db";

/**
 * Generates an official, printable HTML GST Tax Invoice for workshop work orders.
 */
export async function generateTaxInvoiceHtml(invoiceId: string): Promise<string> {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      jobCard: {
        include: {
          tasks: true,
          partConsumptions: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!invoice) throw new Error("Invoice not found");

  const job = invoice.jobCard;
  const dateStr = invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");

  const labourRows = job?.tasks.map((t, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${idx + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><strong>Labour:</strong> ${t.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-family: monospace;">998714</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${t.estimatedHours} hrs</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right;">₹${t.labourRate}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold;">₹${t.totalLabourCost.toLocaleString("en-IN")}</td>
    </tr>
  `).join("") || "";

  const partRows = job?.partConsumptions.map((p, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${(job?.tasks.length || 0) + idx + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><strong>Spare Part:</strong> ${p.product?.name} (SKU: ${p.product?.sku})</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-family: monospace;">870829</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${p.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right;">₹${p.unitPrice}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold;">₹${p.totalPrice.toLocaleString("en-IN")}</td>
    </tr>
  `).join("") || "";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Tax Invoice - ${invoice.invoiceNumber}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 30px; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div style="max-width: 800px; margin: auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; background: #ffffff;">
      <!-- Header -->
      <table style="width: 100%; border-bottom: 2px solid #0F1E36; padding-bottom: 16px;">
        <tr>
          <td>
            <h1 style="color: #0F1E36; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">BHARAT MOTOR CLUB</h1>
            <p style="margin: 2px 0; font-size: 11px; font-weight: bold; color: #E05A1B; text-transform: uppercase;">One Club. Every Automotive Need.</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">
              BMC Central Hub, Plot 42, Sector 18, Udyog Vihar, Gurugram, HR 122015<br/>
              <strong>GSTIN:</strong> 07AAAAA0000A1Z5 • <strong>PAN:</strong> AAAAA0000A • CIN: U50100HR2026PTC099999
            </p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <div style="display: inline-block; background: #0F1E36; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">TAX INVOICE</div>
            <p style="margin: 6px 0 0; font-size: 13px; font-weight: bold; font-family: monospace;">${invoice.invoiceNumber}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Date: ${dateStr}</p>
          </td>
        </tr>
      </table>

      <!-- Customer & Vehicle Info -->
      <table style="width: 100%; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
        <tr>
          <td style="width: 50%; vertical-align: top; font-size: 12px; line-height: 1.5;">
            <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Billed To:</strong><br/>
            <strong style="font-size: 14px; color: #0F1E36;">${invoice.customerName}</strong><br/>
            Phone: ${invoice.customerPhone}<br/>
            Work Order: ${job?.jobNumber || "N/A"}
          </td>
          <td style="width: 50%; vertical-align: top; font-size: 12px; line-height: 1.5;">
            <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Vehicle Serviced:</strong><br/>
            <strong>${job?.vehicleMake} ${job?.vehicleModel}</strong><br/>
            Registration No: <span style="font-family: monospace; font-weight: bold;">${job?.vehicleRegNumber}</span><br/>
            Odometer In: ${job?.odometerIn.toLocaleString("en-IN")} km
          </td>
        </tr>
      </table>

      <!-- Line Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
            <th style="padding: 8px;">#</th>
            <th style="padding: 8px;">Description</th>
            <th style="padding: 8px;">HSN/SAC</th>
            <th style="padding: 8px; text-align: center;">Qty/Hrs</th>
            <th style="padding: 8px; text-align: right;">Rate</th>
            <th style="padding: 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${labourRows}
          ${partRows}
        </tbody>
      </table>

      <!-- Totals & Taxes -->
      <table style="width: 100%; margin-top: 10px;">
        <tr>
          <td style="width: 55%; vertical-align: top; font-size: 11px; color: #64748b;">
            <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">${invoice.paymentStatus}</span> via ${invoice.paymentMethod || "UPI"}</p>
            <p>Warranty Terms: 6 Months / 10,000 km warranty on parts and mechanical craftsmanship.</p>
          </td>
          <td style="width: 45%; vertical-align: top;">
            <table style="width: 100%; font-size: 12px; line-height: 1.8;">
              <tr>
                <td style="color: #64748b;">Subtotal:</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold;">₹${invoice.subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">CGST (9.0%):</td>
                <td style="text-align: right; font-family: monospace;">₹${invoice.cgstAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">SGST (9.0%):</td>
                <td style="text-align: right; font-family: monospace;">₹${invoice.sgstAmount.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #0F1E36; font-size: 15px;">
                <td style="font-weight: bold; padding-top: 6px; color: #0F1E36;">Grand Total:</td>
                <td style="text-align: right; font-family: monospace; font-weight: 900; color: #0F1E36; padding-top: 6px;">₹${invoice.grandTotal.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Footer & Signatures -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
        <div>
          This is a computer-generated tax invoice verified by Bharat Motor Club.
        </div>
        <div style="text-align: right;">
          <strong>For BHARAT MOTOR CLUB PRIVATE LIMITED</strong><br/><br/>
          <span>Authorized Signatory</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generates an official, printable Legal Vehicle Purchase Agreement.
 */
export async function generatePurchaseAgreementHtml(agreementId: string): Promise<string> {
  const agreement = await db.purchaseAgreement.findUnique({
    where: { id: agreementId },
    include: {
      acquisitionCase: {
        include: {
          sellerProfile: { include: { user: true } },
          vehicleDetails: true,
          purchaseTransaction: true,
        },
      },
    },
  });

  if (!agreement) throw new Error("Purchase agreement not found");

  const seller = agreement.acquisitionCase.sellerProfile.user;
  const vehicle = agreement.acquisitionCase.vehicleDetails;
  const txn = agreement.acquisitionCase.purchaseTransaction;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Vehicle Purchase Agreement - ${agreement.agreementNumber}</title>
    <style>
      body { font-family: "Times New Roman", Times, serif; color: #0f172a; margin: 0; padding: 40px; line-height: 1.6; }
      h1, h2, h3 { font-family: Arial, sans-serif; }
    </style>
  </head>
  <body>
    <div style="max-width: 800px; margin: auto;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px;">
        <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px;">BHARAT MOTOR CLUB PRIVATE LIMITED</h2>
        <p style="margin: 4px 0 0; font-size: 13px;">Plot 42, Sector 18, Gurugram, Haryana 122015 • CIN: U50100HR2026PTC099999</p>
        <h3 style="margin: 16px 0 0; text-decoration: underline;">VEHICLE PURCHASE AND TRANSFER AGREEMENT</h3>
        <p style="font-size: 12px; margin-top: 4px;">Agreement Ref: <strong>${agreement.agreementNumber}</strong></p>
      </div>

      <p>This Vehicle Purchase and Transfer Agreement is entered into on <strong>${new Date(agreement.signedDate || agreement.createdAt).toLocaleDateString("en-IN")}</strong> by and between:</p>

      <p><strong>1. THE SELLER:</strong><br/>
      <strong>${seller.fullName}</strong>, having Contact: ${seller.phone}, Email: ${seller.email} (hereinafter referred to as the "SELLER", which expression shall include his/her legal heirs, executors, and administrators).</p>

      <p><strong>2. THE PURCHASER:</strong><br/>
      <strong>BHARAT MOTOR CLUB PRIVATE LIMITED</strong>, a company incorporated under the Companies Act, 2013, having its registered office at Plot 42, Sector 18, Gurugram, Haryana 122015 (hereinafter referred to as the "PURCHASER" or "BMC").</p>

      <h4>1. DESCRIPTION OF VEHICLE:</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;" border="1" cellpadding="6">
        <tr><td style="width: 30%;"><strong>Make & Model:</strong></td><td>${vehicle?.year} ${vehicle?.make} ${vehicle?.model} ${vehicle?.variant || ""}</td></tr>
        <tr><td><strong>Registration Number:</strong></td><td><strong>${vehicle?.registrationNumber || "Applied / As Disclosed"}</strong></td></tr>
        <tr><td><strong>Chassis Number (VIN):</strong></td><td>${vehicle?.vin || "Verified upon Physical Inspection"}</td></tr>
        <tr><td><strong>Fuel Type / Transmission:</strong></td><td>${vehicle?.fuelType} / ${vehicle?.transmission}</td></tr>
        <tr><td><strong>Odometer Reading:</strong></td><td>${vehicle?.odometerKm.toLocaleString("en-IN")} Kilometres</td></tr>
      </table>

      <h4>2. CONSIDERATION & SETTLEMENT:</h4>
      <p>The agreed total purchase consideration for the vehicle is <strong>₹${agreement.agreedPrice.toLocaleString("en-IN")}</strong>. Payment shall be settled by the Purchaser directly to the Seller's bank account via RTGS/NEFT transfer${txn ? " (Reference UTR: " + txn.transactionReference + ")" : ""}.</p>

      <h4>3. SELLER WARRANTIES & LEGAL COVENANTS:</h4>
      <ol style="font-size: 13px; line-height: 1.6;">
        <li>The Seller is the sole, absolute and undisputed legal owner of the vehicle with full authority to transfer title and possession.</li>
        <li>The vehicle is free from all encumbrances, bank hypothecations, legal claims, court attachments, criminal proceedings, and pending RTO challans up to the date of possession transfer.</li>
        <li>The Seller has executed and handed over official Motor Vehicle Transfer Forms (Form 29 and Form 30) along with the original Registration Certificate (RC) and valid NOC.</li>
        <li>The Purchaser assumes full responsibility for the vehicle, custody, reconditioning, and subsequent ownership endorsement from the timestamp of physical delivery.</li>
      </ol>

      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="width: 45%;">
          <p><strong>SIGNED BY THE SELLER:</strong></p><br/><br/>
          <p>___________________________<br/>
          Name: ${seller.fullName}<br/>
          Date: ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
        <div style="width: 45%; text-align: right;">
          <p><strong>FOR BHARAT MOTOR CLUB PVT LTD:</strong></p><br/><br/>
          <p>___________________________<br/>
          Authorized Acquisition Officer<br/>
          Date: ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

