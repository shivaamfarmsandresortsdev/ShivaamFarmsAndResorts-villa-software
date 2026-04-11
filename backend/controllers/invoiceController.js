// import cloudinary from "../config/cloudinary.js";
// import PDFDocument from "pdfkit";
// import streamifier from "streamifier";

// export const uploadInvoice = async (req, res) => {
//   try {
//     const {
//       customerName,
//       checkIn,
//       checkOut,
//       guests,
//       villas,
//       totalAmount,
//       paymentMode
//     } = req.body;

//     // 🧾 Create PDF in memory
//     const doc = new PDFDocument({ margin: 40 });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       // ☁ Upload to Cloudinary
//       const result = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             resource_type: "raw",
//             folder: "invoices",
//             public_id: `invoice_${Date.now()}`
//           },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );

//         streamifier.createReadStream(pdfBuffer).pipe(stream);
//       });

//       const pdfUrl = cloudinary.url(result.public_id, {
//         resource_type: "raw",
//         type: "upload",
//         flags: "attachment",
//         secure: true
//       });

//       res.status(200).json({
//         success: true,
//         url: pdfUrl
//       });
//     });

//     // =========================
//     // 🎨 Invoice Design
//     // =========================

//     doc
//       .fontSize(20)
//       .text("SHIVAAM FARMS & RESORTS", { align: "center" })
//       .moveDown();

//     doc.fontSize(12);
//     doc.text(`Customer Name: ${customerName}`);
//     doc.text(`Check-in: ${checkIn}`);
//     doc.text(`Check-out: ${checkOut}`);
//     doc.text(`Guests: ${guests}`);
//     doc.moveDown();

//     doc.text("Villas:");
//     villas.forEach((villa, index) => {
//       doc.text(`${index + 1}. ${villa}`);
//     });

//     doc.moveDown();
//     doc.text(`Total Amount: ₹${totalAmount}`);
//     doc.text(`Payment Mode: ${paymentMode}`);
//     doc.moveDown();

//     doc.text("Thank you for visiting!", { align: "center" });

//     doc.end();

//   } catch (error) {
//     console.error("PDF ERROR:", error);
//     res.status(500).json({ error: "Invoice generation failed" });
//   }
// };