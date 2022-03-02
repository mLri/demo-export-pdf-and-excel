const fs = require("fs");
const { buildPathHtml } = require("./buildPaths");

const puppeteer = require('puppeteer');

const inlineCss = require('inline-css')

const hb = require("handlebars");

/**
 * Take an object which has the following model
 * @param {Object} item
 * @model
 * {
 *   "invoiceId": `Number`,
 *   "createdDate": `String`,
 *   "dueDate": `String`,
 *   "address": `String`,
 *   "companyName": `String`,
 *   "invoiceName": `String`,
 *   "price": `Number`,
 * }
 *
 * @returns {String}
 */
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

/**
 * @description Generates an `html` table with all the table rows
 * @param {String} rows
 * @returns {String}
 */
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

/**
 * @description Generate an `html` page with a populated table
 * @param {String} table
 * @returns {String}
 */
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
          background: #CCC
        }
        tr:nth-child(even) {
          background: #FFF
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

/**
 * @description this method takes in a path as a string & returns true/false
 * as to if the specified file path exists in the system or not.
 * @param {String} filePath
 * @returns {Boolean}
 */
const doesFileExist = (filePath) => {
  try {
    fs.statSync(filePath); // get information of the specified file path.
    return true;
  } catch (error) {
    return false;
  }
};

const run = async () => {
  try {
    const data_json = [
      {},
      {},
      {
        invoiceId: 1,
        createdDate: "3/27/2018",
        dueDate: "5/24/2019",
        address: "28058 Hazelcrest Center",
        companyName: "Eayo",
        invoiceName: "Carbonated Water - Peach",
        price: 376,
      },
      {
        invoiceId: 2,
        createdDate: "6/14/2018",
        dueDate: "11/14/2018",
        address: "6205 Shopko Court",
        companyName: "Ozu",
        invoiceName: "Pasta - Fusili Tri - Coloured",
        price: 285,
      },
      {},
      {},
    ];

    /* Check if the file for `html` build exists in system or not */
    if (doesFileExist(buildPathHtml)) {
      console.log("Deleting old build file");
      /* If the file exists delete the file from system */
      fs.unlinkSync(buildPathHtml);
    }
    /* generate rows */
    const rows = data_json.map(createRow).join("");
    /* generate table */
    const table = createTable(rows);
    /* generate html */
    const html = createHtml(table);
      console.log("html -> ", html);
    /* write the generated html to file */
    //   fs.writeFileSync(buildPathHtml, html);
    console.log("Succesfully created an HTML table");

    // we are using headless mode
    let args = ["--no-sandbox", "--disable-setuid-sandbox"];
    
    const browser = await puppeteer.launch({
      args: args,
    });
    let pdfs = [];
    const page = await browser.newPage();

    let data = await inlineCss(html, { url: "/" });
    console.log("Compiling the template with handlebars");

    // we have compile our code with handlebars
    const template = hb.compile(data, { strict: true });
    const result = template(data);
    const rs_html = result;
    // We set the page content as the generated html by handlebars
    await page.setContent(rs_html, {
      waitUntil: "networkidle0", // wait for page to load completely
    });

    // let pdfObj = JSON.parse(JSON.stringify(rs_html));
    //   delete pdfObj["content"];
    // pdfObj["buffer"] = Buffer.from(Object.values(await page.pdf(options)));
    // pdfs.push(pdfObj);

    await browser.close();

    console.log(Buffer.from(rs_html));
    // return Buffer.from(Object.values(data));
  } catch (error) {
    console.log("Error generating table", error);
  }
};

run();
