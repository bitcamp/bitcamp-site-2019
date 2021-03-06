var buttons_menu_top;
var layerSelected;
var slackAccessToken;
var slackCode;
var twitterRequestToken;
var twitterAccessToken;
var twitterSecretToken;
var totalLayerThumbnails = {'face': 7, 'hair': 31, 'eyebrows': 9, 'eyes': 12, 'nose': 9, 'mouth': 26, 'facial-hair': 20, 'accessory-1': 16, 'accessory-2': 16, 'accessory-3': 16, 'background': 28};
var selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'facial-hair': -1, 'accessory-1': -1, 'accessory-2': -1, 'accessory-3': -1, 'background': -1}; // Indices start at 0, -1 == nothing selected
var layerColor = {'face': 'rgb(255, 255, 255)', 'hair': 'rgb(255, 255, 255)', 'eyebrows': 'rgb(12,12,12)', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed', 'facial-hair': 'rgb(12, 12, 12)', 'accessory-1': 'rgb(255, 111, 63)', 'accessory-2': 'rgb(255, 239, 63)', 'accessory-3': 'rgb(26, 46, 51)', 'background': 'rgb(255, 175, 63)'};
var layerFlipped = {'face': 1, 'hair': 1, 'eyebrows': 1, 'eyes': 1, 'nose': 1, 'mouth': 1, 'facial-hair': 1, 'accessory-1': 1, 'accessory-2': 1, 'accessory-3': 1};
var layerWidth = {'eyebrows': 0, 'eyes': 0}
multiplier = 16;
var canvasX = 32;
var canvasY = 32;

window.onload = function setup() {
	// Set up help
    var helpLink = document.querySelector('.help__link');
    helpLink.onclick =  function() {
        // FB.AppEvents.logEvent('Needed Help');
    	openHelp();
    }
    var gettingStartedLink = document.querySelector('.help__link--getting-started');
    gettingStartedLink.onclick =  function() {
        gettingStarted(1);
    }
    var changingPositionLink = document.querySelector('.help__link--changing-position');
    changingPositionLink.onclick =  function() {
        changingPosition(1);
    }
    var fixingMistakesLink = document.querySelector('.help__link--fixing-mistakes');
    fixingMistakesLink.onclick =  function() {
        fixingMistakes(1);
    }
    var savingSharingLink = document.querySelector('.help__link--saving-sharing');
    savingSharingLink.onclick =  function() {
        savingSharing(1);
    }

    // Set up tool buttons
    var eraseLayerBtn = document.querySelector('.main-tools__btn--erase-layer');
    eraseLayerBtn.onclick = function() {
    	eraseLayer();
        if (layerSelected != 'background') {
            if (layerColor[layerSelected] != 'fixed') {
        		// if (layerSelected.includes('accessory')) {
        		// 	layerColor[layerSelected] = '#000000';
        		// }
        		// else {
        		// 	layerColor[layerSelected] = '#FFFFFF';
        		// }
            }
        }
        else {
        	layerColor['background'] = 'rgb(255, 175, 63)';
        	drawDefaultBackground();
        }
        disablePalette();
        disableDPad();
        disableMoveTools(0,3);
    }
    var eraseAllBtn = document.querySelector('.main-tools__btn--erase-all');
    eraseAllBtn.onclick = function() {
        eraseAll();
        disablePalette();
        disableDPad();
        disableMoveTools(0,3);

    }
    var paletteColors = document.querySelectorAll('.palette__color');
    for (i = 0; i < paletteColors.length; i++) {
        paletteColors[i].onclick = function() {
            var colorSelected = String(getComputedStyle(this).backgroundColor);
            if (layerSelected == 'background') {
                drawBackground(colorSelected); // Replaces prev color
            }
            else {
                drawImg(colorSelected); // rgb(#,#,#)
            }
        }
    }
    var widenBtn = document.querySelector('.move-tools__btn--widen');
    widenBtn.onclick = function() {
        changeWidth(1);
    }
    var narrowBtn = document.querySelector('.move-tools__btn--narrow');
    narrowBtn.onclick = function() {
        changeWidth(-1);
    }
    var resetPositionBtn = document.querySelector('.main-tools__btn--reset-position');
    resetPositionBtn.onclick = function() {
        resetPosition();
    }
    var resetAllBtn = document.querySelector('.main-tools__btn--reset-all');
    resetAllBtn.onclick = function() {
		translateAll(0, moveableLayers, 0, 0, true);
        layerWidth['eyebrows'] = 0;
        layerWidth['eyes'] = 0;
    }
    // Set up layer buttons
    var layersBtns = document.querySelectorAll('.layers__btn');
    for (i = 0; i < layersBtns.length; i++) {
        layersBtns[i].onclick = function(){
            chooseLayer(this);
        }
    }

    // Set up canvases
    var layers = document.querySelectorAll('.layer');
    var moveableLayers = new Array();
    for (i = 0; i < layers.length; i++) {
        var ctx = layers[i].getContext('2d');
        if (i == 0 || i == layers.length - 1) { // Background + Save layer full size
	        layers[i].width = canvasX*multiplier;
	        layers[i].height = canvasY*multiplier;
        } 
        else {
	        layers[i].width = canvasX;
	        layers[i].height = canvasY;
	        moveableLayers.push(layers[i]);
        }
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }

    var moveAllBtn = document.querySelector('.move-tools__btn--move-all');
    var dPadUpBtn = document.querySelector('.d-pad__btn--up');
    var dPadDownBtn = document.querySelector('.d-pad__btn--down');
    var dPadLeftBtn = document.querySelector('.d-pad__btn--left');
    var dPadRightBtn = document.querySelector('.d-pad__btn--right');
	dPadUpBtn.onclick = function() {
	    translateLayer(0,-1);
	}
	dPadDownBtn.onclick = function() {
	    translateLayer(0,1);
	}
	dPadLeftBtn.onclick = function() {
	    translateLayer(-1*layerFlipped[layerSelected],0);
	}
	dPadRightBtn.onclick = function() {
	    translateLayer(1*layerFlipped[layerSelected],0);
	}
    disableDPad();
    disableMoveTools(0,3);
    moveAllBtn.onclick = function() {
        if (!moveAllBtn.classList.contains('move-tools__btn--disabled')) {
        	if (moveAllBtn.classList.contains('move-tools__btn--selected')) {
    		    dPadUpBtn.onclick = function() {
    		        translateLayer(0,-1);
    		    }
    		    dPadDownBtn.onclick = function() {
    		        translateLayer(0,1);
    		    }
    		    dPadLeftBtn.onclick = function() {
    		        translateLayer(-1*layerFlipped[layerSelected],0);
    		    }
    		    dPadRightBtn.onclick = function() {
    		        translateLayer(1*layerFlipped[layerSelected],0);
    		    }
        		moveAllBtn.classList.remove('move-tools__btn--selected');
        	}
        	else {
    		    dPadUpBtn.onclick = function() {
        			translateAll(0, moveableLayers, 0, -1, false);
    		    }
    		    dPadDownBtn.onclick = function() {
        			translateAll(0, moveableLayers, 0, 1, false);
    		    }
    		    dPadLeftBtn.onclick = function() {
        			translateAll(0, moveableLayers, -1, 0, false);
    		    }
    		    dPadRightBtn.onclick = function() {
        			translateAll(0, moveableLayers, 1, 0, false);
    		    }
        		moveAllBtn.classList.add('move-tools__btn--selected');
        	}
        }
    }
    var flipBtn = document.querySelector('.move-tools__btn--flip');
    flipBtn.onclick = function() {
        if (!flipBtn.classList.contains('move-tools__btn--disabled')) {
            if (moveAllBtn.classList.contains('move-tools__btn--selected')) {
                moveAllBtn.classList.remove('move-tools__btn--selected');
            }
            dPadUpBtn.onclick = function() {
                translateLayer(0,-1);
            }
            dPadDownBtn.onclick = function() {
                translateLayer(0,1);
            }
            dPadLeftBtn.onclick = function() {
                translateLayer(-1*layerFlipped[layerSelected],0);
            }
            dPadRightBtn.onclick = function() {
                translateLayer(1*layerFlipped[layerSelected],0);
            }
            flip();
        }
    }

    // Set up canvas background
    drawDefaultBackground();

    // Disable palette
    disablePalette();

    // Set up Twitter app
    setupTwitter();

    // Set up Facebook app
    // App ID: 182304785885707
    // Test App ID: 170083730455354
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '182304785885707',
            cookie     : true,
            xfbml      : true,
            version    : 'v2.12'
        });
          
        FB.AppEvents.logPageView();
	    FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                logOutDisplay('inline');
            }
	    });

        var shareToFacebook = document.querySelector('.export-options__link--facebook');
        var facebookLoginContainer = document.querySelector('.export-options-login--facebook');
        // var facebookExportOptions = document.querySelector('.export-options--facebook');
        shareToFacebook.onclick = function() {
            shareAllLoginContainer.style.display = 'none';
            FB.getLoginStatus(function(response) {
                shareBtn.classList.add('export-tools__btn--selected');
                if (response.status == 'connected') {
                    FB.api('/me/permissions', function(permissionsResponse) {
                        var permissions = permissionsResponse.data;
                        if (permissions[0].permission == 'publish_actions' && permissions[0].status == 'granted') {
                            openFacebookOptions();
                        }
                        else {
                            facebookLoginContainer.style.display = 'flex';
                        }
                    });
                }
                else {
                    facebookLoginContainer.style.display = 'flex';
                }
            });
        }
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    } (document, 'script', 'facebook-jssdk'));

    var shareBtn = document.querySelector('.export-tools__btn--share');
    var closeLoginLink = document.querySelectorAll('.close-login__link');
    var loginContainer = document.querySelectorAll('.export-options-login');
    for (i = 0; i < 3; i++) (function(i) {
        closeLoginLink[i].onclick = function() {
            shareBtn.classList.remove('export-tools__btn--selected');
            loginContainer[i].style.display = 'none';
        };
    })(i);

    // Facebook Login
    var facebookLoginBtn = document.querySelector('.fb-login-button');
    facebookLoginBtn.setAttribute('data-scope','publish_actions');
    facebookLoginBtn.setAttribute('onlogin','shareFacebookImg();');

    // Twitter export options
    var addToProfileBtn = document.querySelector('.export-options--profile__btn');
    var tweetBtn = document.querySelector('.export-options--tweet__btn');
    var tweetTextContainer = document.querySelector('.export-options-container--tweet');
    var tweetTextArea = document.querySelector('.export-options--tweet__text');
    addToProfileBtn.onclick = function() {
        tweetTextContainer.style.display = 'none';
    }
    tweetBtn.onclick = function() {
        tweetTextContainer.style.display = 'inline';
    }

    // Facebook export options
  	var addToPhotosBtn = document.querySelector('.export-options--photo__btn');
  	var addToTimelineBtn = document.querySelector('.export-options--timeline__btn');
	var photoTextContainer = document.querySelector('.export-options-container--photo');
	var timelineTextContainer = document.querySelector('.export-options-container--timeline');
	var photoTextArea = document.querySelector('.export-options--photo__text');
	var timelineTextArea = document.querySelector('.export-options--timeline__text');
  	addToTimelineBtn.onclick = function() {
  		timelineTextContainer.style.display = 'inline';
  	}
  	addToPhotosBtn.onclick = function() {
  		photoTextContainer.style.display = 'inline';
  		timelineTextContainer.style.display = 'none';
  	}
    var saveBtn = document.querySelector('.export-tools__btn--save');
    saveBtn.onclick = function() {
        // FB.AppEvents.logEvent('Saved Sprite');
        // Preload
		var campfire = new Image();
		campfire.onload = function() {
        	saveImg();
		}
		campfire.src = 'svg/background/campfire-white.svg';
	}
    if (window.matchMedia('(max-width: 500px)').matches) {
        var saveLink = document.querySelector('.save__link');
        var exportImgContainer = document.querySelector('.export-img-container');
        saveLink.onclick = function() {
            exportImgContainer.style.display = 'none';
        }
    }

    var shareFacebookSubmit = document.querySelector('.export-options__btn--yes--facebook');
    shareFacebookSubmit.onclick = function() {
        // FB.AppEvents.logEvent('Shared Sprite');
    	// Preload
        var campfire = new Image();
        campfire.onload = function() {
            shareFacebookImgAuth();
        }
        campfire.src = 'svg/background/campfire-white.svg';
    }

    var shareOptions = document.querySelectorAll('.export-options');
    var shareSlackCancel = document.querySelector('.export-options__btn--no--slack');
    shareSlackCancel.onclick = function() {
        shareBtn.classList.remove('export-tools__btn--selected');
        shareOptions[0].style.display = 'none';
    }
    var shareTwitterCancel = document.querySelector('.export-options__btn--no--twitter');
    shareTwitterCancel.onclick = function() {
        addToProfileBtn.click();
        tweetTextArea.value = '';
        shareBtn.classList.remove('export-tools__btn--selected');
        shareOptions[1].style.display = 'none';
    }
    var shareFacebookCancel = document.querySelector('.export-options__btn--no--facebook');
    shareFacebookCancel.onclick = function() {
        addToPhotosBtn.click();
        photoTextArea.value = '';
        timelineTextArea.value = '';
        shareBtn.classList.remove('export-tools__btn--selected');
        shareOptions[2].style.display = 'none';
    }

    var logOutLink = document.querySelector('.logout__link');
    var shareAllLogoutContainer = document.querySelector('.export-options-all--logout');
    var logoutContainer = document.querySelectorAll('.export-options-logout');

    var closeAllLogoutLink = document.querySelector('.close-all__link--logout');
    var shareAllLoginContainer = document.querySelector('.export-options-all--login');
    shareBtn.onclick = function() {
        closeAllLogoutLink.click();
        if (!shareBtn.classList.contains('export-tools__btn--selected')) {
            shareBtn.classList.add('export-tools__btn--selected');
            shareAllLoginContainer.style.display = 'flex';
        }
    }
    var closeAllLoginLink = document.querySelector('.close-all__link--login');
    closeAllLoginLink.onclick = function() {
        shareBtn.classList.remove('export-tools__btn--selected');
        shareAllLoginContainer.style.display = 'none';
    }

    closeAllLogoutLink.onclick = function() {
        shareBtn.classList.remove('export-tools__btn--selected');
        shareAllLogoutContainer.style.display = 'none';
    }
    logOutLink.onclick = function() {
        // Hide/close all open windows
        shareSlackCancel.click();
        shareFacebookCancel.click();
        closeAllLoginLink.click();
        for (i = 0; i < 3; i++) {
            closeLoginLink[i].click();
        }

        shareAllLogoutContainer.style.display = 'flex';
        if (slackAccessToken != null) {
            logoutContainer[0].style.display = 'flex';
        }
        FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                logoutContainer[2].style.display = 'flex';
            }
        });
        if (logoutContainer[0].style.display == 'none' && logoutContainer[1].style.display == 'none' && logoutContainer[2].style.display == 'none') {
            logOutLink.style.display = 'none';
        }
    }
    var slackLogOutLink = document.querySelector('.logout__link--slack');
    slackLogOutLink.onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://slack.com/api/auth.revoke?token='+slackAccessToken);
        xhr.onload = function() {
            console.log(xhr.response);
            if (xhr.status == 200) {
                var response = JSON.parse(xhr.response);
                if (response.ok == true) {
                    alert('Successfully logged out of Slack!');
                }
            }
        }
        xhr.send();
        slackAccessToken = null;
        logoutContainer[0].style.display = 'none';
        closeAllLogoutLink.click();
        if (logoutContainer[0].style.display == 'none' && logoutContainer[1].style.display == 'none' && logoutContainer[2].style.display == 'none') {
            logOutLink.style.display = 'none';
        }
    }
    var twitterLogOutLink = document.querySelector('.logout__link--twitter');
    var facebookLogOutLink = document.querySelector('.logout__link--facebook');
    facebookLogOutLink.onclick = function() {
        FB.api(
            '/me/permissions',
            'DELETE'
        );
        FB.logout(function(response) {
            alert('Successfully logged out of Facebook!');
            logOutLink.style.display = 'none';
        });
        logoutContainer[2].style.display = 'none';
        closeAllLogoutLink.click();
        if (logoutContainer[0].style.display == 'none' && logoutContainer[1].style.display == 'none' && logoutContainer[2].style.display == 'none') {
            logOutLink.style.display = 'none';
        }
    }

    var shareToSlack = document.querySelector('.export-options__link--slack');
    var slackLoginContainer = document.querySelector('.export-options-login--slack');
    var slackExportOptions = document.querySelector('.export-options--slack');
    var shareSlackSubmit = document.querySelector('.export-options__btn--yes--slack');
    shareToSlack.onclick = function() {
        shareAllLoginContainer.style.display = 'none';
        // Check if logged in
        if (slackAccessToken == null) {
            slackLoginContainer.style.display = 'flex';
        }
        else {
            slackExportOptions.style.display = 'flex';
        }
    }
    shareSlackSubmit.onclick = function() {
        slackLoginAndShare();
    }

    var shareToTwitter = document.querySelector('.export-options__link--twitter');
    var twitterLoginContainer = document.querySelector('.export-options-login--twitter');
    var twitterExportOptions = document.querySelector('.export-options--twitter');
    shareToTwitter.onclick = function() {
        shareAllLoginContainer.style.display = 'none';
        // Check if logged in
        if (twitterAccessToken == null) {
            twitterLoginContainer.style.display = 'flex';
        }
        else {
            twitterExportOptions.style.display = 'flex';
        }
    }
    var shareTwitterSubmit = document.querySelector('.export-options__btn--yes--twitter');
    shareTwitterSubmit.onclick = function() {
        shareTwitterImg();
    }
}

