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
    apiKey: 'AIzaSyCE2en-MyXJVqWsB3gS8uuvMg6I5Loc7As',
    appId: '1:352395797870:web:476de4616fdc860d190d7f',
    messagingSenderId: '352395797870',
    projectId: 'smartedu-5d27b',
    authDomain: 'smartedu-5d27b.firebaseapp.com',
    storageBucket: 'smartedu-5d27b.firebasestorage.app',
    measurementId: 'G-Y21WDHJX48',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDhc2h-PkJDlFG-iqfWJQWS-jQ1QWOfbAs',
    appId: '1:352395797870:android:8a85e4606899471f190d7f',
    messagingSenderId: '352395797870',
    projectId: 'smartedu-5d27b',
    storageBucket: 'smartedu-5d27b.firebasestorage.app',
  );
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyCEGiFVWuDXbI5tN-Yiba8Ol5EvPg8wZDY',
    appId: '1:352395797870:ios:26323bea3037e38e190d7f',
    messagingSenderId: '352395797870',
    projectId: 'smartedu-5d27b',
    storageBucket: 'smartedu-5d27b.firebasestorage.app',
    iosBundleId: 'com.smartedu.smartEduUzbekistan',
  );
}
