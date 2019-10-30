//Roiugh Loop for neon hotel logo
TweenMax.from("#hotelLogo", 2, { opacity: 0, repeat:-1, repeatDelay:5, ease: RoughEase.ease.config({ template:  Sine.easeOut, strength: 2.5, points: 10, taper: "out", randomize: false, clamp: false})});

let animVelocity = 0.5;
let tl = new TimelineMax({paused: true});

tl
    .to("#logosBox", animVelocity, {x: -1000, ease: Back.easeInOut.config(1.4)})
    .to("#avatarNamegBox", animVelocity, {left: 0, ease: Back.easeInOut.config(1.4)})
    .addLabel("configName")
    .to("#avatarNamegBox", animVelocity, {left: -2500, ease: Back.easeInOut.config(1.4)})
    .to("#avatarConfigBox", animVelocity, {left: 0, ease: Back.easeInOut.config(1.4)})
    .addLabel("configAvatar")
    .to("#avatarConfigBox", animVelocity, {left: -2500, ease: Back.easeInOut.config(1.4)})
    .to("#officeSelectorMenu", animVelocity, {left: 0, ease: Back.easeInOut.config(1.4)})
    .addLabel("selectOffice")
    .to("#mainScreen", animVelocity*2, {left: -2500, ease: Back.easeOut.config(1.4)})
    .addLabel("openApp")