function setupTwitter() {
    // Need the following command to bypass CORS (on Windows + Chrome):
    // start chrome --args --disable-web-security --user-data-dir
    var consumerKey = '';
    var consumerSecret = '';
    var nonce = Math.floor(Math.random() * 1e9).toString();
    var timestamp = Math.floor((new Date).getTime() / 1e3);
    var parameters = {'oauth_consumer_key' : consumerKey, 'oauth_nonce': nonce, 'oauth_timestamp' : timestamp, 'oauth_signature_method': 'HMAC-SHA1', 'oauth_version' : '1.0'};
    var signature = oauthSignature.generate('GET', 'https://api.twitter.com/oauth/request_token', parameters, consumerSecret, null, null);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.twitter.com/oauth/request_token?oauth_consumer_key='+consumerKey+'&oauth_nonce='+nonce+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+timestamp+'&oauth_version=1.0&oauth_signature='+signature);
    xhr.onload = function() {
        if (xhr.status === 200) {
            twitterRequestToken = xhr.response.split('&')[0].replace('oauth_token=','');
            console.log(twitterRequestToken);
            var twitterLogin = document.querySelector('.login--twitter');
            twitterLogin.setAttribute('href','https://api.twitter.com/oauth/authenticate?oauth_token='+twitterRequestToken);
        }
    }
    xhr.send();
}

function noAuth() {
    var slackLoginContainer = document.querySelector('.export-options-login--slack');
    var twitterLoginContainer = document.querySelector('.export-options-login--twitter');
    slackLoginContainer.style.display = 'none';
    twitterLoginContainer.style.display = 'none';
    unauthResponse();
}

function noAuthTwitter() {
    noAuth();
    setupTwitter();
}

function authSlack(code,state) {
    console.log('Code: '+code); // Slack code
    console.log('State: '+state); // Slack state
    if (state == 'add') {
    }
    if (state == 'login') {
        var slackExportOptions = document.querySelector('.export-options--slack');
        var slackLoginContainer = document.querySelector('.export-options-login--slack');
        slackCode = code;
        slackLoginContainer.style.display = 'none';
        slackExportOptions.style.display = 'flex';
    }
}

