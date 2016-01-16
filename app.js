// app.js

var MAX_PAGES = 10;

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    testAPI();
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
FB.init({
  appId      : '968425909904683',
  cookie     : true,  // enable cookies to allow the server to access
                      // the session
  xfbml      : true,  // parse social plugins on this page
  version    : 'v2.2' // use version 2.2
});

// Now that we've initialized the JavaScript SDK, we call
// FB.getLoginStatus().  This function gets the state of the
// person visiting this page and can return one of three states to
// the callback you provide.  They can be:
//
// 1. Logged into your app ('connected')
// 2. Logged into Facebook, but not your app ('not_authorized')
// 3. Not logged into Facebook and can't tell if they are logged into
//    your app or not.
//
// These three cases are handled in the callback function.

FB.getLoginStatus(function(response) {
  statusChangeCallback(response);
});

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    var status = document.getElementById('status');
    status.innerHTML = 'Thanks for logging in, ' + response.name + '!';
    var loginButton = document.getElementById('fb-login-button');
    loginButton.style.display = 'none';
    status.style.display = 'none';
    displayFeed();
  });
}

function handleConversation() {
  FB.api(
    "/743877419075563",
    function (response) {
      if (response && !response.error) {
        console.log("you did it fam");
      }
    }
  );
}

function handlePosterPicture(posterId, message, index) {
  var request = "/" + posterId + "/picture?width=300";
  FB.api(
    request,
    function (response) {
      if (response && !response.error) {
        if (message !== undefined) {
          // create post element
          var post = document.createElement('div');
          post.className = 'post';

          // create picture element
          pictureURL = response.data.url;
          console.log(pictureURL);
          var img = document.createElement('img');
          img.className = 'profile-picture';
          img.id = "image"+index.toString();
          img.src = pictureURL;
          console.log(img);

          // create message element
          console.log(message);
          var mess = document.createElement('div');
          mess.className = 'message';
          mess.id = "message"+index.toString();
          mess.innerHTML = message;
          console.log(mess);

          // append all to posts
          console.log("img append");
          post.appendChild(img);
          console.log("mess append");
          post.appendChild(mess);
          console.log("append to doc");
          document.getElementById('posts').appendChild(post);
          handleConversation();
        }
      }
    }
  );
}


function handlePosts(userId, feed) {
  for (var i = 0; i < feed.length; i++) {
    var posterId = feed[i].from.id;
    if (posterId != userId) {
      // needs to be changed to account for posts which user is tagged in
    handlePosterPicture(posterId, feed[i].message, i);
    }
  }
}

function getUserId(feed) {
  FB.api("/me",
      function (response) {
        if (response && !response.error) {
          console.log("logging user id");
          userId = response.id;
          console.log(userId);
          handlePosts(userId, feed);
        }
      }
  );
}

function displayFeed() {
  var feed;
  /* make the API call */
  FB.api("/me/feed?fields=from,message&limit=200",
      function (response) {
        if (response && !response.error) {
          console.log("logging data");
          feed = response.data;
          console.log(feed)
          getUserId(feed)
        }
      }
  );
}
