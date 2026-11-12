import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bharatmotorclub.app',
  appName: 'Bharat Motor Club',
  webDir: 'public',
  server: {
    // Points the native app directly to the active live server
    url: 'http://10.10.23.58:3000',
    cleartext: true
  }
};

export default config;