function slackLoginAndShare() {
    var shareCancel = document.querySelector('.export-options__btn--no--slack');
    var shareSlackSubmit = document.querySelector('.export-options__btn--yes--slack');
    shareSlackSubmit.onclick = function() {
        return false;
    }
    var clientID = '33353232930.335154144673';
    // Pls no steal
    var clientSecret = [!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+(![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]]+[+!+[]]+(![]+[])[+!+[]]+[+[]]+([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+!+[]]+(![]+[])[+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+([][[]]+[])[!+[]+!+[]]+[+[]]+(![]+[])[+[]]+[!+[]+!+[]+!+[]+!+[]]+(+(+!+[]+[+!+[]]))[(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+(+![]+([]+[])[([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([![]]+[][[]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(+![]+[![]]+([]+[])[([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]])[!+[]+!+[]+[+[]]]](!+[]+!+[]+[+[]])+(![]+[])[+!+[]]+[+[]]+[+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+(![]+[])[+[]]+[+[]]+(![]+[])[+[]]+[+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]]+[!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]];
    if (slackAccessToken == null) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://slack.com/api/oauth.access?client_id='+clientID+'&client_secret='+clientSecret+'&code='+slackCode);
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.response);
                console.log(response);
                if (response.ok == true) {
                    var accessToken = response.access_token;
                    slackAccessToken = accessToken;
                    logOutDisplay('inline');
                    shareSlackImg();
                }
            }
        }
        xhr.send();
    }
    else {
        shareSlackImg();
    }
    shareSlackSubmit.onclick = function() {
        slackLoginAndShare();
    }
    shareCancel.click();
}

function shareSlackImg() {
    var exportedImg = imgToDataURI();
    restoreSaveLayer();
    var imgBlob = dataURIToBlob(exportedImg);
    var fd2 = new FormData();
    fd2.append('token', slackAccessToken);
    fd2.append('image', imgBlob);
    var xhr2 = new XMLHttpRequest();
    xhr2.open('POST', 'https://slack.com/api/users.setPhoto');
    xhr2.onload = function() {
        console.log(xhr2.response);
        if (xhr2.status == 200) {
            var response2 = JSON.parse(xhr2.response);
            if (response2.ok == true) {
                alert('Successfully uploaded to Slack!');
            }
        }
    }
    xhr2.send(fd2);
}

function shareTwitterImg() {
    var shareTwitterSubmit = document.querySelector('.export-options__btn--yes--twitter');
    shareTwitterSubmit.onclick = function() {
        return false;
    }
    var addToProfileBtn = document.querySelector('.export-options--profile__btn');
    var shareCancel = document.querySelector('.export-options__btn--no--twitter');
    var consumerKey = '';
    var consumerSecret = '';
    var nonce = Math.floor(Math.random() * 1e9).toString();
    var timestamp = Math.floor((new Date).getTime() / 1e3);
    var parameters = {'oauth_token': twitterAccessToken,'oauth_consumer_key' : consumerKey, 'oauth_nonce': nonce, 'oauth_timestamp' : timestamp, 'oauth_signature_method': 'HMAC-SHA1', 'oauth_version' : '1.0'};

    if (addToProfileBtn.checked) {
        var exportedImg = imgToDataURI();
        restoreSaveLayer();
        var imgBlob = dataURIToBlob(exportedImg);
        var fd = new FormData();
        fd.append('image', imgBlob);
        var signature = oauthSignature.generate('POST', 'https://api.twitter.com/1.1/account/update_profile_image.json', parameters, consumerSecret, twitterSecretToken, null);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.twitter.com/1.1/account/update_profile_image.json?oauth_consumer_key='+consumerKey+'&oauth_nonce='+nonce+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+timestamp+'&oauth_version=1.0&oauth_signature='+signature+'&oauth_token='+twitterAccessToken);
        xhr.onload = function() {
            console.log(xhr.response);  
            if (xhr.status == 200) {
                alert('Successfully uploaded to Twitter!');
                shareCancel.click();
            }
        }
        xhr.send(fd);
    }
    else {
        var exportedImg = imgToDataURI();
        restoreSaveLayer();
        var imgBlob = dataURIToBlob(exportedImg);
        var fd = new FormData();
        fd.append('media', imgBlob);
        var signature = oauthSignature.generate('POST', 'https://upload.twitter.com/1.1/media/upload.json', parameters, consumerSecret, twitterSecretToken, null);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://upload.twitter.com/1.1/media/upload.json?oauth_consumer_key='+consumerKey+'&oauth_nonce='+nonce+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+timestamp+'&oauth_version=1.0&oauth_signature='+signature+'&oauth_token='+twitterAccessToken);
        xhr.onload = function() {
            console.log(xhr.response);  
            if (xhr.status == 200) {
                alert('Successfully uploaded to Twitter!');
                var mediaID = JSON.parse(xhr.response).media_id_string;
                console.log(mediaID);
                var tweetTextArea = document.querySelector('.export-options--tweet__text');
                var tweet = tweetTextArea.value;
                if (tweet.length > 140) {
                    tweet = tweet.substring(0,140);
                }
                else if (tweet.length == 0) {
                    alert('Character field empty.');
                }
                var fd2 = new FormData();
                // fd2.append('media_ids', mediaID);
                fd2.append('status', tweet);
                var nonce2 = Math.floor(Math.random() * 1e9).toString();
                var timestamp2 = Math.floor((new Date).getTime() / 1e3);
                var parameters2 = {'media_ids':mediaID,'oauth_token': twitterAccessToken,'oauth_consumer_key' : consumerKey, 'oauth_nonce': nonce2, 'oauth_timestamp' : timestamp2, 'oauth_signature_method': 'HMAC-SHA1', 'oauth_version' : '1.0'};
                var signature2 = oauthSignature.generate('POST', 'https://api.twitter.com/1.1/statuses/update.json', parameters2, consumerSecret, twitterSecretToken, null);
                var xhr2 = new XMLHttpRequest();
                xhr2.open('POST', 'https://api.twitter.com/1.1/statuses/update.json?media_ids='+mediaID+'&oauth_consumer_key='+consumerKey+'&oauth_nonce='+nonce2+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+timestamp2+'&oauth_version=1.0&oauth_signature='+signature2+'&oauth_token='+twitterAccessToken);
                xhr2.onload = function() {
                    // console.log(xhr2.response);  
                    if (xhr2.status == 200) {
                        alert('Successfully tweeted!');
                        shareCancel.click();
                    }
                }
                xhr2.send(fd2);
            }
        }
        xhr.send(fd);
    }
    shareTwitterSubmit.onclick = function() {
        shareTwitterImg();
    }
}

function authTwitter(requestToken, verifier) {
    console.log('Request Token: '+requestToken);
    console.log('Verifier: '+verifier);
    if (twitterRequestToken == requestToken) {
        var fd = new FormData();
        fd.append('oauth_verifier', verifier);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.twitter.com/oauth/access_token?oauth_token='+twitterRequestToken);
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(xhr.response);
                twitterAccessToken = xhr.response.split('oauth_token=').pop().split('&')[0];
                twitterSecretToken = xhr.response.split('oauth_token_secret=').pop().split('&')[0];
                var twitterLoginContainer = document.querySelector('.export-options-login--twitter');
                var twitterExportOptions = document.querySelector('.export-options--twitter');
                var addToProfileBtn = document.querySelector('.export-options--profile__btn');
                twitterLoginContainer.style.display = 'none';
                twitterExportOptions.style.display = 'flex';
                addToProfileBtn.click();
            }
        }
        xhr.send(fd);
    }
    else {
        noAuthTwitter();
    }
}

function loadLayerThumbnails(pageNum, totalThumbnails) {
    var prevBtn = document.querySelector('.layer-thumbnails-nav__btn--prev');
    var nextBtn = document.querySelector('.layer-thumbnails-nav__btn--next');

    var total = totalLayerThumbnails[layerSelected];
    var start = (pageNum - 1) * totalThumbnails; // Absolute index (0 to total)
    var end; // Relative index to div (0 to 4 or 28)

    // Hide/show prev btn
    if (start == 0) {
        prevBtn.style.display = 'none'; //TODO
        prevBtn.onclick = '';
    }
    else {
        prevBtn.style.display = 'inline';
        prevBtn.onclick = function() {
            loadLayerThumbnails(pageNum - 1, totalThumbnails);
        }
    }
    // Find ending index & hide/show next btn
    if (start + totalThumbnails >= total) {
        end = total - start;
        nextBtn.style.display = 'none'; //TODO
        nextBtn.onclick = '';
    }
    else {
        end = totalThumbnails;
        nextBtn.style.display = 'inline';
        nextBtn.onclick = function() {
            loadLayerThumbnails(pageNum + 1, totalThumbnails);
        }
    }
    // Change page num
    if (window.matchMedia('(max-width: 500px)').matches) {
	    var navLayer = document.querySelector('.layer-thumbnails-nav-layer');
	    var layerSelectedText = layerSelected;
		layerSelectedText = layerSelectedText.charAt(0).toUpperCase() + layerSelectedText.substring(1);
		layerSelectedText = layerSelectedText.replace('-',' ');
	    navLayer.innerHTML = layerSelectedText;
	}
	// else {
	    var pageNumDisplay = document.querySelector('.layer-thumbnails-nav-page-num');
	    pageNumDisplay.innerHTML = 'Page ' + pageNum;
	// }

    // Clear cells
    var layerThumbnails = document.querySelectorAll('.layer-thumbnails__row__cell');
    for (i = 0; i < totalThumbnails; i++) {
        // TEMPORARY
        layerThumbnails[i].textContent = '';
        // layerThumbnailsImgs[i].src = '';
        layerThumbnails[i].onclick = '';
    }
    // Populate cells
    if (layerSelected == 'background') {
    }
    for (i = 0; i < end; i++) (function(i) {
        if (layerSelected == 'background') {
	    	switch ((pageNum-1)*totalThumbnails+i) {
	    		case 0: layerThumbnails[i].innerText = 'Solid Color'; break;
	    		case 1: layerThumbnails[i].textContent = 'Gradient 1'; break;
	    		case 2: layerThumbnails[i].textContent = 'Gradient 2'; break;
	    		case 3: layerThumbnails[i].textContent = 'Gradient 3'; break;
	    		case 4: layerThumbnails[i].textContent = 'Campfire 1'; break;
	    		case 5: layerThumbnails[i].textContent = 'Campfire 2'; break;
	    		case 6: layerThumbnails[i].textContent = 'Campfire 3'; break;
	    		case 7: layerThumbnails[i].textContent = 'Campfire 4'; break;
                case 8: layerThumbnails[i].textContent = 'Bitcoin 1'; break;
                case 9: layerThumbnails[i].textContent = 'Bitcoin 2'; break;
                case 10: layerThumbnails[i].textContent = 'Bitcoin 3'; break;
                case 11: layerThumbnails[i].textContent = 'Bitcoin 4'; break;
                case 12: layerThumbnails[i].textContent = 'Pizza 1'; break;
                case 13: layerThumbnails[i].textContent = 'Pizza 2'; break;
                case 14: layerThumbnails[i].textContent = 'Pizza 3'; break;
                case 15: layerThumbnails[i].textContent = 'Pizza 4'; break;
                case 16: layerThumbnails[i].textContent = 'Burger 1'; break;
                case 17: layerThumbnails[i].textContent = 'Burger 2'; break;
                case 18: layerThumbnails[i].textContent = 'Burger 3'; break;
                case 19: layerThumbnails[i].textContent = 'Burger 4'; break;
                case 20: layerThumbnails[i].textContent = 'Cookie 1'; break;
                case 21: layerThumbnails[i].textContent = 'Cookie 2'; break;
                case 22: layerThumbnails[i].textContent = 'Cookie 3'; break;
                case 23: layerThumbnails[i].textContent = 'Cookie 4'; break;
                case 24: layerThumbnails[i].textContent = 'Sprite Bomb 1'; break;
                case 25: layerThumbnails[i].textContent = 'Sprite Bomb 2'; break;
                case 26: layerThumbnails[i].textContent = 'Sprite Bomb 3'; break;
                case 27: layerThumbnails[i].textContent = 'Sprite Bomb 4'; break;
	    	}
        }
        else {
            // layerThumbnails[i].textContent = layerSelected + ' ' + (i + start + 1); // TEMPORARY
            if (layerColor[layerSelected] != 'fixed') {
	            var imgColor = document.createElement('img');
                if (layerSelected.includes('accessory')) {
	            	imgColor.setAttribute('src', 'png/accessory/accessory-color-' + (i + start) + '.png');
                }
                else {
	            	imgColor.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-color-' + (i + start) + '.png');
	        	}
	            imgColor.setAttribute('height',canvasX*2);
	            imgColor.setAttribute('width',canvasX*2);
	            imgColor.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(imgColor);
	            var imgOutline = document.createElement('img');
                if (layerSelected.includes('accessory')) {
	            	imgOutline.setAttribute('src', 'png/accessory/accessory-outline-' + (i + start) + '.png');
                    if ((pageNum-1)*totalThumbnails+i == 27) {
                        layerThumbnails[i].textContent = 'Earrings';
                    }
                } 
                else {
	            	imgOutline.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-outline-' + (i + start) + '.png');
	        	}
	            imgOutline.setAttribute('height',canvasX*2);
	            imgOutline.setAttribute('width',canvasX*2);
	            imgOutline.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(imgOutline);
            }
            else {
	            var img = document.createElement('img');
	            img.setAttribute('src', 'png/' + layerSelected + '/' + layerSelected + '-' + (i + start) + '.png');
	            img.setAttribute('height',canvasX*2);
	            img.setAttribute('width',canvasX*2);
	            img.classList.add('layer-thumbnails__row__cell__img');
	            layerThumbnails[i].appendChild(img);
            }
        }
        layerThumbnails[i].onclick = function() {
            setIndexAndDraw(layerThumbnails[i], (i + start));
        }
    })(i);

    // Remove previously selected layer thumbnail if present
    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    // Highlight selected layer thumbnail if present
    if (selectedIndex[layerSelected] >= start && selectedIndex[layerSelected] < start + end) {
        var currentSelected = layerThumbnails[selectedIndex[layerSelected] % totalThumbnails];
        currentSelected.classList.add('layer-thumbnails__row__cell--selected');
    }
}

function chooseLayer(button) {
    var thumbnailContainer = document.querySelector('.layer-thumbnails-container');
    var thumbnailNavContainer = document.querySelector('.layer-thumbnails-nav-container');
	var lastClicked = document.querySelector('.layers__btn--selected');

    if (lastClicked == null) {
        // Removes any tutorial stuff
        var helpContainer = document.querySelector('.help-container');
        var helpMessageContainer = document.querySelector('.help-message-container');
        var helpMessage = document.querySelector('.help-message');
        var helpNavContainer = document.querySelector('.help-nav-container');
        var helpNavNext = document.querySelector('.help-nav__btn--next');
        helpContainer.style.display = 'none';
        helpMessageContainer.style.display = 'none';
        helpMessage.style.display = 'none';
        helpNavContainer.style.display = 'none';
        helpNavNext.style.display = 'none';
        lastClicked = button;
    }
    layerSelected = button.value.toLowerCase().replace(' ','-');
    if (window.matchMedia('(max-width: 500px)').matches) {
    	loadLayerThumbnails(parseInt(selectedIndex[layerSelected]/4) + 1, 4);  // Page of selected layer thumbnail + total thumbnails
	}
    else {
    	loadLayerThumbnails(parseInt(selectedIndex[layerSelected]/28) + 1, 28);
	}
    lastClicked.classList.remove('layers__btn--selected');
    button.classList.add('layers__btn--selected');
    thumbnailContainer.style.display = 'flex'; //TODO
    thumbnailNavContainer.style.display = 'flex'; //TODO
	disablePalette();
    if (selectedIndex[layerSelected] != -1) {
    	if (layerSelected != 'background') {
    		enableDPad();
    		enableMoveTools(2,3);
    	}
    	else {
    		disableDPad();
    		disableMoveTools(2,3);
    	}
    	if (layerSelected == 'eyes' || layerSelected == 'eyebrows') {
    		enableMoveTools(0,2);
    	}
    	if (layerColor[layerSelected] != 'fixed') {
    		enablePalette();
    	}
    }
    else {
    	disableDPad();
    	disableMoveTools(0,3);
    }

    // Add/remove or enable/disable color palettes
    var skinPalette = document.querySelector('.palette--skin');
    var hairPalette = document.querySelector('.palette--hair');
    skinPalette.style.display = 'none';
    hairPalette.style.display = 'none';

    if (layerSelected == 'face') {
        // Change color palette
        skinPalette.style.display = 'flex';
    }
    else if (layerSelected == 'hair' || layerSelected == 'eyebrows' || layerSelected == 'facial-hair') {
        // Change color palette
        hairPalette.style.display = 'flex';
    }
}

function setIndexAndDraw(currentSelected, index) {
    // currentSelected == layer thumbnail div clicked
    // index finds the correct image

    // FOR TUTORIAL
	var helpMessageContainer = document.querySelector('.help-message-container');

    if (layerColor[layerSelected] != 'fixed') {
    	enablePalette();
    }

    if (selectedIndex[layerSelected] == index) {
		if (helpMessageContainer.style.display != 'flex') { // FOR TUTORIAL (if a layer is already drawn)
	        if (layerSelected != 'background') {
	        	disablePalette();
	        	disableDPad();
	        	disableMoveTools(0,3);
	            eraseLayer();
	        }
            else {
	        	drawBackground(layerColor['background']);
	        }
		}
    }
    else if (selectedIndex[layerSelected] != index) {
        // Remove previously selected layer thumbnail if present
        eraseLayer();
        // Highlight selected layer thumbnail
        currentSelected.classList.add('layer-thumbnails__row__cell--selected');
        selectedIndex[layerSelected] = index;
        if (layerSelected != 'background') {
        	enableDPad();
        	enableMoveTools(2,3);
        }
        if (layerSelected == 'eyes' || layerSelected == 'eyebrows') {
        	enableMoveTools(0,2);
        }
        if (layerSelected == 'background') {
            drawBackground(layerColor['background']);
        }
        else {
            // Redraw facial hair if face is added/changed
        	drawImg(layerColor[layerSelected]);
            if (layerSelected == 'face' && selectedIndex['facial-hair'] != -1) {
                drawFacialHair(layerColor['facial-hair']);
            }
        }
    }

    // FOR TUTORIAL
    var helpMessage = document.querySelector('.help-message');
	if (helpMessage.innerHTML == 'Next, select any option in the list above.') {
		if (layerColor[layerSelected] != 'fixed') {
            gettingStarted(3);
		}
		else {
			gettingStarted(4);
		}
	}
}

function disablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < paletteColors.length; i++) {
        paletteColors[i].style.opacity = '0.6'; // Maybe I should make a class for this?
        paletteColors[i].onclick = function() {
        	return false;
		}
    }
}

function enablePalette() {
    var paletteColors = document.querySelectorAll('.palette__color');
    for(i = 0; i < paletteColors.length; i++) {
        paletteColors[i].style.opacity = '1.0';
        paletteColors[i].onclick = function() {
	        var colorSelected = String(getComputedStyle(this).backgroundColor);
	        if (layerSelected == 'background') {
	            drawBackground(colorSelected); // Replaces prev color
	        }
            else {
	            drawImg(colorSelected); // rgb(#,#,#)
	        }
		}
    }
}

function disableDPad() {
    var dPadBtns = document.querySelectorAll('.d-pad__btn');
    for(i = 0; i < dPadBtns.length; i++) {
        dPadBtns[i].classList.add('d-pad__btn--disabled');
    }
    disableMoveTools(3,4);
}

function enableDPad() {
    var dPadBtns = document.querySelectorAll('.d-pad__btn');
    for(i = 0; i < dPadBtns.length; i++) {
        dPadBtns[i].classList.remove('d-pad__btn--disabled');
    }
    enableMoveTools(3,4);
}

function disableMoveTools(start, end) {
    var moveBtns = document.querySelectorAll('.move-tools__btn');
    for(i = start; i < end; i++) {
    	moveBtns[i].classList.add('move-tools__btn--disabled');
    }
}

function enableMoveTools(start, end) {
    var moveBtns = document.querySelectorAll('.move-tools__btn');
    for(i = start; i < end; i++) {
    	moveBtns[i].classList.remove('move-tools__btn--disabled');
    }
}

function disableFlip() {
    var flipBtn = document.querySelector('.move-tools__btn--flip');
    flipBtn.classList.add('move-tools__btn--disabled');
}

function enableFlip() {
    var flipBtn = document.querySelector('.move-tools__btn--flip');
    flipBtn.classList.remove('move-tools__btn--disabled');
}

function drawImg(color) {
    // TODO: Disable for background and some layers
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, canvasX, canvasY);
        ctx.globalCompositeOperation = 'source-over'; // I don't know why this works
        if (layerColor[layerSelected] != 'fixed') {
            if (layerSelected == 'facial-hair') {
                drawFacialHair(color);
            }
            else {
                var imgColor = new Image();
                imgColor.onload = function() {
                    if (layerSelected == 'eyebrows') {
                        drawImgHalves(imgColor, ctx);
                    }
                    else {
                        ctx.drawImage(imgColor, 0, 0);
                    }
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, canvasX, canvasY);

                    var imgOutline = new Image();
                    imgOutline.onload = function() {
                        if (layerSelected == 'eyebrows') {
                            drawImgHalves(imgOutline, ctx);
                        }
                        else {
                            ctx.drawImage(imgOutline, 0, 0);
                        }
                    }
                    imgOutline.onerror = function() {
                        drawImg(color);
                    }
                    // Change file name for accessories
                    if (layerSelected.includes('accessory')) {
                        imgOutline.src = 'png/accessory/accessory-outline-' + selectedIndex[layerSelected] + '.png';
                    }
                    else {
                        imgOutline.src = 'png/' + layerSelected + '/' + layerSelected + '-outline-' + selectedIndex[layerSelected] + '.png';
                    } 
                }
                imgColor.onerror = function() {
                    drawImg(color);
                }
                // Change file name for accessories
                if (layerSelected.includes('accessory')) {
                    imgColor.src = 'png/accessory/accessory-color-' + selectedIndex[layerSelected] + '.png';
                }
                else {
                    imgColor.src = 'png/' + layerSelected + '/' + layerSelected + '-color-' + selectedIndex[layerSelected] + '.png';
                }
            }
            layerColor[layerSelected] = color;

            // FOR TUTORIAL
            var helpMessage = document.querySelector('.help-message');
            if (helpMessage.innerHTML == 'Now, choose a color in the palette!') {
                gettingStarted(4);
            }
        } 
        else {
            var img = new Image();
            img.onload = function() {
                if (layerSelected == 'eyes') {
                    drawImgHalves(img, ctx);
                }
                else {
                    ctx.drawImage(img, 0, 0);
                }
            }
            img.onerror = function() {
                drawImg(color);
            }
            img.src = 'png/' + layerSelected + '/' + layerSelected + '-' + selectedIndex[layerSelected] + '.png';
        }
    }
}

