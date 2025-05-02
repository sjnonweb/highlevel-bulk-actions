import * as fs from 'fs';
import * as path from 'path';

const generateCsv = () => {
  let total = 10;

  const args = process.argv.slice(2);
  if (args.length) {
    total = parseInt(args[0]);
  }

  const contacts = [
    ['name', 'email', 'age'],
  ];

  for (let i = 0; i < total; i++) {
    contacts.push([
      `Contact ${i + 1}`,
      `contact${i + 1}@example.com`,
      Math.floor(Math.random() * 50) + 18,
    ]);
  }
  console.log(import.meta.dirname)
  const csvContent = contacts.map((row) => row.join(',')).join('\n');
  const filePath = path.join(import.meta.dirname, 'test.csv');
  fs.writeFile(filePath, csvContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing CSV file:', err);
    } else {
      console.log(`CSV file was saved successfully to ${filePath}`);
    }
  });
}

generateCsv();
