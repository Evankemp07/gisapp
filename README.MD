# Overview

This application shows how a react frontend can be used to serve a responsive and simple web app. This web app also used the dajango framework to create create an api.

This application was made to provide visitors of my Christmas light show with other light shows to visit that are near by. The user will simple visit the website and they can explore the map. The user can utilized the markers that are automatically populated to the map from a postgresql database. The app also supports  upvote and downvoting lightshows and stores this data in a Firebase Firestore database. 

I created this software to provide my light show visitors with as much info about other close by light shows in a simple and easy format.

[Software Demo Video Version 1](https://youtu.be/uovvD8X3i8U)

[Software Demo Video Version 2](https://vimeo.com/1074129341/05bb17ed98?share=copy)

# Cloud Database

In this project I utilized Firsbase Firestore to store vote data for the light show locations

For each location (by thier Id) I store both the Upvote and the Down vote value. This data is then used to display a recomended list for the users to use.

# Development Environment

### Tools Used

-**Code Editor:** [VS Code](https://code.visualstudio.com/)

-**Version Control:** [Git](https://git-scm.com/)

-**Package Manager:** [npm](https://www.npmjs.com/)

-**Build Tool:** [Webpack](https://webpack.js.org/) (used internally by React)

-**API Testing:** [Postman](https://www.postman.com/)

-**Firebase Project Dashboard**[Firebase Console](https://console.firebase.google.com/)

### Programming Language & Libraries

-**Programming Language:** JavaScript (ES6+)

-**Framework:** [React.js](https://react.dev/)

-**Google Maps API:** [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)

-**Markdown Parser:** [marked](https://www.npmjs.com/package/marked)

-**Firebase CL tools** [docs](https://firebase.google.com/docs/cli/)

# Useful Websites

* [React.js Documentation](https://react.dev/)
* [Google Maps Platform](https://developers.google.com/maps)
* [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)
* [Marked.js Documentation](https://marked.js.org/)
* [MDN Web Docs](https://developer.mozilla.org/)
* [Stack Overflow](https://stackoverflow.com/)
* [GitHub](https://github.com/)
* [Firebase Docs](https://firebase.google.com/docs/)

# Future Work

- Improve the submission process for adding a light show to the map.
