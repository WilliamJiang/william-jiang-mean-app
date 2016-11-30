#Traffic Bridge

This project contains the front-end AngularJS code and back-end Express code for the Traffic Bridge main application and admin application. Code for the main app is in `public/app` and `server/app`. Code for the admin app is in `public/admin` and `server/admin`. Code that is shared between both projects in the top level directories `public` and `server`.

The entry point for the main app is `server.js`. The entry point for the admin app is `admin.js`.

At this time, for convenience, when you push to the `master` branch of this project, Codeship is setup to deploy to both the main and admin Elastic Beanstalk environments.

After cloning this repository to your local machine, do the  following:

````
bower install
npm install
npm start
````