function drawImgHalves(img, ctx) {
    if (layerWidth[layerSelected] <= 0) {
        ctx.drawImage(img, 0 + layerWidth[layerSelected], 0, canvasX/2, canvasY, 0, 0, canvasX/2, canvasY); // Right eye
        ctx.drawImage(img, canvasX/2 - layerWidth[layerSelected], 0, canvasX/2, canvasY, canvasX/2, 0, canvasX/2, canvasY); // Left eye
    }
    else {
        ctx.drawImage(img, 0 + layerWidth[layerSelected], 0, canvasX/2 - layerWidth[layerSelected], canvasY, 0, 0, canvasX/2 - layerWidth[layerSelected], canvasY); // Right eye
        ctx.drawImage(img, canvasX/2, 0, canvasX/2, canvasY, canvasX/2 + layerWidth[layerSelected], 0, canvasX/2, canvasY); // Left eye
    }
}

function drawImgHalvesTranslateAll(currentLayer, img, ctx) {
    if (layerWidth[currentLayer] <= 0) {
        ctx.drawImage(img, 0 + layerWidth[currentLayer], 0, canvasX/2, canvasY, 0, 0, canvasX/2, canvasY); // Right eye
        ctx.drawImage(img, canvasX/2 - layerWidth[currentLayer], 0, canvasX/2, canvasY, canvasX/2, 0, canvasX/2, canvasY); // Left eye
    }
    else {
        ctx.drawImage(img, 0 + layerWidth[currentLayer], 0, canvasX/2 - layerWidth[currentLayer], canvasY, 0, 0, canvasX/2 - layerWidth[currentLayer], canvasY); // Right eye
        ctx.drawImage(img, canvasX/2, 0, canvasX/2, canvasY, canvasX/2 + layerWidth[currentLayer], 0, canvasX/2, canvasY); // Left eye
    }
}

