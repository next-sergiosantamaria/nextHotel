//Roiugh Loop for neon hotel logo
TweenMax.from("#hotelLogo", 2, { opacity: 0, repeat:-1, repeatDelay:5, ease: RoughEase.ease.config({ template:  Sine.easeOut, strength: 2.5, points: 10, taper: "out", randomize: false, clamp: false})});


var tl = new TimelineMax({paused: true});

tl
    .to("#logosBox", 0.3, {x: -1000, ease: Back.easeInOut.config(1.4)})
    .to("#avatarConfigBox", 0.3, {left: 0, ease: Back.easeInOut.config(1.4)})
    .addLabel("configAvatar")
    .to("#avatarConfigBox", 0.3, {left: -2500, ease: Back.easeInOut.config(1.4)})
    .to("#officeSelectorMenu", 0.3, {left: 0, ease: Back.easeInOut.config(1.4)})
    .addLabel("selectOffice")
    .to("#mainScreen", 0.3, {left: -2500, ease: Back.easeOut.config(1.4)})
    .addLabel("openApp")
