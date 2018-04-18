# ShowYouCare | Park elsewhere

ShowYouCare is a community improvement platform. Been put in danger by a selfish parker? Scan a ShowYouCare Sticker and leave on the car, then wait for the apolgy.

### Video Demos
[Report Process](https://www.youtube.com/watch?v=nyKYoL2zbHY&feature=youtu.be)

[Reply Process](https://www.youtube.com/watch?v=RQIMbz1RFbw&feature=youtu.be)

## Details
This application is split into client side Ionic/Cordova mobile application, and NodeJS, Express, Postgres server side application.

To get started, clone this repoistory and move into the directory.

1. `git clone https://github.com/ShowYouCareMMU/ShowYouCare.git ShowYouCare`
2. `cd ShowYouCare`

### Server side
Server side source code can be found in `/code/production/api/showyoucare`. 

Download all the depedencies using `npm install` and run it using `npm start`.

### Client side
Client side source code can be found in `/code/production/app/ShowYouCare`.

1. Download all the depedencies using `npm install`.
2. To run, start [Android Emulator](https://developer.android.com/studio/run/emulator.html) and run `ionic cordova emulate [platform] --lc`.
3. For production builds, use `ionic cordova build [platform]`.
