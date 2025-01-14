# Procedure for building an AivisSpeech server on a home LAN

## Required Equipment

- LAN environment in the home
- Windows or macOS PC, or Linux server
  - Please refer to the procedure for Windows or macOS as we have not verified this on a Linux server.
  - Windows operating environment is Windows 11 Home
  - The confirmed operating environment for macOS is Apple silicon macOS Sonoma

## 前提条件

- The commands that appear are run in a terminal with VSCode and Cursor editor installed

## Set up an AivisSpeech server

1. Download the AivisSpeech engine for your environment from the link [Where to download the AivisSpeech engine](https://github.com/Aivis-Project/AivisSpeech-Engine/releases/latest).
1. Unzip the downloaded file.
   - It is compressed by 7zip, so if you do not have an environment that can decompress with 7zip, download a tool to decompress 7zip and decompress it.
     - Example) Windows, [7zip](https://7-zip.org/download.html)
     - Example) macOS, I have referred to [this page](https://apple.stackexchange.com/a/307975).
1. Place the unzipped folder in the desired location.
1. In the terminal, make the unzipped folder the current folder and execute the following to check the operation.
   - Windows
   ```
   .\run.exe --host localhost
   ```
   - macOS
   ```
   ./run --host localhost
   ```
1. Once you have accessed http://localhost:10101 and have verified that the AivisSpeech server is up and running, exit the AivisSpeech server by pressing Ctrl + C in the terminal.
1. It is not very good for security to be able to access the AivisSpeech server from other than the browser and the RobotVRM site, so you should follow the instructions in the RobotVRM app's AivisSpeech configuration instructions to set up the AivisSpeech server so that the site is only accessible from the RobotVRM site RobotVRM site only.
   - Windows
   ```
   .\run.exe --host localhost --allow_origin https://(URL shown in the RobotVRM app's AivisSpeech settings)
   ```
   - macOS
   ```
   ./run --host localhost --allow_origin https://(URL shown in the RobotVRM app's AivisSpeech settings)
   ```

## Connect to AivisSpeech server with self-signed certificate to verify operation

1. Reverse proxy the AivisSpeech server ( http://localhost:10101 ) with [How to set up SSL with self-signed certificate](./self_signed_cert_ssl.md) so that it can be accessed from a smartphone device with RobotVRM application.
1. Enter https://192.168.x.x (IP address of the AivisSpeech server) in the “AivisSpeech server URL” field in the RobotVRM application's AivisSpeech settings, press the “Listen to voice” button, and if the voice comes out, the operation check is complete.