function drawFacialHair(color) {
    var facialHairLayer = document.querySelector('.layer--facial-hair');
    var ctx = facialHairLayer.getContext('2d');
    ctx.clearRect(0,0,32,32);
    var selectedFace = selectedIndex['face'];
    if (selectedFace == -1) {
        selectedFace = 0;
    }
    var faceColor = new Image();
    faceColor.onload = function() {
        facialHairLayer.style.display = 'none';
        ctx.drawImage(faceColor, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = layerColor['face'];
        ctx.fillRect(0, -1, canvasX, canvasY);
        var facialHairColor = new Image();
        facialHairColor.onload = function() {
            facialHairLayer.style.display = 'inline';
            ctx.drawImage(facialHairColor, 0, 0);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvasX, canvasY);
            var facialHairOutline = new Image();
            facialHairOutline.onload = function() {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.drawImage(facialHairOutline, 0, 0);
                var faceOutline = new Image();
                faceOutline.onload = function() {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.drawImage(faceOutline, 0, 0);
                    ctx.globalCompositeOperation = 'source-over';
                }
                faceOutline.onerror = function() {
                    drawFacialHair(color);
                }
                faceOutline.src = 'png/face/face-outline-'+selectedFace+'.png';
            }
            facialHairOutline.onerror = function() {
                drawFacialHair(color);
            }
            facialHairOutline.src = 'png/facial-hair/facial-hair-outline-'+selectedIndex['facial-hair']+'.png';
        }
        facialHairColor.onerror = function() {
            drawFacialHair(color);
        }
        facialHairColor.src = 'png/facial-hair/facial-hair-color-'+selectedIndex['facial-hair']+'.png';
    }
    faceColor.onerror = function() {
        drawFacialHair(color);
    }
    faceColor.src = 'png/face/face-color-'+selectedFace+'.png';
}

function eraseShadow() {
    var faceLayer = document.querySelector('.layer--face');
    var ctx = faceLayer.getContext('2d');
    var imgColor = new Image();
    imgColor.onload = function() {
        ctx.drawImage(imgColor, 0, 0);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = layerColor['face'];
        ctx.fillRect(0, 0, canvasX, canvasY);
        var imgOutline = new Image();
        imgOutline.onload = function() {
            ctx.drawImage(imgOutline, 0, 0);
        }
        imgOutline.onerror = function() {
            eraseShadow();
        }
        imgOutline.src = 'png/face/face-outline-' + selectedIndex['face'] + '.png';
    }
    imgColor.onerror = function() {
        eraseShadow();
    }
    imgColor.src = 'png/face/face-color-'+selectedIndex['face']+'.png';
}

function drawBackground(colorSelected) {
    if (selectedIndex != -1) {
        layerColor['background'] = colorSelected;
        var backgroundLayer = document.querySelector('.layer--background');
	    var ctx = backgroundLayer.getContext('2d');
	    ctx.setTransform(1, 0, 0, 1, 0, 0);
	    ctx.clearRect(0, 0, 512, 512);
        if (selectedIndex['background'] >= 4 && selectedIndex['background'] <= 27) {
        	drawSolidBackground(colorSelected);
		}
	    switch (selectedIndex['background']) {
	    	case 0: drawSolidBackground(colorSelected); break; // Solid color
	    	case 1: drawGradientBackground(colorSelected, 4); break; // Gradient
	    	case 2: drawGradientBackground(colorSelected, 2); break; // Gradient
	    	case 3: drawGradientBackground(colorSelected, 1); break; // Gradient
	    	case 4: drawSpriteBackground('campfire', 0, false, false); break;
	    	case 5: drawSpriteBackground('campfire', 300, true, false); break;
	    	case 6: drawSpriteBackground('campfire', 240, false, true); break;
	    	case 7: drawSpriteBackground('campfire', 300, true, true); break;
            case 8: drawSpriteBackground('15', 0, false, false); break;
            case 9: drawSpriteBackground('15', 500, true, false); break;
            case 10: drawSpriteBackground('15', 240, false, true); break;
            case 11: drawSpriteBackground('15', 300, true, true); break;
            case 12: drawSpriteBackground('13', 0, false, false); break;
            case 13: drawSpriteBackground('13', 300, true, false); break;
            case 14: drawSpriteBackground('13', 240, false, true); break;
            case 15: drawSpriteBackground('13', 300, true, true); break;
            case 16: drawSpriteBackground('9', 0, false, false); break;
            case 17: drawSpriteBackground('9', 300, true, false); break;
            case 18: drawSpriteBackground('9', 240, false, true); break;
            case 19: drawSpriteBackground('9', 300, true, true); break;
            case 20: drawSpriteBackground('10', 0, false, false); break;
            case 21: drawSpriteBackground('10', 300, true, false); break;
            case 22: drawSpriteBackground('10', 240, false, true); break;
            case 23: drawSpriteBackground('10', 300, true, true); break;
            case 24: drawSpriteBomb(14,14); break;
            case 25: drawRandomSpriteBomb(400, true, false); break;
            case 26: drawRandomSpriteBomb(400, false, true); break;
            case 27: drawRandomSpriteBomb(400, true, true); break;
	    }
    }
}

