import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
const FCM_PROVIDER: Provider = {
  provide: 'FCM_CLIENT',
  useFactory: () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require('../../accountService.json');
    const firebaseApp =
      getApps().find((app) => app.name === '[DEFAULT]') ??
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

    const messagingClient = getMessaging(firebaseApp);
    return messagingClient;
  },
};

export default FCM_PROVIDER;
