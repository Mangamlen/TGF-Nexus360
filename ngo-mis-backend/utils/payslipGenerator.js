const pdf = require("html-pdf");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs");

// Helper to convert data to QR code image (base64)
async function generateQrCodeBase64(text) {
  try {
    return await qrcode.toDataURL(text, { errorCorrectionLevel: 'H', width: 100 });
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
}

// Function to generate payslip HTML
async function generatePayslipHtml(payslipData, qrCodeDataUrl) {
  const {
    payroll_record_id,
    month,
    year,
    total_present,
    net_salary,
    generated_on,
    emp_code,
    joining_date,
    employee_name,
    employee_email,
    department_name,
    designation_title,
    basic,
    hra,
    allowance,
    deduction
  } = payslipData;

  const formattedJoiningDate = joining_date ? new Date(joining_date).toLocaleDateString() : 'N/A';
  const formattedGeneratedOn = generated_on ? new Date(generated_on).toLocaleDateString() : 'N/A';
  const formattedNetSalary = `₹${net_salary.toLocaleString('en-IN')}`;
  const formattedBasic = `₹${basic ? parseFloat(basic).toLocaleString('en-IN') : '0'}`;
  const formattedHra = `₹${hra ? parseFloat(hra).toLocaleString('en-IN') : '0'}`;
  const formattedAllowance = `₹${allowance ? parseFloat(allowance).toLocaleString('en-IN') : '0'}`;
  const formattedDeduction = `₹${deduction ? parseFloat(deduction).toLocaleString('en-IN') : '0'}`;


  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border: 1px solid #eee; max-width: 800px; margin: auto;">
      <h1 style="color: #0B1F2A; text-align: center; border-bottom: 2px solid #2ECC71; padding-bottom: 10px;">Payslip - ${month} ${year}</h1>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 65%;">
          <p><strong>Employee Name:</strong> ${employee_name}</p>
          <p><strong>Employee Code:</strong> ${emp_code}</p>
          <p><strong>Email:</strong> ${employee_email}</p>
          <p><strong>Department:</strong> ${department_name || 'N/A'}</p>
          <p><strong>Designation:</strong> ${designation_title || 'N/A'}</p>
          <p><strong>Joining Date:</strong> ${formattedJoiningDate}</p>
        </div>
        <div style="width: 30%; text-align: right;">
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px; margin-left: auto; display: block;">` : ''}
          <p style="margin-top: 10px;"><strong>Generated On:</strong> ${formattedGeneratedOn}</p>
          <p><strong>Payroll ID:</strong> ${payroll_record_id}</p>
        </div>
      </div>

      <h2 style="color: #0B1F2A; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Earnings</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">Basic Salary</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${formattedBasic}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">HRA</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${formattedHra}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">Allowance</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${formattedAllowance}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">Total Present Days</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${total_present}</td>
        </tr>
      </table>

      <h2 style="color: #0B1F2A; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Deductions</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">Deduction</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${formattedDeduction}</td>
        </tr>
      </table>

      <div style="background-color: #2ECC71; color: white; padding: 15px; text-align: center; font-size: 1.2em; border-radius: 5px;">
        <strong>Net Salary: ${formattedNetSalary}</strong>
      </div>

      <p style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #777;">This is a system-generated payslip and does not require a signature.</p>
    </div>
  `;
}

// Main function to generate PDF
async function generatePayslipPdf(payslipData) {
  const qrCodeText = `Payslip ID: ${payslipData.payroll_record_id}\nEmployee: ${payslipData.employee_name}\nMonth: ${payslipData.month} ${payslipData.year}`;
  const qrCodeDataUrl = await generateQrCodeBase64(qrCodeText);

  const htmlContent = await generatePayslipHtml(payslipData, qrCodeDataUrl);

  const options = {
    format: "A4",
    orientation: "portrait",
    border: "1cm",
    // Use an absolute path for PhantomJS (needed by html-pdf)
    // This is often tricky in deployment, consider Puppeteer for production
    base: `file://${path.resolve(__dirname, '../')}/`,
  };

  return new Promise((resolve, reject) => {
    pdf.create(htmlContent, options).toBuffer((err, buffer) => {
      if (err) {
        console.error("Error creating PDF:", err);
        return reject(err);
      }
      resolve(buffer);
    });
  });
}

module.exports = { generatePayslipPdf };