function drawDefaultBackground() {
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (i = 0; i < multiplier; i++) {
      for (j = 0; j < multiplier; j++) {
        ctx.fillStyle = 'rgb(' + Math.floor(255 - 4 * i) + ', ' +
            Math.floor(175 - 8 * j) + ', ' + 63 + ')';
        ctx.fillRect(j * canvasX, i * canvasY, canvasX, canvasY);
      }
    }
}

function drawSolidBackground(colorSelected) {
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.clearRect(0, 0, canvasX*multiplier, canvasY*multiplier);
    ctx.fillStyle = colorSelected;
    ctx.fillRect(0, 0, canvasX*multiplier, canvasY*multiplier);
}

function drawGradientBackground(colorSelected, factor) {
    var rgb = colorSelected.match(/\d+/g);
    var backgroundLayer = document.querySelector('.layer--background');
    var ctx = backgroundLayer.getContext('2d');
    ctx.clearRect(0, 0, canvasX*multiplier, canvasY*multiplier);
    for (i = 0; i < multiplier/factor; i++) {
      for (j = 0; j < multiplier/factor; j++) {
        ctx.fillStyle = 'rgb(' + Math.floor(rgb[0] - 4*i) + ', ' +
            Math.floor(rgb[1] - 2*i) + ', ' + rgb[2] + ')';
        ctx.fillRect(j * canvasX*factor, i * canvasY*factor, canvasX*factor, canvasY*factor);
      }
    }
}

function drawSpriteBackground(sprite, spriteNum, randomSize, rotation) {
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	var img = new Image();
	img.onload = function() {
		if (!randomSize && !rotation) {
			for (i = 0; i < 15; i++) {
				for (j = 0; j < 15; j++) {
					ctx.drawImage(img, (i*36)+8, (j*36)+8, 32, 32);
				}
			}
		}
		else {
			ctx.translate(canvasX*multiplier/2,canvasY*multiplier/2);
			for (i = 0; i < spriteNum; i++) {
				// RANDOMNESS
				var randSize = Math.floor((Math.random()*2)*4)*Math.floor(Math.random()*8) + 16;
				var randAngle = Math.floor(Math.random()*-3 + 6);
				var randX = Math.floor((Math.random()*-36)*16 + 256);
				var randY = Math.floor((Math.random()*-36)*16 + 256);
				if (randomSize && !rotation) {
					ctx.drawImage(img, randX, randY, randSize, randSize);
				}
				if (!randomSize && rotation) {
					ctx.rotate((i+randAngle)*2*Math.PI/120);
					ctx.drawImage(img, -50, -200 - .7*i, 32, 32);
				}
				if (randomSize && rotation) {
					ctx.rotate(i*2*Math.PI/120);
					ctx.drawImage(img, -50, -200 - .5*i, randSize, randSize);
				}
			}
		}
		// if (rotation) {
		// 	drawSpotlight();
		// }
   	}
   	if (sprite == 'campfire') {
		img.src = 'svg/background/campfire.svg';
   	}
   	else {
		img.src = 'png/background/background-'+sprite+'.png';
   	}
}

function drawSpriteBomb(row, col) {
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	if (row >= 0) {
		if (col >= 0) {
			var img = new Image();
			img.onload = function() {
				drawSpriteBomb(row, col - 1);
				ctx.drawImage(img, (row*36)+8, (col*36)+8, 32, 32);

			}
			var randNum = Math.floor(Math.random()*16);
			img.src = 'png/background/background-'+randNum+'.png';
		}
		else {
			drawSpriteBomb(row - 1, 14);
		}
	}
}

function drawRandomSpriteBomb(spriteNum, randomSize, rotation) {
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	if (spriteNum == 400) {
		ctx.translate(canvasX*multiplier/2,canvasY*multiplier/2);
	}
	if (spriteNum >= 0) {
		var img = new Image();
		img.onload = function() {
			drawRandomSpriteBomb(spriteNum - 1, randomSize, rotation);
			var randSize = Math.floor((Math.random()*2)*4)*Math.floor(Math.random()*8) + 16;
			var randAngle = Math.floor(Math.random()*-3 + 6);
			var randX = Math.floor((Math.random()*-36)*16 + 256);
			var randY = Math.floor((Math.random()*-36)*16 + 256);
			if (randomSize && !rotation) {
				ctx.drawImage(img, randX, randY, randSize, randSize);
			}
			if (!randomSize && rotation) {
				ctx.rotate((spriteNum+randAngle)*2*Math.PI/120);
				ctx.drawImage(img, -50, -200 - .4*spriteNum, 32, 32);
			}
			if (randomSize && rotation) {
				ctx.rotate(spriteNum*2*Math.PI/120);
				ctx.drawImage(img, -50, -200 - .4*spriteNum, randSize, randSize);
			}
		}
		var randNum = Math.floor(Math.random()*16);
		img.src = 'png/background/background-'+randNum+'.png';
	}
}

function drawSpotlight() {
	// Assume canvas translated to center
    var backgroundLayer = document.querySelector('.layer--background');
	var ctx = backgroundLayer.getContext('2d');
	var gradient = ctx.createRadialGradient(0,0,160,0,0,280);
	gradient.addColorStop(0,'rgba(255, 255, 255, .7)');
	gradient.addColorStop(1,'rgba(255, 255, 255, .05)');
	ctx.fillStyle = gradient;
	ctx.setTransform(1, 0, 0, 1, 256, 256);
	ctx.fillRect(-256,-256, 512, 512);
	ctx.translate(canvasX*multiplier/2,canvasY*multiplier/2);
}

function changePosition(button) {
    // TODO: Disable for background
    var dPad = document.querySelector('.d-pad-container');
    if (dPad.style.display == 'flex') {
        button.classList.remove('layers__btn--selected');
        button.classList.add('layers__btn--unselected');
        dPad.style.display = 'none'; //TODO
        dPad.style.borderRight = '0px'; //TODO
    }
    else {
        button.classList.remove('layers__btn--unselected');
        button.classList.add('layers__btn--selected');
        dPad.style.display = 'flex'; //TODO
        dPad.style.borderRight = '16px solid white'; //TODO
    }
}

function resetPosition() {
    if (selectedIndex[layerSelected] != -1 && layerSelected != null) {
        if (layerSelected != 'background') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvasX, canvasY);
            drawImg(layerColor[layerSelected]);

            if (layerSelected == 'eyebrows' || layerSelected == 'eyes') {
                layerWidth[layerSelected] = 0;
            }
        }
    }
}

function translateLayer(x,y) {
    // TODO: Disable for background
    if (selectedIndex[layerSelected] != -1 && layerSelected != null && layerSelected != 'background') {
        var layer = document.querySelector('.layer--' + layerSelected);
        var ctx = layer.getContext('2d');
        // Erase + copy to current layer
        ctx.clearRect(0, 0, canvasX, canvasY);
        ctx.translate(x,y);
        drawImg(layerColor[layerSelected]);
    }
}

function translateAll(layer, moveableLayers, x, y, reset) {
	if (layer < moveableLayers.length) {
        var currentLayer = moveableLayers[layer].className;
        currentLayer = currentLayer.replace('layer ','');
        currentLayer = currentLayer.replace(' layer--exportable','');
        currentLayer = currentLayer.replace('layer--','');
        currentLayer = currentLayer.replace('--','-');
        var ctx = moveableLayers[layer].getContext('2d');
        // Erase + copy to current layer
        ctx.clearRect(0, 0, canvasX, canvasY);
        if (layerFlipped[currentLayer] == -1) {
            ctx.translate(-1*x,y);
        }
        else {
            ctx.translate(x,y);
        }
        if (reset) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        if (selectedIndex[currentLayer] != -1) {
	        // DRAWIMG FUNCTION:
	        ctx.clearRect(0, 0, canvasX, canvasY);
	        ctx.globalCompositeOperation = 'source-over';
	        if (layerColor[currentLayer] != 'fixed') {
                if (currentLayer == 'facial-hair') {
                    drawFacialHair(layerColor['facial-hair']);
                    translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
                }
                else {
                    var imgColor = new Image();
                    imgColor.onload = function() {
                        if (currentLayer == 'eyebrows') {
                            drawImgHalvesTranslateAll(currentLayer, imgColor, ctx);
                        }
                        else {
                            ctx.drawImage(imgColor, 0, 0);
                        }
                        ctx.globalCompositeOperation = 'source-atop';
                        ctx.fillStyle = layerColor[currentLayer];
                        ctx.fillRect(0, 0, canvasX, canvasY);
                        var imgOutline = new Image();
                        imgOutline.onload = function() {
                            if (currentLayer == 'eyebrows') {
                                drawImgHalvesTranslateAll(currentLayer, imgOutline, ctx);
                                translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
                            }
                            else {
                                ctx.drawImage(imgOutline, 0, 0);
                                translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
                            }
                        }
                        imgOutline.onerror = function() {
                            drawImg(color);
                        }
                        // Change file name for accessories
                        if (currentLayer.includes('accessory')) {
                            imgOutline.src = 'png/accessory/accessory-outline-' + selectedIndex[currentLayer] + '.png';
                        }
                        else {
                            imgOutline.src = 'png/' + currentLayer + '/' + currentLayer + '-outline-' + selectedIndex[currentLayer] + '.png';
                        }
                    }
                    imgColor.onerror = function() {
                        translateAll(layer, moveableLayers, x, y, reset); // TRANSLATE
                    }
                    // Change file name for accessories
                    if (currentLayer.includes('accessory')) {
                        imgColor.src = 'png/accessory/accessory-color-' + selectedIndex[currentLayer] + '.png';
                    }
                    else {
                        imgColor.src = 'png/' + currentLayer + '/' + currentLayer + '-color-' + selectedIndex[currentLayer] + '.png';
                    }
                }
	        }
            else {
	            var img = new Image();
	            img.onload = function() {
                    if (currentLayer == 'eyes') {
                        drawImgHalvesTranslateAll(currentLayer, img, ctx);
                        translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
                    }
                    else {
                        ctx.drawImage(img, 0, 0);
                        translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
                    }
	            }
	            img.onerror = function() {
                    translateAll(layer, moveableLayers, x, y, reset); // TRANSLATE
	            }
	            img.src = 'png/' + currentLayer + '/' + currentLayer + '-' + selectedIndex[currentLayer] + '.png';
	        }
        }
        else {
            translateAll(layer + 1, moveableLayers, x, y, reset); // TRANSLATE
        }
	}
}

