const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/Home.jsx',
    'src/pages/Login.jsx',
    'src/pages/MovieDetails.jsx',
    'src/pages/MyTickets.jsx',
    'src/pages/PaymentPage.jsx',
    'src/pages/Profile.jsx',
    'src/pages/SeatSelection.jsx',
    'src/context/AuthContext.jsx',
];

files.forEach(f => {
    const fp = path.resolve(__dirname, f);
    let c = fs.readFileSync(fp, 'utf8');

    const relPath = '../utils/api';

    // Replace axios import with api import
    c = c.replace("import axios from 'axios';", `import api from '${relPath}';`);

    // Replace axios.METHOD(`${API_URL}/...`) with api.METHOD(`/...`)
    c = c.replace(/axios\.(get|post|put|delete|patch)\(`\$\{API_URL\}/g, 'api.$1(`');

    // Remove API_URL constant
    c = c.replace(/const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api';\r?\n/g, '');

    fs.writeFileSync(fp, c);
    console.log('Updated:', f);
});

console.log('Done!');
