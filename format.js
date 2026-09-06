const fs = require('fs');
const content = fs.readFileSync('contexts/AuthContext.tsx', 'utf-8');
if (content.startsWith("'use client';import")) {
  fs.writeFileSync('contexts/AuthContext.tsx', content.replace("'use client';", "'use client';\n"));
}
