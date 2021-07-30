<?php
    require "./lib/steamauth/steamauth.php";
    $disallowUser = false;
    if(isset($_SESSION['steamid'])) {
        include ('./lib/steamauth/userInfo.php'); //To access the $steamprofile array
        $banned = getenv('BANNED_ID');
        if($steamprofile['steamid'] === $banned) {
            echo "<h1>You are banned from this site!!</h1>";
            echo "<a href='https://steamcommunity.com/app/1596310/discussions/0/5739253211807357811/#c3055114706804901676'>WHY?</a>";
            die();
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="description" content="Calculate the best GPU combination for your customer's orders. Crypto Mining Simulator is a PC game where you can build your virtual mining empire."/>
    <meta name="tags" content="gpu, mining, crypto, pc, game, simulator"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:creator" content="@xlshallox"/>
    <meta property="og:url" content="https://lshallo.github.io/crypto-calc"/>
    <meta property="og:title" content="Crypto Mining Simulator Calculator"/>
    <meta property="og:description" content="Calculate the best GPU combination for your customer's orders. Crypto Mining Simulator is a PC game where you can build your virtual mining empire."/>
    <meta property="og:image" content="https://lshallo.github.io/crypto-calc/img/card.jpg"/>
    <title>Crypto Mining Simulator Calculator</title>
    <link rel="stylesheet" href="css/bootstrap.min.css"/>
    <link rel="stylesheet" href="css/calculator.css"/>
    <link rel="icon" href="img/favicon.png" id="favicon">
</head>
<body>
    <div class="bg-image" id="bg-container">
        <canvas id="background"></canvas>
    </div>
    <div class="settings backdrop-blur">
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="faviconAnim" checked>
            <label class="form-check-label" for="faviconAnim">
                Animate Favicon
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gpuAnim" checked>
            <label class="form-check-label" for="gpuAnim">
                Animate GPUs
            </label>
        </div>
        <?php
            if(isset($_SESSION['steamid'])) {
                logoutbutton();
            }
        ?>
    </div>
    <div class="form-container backdrop-blur">
        <div class="row mb-3">
            <label class="col-form-label col-sm-3" for="hash">Hashpower</label>
            <div class="col-sm-9">
                <div class="input-group">
                    <input type="text" class="form-control" id="hash" placeholder="100">
                    <div class="input-group-text">MH/s</div>
                </div>
            </div>
        </div>
        <div class="row mb-3">
            <label for="cardNum" class="col-sm-3 col-form-label">Max. Cards</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" id="cardNum" placeholder="2" value="2">
            </div>
        </div>
        <hr>
        <div id="result" class="result-box"></div>
        <div id="warning" class="alert alert-warning hidden mt-3">
            ERROR
        </div>
    </div>

    <div class="hidden">
        <canvas id="hidden-canvas"></canvas>
    </div>

    <div id="coffee">
        <a target="_blank" href="https://www.buymeacoffee.com/lshallo">
            <img alt="Buy Me A Coffee Logo" src="img/coffee.png">
            <div class="flyout">
                Support me!
            </div>
        </a>
    </div>

    <div class="banner">
        <?php
            if(!isset($_SESSION['steamid'])) {
                echo('<div class="filler hidden">
            <div class="text">
                It would be nice if you could allow ads!<br>
                ' . (isset($_SESSION['steamid'])?'':'Login with Steam to get rid of them!<br>'.loginbutton("rectangle")) . '
            </div>
        </div>');
            echo '<iframe data-aa="1640574" src="//acceptable.a-ads.com/1640574?size=Adaptive&background_color=3c3c3c" style="border:0; padding:0; width:100%; height:100%; overflow:hidden" allowtransparency="true"></iframe>';
            }
        ?>
    </div>

    <script>
        setTimeout(() => {
            let fillers = document.getElementsByClassName('filler');
            for(let filler of fillers) {
                filler.style.opacity = '0';
                filler.classList.remove('hidden');
                for(let k = 0; k < 1; k += 0.1) {
                    setTimeout(() => {
                        filler.style.opacity = `${k}`;
                    }, k * 150);
                }
            }
        }, 1000);
    </script>
    <script src="js/calculator.js"></script>
    <script src="js/fallingCard.js"></script>
    <script src="js/favicon.js"></script>
    <script src="js/bg-renderer.js"></script>
</body>
</html>