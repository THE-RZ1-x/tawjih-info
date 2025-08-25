import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env' });

function checkDatabaseFile() {
  const dbPath = join(process.cwd(), 'prisma', 'dev.db');
  
  console.log('Checking database file:', dbPath);
  
  if (existsSync(dbPath)) {
    const stats = require('fs').statSync(dbPath);
    console.log(`Database file exists. Size: ${stats.size} bytes`);
    
    if (stats.size > 0) {
      console.log('Database file is not empty');
      
      // Try to read first few bytes
      try {
        const buffer = readFileSync(dbPath, { encoding: 'utf8', flag: 'r' });
        console.log('First 100 characters of database file:');
        console.log(buffer.substring(0, 100));
      } catch (err) {
        console.log('Could not read database file contents');
      }
    } else {
      console.log('Database file is empty');
    }
  } else {
    console.log('Database file does not exist');
  }
}

checkDatabaseFile();
