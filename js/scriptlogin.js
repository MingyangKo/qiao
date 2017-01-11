
$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyARk2rLJv0mwPYpeKLhDbMZX5ug9Ljk0RM",
    authDomain: "qiao-dfce8.firebaseapp.com",
    databaseURL: "https://qiao-dfce8.firebaseio.com",
    storageBucket: "qiao-dfce8.appspot.com",
    messagingSenderId: "103465176883"
  };
  firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');

  var dbRef = firebase.database().ref();
  // REGISTER DOM ELEMENTS
  const $messageField = $('#messageInput');
  const $messageList = $('#example-messages');
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignOut = $('#btnSignOut');
  const $btnSignUp = $('#btnSignUp');
  const $message = $('#example-messages');
  const $signInfo = $('#sign-info');
  const $btnSubmit = $('#btnSubmit');
  const $btnChatroom = $('#chatroom');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');

  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
  }


  // SignIn
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(e){
      history.go(-2);
    });
  });

  // Listening Login User
firebase.auth().onAuthStateChanged(function(user){
  if(user) {
    console.log('SignIn '+user.email);
    $signInfo.html(user.email+" is login...");
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
    $img.attr("src",user.photoURL);

    // Add a callback that is triggered for each chat message.
    dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
      //GET DATA
      var data = snapshot.val();
      var imgs = data.img;
      var username = data.name || "anonymous";
      var message = data.text;

      //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
      var $messageElement = $("<li>");
      var $nameElement = $("<strong class='example-chat-username'></strong>");
      var $imgElement = $("<img src='' id='pro'>")
      const $pro = $('#pro');


      $pro.attr("src",imgs);

      $nameElement.text(username);
      $messageElement.text(message).prepend($nameElement).prepend($imgElement);

      //ADD MESSAGE
      $messageList.append($messageElement)

      // SCROLL TO BOTTOM OF MESSAGE LIST
      $messageList[0].scrollTop = $messageList[0].scrollHeight;
    });
  } else {
    console.log("not logged in");
  }
});


// SignOut
$btnSignOut.click(function(){
  firebase.auth().signOut();
  console.log('LogOut');
  $signInfo.html('No one login...');
  $btnSignOut.attr('disabled', 'disabled');
  $btnSignIn.removeAttr('disabled')
  $message.html('');
  window.location.href = "./index.html";
});

// SignUp
$btnSignUp.click(function(e){
  const email = $email.val();
  const pass = $password.val();
  const auth = firebase.auth();
  // signUp
  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(function(e){
    console.log(e.message);
    $signInfo.html(e.message);
  });
  promise.then(function(user){
    console.log("SignUp user is "+user.email);
    const dbUserid = dbUser.child(user.uid);
    dbUserid.push({email:user.email});
    window.location.href = "./profile.html";
  });
});


// LISTEN FOR KEYPRESS EVENT
$messageField.keypress(function (e) {
  if (e.keyCode == 13) {

    //FIELD VALUES
    var username = firebase.auth().currentUser.displayName;
    var imgs = firebase.auth().currentUser.photoURL;
    var message = $messageField.val();
    console.log(username);
    console.log(message);

    //SAVE DATA TO FIREBASE AND EMPTY FIELD
    dbChatRoom.push({img:imgs,name:username,text:message});
    $messageField.val('');
  }
});
var storageRef = firebase.storage().ref();

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var file = evt.target.files[0];

  var metadata = {
    'contentType': file.type
  };

  // Push to child path.
  // [START oncomplete]
  storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
    console.log(snapshot.metadata);
    photoURL = snapshot.metadata.downloadURLs[0];
    console.log('File available at', photoURL);
  }).catch(function(error) {
    // [START onfailure]
    console.error('Upload failed:', error);
    // [END onfailure]
  });
  // [END oncomplete]
}

window.onload = function() {
  $file.change(handleFileSelect);
  // $file.disabled = false;
}
  $btnChatroom.attr('disabled', 'disabled');
// Submit
$btnSubmit.click(function(){
  const user = firebase.auth().currentUser;
  const $userName = $('#userName').val();

  const promise = user.updateProfile({
    displayName: $userName,
    photoURL: photoURL
  });
  promise.then(function() {
    console.log("Update successful.");
    $btnChatroom.removeAttr('disabled');
    if (user) {
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);
      const loginName = user.displayName || user.email;
      $signInfo.html(loginName+" is login...");
    }
  });
});
    $btnChatroom.click(function(){
      window.location.href = "./chatroom.html";
    });
});
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
  appId      : '1719424355053656',
  cookie     : true,  // enable cookies to allow the server to access
                      // the session
  xfbml      : true,  // parse social plugins on this page
  version    : 'v2.8' // use graph api version 2.8
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
  js.src = "//connect.facebook.net/zh_TW/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}
function fbLogin() {  
      FB.login(function(response) {
       if (response.session) {
         if (response.perms) {
          //使用者已登入Facebook成功，且已授權你的應用程式存取
         } else {
           //使用者已登入Facebook成功，但未授權你的應用程式存取
         }
       } else {
         //使用者未登入成功
       }
     }, {scope: 'public_profile,email'}); //設定需要授權的項目
  }

var provider = new firebase.auth.FacebookAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
firebase.auth().signInWithRedirect(provider);
firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
