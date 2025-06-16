
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c5dbf2c06b084d69a085ebb74480756e',
  appName: 'tracknest-flow-state',
  webDir: 'dist',
  server: {
    url: 'https://c5dbf2c0-6b08-4d69-a085-ebb74480756e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
