# Creating a self-signed certificate

1. Installing mkcert
   - Windows
   ```
   winget install mkcert
   ```
   - macOS
   ```
   brew install mkcert
   ```
1. Installation of a local CA (Certificate Authority)
   ```
   mkcert -install
   ```
1. Create a server certificate with an IP address and place it in any location
   ```
   mkcert localhost 127.0.0.1 192.168.X.X(IP address of the server you want to connect to with SSL)
   ```