function changeWidth(x) {
    // The greater x is, the wider
    if (layerSelected != null && selectedIndex[layerSelected] != -1) {
    	if (layerSelected == 'eyes' || layerSelected == 'eyebrows') {
	        if (layerWidth[layerSelected] + x >= -2 && layerWidth[layerSelected] + x <= 2) {
	            layerWidth[layerSelected] = layerWidth[layerSelected] + x;
	        }
        	drawImg();
    	}
    }
}

function flip() {
	if (layerSelected != null && selectedIndex[layerSelected] != -1) {
	    var layer = document.querySelector('.layer--' + layerSelected);
	    var ctx = layer.getContext('2d');
	    ctx.scale(-1,1);
	    translateLayer(-32,0);

	    var dPadLeftBtn = document.querySelector('.d-pad__btn--left');
	    var dPadRightBtn = document.querySelector('.d-pad__btn--right');
	    layerFlipped[layerSelected]*=-1;
	    // dPadLeftBtn.onclick = function() {
	    //     translateLayer(-1*layerFlipped[layerSelected],0);
	    // }
	    // dPadRightBtn.onclick = function() {
	    //     translateLayer(1*layerFlipped[layerSelected],0);
	    // }
	}
}

function eraseLayer() {
    if (layerSelected != null) {
        if (layerSelected != 'background') {
            var layer = document.querySelector('.layer--' + layerSelected);
            var ctx = layer.getContext('2d');
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvasX, canvasY);

            if (layerSelected == 'eyebrows' || layerSelected == 'eyes') {
                layerWidth[layerSelected] = 0;
            }
        }
        // Remove previously selected layer thumbnail if present
        var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
        if (prevSelected != null) {
            prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
        }
        selectedIndex[layerSelected] = -1;
    }
}

function eraseAll() {
    var layers = document.querySelectorAll('.layer--exportable');
    for (i = 1; i < layers.length; i++) // Do not delete first layer (background) yet... 
    {
        var ctx = layers[i].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasX, canvasY);
    }
    drawDefaultBackground();

    var prevSelected = document.querySelector('.layer-thumbnails__row__cell--selected');
    if (prevSelected != null) {
        prevSelected.classList.remove('layer-thumbnails__row__cell--selected');
    }
    selectedIndex = {'face': -1, 'hair': -1, 'eyebrows': -1, 'eyes': -1, 'nose': -1, 'mouth': -1, 'facial-hair': -1, 'accessory-1': -1, 'accessory-2': -1, 'accessory-3': -1, 'background': -1}; // Indices start at 0, -1 == nothing selected
    layerColor = {'face': 'rgb(255, 255, 255)', 'hair': 'rgb(255, 255, 255)', 'eyebrows': 'rgb(12,12,12)', 'eyes': 'fixed', 'nose': 'fixed', 'mouth': 'fixed', 'facial-hair': 'rgb(255, 255, 255)', 'accessory-1': 'rgb(255, 111, 63)', 'accessory-2': 'rgb(255, 239, 63)', 'accessory-3': 'rgb(26, 46, 51)', 'background': 'rgb(255, 175, 63)'};
}

function openHelp() {
	var thumbnailContainer = document.querySelector('.layer-thumbnails-container');
	var thumbnailNavContainer = document.querySelector('.layer-thumbnails-nav-container');
	var helpContainer = document.querySelector('.help-container');
	var helpMessageContainer = document.querySelector('.help-message-container');
	if (helpMessageContainer.style.display != 'inline' && helpContainer.style.display != 'inline') { //TODO
    	thumbnailContainer.style.display = 'none';
    	thumbnailNavContainer.style.display = 'none';
		helpContainer.style.display = 'inline';
		helpMessageContainer.style.display = 'inline';

		var lastClicked = document.querySelector('.layers__btn--selected');
		if (lastClicked != null) {
			lastClicked.classList.remove('layers__btn--selected');
		}

		layerSelected = null;
		disablePalette();
		disableDPad();
        disableMoveTools(2,3);

	}
}

function gettingStarted(stepNum) {
	var helpMessageContainer = document.querySelector('.help-message-container');
	var helpMessage = document.querySelector('.help-message');
    var layersBtns = document.querySelectorAll('.layers__btn');
	var layers = document.querySelector('.layers');
	var thumbnailContainer = document.querySelector('.layer-thumbnails-container');
	var paletteContainer = document.querySelector('.palette-container');
    var paletteColors = document.querySelectorAll('.palette__color');

	helpMessageContainer.style.display = 'flex';
	helpMessage.style.display = 'inline';
	switch (stepNum) {
		case 1: {
            disableLeftTools();
            // Custom chooseLayer
		    for (i = 0; i < layersBtns.length; i++) {
		        layersBtns[i].onclick = function() {
        			layerSelected = this.value.toLowerCase().replace(' ','-');
        			this.classList.add('layers__btn--selected');
		            gettingStarted(2);
		        }
		    }
			helpMessage.textContent = 'First, select a feature to add to the canvas (highlighted in orange).';
			layers.style.backgroundColor = '#FFAF3F';
			break;
		}
		case 2: {            
			// Disable layer btns
		    for (i = 0; i < layersBtns.length; i++) {
		        layersBtns[i].onclick = function() {
		        	return false;
		        }
		    }
			layers.style.backgroundColor = 'white';
			loadLayerThumbnails(1, 28);
			thumbnailContainer.style.display = 'flex';
            var thumbnailNavContainer = document.querySelector('.layer-thumbnails-nav-container');
			thumbnailNavContainer.style.display = 'none';
			helpMessage.textContent = 'Next, select any option in the list above.';
			break;
		}
		case 3: {
            disableDPad();
            disableMoveTools(0,4);
			thumbnailContainer.style.display = 'none';
			helpMessage.textContent = 'Now, choose a color in the palette!';
			paletteContainer.style.border = 'solid 6px #FFAF3F';

		    var skinPalette = document.querySelector('.palette--skin');
		    var hairPalette = document.querySelector('.palette--hair');
		    skinPalette.style.display = 'none';
		    hairPalette.style.display = 'none';
		    if (layerSelected == 'face') {
		        skinPalette.style.display = 'flex';
		    }
		    else if (layerSelected == 'hair' || layerSelected == 'eyebrows' || layerSelected == 'facial-hair') {
		        hairPalette.style.display = 'flex';
		    }
			break;
		}
		case 4: {
			paletteContainer.style.border = 'none';
			thumbnailContainer.style.display = 'none';
			var layerSelectedText = layerSelected;
			if (layerSelected == null) {
				layerSelectedText = '?';
			}
			else if (layerSelected.includes('accessory')) {
				layerSelectedText = 'accessory';
			}
			else if (layerSelected == 'facial-hair') {
				layerSelectedText = 'facial hair';
			}
			helpMessage.textContent = 'Great job! You have successfully added a ' + layerSelectedText +' to your sprite!';
    		var helpNavContainer = document.querySelector('.help-nav-container');
    		helpNavContainer.style.display = 'flex';

    		var helpNavNext = document.querySelector('.help-nav__btn--next');
    		var lastClicked = document.querySelector('.layers__btn--selected');
    		helpNavNext.style.display = 'flex';
    		helpNavNext.onclick = function() {
                var helpContainer = document.querySelector('.help-container');
                helpMessage.textContent = '';
                helpMessage.style.display = 'none';
                helpContainer.style.display = 'none';
                helpMessageContainer.style.display = 'none';
                helpNavContainer.style.display = 'none';
                chooseLayer(lastClicked);
                enableLeftTools();
                for (i = 0; i < layersBtns.length; i++) {
                    layersBtns[i].onclick = function() {
                        chooseLayer(this);
                    }
                }
    		}
    		break;
		}
	}
}

function changingPosition(stepNum) {
    var helpMessageContainer = document.querySelector('.help-message-container');
    var helpMessage = document.querySelector('.help-message');
    var helpNavNext = document.querySelector('.help-nav__btn--next');

    helpMessageContainer.style.display = 'flex';
    helpMessage.style.display = 'inline';
    switch (stepNum) {
        case 1: {
            var helpNavContainer = document.querySelector('.help-nav-container');
            helpNavContainer.style.display = 'flex';
            helpNavNext.style.display = 'flex';
            helpNavNext.onclick = function() {
                changingPosition(2);
            }
            helpMessage.textContent = 'The buttons below (highlighted in orange) are used to change positions.';
            break;
        }
        case 2: {
            helpNavNext.onclick = function() {
                changingPosition(3);
            }
            helpMessage.textContent = 'The widen button widens.';
            break;
        }
        case 3: {
            helpNavNext.onclick = function() {
                changingPosition(4);
            }
            helpMessage.textContent = 'The narrow button narrows.';
            break;
        }
        case 4: {
            helpNavNext.onclick = function() {
                changingPosition(5);
            }
            helpMessage.textContent = 'The flip button flips.';
            break;
        }
        case 5: {
            helpNavNext.onclick = function() {
                var helpNavContainer = document.querySelector('.help-nav-container');
                helpNavContainer.style.display = 'none';
                helpNavNext.style.display = 'none';
                helpMessageContainer.style.display = 'none';
                helpMessage.style.display = 'none';
                openHelp();
            }
            helpMessage.textContent = 'The move all button moves all.';
            break;
        }
    }
}

