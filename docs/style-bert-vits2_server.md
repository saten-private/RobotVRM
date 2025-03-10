# Procedure for building a Style-Bert-VITS2 server for a home LAN

## Required Equipment

- LAN environment in the home
- Windows or Linux server
  - Windows operating environment is Windows 11 Home
  - This has not been verified on a Linux server, so please refer to the Windows procedure for implementation.

## Prerequisite.

- The commands that appear are executed in a terminal with VSCode and Cursor editor installed.

## Set up a Style-Bert-VITS2 server

1. Execute the following in a terminal to authorize the process
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
1. Create an environment by following the steps in [Style-Bert-VITS2 for Git and Python users](https://github.com/litagin02/Style-Bert-VITS2?tab=readme-ov-file#git%E3%82%84python%E4%BD%BF%E3%81%88%E3%82%8B%E4%BA%BA).
   When you run `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`, you will be asked to pass through the path as instructed `$env:Path = "C:\Users\XXXX\.cargo\bin;$env:Path"`. Please continue by passing the path as follows.
1. Confirm that voice synthesis is available in the browser by executing the following, which will automatically open the browser.
   - Without GPU
     ```
     python server_editor.py --inbrowser --device cpu
     ```
   - When using a GPU (not necessary if you do not train models, etc.)
     ```
     python server_editor.py --inbrowser
     ```
1. Make sure that the API server is up and running by running the following, and that you can access http://localhost:5000/docs to check the API documentation, see [API Server Details for Style-Bert-VITS2](https://github.com/litagin02/Style-Bert-VITS2?tab=readme-ov-file#api-server) for CORS settings, etc.
   ```
   python server_fastapi.py
   ```

## Connect to Style-Bert-VITS2 server with self-signed certificate and check operation

1. Reverse proxy the Style-Bert-VITS server (http://localhost:5000) using [How to set up SSL with a self-signed certificate](./self_signed_cert_ssl.md) so that it can be accessed from a smartphone device with the RobotVRM app.
1. In the RobotVRM application, enter https://192.168.x.x (IP address of the Style-Bert-VIT2 server) in the “Server URL” field and try chat input.
