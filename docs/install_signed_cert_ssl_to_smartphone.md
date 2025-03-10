# How to install a self-signed certificate on your phone

## Send CA root certificate from the computer that created the self-signed certificate

1. Check the location of the CA root certificate by running the following in a terminal \* assuming mkcert is already installed
   ```
   mkcert -CAROOT
   ```
1. In a terminal, run the following to copy the CA root certificate to `.crt` extension
   ```
   cd "(Output Path)"
   ls # Confirmation that rootCA.pem exists
   cp rootCA.pem rootCA_name.crt # The “name” part is good because it is easy to understand the computer name, etc.
   ```
1. The created crt file is sent to the smartphone device via email or other means.

## Install the crt file on your mobile device

### iOS

1. Download the crt file you received. When installing from a browser, you need to be in **Safari**, not Chrome, etc., or it won't work.
1. Install the root certificate downloaded from Setting App > General > VPN & Device Management (confirmed for iOS15)
1. Settings app > General > About > Certificate Trust Settings > Put the installed root certificate in a trusted state (checked iOS15)
1. Access https://192.168.X.X (the IP address of the server you want to connect to via SSL) in your phone's browser and if you do not see a privacy warning, you are good to go. It is OK if you cannot access it.

### Android

1. Download the crt file you received.
1. Settings app > Security & privacy > More security and privacy > Encryption & credentials > Install a certificate > CA certificate > Select and install the downloaded crt file (case of Pixel 6a on Android 14)
1. Access https://192.168.X.X (the IP address of the server you want to connect to via SSL) in your phone's browser and if you do not see a privacy warning, you are good to go. It is OK if you cannot access it.
