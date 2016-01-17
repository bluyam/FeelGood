// app.js

var MAX_RESULTS = 100;
var MAX_SINGLE_POSTS = 10;
var INDIVIDUAL_DISPLAY = 8;

var spinner;

var friends = new Set([]);
var friendDivs = [];
var hasLoadedMaxPosts = false;

var images = new Set([]);

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
    status.innerHTML = 'Feeling The Love...';
    var loginButton = document.getElementById('fb-login-button');
    loginButton.style.display = 'none';
    var target = document.getElementById('spinner');
    spinner = new Spinner().spin(target);
    displayFeed();
  });
}

function appendInfoScreen() {
  document.getElementById('status').innerHTML = "Can you feel it?";
  var sub = document.getElementById('spinner')
  sub.innerHTML = "Here are some nice posts from people who think you're awesome.";
  sub.style.marginTop = "1.5em";
}

function begin() {
  appendInfoScreen();
  for (var i = 0; i < friendDivs.length && i < INDIVIDUAL_DISPLAY; i++) {
    friendDivs[i].className = "post";
    friendDivs[i].id = "post"+i.toString();
    document.getElementById('posts').appendChild(friendDivs[i]);
  }
}

function handleSinglePosts() {
  spinner.stop();
  var spinnerDiv = document.getElementById('spinner');
  // spinnerDiv.style.display = 'none';
  var status = document.getElementById('status');
  // status.style.display = 'none';
  begin();
}

function handlePosterPicture(posterId, message, index) {
  var request = "/" + posterId + "/?fields=picture.width(225).height(225),name";
  FB.api(
    request,
    function (response) {
      if (response && !response.error) {
        if (message !== undefined) {
          // create post element
          var post = document.createElement('div');
          post.className = 'post';

          // create name element
          var name = document.createElement('div');
          name.className = 'name';
          name.innerHTML = response.name;
          console.log(name.innerHTML);

          // create picture element
          pictureURL = response.picture.data.url;
          var imageObject = new Image();
          imageObject.src = pictureURL;
          console.log(pictureURL);
          var img = document.createElement('div');
          img.className = 'profile-picture';
          img.id = "image"+index.toString();
          img.style.backgroundImage = "url("+pictureURL+")";
          // console.log(img);

          // create message element
          console.log(message);
          var mess = document.createElement('div');
          mess.className = 'message';
          mess.id = "message"+index.toString();
          mess.innerHTML = "\""+message+"\"";
          // console.log(mess);

          // append all to posts
          // console.log("img append");
          post.appendChild(name);
          post.appendChild(img);
          // console.log("mess append");
          post.appendChild(mess);
          // console.log("append to doc");
          // document.getElementById('posts').appendChild(post);

          // add to data storage
          previousLength = friends.size;
          if (!hasLoadedMaxPosts) {
            friends.add(posterId);
          }
          newLength = friends.size;
          if (previousLength != newLength) {
            friendDivs.push(post);
            images.add(imageObject);
          }
          if (friends.size >= MAX_SINGLE_POSTS && !hasLoadedMaxPosts) {
            handleSinglePosts();
            hasLoadedMaxPosts = true;
            console.log(friendDivs.length);
            console.log(images);
          }
        }
      }
    }
  );
}


function handlePosts(userId, feed) {
  var count = 0;
  for (var i = 0; i < feed.length; i++) {
    var posterId = feed[i].from.id;
    if (posterId != userId && !friends.has(posterId)) { // disclude page posts
      handlePosterPicture(posterId, feed[i].message, i);
    }
  }
}

function getUserId(feed) {
  FB.api("/me",
      function (response) {
        if (response && !response.error) {
          // console.log("logging user id");
          userId = response.id;
          // console.log(userId);
          handlePosts(userId, feed);
        }
      }
  );
}

function displayFeed() {
  var feed;
  /* make the API call */
  FB.api("/me/feed?fields=from,message&limit="+MAX_RESULTS.toString(),
      function (response) {
        if (response && !response.error) {
          // console.log("logging data");
          feed = response.data;
          // console.log(feed)
          getUserId(feed);
        }
      }
  );
}
