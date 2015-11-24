# Broadcast

Simple broadcast example with tarifa for ios and android

## Mobile apps
### tarifa project setup

Edit all FIXMEs in `tarifa.json` with your settings:

- `hostname`: Current hostname of the server
- `port`: Port number of the server
- [Android] `senderID`: Project number as defined in the Google Developers Console
- [iOS] `provisioning_path`: Path of the provisioning profile enabling push notifications
- [iOS] `provisioning_name`: Name of the provisioning profile
- [iOS] `identity`: Developer identity needed to sign the app

Regenerate the cordova app with

```
tarifa check --verbose
```

### Launch apps

```
tarifa run android,ios --verbose
```

## Server
### Install

```
npm install
```

You need a `cert.pem` and a `key.pem` for the
ios part (refer to https://github.com/argon/node-apn#connecting)

Edit `settings.json` with your settings:

- [android] `apiKey`: API access credentials for the project as defined in the Google Developers Console
- [ios] `passphrase`: Passpharse for the connection key

### Run

```
npm start
```
