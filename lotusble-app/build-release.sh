#!/bin/sh -e
# Copyright (C) 2020 warhog <warhog@gmx.de>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

