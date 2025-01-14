# Procedure for building a VOICEVOX server in a home LAN

## Required Equipment

- LAN environment in the home
- Windows or macOS PC, or Linux server
  - Please refer to the Windows or macOS procedure as it has not been tested on a Linux server.
  - Windows operating environment is Windows 11 Home
  - The confirmed operating environment for macOS is Apple silicon macOS Sonoma

## Prerequisite.

- The commands that appear are run in a terminal with VSCode and Cursor editor installed

## Set up a VOICEVOX server

1. Download the appropriate VOICEVOX engine for your environment from the link [Where to download VOICEVOX engines](https://github.com/VOICEVOX/voicevox_engine/releases/latest).
1. Unzip the downloaded file.
   - It is compressed by 7zip, so if you do not have an environment that can decompress with 7zip, download a tool to decompress 7zip and decompress it.
     - Example) Windows, [7zip](https://7-zip.org/download.html)
     - Example) macOS, I have referred to [this page](https://apple.stackexchange.com/a/307975).
1. Place the unzipped folder in the desired location
1. In the terminal, make the unzipped folder the current folder and execute the following to check the operation.
   - Windows
   ```
   .\run.exe --host localhost
   ```
   - macOS
   ```
   ./run --host localhost
   ```
1. Once you have accessed http://localhost:50021 and have verified that the VOICEVOX server is up and running, exit the VOICEVOX server by pressing Ctrl + C in the terminal.
1. It is not very good for security to be able to access the VOICEVOX server from other than the browser and the RobotVRM site, so you should follow the instructions in the RobotVRM app's VOICEVOX configuration instructions to allow the site to be accessed only from the RobotVRM site The site can only be accessed from the RobotVRM site.
   - Windows
   ```
   .\run.exe --host localhost --allow_origin https://(URL shown in VOICEVOX settings in RobotVRM app)
   ```
   - macOS
   ```
   ./run --host localhost --allow_origin https://(URL shown in VOICEVOX settings in RobotVRM app)
   ```

## Connect to VOICEVOX server with self-signed certificate and check operation

1. Reverse proxy the VOICEVOX server ( http://localhost:50021 ) with [How to set up SSL with self-signed certificate](./self_signed_cert_ssl.md) so that it can be accessed from the smartphone device containing the RobotVRM app.
1. Enter https://192.168.x.x (IP address of the VOICEVOX server) in the “VOICEVOX Server URL” field in the RobotVRM application's VOICEVOX settings, press the “Listen to Voice” button, and if the voice comes out, the operation check is complete.
