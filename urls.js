const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');

if (process.argv.length !== 3) {
  console.error('Usage: node urls.js FILENAME');
  process.exit(1);
}

const fileName = process.argv[2];

fs.readFile(fileName, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  const urls = data.split('\n').filter(Boolean);
  if (urls.length === 0) {
    console.log("No URLs found in the file.");
  }

  urls.forEach((urlString) => {
    console.log(`Processing URL: ${urlString.trim()}`); // Log URL being processed
    const parsedUrl = new URL(urlString.trim());

    const requestModule = parsedUrl.protocol === 'https:' ? https : http;

    requestModule.get(urlString.trim(), (response) => {
      let htmlContent = '';
      response.on('data', (chunk) => {
        htmlContent += chunk;
      });

      response.on('end', () => {
        const outputFileName = parsedUrl.hostname;
        fs.writeFile(outputFileName, htmlContent, (err) => {
          if (err) {
            console.error(`Error writing to file ${outputFileName}: ${err.message}`);
          } else {
            console.log(`Saved HTML content for ${urlString} to ${outputFileName}`);
          }
        });
      });
    }).on('error', (err) => {
      console.error(`Error fetching URL ${urlString}: ${err.message}`);
    });
  });
});
