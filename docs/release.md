# How to release (under maintenance, minimal description at present)

## Server Production Environment

1. Prepare the server for the production environment
1. Configure nginx
1. Prepare RobotVRM source code
1. Set the following values in `.env.local`
   - In `NEXT_PUBLIC_ROBOTVRM_DOCS_URL`, enter the URL of the GitHub branch of the repository you cloned in order for the app to reference documents on GitHub. This URL will be used as the root to refer to the document
     - If the repository is private, you can prepare a separate repository that only publishes the part of the document that refers to it as documentation, or you can create documentation for the same path that refers to it.
   - (Recommended) The URL of the web page containing the EULA can be set in `NEXT_PUBLIC_ROBOTVRM_EULA_URL`. (If set, a checkbox requesting agreement to the EULA will be displayed when the application is launched for the first time.
1. Change `app_name` and port number so that `docker-compose.yml` is not covered in the same computer as follows
   ```diff
    services:
   -  app_name: # When managing multiple containers on the same computer, change app_name to set different identifiers
   +  first: # When managing multiple containers on the same computer, change app_name to set different identifiers
        build: .
        ports:
   -      - '3000:3000' # (port number): (port number in container), so you can specify (port number to start in computer):3000
   +      - '53501:3000' # (port number): (port number in container), so you can specify (port number to start in computer):3000
        env_file:
          - .env
          - .env.local
   ```
1. Build Docker
   ```
   docker-compose build
   ```
1. Launch Docker
   ```
   docker-compose up -d
   ```
   - To stop, do the following
     ```
     docker-compose down
     ```
1. Set nginx reverse proxy to localhost of the RobotVRM server that is up on the port number you specified earlier

## Release build of smartphone apps

1. Set the following values in `.env.local` of RobotVRM development environment locally
   - Set `ROBOTVRM_PRODUCTION_SERVER_URL` to the URL of the server in the production environment that the smartphone app will access.
   - (iOS) The Team specified in `ROBOTVRM_IOS_DEVELOPMENT_TEAM` must be an Apple Developer Program contracted Team when publishing to the App Store.
1. Reflect the production environment by doing the following
   ```
   pnpm sync-production
   ```
1. After that, you can build and work on the release as usual in Android Studio or Xcode.
   - Android also requires a Google Play Developer account to publish to the Google Play Store

## Confirmation of operation when EULA is set

If you have set `NEXT_PUBLIC_ROBOTVRM_EULA_URL`, please make sure that when you test the app in the production environment, a checkbox for the EULA will appear in a popup when the app is launched for the first time and you must agree to it before proceeding.

- The behavior of the EULA can also be checked in the development environment by setting `NEXT_PUBLIC_ROBOTVRM_EULA_URL`.
