const express = require("express");

// var Promise = require("bluebird");
const puppeteer = require("puppeteer");
// const inlineCss = require("inline-css");
// const hb = require("handlebars");
const data_json = require("./data.json");

const app = express();

app.use("/pdf", async (req, res, next) => {
  const createRow = (item) => `
    <tr>
      <td>${item.invoiceId}</td>
      <td>${item.invoiceName}</td>
      <td>${item.price}</td>
      <td>${item.createdDate}</td>
      <td>${item.dueDate}</td>
      <td>${item.address}</td>
      <td>${item.companyName}</td>
    </tr>
  `;

  const createTable = (rows) => `
    <table>
      <tr>
          <th>Invoice Id</td>
          <th>Invoice Name</td>
          <th>Price</td>
          <th>Invoice Created</td>
          <th>Due Date</td>
          <th>Vendor Address</td>
          <th>Vendor Name</td>
      </tr>
      ${rows}
    </table>
  `;

  const createHtml = (table) => `
    <html>
      <head>
        <style>
          table {
            width: 100%;
          }
          tr {
            text-align: left;
            border: 1px solid black;
          }
          th, td {
            padding: 15px;
          }
          tr:nth-child(odd) {
            background-color: yellow;
            color: blue;
          }
          tr:nth-child(even) {
            background-color: white;
            color: red;
          }
          .no-content {
            background-color: red;
          }
        </style>
      </head>
      <body>
        ${table}
      </body>
    </html>
  `;

  const genPdf = async (html) => {
    // we are using headless mode
    let args = ["--no-sandbox", "--disable-setuid-sandbox"];

    const browser = await puppeteer.launch({
      args: args,
    });

    const page = await browser.newPage();

    // let data = await inlineCss(html, { url: "/" });
    // console.log("data -> ", data);
    // console.log("Compiling the template with handlebars");

    // We set the page content as the generated html by handlebars
    await page.setContent(html, {
      waitUntil: "networkidle0", // wait for page to load completely
    });

    const pdf_rs = await page.pdf({ printBackground: true });
    // console.log("pdf_rs -> ", pdf_rs);
    return pdf_rs;

    // return Promise.props(page.pdf())
    // .then(async function(data) {
    //    await browser.close();

    //    console.log('data in promise -> ', data)

    //    return Buffer.from(Object.values(data));
    // })
  };

  try {
    /* generate rows */
    const rows = data_json.map(createRow).join("");
    const table = createTable(rows);
    const html = createHtml(table);
    // console.log("html -> ", html);
    console.log("Succesfully created an HTML table");

    const genPdfBuffer = await genPdf(html);
    // console.log("genPdfBuffer -> ", genPdfBuffer);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment;filename=test.pdf",
    });

    res.send(genPdfBuffer);
  } catch (error) {
    console.log("Error generating table", error);
  }
});

app.use("/xlsx", async (req, res, next) => {
  // const XLSX = require("xlsx");
  const excel = require("exceljs");
  try {
    // const data = [
    //   { name: "Tosaporn", email: "Tosaporn@gmail.com", tel: "0967459254" },
    //   { name: "Jayda", email: "Jayda@gmail.com", tel: "0967459253" },
    // ];
    // const wb = XLSX.utils.book_new();
    // const ws = XLSX.utils.json_to_sheet(data);
    // XLSX.utils.book_append_sheet(wb, ws)

    // const buffer = Buffer.from(JSON.stringify(wb))
    // console.log(buffer)
    // res.set({
    //   "Content-Type": "application/vnd.ms-excel",
    //   "Content-Disposition": "attachment;filename=demo.xlsx",
    // });
    // res.send(buffer)

    //work
    const data = [
      { id: "0001", title: "test1", description: "des...1" },
      { id: "0002", title: "test2", description: "des...2" },
      { id: "0003", title: "test3", description: "des...3" },
    ];

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Tutorials");
    worksheet.columns = [
      { header: "Id", key: "id", width: 5 },
      { header: "Title", key: "title", width: 25 },
      { header: "Description", key: "description", width: 25 },
    ];
    worksheet.addRows(data);

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment;filename=demo.xlsx",
    });
    const a = await workbook.xlsx.write(res);
    console.log("a -> ", a);
    res.status(200).end();
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => console.log("server run on port 3000..."));
