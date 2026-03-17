const os = require('os');

console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('');

const interfaces = os.networkInterfaces();
console.log('All network interfaces:');
Object.entries(interfaces).forEach(([name, list]) => {
  list.forEach(iface => {
    console.log(' ', name, '|', 'family:', iface.family, '| internal:', iface.internal, '| address:', iface.address);
  });
});

console.log('');
const localIPs = [];
Object.values(interfaces).forEach(list => {
  list.forEach(iface => {
    const isIPv4 = iface.family === 'IPv4' || iface.family === 4;
    if (isIPv4 && !iface.internal) localIPs.push(iface.address);
  });
});
console.log('Detected IPs:', localIPs);

// Try loading server.js dependencies
console.log('');
console.log('Testing require...');
try { require('express'); console.log('  express: OK'); } catch(e) { console.log('  express: FAIL -', e.message); }
try { require('ws'); console.log('  ws: OK'); } catch(e) { console.log('  ws: FAIL -', e.message); }
try { require('uuid'); console.log('  uuid: OK'); } catch(e) { console.log('  uuid: FAIL -', e.message); }
