import localtunnel from 'localtunnel';

const PORT = 3000;
const SUBDOMAIN = 'vyro-universe';

async function connectTunnel() {
  console.log('🔄 Connecting persistent tunnel for VYRO...');
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

    console.log(`🚀 VYRO Public URL is ACTIVE: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.warn('⚠️ Tunnel closed. Reconnecting in 3s...');
      setTimeout(connectTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      tunnel.close();
    });
  } catch (err) {
    console.error('Failed to connect tunnel:', err.message);
    setTimeout(connectTunnel, 5000);
  }
}

connectTunnel();
