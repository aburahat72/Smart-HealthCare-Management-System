/**
 * PDF Receipt Generator
 * ---------------------
 * Generates professional appointment receipts/invoices as PDF buffers.
 *
 * Customization points:
 *   - Hospital branding: config/features.js → hospital section
 *   - Logo: Set HOSPITAL_LOGO_URL env var or pass logoPath
 *   - Digital signature: Uncomment signature block when certificate is available
 *   - QR verification: Uncomment QR block when verification URL is ready
 *   - GST/Tax: Uncomment tax section when tax registration is configured
 */

import PDFDocument from 'pdfkit';
import features from '../config/features.js';

const { hospital } = features;

/**
 * Build a PDF receipt buffer for an appointment.
 * @param {Object} data - { appointment, patient, doctor, payment }
 * @returns {Promise<Buffer>}
 */
export const generateReceiptPdf = (data) => {
  const { appointment, patient, doctor, payment } = data;
  const doctorName = doctor?.userId?.name || doctor?.name || 'Doctor';
  const patientName = patient?.name || 'Patient';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- Header ---
    doc.fontSize(22).fillColor('#2563eb').text(hospital.name, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(hospital.address, { align: 'center' });
    doc.text(`Phone: ${hospital.phone} | Email: ${hospital.email}`, { align: 'center' });
    doc.moveDown(0.5);

    // Future: Hospital logo placeholder
    // if (process.env.HOSPITAL_LOGO_URL) {
    //   doc.image(process.env.HOSPITAL_LOGO_URL, doc.page.width / 2 - 40, doc.y, { width: 80 });
    //   doc.moveDown(2);
    // }

    doc.moveDown(0.5);
    doc.strokeColor('#2563eb').lineWidth(2)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);

    // --- Title ---
    const isPaid = payment?.status === 'completed';
    doc.fontSize(16).fillColor('#111').text(isPaid ? 'APPOINTMENT RECEIPT' : 'BOOKING CONFIRMATION', { align: 'center' });
    doc.fontSize(10).fillColor(isPaid ? '#16a34a' : '#ca8a04')
      .text(isPaid ? 'Payment Received' : 'Payment Pending', { align: 'center' });
    doc.moveDown(1);

    // --- Reference & Date ---
    const row = (label, value) => {
      doc.fontSize(10).fillColor('#666').text(label, 50, doc.y, { continued: true, width: 200 });
      doc.fillColor('#111').text(value, { align: 'right' });
    };

    row('Appointment ID:', appointment.referenceId || appointment._id);
    row('Booking Date:', new Date(appointment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    doc.moveDown(0.5);

    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.8);

    // --- Patient & Doctor Details ---
    doc.fontSize(12).fillColor('#2563eb').text('Appointment Details');
    doc.moveDown(0.5);
    row('Patient Name:', patientName);
    row('Doctor Name:', doctorName);
    row('Department:', doctor?.specialization || 'General');
    row('Appointment Date:', new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    row('Appointment Time:', appointment.time);
    row('Status:', appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1));
    doc.moveDown(0.5);

    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.8);

    // --- Payment Details ---
    doc.fontSize(12).fillColor('#2563eb').text('Payment Details');
    doc.moveDown(0.5);
    row('Consultation Fee:', `₹${appointment.consultationFee || 0}`);
    row('Payment Status:', isPaid ? 'Paid' : 'Pending');
    if (payment?.transactionId) row('Transaction ID:', payment.transactionId);
    if (payment?.provider) row('Payment Method:', payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1));
    doc.moveDown(0.5);

    // Future: GST/Tax placeholder
    // if (hospital.gstNumber) {
    //   row('GST Number:', hospital.gstNumber);
    //   row('Tax (18%):', `₹${((appointment.consultationFee || 0) * 0.18).toFixed(2)}`);
    // }

    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);

    // --- Total ---
    doc.fontSize(14).fillColor('#111')
      .text(`Total: ₹${appointment.consultationFee || 0}`, { align: 'right' });
    doc.moveDown(2);

    // Future: QR Code verification placeholder
    // const verifyUrl = `${process.env.CLIENT_URL}/verify-receipt/${appointment.referenceId}`;
    // doc.fontSize(8).fillColor('#999').text(`Verify: ${verifyUrl}`, { align: 'center' });
    // QRCode.toDataURL(verifyUrl).then(url => doc.image(url, doc.page.width / 2 - 40, doc.y, { width: 80 }));

    // Future: Digital signature placeholder
    // doc.fontSize(9).fillColor('#666').text('Authorized Signature', 50, doc.page.height - 100);
    // if (process.env.SIGNATURE_IMAGE_PATH) doc.image(process.env.SIGNATURE_IMAGE_PATH, 50, doc.page.height - 90, { width: 100 });

    // --- Footer ---
    if (hospital.registrationNumber) {
      doc.fontSize(8).fillColor('#999')
        .text(`Registration No: ${hospital.registrationNumber}`, 50, doc.page.height - 60, { align: 'center' });
    }
    doc.fontSize(8).fillColor('#999')
      .text('Thank you for choosing Smart Healthcare. This is a computer-generated receipt.', 50, doc.page.height - 45, { align: 'center' });

    doc.end();
  });
};

export default { generateReceiptPdf };