function fixingMistakes(stepNum) {
    var helpMessageContainer = document.querySelector('.help-message-container');
    var helpMessage = document.querySelector('.help-message');
    var helpNavNext = document.querySelector('.help-nav__btn--next');

    helpMessageContainer.style.display = 'flex';
    helpMessage.style.display = 'inline';
    switch (stepNum) {
        case 1: {
            var helpNavContainer = document.querySelector('.help-nav-container');
            helpNavContainer.style.display = 'flex';
            helpNavNext.style.display = 'flex';
            helpNavNext.onclick = function() {
                fixingMistakes(2);
            }
            helpMessage.textContent = 'The buttons to the left (highlighted in orange) are used to fix mistakes.';
            break;
        }
        case 2: {
            helpNavNext.onclick = function() {
                fixingMistakes(3);
            }
            helpMessage.textContent = 'The erase layer button erases the layer.';
            break;
        }
        case 3: {
            helpNavNext.onclick = function() {
                fixingMistakes(4);
            }
            helpMessage.textContent = 'The reset position button resets the position.';
            break;
        }
        case 4: {
            helpNavNext.onclick = function() {
                fixingMistakes(5);
            }
            helpMessage.textContent = 'The erase all button erases all layers.';
            break;
        }
        case 5: {
            helpNavNext.onclick = function() {
                var helpNavContainer = document.querySelector('.help-nav-container');
                helpNavContainer.style.display = 'none';
                helpNavNext.style.display = 'none';
                helpMessageContainer.style.display = 'none';
                helpMessage.style.display = 'none';
                openHelp();
            }
            helpMessage.textContent = 'The reset all button resets all positions.';
            break;
        }
    }
}

function savingSharing(stepNum) {
    var helpMessageContainer = document.querySelector('.help-message-container');
    var helpMessage = document.querySelector('.help-message');
    var helpNavNext = document.querySelector('.help-nav__btn--next');

    helpMessageContainer.style.display = 'flex';
    helpMessage.style.display = 'inline';
    switch (stepNum) {
        case 1: {
            var helpNavContainer = document.querySelector('.help-nav-container');
            helpNavContainer.style.display = 'flex';
            helpNavNext.style.display = 'flex';
            helpNavNext.onclick = function() {
                savingSharing(2);
            }
            helpMessage.textContent = 'The buttons to the left (highlighted in orange) are used to save and share.';
            break;
        }
        case 2: {
            helpNavNext.onclick = function() {
                savingSharing(3);
            }
            helpMessage.textContent = 'The save button saves.';
            break;
        }
        case 3: {
            helpNavNext.onclick = function() {
                var helpNavContainer = document.querySelector('.help-nav-container');
                helpNavContainer.style.display = 'none';
                helpNavNext.style.display = 'none';
                helpMessageContainer.style.display = 'none';
                helpMessage.style.display = 'none';
                openHelp();
            }
            helpMessage.textContent = 'The share button shares.';
            break;
        }
    }
}

function saveImg() {
	var exportedImg = imgToDataURI();
    restoreSaveLayer();
    if (window.matchMedia('(max-width: 500px)').matches) {
        var exportImgContainer = document.querySelector('.export-img-container');
        var exportImg = document.querySelector('.export-img');
        exportImgContainer.style.display = 'flex';
        exportImg.textContent = '';
        var img = new Image();
        img.style.height = '280px';
        img.style.width = '280px';
        img.onload = function() {
            exportImg.append(img);
        }
        img.src = exportedImg;
    }
    else {
        var a = document.createElement('a');
        a.style.display = 'none';
        a.download = 'sprite.png';
        a.href = exportedImg;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function imgToDataURI() {
	var layers = document.querySelectorAll('.layer--exportable');
	var saveLayer = document.querySelector('.layer--save');
	var ctx = saveLayer.getContext('2d');
	ctx.drawImage(layers[0], 0, 0); //Background does not need rescale
	ctx.scale(multiplier, multiplier);
	for (i = 1; i < layers.length; i++)
	{
	    ctx.drawImage(layers[i],0,0);
	}
	// Draw Bitcamp logo
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.font='20px Aleo Bold';
	ctx.fillStyle = 'white';
	ctx.fillText('bitcamp 2018',384,504);
	var campfire = new Image();
	campfire.src = 'svg/background/campfire-white.svg';
	ctx.drawImage(campfire, 348,478,32,32);
    return saveLayer.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Convert image to 'octet-stream' (Just a download, really)
}

function dataURIToBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

function restoreSaveLayer() {
	var saveLayer = document.querySelector('.layer--save');
	var ctx = saveLayer.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
}

function disableShareBtn() {
    var shareBtn = document.querySelector('.export-tools__btn--share');
    shareBtn.classList.add('export-tools__btn--selected');
    shareBtn.onclick = function() {
		return false;
    }
}

function openFacebookOptions() {
    var facebookLoginContainer = document.querySelector('.export-options-login--facebook');
    var facebookExportOptions = document.querySelector('.export-options--facebook');
    facebookExportOptions.style.display = 'flex';
    facebookLoginContainer.style.display = 'none';
}

function shareFacebookImg() {
    var facebookLoginContainer = document.querySelector('.export-options-login--facebook');
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            logOutDisplay('inline');
            FB.api('/me/permissions', function(permissionsResponse) {
                var permissions = permissionsResponse.data;
                if (permissions[0].permission == 'publish_actions' && permissions[0].status == 'granted') {
                    openFacebookOptions();
                }
                else {
                    unauthResponse();
                    facebookLoginContainer.style.display = 'none';
                }
            });
        }
        else {
            unauthResponse();
            facebookLoginContainer.style.display = 'none';
        }
    });
}

function logOutDisplay(display) {
    var logOutLink = document.querySelector('.logout__link');
    logOutLink.style.display = display;
}

function shareFacebookImgAuth() {
    var shareCancel = document.querySelector('.export-options__btn--no--facebook');
    var shareFacebookSubmit = document.querySelector('.export-options__btn--yes--facebook');
    shareFacebookSubmit.onclick = function() {
        return false;
    }
    var exportedImg = imgToDataURI();
    restoreSaveLayer();
	var imgBlob = dataURIToBlob(exportedImg);
	var accessToken = FB.getAuthResponse().accessToken;
    var fd = new FormData();
    fd.append('access_token', accessToken);
    fd.append('source', imgBlob);

	var photoText = document.querySelector('.export-options--photo__text');
    fd.append('caption', photoText.value);

	var timelineText = document.querySelector('.export-options--timeline__text');
    var shareTimelineBtn = document.querySelector('.export-options--timeline__btn');
	if (shareTimelineBtn.checked) {
    	fd.append('no_story', false);
	}
	else {
    	fd.append('no_story', true);
	}

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://graph.facebook.com/photos?access_token=' + accessToken);
	// Define what happens on successful data submission
	xhr.onload = function() {
	    if (xhr.status === 200) {
	    	alert('Successfully uploaded to Facebook!');
			console.log(xhr);
	    	var photoID = JSON.parse(xhr.responseText).id;
	    	console.log('Photo ID: ' + photoID);
			var xhr2 = new XMLHttpRequest();
			xhr2.open('GET', 'https://graph.facebook.com/' + photoID + '?fields=images&access_token=' + accessToken);
			xhr2.onload = function() {
				console.log(xhr2);
				var images = JSON.parse(xhr2.responseText).images;
				var sourceURL = images[0].source;
				console.log(sourceURL);
			}
			xhr2.send();

			if (shareTimelineBtn.checked) {
				FB.api(
				    '/me/feed',
				    'POST',
				    {
				        'message': timelineText.value,
				        'object_attachment': photoID
				    },
				    function (response) {
						if (response && !response.error) {
							alert('Successfully shared to Timeline!');
                            shareCancel.click();
						}
						else {
							console.log(response.error);
						}
				    }
				);
			}
	    }
	    else {
	    	console.log(xhr.responseText);
	    }
	};
	xhr.send(fd);
    shareFacebookSubmit.onclick = function() {
        // FB.AppEvents.logEvent('Shared Sprite');
        shareFacebookImgAuth();
    }
}

function shareStatus(text) {
	var title = document.querySelector('.export-options__title');
	title.innerHTML = text;
}

function unauthResponse() {
    alert('User cancelled login or did not fully authorize.');
    var shareBtn = document.querySelector('.export-tools__btn--share');
    shareBtn.classList.remove('export-tools__btn--selected');
}

function disableLeftTools() {
    var mainTools = document.querySelectorAll('.main-tools__btn');
    var exportTools = document.querySelectorAll('.export-tools__btn');
    for (i = 0; i < mainTools.length; i++) {
        mainTools[i].onclick = function() {
            return false;
        }
    }
    for (j = 0; j < exportTools.length; j++) {
        exportTools[j].onclick = function() {
            return false;
        }

    }

}

function enableLeftTools() {
    var eraseLayerBtn = document.querySelector('.main-tools__btn--erase-layer');
    eraseLayerBtn.onclick = function() {
        eraseLayer();
        if (layerSelected != 'background') {
            if (layerColor[layerSelected] != 'fixed') {
                // if (layerSelected.includes('accessory')) {
                //     layerColor[layerSelected] = '#000000';
                // }
                // else {
                //     layerColor[layerSelected] = '#FFFFFF';
                // }
            }
        }
        else {
            layerColor['background'] = 'rgb(255, 175, 63)';
            drawDefaultBackground();
        }
        disablePalette();
        disableDPad();
        disableMoveTools(0,3);
    }
    var eraseAllBtn = document.querySelector('.main-tools__btn--erase-all');
    eraseAllBtn.onclick = function() {
        eraseAll();
        disablePalette();
        disableDPad();
        disableMoveTools(0,3);

    }
    // enableShareBtn();
    var saveBtn = document.querySelector('.export-tools__btn--save');
    saveBtn.onclick = function() {
        // FB.AppEvents.logEvent('Saved Sprite');
        // Preload
        var campfire = new Image();
        campfire.onload = function() {
            saveImg();
        }
        campfire.src = 'svg/background/campfire-white.svg';
    }
}