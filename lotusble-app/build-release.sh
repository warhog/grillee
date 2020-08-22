#!/bin/sh -e

rm -f lotusble.apk

# set the path to the platform tools
PATH=$PATH:/home/$USER/Android/Sdk/platform-tools

ionic cordova build --release --prod android
if [ $? -ne 0 ]; then
    echo "failed to build"
    exit 1
fi

# sign the jar file
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore lotusble-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name
if [ $? -ne 0 ]; then
    echo "failed to sign jar"
    exit 1
fi

# # run zipalignment
# #/home/$USER/Android/Sdk/build-tools/28.0.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk lotusble.apk
/home/$USER/Android/Sdk/build-tools/28.0.0/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk lotusble.apk
if [ $? -ne 0 ]; then
    echo "failed to align zip file"
    exit 1
fi

