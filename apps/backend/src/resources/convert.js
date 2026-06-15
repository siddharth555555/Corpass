const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream(__dirname + '/pincode_with_lat-long.csv');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const pincodes = {};
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    const parts = line.split(',');
    if (parts.length >= 11) {
      const pincode = parts[4].trim();
      const lat = parseFloat(parts[9]);
      const lon = parseFloat(parts[10]);
      
      if (pincode && !isNaN(lat) && !isNaN(lon) && !pincodes[pincode]) {
        pincodes[pincode] = { lat, lon };
      }
    }
  }

  fs.writeFileSync(__dirname + '/pincodes.json', JSON.stringify(pincodes));
  console.log(`Successfully converted. Total unique pincodes: ${Object.keys(pincodes).length}`);
}

processLineByLine();
