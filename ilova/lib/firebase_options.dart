import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'mock-api-key-idx-supercell',
    appId: '1:123456789:web:1234abcd',
    messagingSenderId: '123456789',
    projectId: 'SmartEdu',
    authDomain: 'smartedu.firebaseapp.com',
    storageBucket: 'smartedu.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'mock-api-key-idx-supercell',
    appId: '1:123456789:android:1234abcd',
    messagingSenderId: '123456789',
    projectId: 'SmartEdu',
    storageBucket: 'smartedu.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'mock-api-key-idx-supercell',
    appId: '1:123456789:ios:1234abcd',
    messagingSenderId: '123456789',
    projectId: 'SmartEdu',
    storageBucket: 'smartedu.appspot.com',
    iosBundleId: 'com.example.smartEduUzbekistan',
  );
}
