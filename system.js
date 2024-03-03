let objects = document.getElementsByClassName("ground")

let player
let playerStyle
let playerSize = [0, 0]

let playerImage

let gravity = -9.81
let yVelocity = 0
let jumpState = false
let jumpForce = 9.81
let jumpDuration = 0
let jumpTrigger = false

let grounded = false
let collisions = [false, false, false, false]   //left, right, top, bottom
let colliders = [null, null, null, null]        //left, right, top, bottom
let offset = 5

let moveLeftTrigger = false
let moveRightTrigger = false
let moveAmount = 10

let enterTrigger = false

let animationState = "idle"
let defualtAnimationPath = "ImageAnimations/"
let idleAnimation = ["Idle1.png", "Idle2.png", "Idle3.png", "Idle4.png"]
let walkAnimation = ["Walk1.png", "Walk2.png", "Walk3.png", "Walk4.png", "Walk5.png", "Walk6.png", "Walk7.png", "Walk8.png"]
let jumpAnimation = ["Jump2.png"]

let currentTrack = 0
let animFrameDelay = 0

let sectorCount = 1
let totalSectorWidth = 1500
let maxSectorsLoaded = 4
let theBorder
let totalSectors = 1
let prevSectorType = -1

let oxygenBar
let oxygen = 100

let scoreBar
let score = 0
let bestScore = localStorage.getItem("score")
if (!bestScore){
    bestScore = 0
    localStorage.setItem("score", 0)
} 
let span

let gameOverDelay = 0
let gameOverScreen
let goodText

let backgroundMusic = new Audio("Audio/BackgroundMusic.mp3")
backgroundMusic.loop = true
backgroundMusic.volume = 0.3
let gameOverAudio

let audioMute = document.getElementById("audio-mute")
let audioMuted = true

let mobile_left = false
let mobile_right = false


function spawnPlayer(left_position, top_position) {
    player = document.createElement("div")
    
    playerStyle = player.style

    //playerStyle.backgroundColor = "#00ff00"
    playerStyle.width = "150px"
    playerStyle.height = "150px"

    playerStyle.position = "absolute"
    playerStyle.top = top_position
    playerStyle.left = left_position

    playerImage = document.createElement("img")

    playerImageStyle = playerImage.style

    playerImageStyle.width = "250px"
    playerImageStyle.height = "250px"

    playerImageStyle.position = "absolute"
    playerImageStyle.left = "-50px"
    playerImageStyle.top = "-85px"

    playerSize[0] = convertPixelsToFloat(playerStyle.width) + convertPixelsToFloat(playerStyle.padding) + convertPixelsToFloat(playerStyle.borderWidth)
    playerSize[1] = convertPixelsToFloat(playerStyle.height) + convertPixelsToFloat(playerStyle.padding) + convertPixelsToFloat(playerStyle.borderWidth)

    document.body.appendChild(player)
    player.appendChild(playerImage)

}

function convertPixelsToFloat(pixels){
    let pixelFloat = parseFloat(pixels.slice(0, pixels.length -2)) || 0

    return pixelFloat
}

function isPositionInElement(position, element){
    let inside = false

    let x = position[0]
    let y = position[1]

    let insideX = false
    let insideY = false

    let elementStyle = window.getComputedStyle(element)
    let elementWidth = convertPixelsToFloat(elementStyle.width)
    let elementHeight = convertPixelsToFloat(elementStyle.height)
    let elementPadding = convertPixelsToFloat(elementStyle.padding)
    let elementBorder = convertPixelsToFloat(elementStyle.borderWidth)

    let elementSizeX = elementWidth + elementPadding + elementBorder
    let elementSizeY = elementHeight + elementPadding + elementBorder
    let elementPositionX = convertPixelsToFloat(elementStyle.left)
    let elementPositionY = convertPixelsToFloat(elementStyle.top)

    if (x >= elementPositionX && x <= elementPositionX + elementSizeX){
        insideX = true
    }
    if (y >= elementPositionY && y <= elementPositionY + elementSizeY){
        insideY = true
    }

    if (insideX && insideY){
        inside = true
    }

    return inside
}

function handleCollisions(){
    if (!player || !playerStyle) return

    let pLeft = convertPixelsToFloat(playerStyle.left)
    let pTop = convertPixelsToFloat(playerStyle.top)

    let bottomLeftPoint = [pLeft + offset, pTop + playerSize[1] + offset]
    let bottomRightPoint = [pLeft + playerSize[0] - offset, pTop + playerSize[1] + offset]

    let rightTopPoint = [pLeft + playerSize[0] + offset, pTop + offset]
    let rightBottomPoint = [pLeft + playerSize[0] + offset, pTop + playerSize[1] - offset]

    let leftTopPoint = [pLeft - offset, pTop + offset]
    let leftBottomPoint = [pLeft - offset, pTop + playerSize[1] - offset]

    let topLeftPoint = [pLeft + offset, pTop - offset]
    let topRightPoint = [pLeft + playerSize[0] - offset, pTop - offset]

    let bottom = false
    let right = false
    let left = false
    let top = false

    let bottomCollider = null
    let rightCollider = null
    let leftCollider = null
    let topCollider = null

    for (let object of objects){
        let bottomLeft = isPositionInElement([bottomLeftPoint[0], bottomLeftPoint[1]], object)
        let bottomRight = isPositionInElement([bottomRightPoint[0], bottomRightPoint[1]], object)

        let rightTop = isPositionInElement([rightTopPoint[0], rightTopPoint[1]], object)
        let rightBottom = isPositionInElement([rightBottomPoint[0], rightBottomPoint[1]], object)

        let leftTop = isPositionInElement([leftTopPoint[0], leftTopPoint[1]], object)
        let leftBottom = isPositionInElement([leftBottomPoint[0], leftBottomPoint[1]], object)

        let topLeft = isPositionInElement([topLeftPoint[0], topLeftPoint[1]], object)
        let topRight = isPositionInElement([topRightPoint[0], topRightPoint[1]], object)

        if (bottomLeft || bottomRight){
            bottom = true
            bottomCollider = object
        }

        if (rightTop || rightBottom){
            right = true
            rightCollider = object
        }

        if (leftTop || leftBottom){
            left = true
            leftCollider = object
        }

        if (topLeft || topRight){
            top = true
            topCollider = object
        }
    }

    collisions[3] = bottom
    colliders[3] = bottomCollider

    collisions[1] = right
    colliders[1] = rightCollider

    collisions[0] = left
    colliders[0] = leftCollider

    collisions[2] = top
    colliders[2] = topCollider
}

function checkGround(){
    if (collisions[3]){
        grounded = true
    }
    else{
        grounded = false
    }
}

function applyGravity(){
    if (!player || !playerStyle) return

    let currentTop = convertPixelsToFloat(playerStyle.top)
    
    playerStyle.top = (currentTop - yVelocity) + "px"
}

function fixGravity(){
    if (collisions[3] && colliders[3]){
        let collider = colliders[3]
        let colliderStyle = window.getComputedStyle(collider)
        let colliderTop = convertPixelsToFloat(colliderStyle.top)

        playerStyle.top = colliderTop - playerSize[1] + "px"
    }
}

function applyJump(){
    if (!player || !playerStyle) return
    if (collisions[2] && colliders[2]) return

    let currentTop = convertPixelsToFloat(playerStyle.top)
    
    playerStyle.top = (currentTop - yVelocity) + "px"
}

function fixJump(){
    if (collisions[2] && colliders[2]){
        let collider = colliders[2]
        let colliderStyle = window.getComputedStyle(collider)
        let colliderTop = convertPixelsToFloat(colliderStyle.top)
        let colliderSize = convertPixelsToFloat(colliderStyle.height)

        playerStyle.top = colliderTop + colliderSize + offset + offset/2 + "px"

        yVelocity = 0
        jumpState = false
        jumpDuration = 0
    }
}

function jump(){
    if (!jumpState && grounded){
        jumpState = true
    }
}

function moveLeft(){
    mobile_left = false

    if (!player || !playerStyle) return

    if (!collisions[0]){
        playerStyle.left = convertPixelsToFloat(playerStyle.left) - moveAmount + "px"
    }
    else{
        if (colliders[0] && !grounded){
            let collider = colliders[0]
            let colliderStyle = window.getComputedStyle(collider)
            let colliderLeft = convertPixelsToFloat(colliderStyle.left)
            let colliderSize = convertPixelsToFloat(colliderStyle.width)
    
            playerStyle.left = colliderLeft + colliderSize + "px"
        }
    }
}

function moveRight(){
    mobile_right = false

    if (!player || !playerStyle) return

    if (!collisions[1]){
        playerStyle.left = convertPixelsToFloat(playerStyle.left) + moveAmount + "px"
    }
    else{
        if (colliders[1] && !grounded){
            let collider = colliders[1]
            let colliderStyle = window.getComputedStyle(collider)
            let colliderLeft = convertPixelsToFloat(colliderStyle.left)
    
            playerStyle.left = colliderLeft - convertPixelsToFloat(playerStyle.width) + "px"
        }
    }
}

function playerFollowCamera(){
    if (!player || !playerStyle) return

    let height = window.innerHeight
    let width = window.innerWidth

    let leftScroll = convertPixelsToFloat(playerStyle.left)
    let topScroll = convertPixelsToFloat(playerStyle.top)

    leftScroll -= width/2
    topScroll -= height/2

    if (window.innerWidth <= 800){
        leftScroll += 200
    }

    window.scrollTo(leftScroll, 0)
}

function animatePlayer(){
    if (jumpState || !grounded){
        if (animationState != "jump"){
            animationState = "jump"
            currentTrack = 0
        }
    }
    else{
        if (moveLeftTrigger || moveRightTrigger){
            {
                if (animationState != "walk"){
                    animationState = "walk"
                    currentTrack = 0
                }
            }
        }
        else{
            if (animationState != "idle"){
                animationState = "idle"
                currentTrack = 0
            }
        }
    }
   
    if (moveLeftTrigger){
        playerImage.style.transform = "scaleX(-1)"
    }
    else if (moveRightTrigger){
        playerImage.style.transform = "scaleX(1)"
    }

    if (animFrameDelay > 0){
        animFrameDelay -= 1
    }
    else{
        animFrameDelay = 5

        if (animationState == "idle"){
            let currentTrackPath = defualtAnimationPath + idleAnimation[currentTrack]
    
            playerImage.src = currentTrackPath
    
            currentTrack += 1
            if (currentTrack > idleAnimation.length-1) currentTrack = 0
        }
        else if (animationState == "walk"){
            let currentTrackPath = defualtAnimationPath + walkAnimation[currentTrack]
    
            playerImage.src = currentTrackPath
    
            currentTrack += 1
            if (currentTrack > walkAnimation.length-1) currentTrack = 0
        }
        else if (animationState == "jump"){
            let currentTrackPath = defualtAnimationPath + jumpAnimation[currentTrack]
    
            playerImage.src = currentTrackPath
    
            currentTrack += 1
            if (currentTrack > jumpAnimation.length-1) currentTrack = 0
        }

    }
}

function getRandomNumber(rangeMin, rangeMax){
    if (rangeMin >= rangeMax) return 0

    let rangeDif = Math.abs(rangeMin - rangeMax)

    let rn = Math.floor(Math.random() * (rangeDif +1))

    rn = rangeMin +rn

    return rn
}

function getStarOrb(defPlatform, leftOffset, topOffset, sector){
    let block1 = document.createElement("img")
    block1.classList = "block ground"
    block1.src = "LevelAssets/StarOrb.png"
    block1.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    block1.style.top = topOffset + "px"
    block1.style.width = "150px"
    block1.style.height = "150px"
    block1.style.animationName = "orb"
    block1.style.animationDuration = 5 + "s"
    block1.style.animationIterationCount = "infinite"
    sector.appendChild(block1)

    return block1
}

function getGrassBlock(defPlatform, leftOffset, topOffset, sector){
    let block0 = document.createElement("img")
    block0.classList = "def-block"
    block0.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    block0.style.top = topOffset + "px"
    block0.src = "LevelAssets/Grass_block.png"
    sector.appendChild(block0)

    let collider = document.createElement("div")
    collider.classList = "ground"
    collider.style.left = convertPixelsToFloat(block0.style.left) + 10 + "px"
    collider.style.position = "absolute"
    collider.style.top = topOffset + 60 + "px"
    collider.style.width = "225px"
    collider.style.height = "125px"
    sector.appendChild(collider)

    return block0, collider
}

function getTree(defPlatform, leftOffset, topOffset, sector){
    let tree = document.createElement("img")
    tree.style.position = "absolute"
    tree.style.width = "350px"
    tree.style.height = "500px"
    tree.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    tree.style.top = topOffset + "px"
    tree.style.zIndex = -3
    tree.src = "LevelAssets/Tree_01.png"
    sector.appendChild(tree)

    let collider0 = document.createElement("div")
    collider0.classList = "ground"
    collider0.style.position = "absolute"
    collider0.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    collider0.style.top = topOffset + "px"
    collider0.style.height = "250px"
    collider0.style.width = "350px"
    sector.appendChild(collider0)

    let collider1 = document.createElement("div")
    collider1.classList = "ground"
    collider1.style.position = "absolute"
    collider1.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + 140 + "px"
    collider1.style.top = topOffset + "px"
    collider1.style.height = "500px"
    collider1.style.width = "70px"
    sector.appendChild(collider1)

    return tree, collider0, collider1
}

function getOxygen(defPlatform, leftOffset, topOffset, sector){
    let oxygen = document.createElement("img")
    oxygen.classList = "oxygen"
    oxygen.style.position = "absolute"
    oxygen.style.width = "150px"
    oxygen.style.height = "150px"
    oxygen.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    oxygen.style.top = topOffset + "px"
    oxygen.src = "LevelAssets/Oxygen.png"
    oxygen.style.animationName = "oxygen"
    oxygen.style.animationDuration = 1 + "s"
    oxygen.style.animationIterationCount = "infinite"
    sector.appendChild(oxygen)

    return oxygen
}

function getKey(defPlatform, leftOffset, topOffset, sector){
    let key = document.createElement("img")
    key.classList = "key"
    key.style.position = "absolute"
    key.style.width = "100px"
    key.style.height = "50px"
    key.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    key.style.top = topOffset + "px"
    key.src = "LevelAssets/Key.png"
    key.style.animationName = "oxygen"
    key.style.animationDuration = 1 + "s"
    key.style.animationIterationCount = "infinite"
    sector.appendChild(key)

    return key
}

function getLockedDoor(defPlatform, leftOffset, topOffset, sector){
    let door  = document.createElement("img")
    door.classList = "door"
    door.style.position = "absolute"
    door.style.width = "300px"
    door.style.height = "480px"
    door.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    door.style.top = topOffset + "px"
    door.style.zIndex = 10
    door.src = "LevelAssets/Door.png"
    sector.appendChild(door)

    let collider = document.createElement("div")
    collider.classList = "ground door-collider"
    collider.style.position = "absolute"
    collider.style.width = "300px"
    collider.style.height = "1000px"
    collider.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    collider.style.top = "0px"
    sector.appendChild(collider)

    return door
}

function getRose(defPlatform, leftOffset, topOffset, sector){
    let rose = document.createElement("img")
    rose.classList = "rose"
    rose.style.position = "absolute"
    rose.style.width = "75px"
    rose.style.height = "125px"
    rose.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + 25 + "px"
    rose.style.top = topOffset + "px"
    rose.style.filter = "drop-shadow(0 0 10px #ff0000)"
    rose.style.animationName = "rose"
    rose.style.animationDuration = "1s"
    rose.style.animationIterationCount = "infinite"
    rose.src = "LevelAssets/Rose.png"
    sector.appendChild(rose)

    return rose
}

function getMetalGear(defPlatform, leftOffset, topOffset, sector){
    let metalGear = document.createElement("img")
    metalGear.classList = "metal-gear"
    metalGear.style.position = "absolute"
    metalGear.style.width = "125px"
    metalGear.style.height = "125px"
    metalGear.style.left = convertPixelsToFloat(defPlatform.style.left) + leftOffset + "px"
    metalGear.style.top = topOffset + "px"
    metalGear.style.filter = "drop-shadow(0 0 10px #ffffff)"
    metalGear.style.animationName = "gear"
    metalGear.style.animationDuration = "3s"
    metalGear.style.animationIterationCount = "infinite"
    metalGear.style.color = "#000000"
    metalGear.style.transition = "top 3s"
    metalGear.src = "LevelAssets/MetalGear.png"
    sector.appendChild(metalGear)

    return metalGear
}

function generateNextSector(){
    let sector = document.createElement("section")
    sector.classList = "actual-sector"
    let sectorWidth = 1500

    let defPlatform = document.createElement("div")
    defPlatform.classList = "ground platform game-sector"
    defPlatform.style.left = (totalSectorWidth) + "px"
    sector.appendChild(defPlatform)

    let sectorType = getRandomNumber(0, 9)

    while (prevSectorType == sectorType){
        sectorType = getRandomNumber(0, 9)
    }

    prevSectorType = sectorType

    //sectorType = 9

    if (sectorType == 0){
        sectorWidth = 1500
        defPlatform.style.width = sectorWidth + "px"

        getGrassBlock(defPlatform, 250, 610, sector)
        getStarOrb(defPlatform, 800, 350, sector)
        getStarOrb(defPlatform, 1100, 150, sector)
        getTree(defPlatform, 1200, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 50, sector)
    }
    else if (sectorType == 1){
        sectorWidth = 3500
        defPlatform.style.width = sectorWidth + "px"

        getGrassBlock(defPlatform, 350, 610, sector)
        getStarOrb(defPlatform, 950, 350, sector)
        getStarOrb(defPlatform, 1500, 350, sector)
        getStarOrb(defPlatform, 2000, 350, sector)
        getStarOrb(defPlatform, 2500, 350, sector)
        getStarOrb(defPlatform, 3000, 350, sector)
        getTree(defPlatform, 3200, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 50, sector)
        getOxygen(defPlatform, 1500, 150, sector)
    }
    else if (sectorType == 2){
        sectorWidth = 2000
        defPlatform.style.width = sectorWidth + "px"

        getGrassBlock(defPlatform, 1150, 610, sector)
        getStarOrb(defPlatform, 850, 350, sector)
        getStarOrb(defPlatform, 500, 150, sector)
        getStarOrb(defPlatform, 500, 0, sector)
        getStarOrb(defPlatform, 500, -150, sector)

        getKey(defPlatform, 750, 100, sector)
        getLockedDoor(defPlatform, 1700, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }
    else if (sectorType == 3){
        sectorWidth = 1800
        defPlatform.style.width = sectorWidth + "px"

        getRose(defPlatform, 425, 600, sector)
        getRose(defPlatform, 550, 600, sector)
        getRose(defPlatform, 675, 600, sector)
        getRose(defPlatform, 1000, 600, sector)
        getRose(defPlatform, 1125, 600, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }
    else if (sectorType == 4){
        sectorWidth = 1800
        defPlatform.style.width = sectorWidth + "px"

        getRose(defPlatform, 175, 600, sector)
        getRose(defPlatform, 300, 600, sector)
        getRose(defPlatform, 425, 600, sector)
        getGrassBlock(defPlatform, 550, 610, sector)
        getRose(defPlatform, 730, 575, sector)
        getRose(defPlatform, 800, 600, sector)
        getRose(defPlatform, 925, 600, sector)
        getRose(defPlatform, 1050, 600, sector)
        getRose(defPlatform, 1175, 600, sector)
        getRose(defPlatform, 1300, 600, sector)
        getRose(defPlatform, 1425, 600, sector)
        getStarOrb(defPlatform, 1200, 450, sector)

        getTree(defPlatform, 1500, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 50, sector)
    }
    else if (sectorType == 5){
        sectorWidth = 4000
        defPlatform.style.width = sectorWidth + "px"

        getRose(defPlatform, 250, 600, sector)

        getRose(defPlatform, 800, 600, sector)
        getRose(defPlatform, 925, 600, sector)
        getRose(defPlatform, 1050, 600, sector)
        getRose(defPlatform, 1175, 600, sector)

        getGrassBlock(defPlatform, 1500, 610, sector)
        getRose(defPlatform, 1725, 600, sector)
        getRose(defPlatform, 1850, 600, sector)
        getRose(defPlatform, 1975, 600, sector)
        getRose(defPlatform, 2100, 600, sector)
        getRose(defPlatform, 2225, 600, sector)
        getRose(defPlatform, 2350, 600, sector)
        getRose(defPlatform, 2475, 600, sector)
        getRose(defPlatform, 2600, 600, sector)
        getRose(defPlatform, 2725, 600, sector)
        getStarOrb(defPlatform, 2200, 450, sector)
        getRose(defPlatform, 2850, 600, sector)
        getRose(defPlatform, 2925, 600, sector)
        getRose(defPlatform, 3500, 600, sector)

        getKey(defPlatform, 1600, 25, sector)

        getLockedDoor(defPlatform, 3700, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }
    else if (sectorType == 6){
        sectorWidth = 1800
        defPlatform.style.width = sectorWidth + "px"

        getRose(defPlatform, 125, 600, sector)
        getRose(defPlatform, 250, 600, sector)
        getRose(defPlatform, 375, 600, sector)

        getGrassBlock(defPlatform, 750, 610, sector)
        getRose(defPlatform, 975, 600, sector)
        getRose(defPlatform, 1100, 600, sector)
        getRose(defPlatform, 1225, 600, sector)
        getRose(defPlatform, 1350, 600, sector)
        getRose(defPlatform, 1475, 600, sector)

        getStarOrb(defPlatform, 1200, 450, sector)
        getRose(defPlatform, 1240, 325, sector)

        getTree(defPlatform, 1500, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 50, sector)
    }
    else if (sectorType == 7){
        sectorWidth = 1600
        defPlatform.style.width = sectorWidth + "px"

        getMetalGear(defPlatform, 325, 540, sector)
        getMetalGear(defPlatform, 200, 540, sector)

        getRose(defPlatform, 500, 600, sector)
        getRose(defPlatform, 625, 600, sector)

        getMetalGear(defPlatform, 1000, 540, sector)
        getMetalGear(defPlatform, 1125, 540, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }
    else if (sectorType == 8){
        sectorWidth = 1600
        defPlatform.style.width = sectorWidth + "px"

        getRose(defPlatform, 500, 600, sector)
        getRose(defPlatform, 625, 600, sector)

        getMetalGear(defPlatform, 850, 540, sector)

        getRose(defPlatform, 1025, 600, sector)
        getRose(defPlatform, 1150, 600, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }
    else if (sectorType == 9){
        sectorWidth = 2300
        defPlatform.style.width = sectorWidth + "px"

        getMetalGear(defPlatform, 500, 350, sector)
        getMetalGear(defPlatform, 120, 350, sector)
        getMetalGear(defPlatform, 750, 350, sector)

        getGrassBlock(defPlatform, 1000, 610, sector)
        getMetalGear(defPlatform, 1350, 150, sector)
        getKey(defPlatform, 1300, 200, sector)

        getRose(defPlatform, 1225, 600, sector)
        getRose(defPlatform, 1350, 600, sector)
        getRose(defPlatform, 1475, 600, sector)
        getRose(defPlatform, 1600, 600, sector)

        getLockedDoor(defPlatform, 2000, 270, sector)

        getOxygen(defPlatform, sectorWidth-225, 600, sector)
    }


    for (let i = 0; i < Math.floor(sectorWidth/150); i++){
        let grassPile = document.createElement("img")
        grassPile.classList = "grass-def-data"
        grassPile.style.left = (convertPixelsToFloat(defPlatform.style.left) + (i * 150)) + "px"
        grassPile.style.top = "700px"
        grassPile.src = "LevelAssets/Grass_01.png"
        sector.appendChild(grassPile)
    }

    for (let i = 0; i < getRandomNumber(4, Math.floor(sectorWidth/150) -5); i++){
        let plant = document.createElement("img")
        plant.classList = "plant-def-data"
        plant.style.left = (convertPixelsToFloat(defPlatform.style.left) + getRandomNumber(0, (sectorWidth - convertPixelsToFloat(plant.style.width)))) + "px"
        plant.style.top = "650px"
        let flowerName = getRandomNumber(1, 4)
        plant.src = "LevelAssets/Flower_0" + flowerName + ".png"
        sector.appendChild(plant)
    }

    document.body.appendChild(sector)

    totalSectors ++
    sectorCount ++
    totalSectorWidth += sectorWidth
}

function createScoreBar(){
    let holder = document.createElement("div")
    holder.style.position = "fixed"
    holder.style.width = "250px"
    holder.style.height = "40px"
    holder.style.left = "50%"
    holder.style.transform = "translate(-50%)"
    holder.style.zIndex = 135
    holder.style.top = "810px"
    holder.style.backgroundColor = "rgb(75, 37, 2)"
    holder.style.borderRadius = "25px"
    holder.style.border = "solid 2px rgb(248, 216, 36)"

    document.body.appendChild(holder)

    scoreBar = document.createElement("p")
    scoreBar.style.position = "absolute"
    scoreBar.style.width = "230px"
    scoreBar.style.height = "40px"
    scoreBar.style.color = "rgb(248, 216, 36)"
    scoreBar.style.fontFamily = "fantasy"
    scoreBar.style.alignItems = "center"
    scoreBar.style.fontSize = "25px"
    scoreBar.style.top = "-20px"
    scoreBar.style.textAlign = "right"
    scoreBar.style.left = "10px"
    scoreBar.innerText = "0"

    holder.appendChild(scoreBar)

    let decor = document.createElement("img")
    decor.style.position = "absolute"
    decor.style.width = "40px"
    decor.style.height = "40px"
    decor.style.backgroundColor = "rgb(75, 37, 2)"
    decor.style.borderRadius = "25px"
    decor.style.left = "-50px"
    decor.style.top = "-1px"
    decor.style.border = "solid 2px rgb(248, 216, 36)"
    decor.src = "ImageAnimations/Score.png"

    holder.appendChild(decor)

    span = document.createElement("span")
    span.style.color = "blue"

    scoreBar.appendChild(span)

    if (window.innerWidth <= 800){
        holder.style.top = "10px"
        holder.style.left = "255px"

        audioMute.style.width = "40px"
        audioMute.style.height = "40px"
        audioMute.style.top = "10px"
    }
}

function convertNumberToInteligentString(number){
    let i_string = number.toString()

    let flippedString = ""
    let t = 0
    for (let i = 0; i < i_string.length; i++){
        let letter = i_string.slice(i_string.length -i -1, i_string.length -i)
        flippedString += letter
        t++
        if (t == 3){
            t = 0
            flippedString += " "
        }
    }
    i_string = ""
    for (let i = 0; i < flippedString.length; i++){
        let letter = flippedString.slice(flippedString.length -i-1, flippedString.length -i)
        i_string += letter
    }

    if (number.toString().length < 4) i_string = number.toString()

    return i_string
}

function updateScoreBar(){
    if (!scoreBar) return

    let newScore = -400 + convertPixelsToFloat(player.style.left)
    if (newScore < 0) newScore = 0

    if (newScore > score) score = newScore

    scoreBar.textContent = convertNumberToInteligentString(score) + " [" + convertNumberToInteligentString(bestScore) + "]"
}

function createOxygenBar(){
    let holder = document.createElement("div")
    holder.style.position = "fixed"
    holder.style.width = window.innerWidth -150 + "px"
    holder.style.height = "25px"
    holder.style.left = "75px"
    holder.style.zIndex = 135
    holder.style.top = "860px"
    holder.style.backgroundColor = "rgb(75, 37, 2)"
    holder.style.borderRadius = "25px"

    document.body.appendChild(holder)

    oxygenBar = document.createElement("div")
    oxygenBar.style.position = "absolute"
    oxygenBar.style.width = convertPixelsToFloat(holder.style.width) - 10 + "px"
    oxygenBar.style.height = convertPixelsToFloat(holder.style.height) - 10 + "px"
    oxygenBar.style.left = "5px"
    oxygenBar.style.top = "5px"
    oxygenBar.style.backgroundColor = "rgb(248, 216, 36)"
    oxygenBar.style.borderRadius = "25px"

    holder.appendChild(oxygenBar)

    let decor = document.createElement("img")
    decor.style.position = "absolute"
    decor.style.width = "50px"
    decor.style.height = "50px"
    decor.style.backgroundColor = "rgb(75, 37, 2)"
    decor.style.borderRadius = "25px"
    decor.style.left = "-55px"
    decor.style.top = "-11.5px"
    decor.style.border = "solid 2px rgb(248, 216, 36)"
    decor.src = "LevelAssets/Oxygen.png"

    holder.appendChild(decor)

    if (window.innerWidth <= 800){
        holder.style.top = "85px"
        holder.style.left = "100px"
    }
}

function updateOxygenBar(){
    if (!oxygenBar) return

    oxygenBar.style.width = oxygen * ((window.innerWidth -160)/100) + "px"
    oxygenBar.parentNode.style.width = window.innerWidth -150 + "px"
}

function distanceTo(e_0, e_1){
    let distance = 0

    let c_0_x = convertPixelsToFloat(e_0.style.left) + convertPixelsToFloat(e_0.style.width)/2
    let c_0_y = convertPixelsToFloat(e_0.style.top) + convertPixelsToFloat(e_0.style.height)/2

    let c_1_x = convertPixelsToFloat(e_1.style.left) + convertPixelsToFloat(e_1.style.width)/2
    let c_1_y = convertPixelsToFloat(e_1.style.top) + convertPixelsToFloat(e_1.style.height)/2

    let x_distance = Math.abs(c_0_x - c_1_x)
    let y_distance = Math.abs(c_0_y - c_1_y)

    distance = Math.sqrt(Math.pow(x_distance, 2) + Math.pow(y_distance, 2))

    return distance
}

function handleOxygens(){
    if (convertPixelsToFloat(player.style.left) > 1270){
        let extraDifficulty = 0

        if (totalSectors > 7 && totalSectors < 15) extraDifficulty = 0.02
        if (totalSectors > 14 && totalSectors < 22) extraDifficulty = 0.05
        if (totalSectors > 21 && totalSectors < 28) extraDifficulty = 0.09
        if (totalSectors > 27 && totalSectors < 50) extraDifficulty = 0.14
        if (totalSectors > 50) extraDifficulty = 0.2

        oxygen -= 0.05 + (0.001 * score/1000) + extraDifficulty
    }
    else[
        oxygen = 100
    ]

    let oxygens = document.getElementsByClassName("oxygen")

    for (let o of oxygens){
        let distance = distanceTo(o, player)

        if (distance < 150){
            o.remove()

            let oxygenAudio = new Audio("Audio/Oxygen.mp3")
            if (!audioMuted) oxygenAudio.play()
            oxygen = 100
        }
    }

    if (oxygen <= 0){
        gameOver()
    }
}

function handleKeys(){
    let keys = document.getElementsByClassName("key")

    for (let key of keys){
        let distance = distanceTo(key, player)

        if (distance < 150){
            let keyParentNode = key.parentNode
            key.remove()

            let keyAudio = new Audio("Audio/Key.mp3")
            if (!audioMuted) keyAudio.play()

            let doors = document.getElementsByClassName("door")
            let doorColliders = document.getElementsByClassName("door-collider")

            for (let door of doors){
                if (door.parentNode == keyParentNode){
                    door.remove()
                }
            }

            for (let doorCollider of doorColliders){
                if (doorCollider.parentNode == keyParentNode){
                    doorCollider.remove()
                }
            }

        }
    }
}

function handleRoses(){
    let roses = document.getElementsByClassName("rose")

    for (let rose of roses){
        let distance = distanceTo(rose, player)

        if (distance < 75){
            oxygen = 0
        }
    }
}

function handleMetalGears(){
    let metalGears = document.getElementsByClassName("metal-gear")

    for (let metalGear of metalGears){
        let distance = distanceTo(metalGear, player)

        if (distance < 75 * parseFloat(window.getComputedStyle(metalGear).scale)){
            oxygen = 0
        }
    }
}

function handleSectorGeneration(){
    if (gameOverDelay > 0) return

    while (sectorCount < maxSectorsLoaded){
        generateNextSector()
    }

    let playerX = convertPixelsToFloat(player.style.left)

    if (playerX + 1500 > totalSectorWidth){
        let s = null

        for (let sector of document.getElementsByClassName("game-sector")){
            if (!s){
                s = sector
            }
            else{
                if (convertPixelsToFloat(sector.style.left) < convertPixelsToFloat(s.style.left)){
                    s = sector
                }
            }
        }

        if (s){
            sectorCount -= 1
            let s_left = convertPixelsToFloat(s.style.left)
            let s_width = convertPixelsToFloat(s.style.width)
            s.parentNode.remove()

            if (theBorder) theBorder.remove()

            theBorder = createEndBorder()
            theBorder.style.left = s_left + "px"
            theBorder.style.width = s_width + "px"
        }
    }
}

function createEndBorder(){
    let endBorder = document.createElement("img")
    endBorder.classList = "end-border ground"
    endBorder.style.position = "absolute"
    endBorder.style.width = "1500px"
    endBorder.style.height = "2000px"
    endBorder.style.top = 0
    endBorder.zIndex = 1
    endBorder.src = "LevelAssets/Grass_ground.png"
    document.body.appendChild(endBorder)

    return endBorder
}

function gameOver(){
    if (gameOverDelay == 0){
        gameOverAudio = new Audio("Audio/GameOver2.mp3")
        gameOverAudio.volume = 0.3
        if (!audioMuted) gameOverAudio.play()

        if (score > bestScore){
            localStorage.setItem("score", score)
            bestScore = score
        }
    
        gameOverScreen = document.createElement("div")
        gameOverScreen.style.zIndex = 200
        gameOverScreen.style.position = "fixed"
        gameOverScreen.style.top = "-10px"
        gameOverScreen.style.left = "-10px"
        gameOverScreen.style.width = window.innerWidth +20 +"px"
        gameOverScreen.style.height = window.innerHeight +20 +"px"
        gameOverScreen.style.backgroundColor = "black"
        gameOverScreen.style.animationName = "gameOver"
        gameOverScreen.style.animationDuration = "2s"
        gameOverScreen.style.animationIterationCount = 1
    
        document.body.appendChild(gameOverScreen)

        goodText = document.createElement("p")
        goodText.style.position = "absolute"
        goodText.style.left = "50%"
        goodText.style.top = "20%"
        goodText.style.width = window.innerWidth / 1.5 + "px"
        goodText.style.height = "100px"
        goodText.style.transform = "translate(-50%)"
        goodText.style.color = "rgb(248, 216, 36)"
        goodText.style.textAlign = "center"
        goodText.style.fontSize = "75px"
        goodText.style.animationName = "gameOverText"
        goodText.style.animationDuration = "2s"
        goodText.style.animationIterationCount = 1
        goodText.style.font = "fantasy"

        let goodTextContent = [
            "Game over!", "You are going to make it next time!", "It was not this time!", "You are doing great!", "Nice try!", "Next time!", "Did you tryhard?",
            "Have you reached 135K+ score?", "I have done 1M with one hand, my other hand was starting a business!", "Emotional damage!", "Áááááááááááááááááá!",
            "You are not a speedwalker, are you?", "That was close!", "Have you even tried to jump?"
        ]
        goodText.innerText = goodTextContent[getRandomNumber(0, goodTextContent.length-1)]

        if (window.innerWidth <= 800){
            goodText.style.fontSize = "20px"
        }

        gameOverScreen.appendChild(goodText)

        gameOverDelay = 1
    }
    else{
        gameOverDelay += 1
        gameOverScreen.style.width = window.innerWidth +20 +"px"
        gameOverScreen.style.height = window.innerHeight +20 +"px"

        if (gameOverDelay >= 500){
            //location.reload()
            gameOverDelay = 0
            player.remove()
            playerStyle = null
            spawnPlayer("400px", "250px")
            score = 0
            oxygen = 100
            totalSectorWidth = 1500
            totalSectors = 1
            sectorCount = 1
            let sectors = document.getElementsByClassName("actual-sector")
            let endBorders = document.getElementsByClassName("end-border")
            for (let i = sectors.length - 1; i >= 0; i--) {
                sectors[i].parentNode.removeChild(sectors[i])
            }
            for (let i = endBorders.length - 1; i >= 0; i--) {
                endBorders[i].parentNode.removeChild(endBorders[i])
            }
            gameOverScreen.remove()
        }

        if (gameOverDelay >= 420){
            goodText.innerText = "Get up! Try again!"
        }
    }

    if (enterTrigger && gameOverDelay > 0){
        gameOverAudio.pause()
        gameOverDelay += 1000
    }
}

function createInfoMessage(){
    let info = document.createElement("div")
    info.style.width = window.innerWidth*2 + "px"
    info.style.height = window.innerHeight*2 + "px"
    info.style.backgroundColor = "black"
    info.style.zIndex = 9999
    info.style.position = "fixed"
    info.style.left = 0
    info.style.top = "-500px"
    
    let txt = document.createElement("p")
    txt.style.width = "250px"
    txt.style.height = "500px"
    txt.style.color = "white"
    txt.style.zIndex = 10000
    txt.style.position = "fixed"
    txt.style.fontFamily = "fantasy"
    txt.style.top = "25%"
    txt.style.left = "50%"
    txt.style.transform = "translate(-50%)"
    txt.style.fontSize = "50px"
    txt.style.textAlign = "center"

    txt.innerText = "Open this website on PC"


    document.body.appendChild(info)
    document.body.appendChild(txt)
}

function createMobileControls(){
    let startY

    function touchStart(event) {
        startY = event.touches[0].clientY
    }

    function touchMove(event) {
        let endY = event.touches[0].clientY;

        if (endY < startY - 100) {
            if (!jumpState) jump()
        }
    }

    document.addEventListener('touchstart', touchStart)
    document.addEventListener('touchmove', touchMove)

    let mobile_left_button = document.createElement("div")
    mobile_left_button.style.width = window.innerWidth/2 + "px"
    mobile_left_button.style.height = window.innerHeight + "px"
    mobile_left_button.style.position = "fixed"
    mobile_left_button.style.top = "70px"
    mobile_left_button.style.left = 0
    mobile_left_button.style.zIndex = 1500

    let mobile_right_button = document.createElement("div")
    mobile_right_button.style.width = window.innerWidth/2 + "px"
    mobile_right_button.style.height = window.innerHeight + "px"
    mobile_right_button.style.position = "fixed"
    mobile_right_button.style.top = "70px"
    mobile_right_button.style.left = window.innerWidth/2 + "px"
    mobile_right_button.style.zIndex = 1500

    document.body.appendChild(mobile_left_button)
    document.body.appendChild(mobile_right_button)

    mobile_left_button.addEventListener("touchstart", () => {
        moveLeftTrigger = true
    })
    mobile_left_button.addEventListener("touchend", () => {
        moveLeftTrigger = false
    })

    mobile_right_button.addEventListener("touchstart", () => {
        moveRightTrigger = true
    })
    mobile_right_button.addEventListener("touchend", () => {
        moveRightTrigger = false
    })
}

function runtime(){
    handleCollisions()
    checkGround()

    if (!grounded){
        if (!jumpState){
            if (yVelocity < gravity) yVelocity = gravity
            yVelocity -= 1
            applyGravity()
        }
    }
    else{
        if (yVelocity != 0){
            fixGravity()
        }
        yVelocity = 0
        if (!jumpState){
            jumpDuration = 0
        }
    }

    if (jumpState){
        if (jumpDuration < 10){
            jumpDuration ++
            if (yVelocity < jumpForce) yVelocity = jumpForce
            yVelocity += 1
            applyJump()
        }
        else{
            jumpDuration = 0
            jumpState = false
        }
        fixJump()
    }

    if (collisions[2]) fixJump()

    if (gameOverDelay == 0){
        if (moveLeftTrigger || mobile_left) moveLeft()
        if (moveRightTrigger || mobile_right) moveRight()
        if (jumpTrigger) jump()
    }

    playerFollowCamera()
    animatePlayer()

    handleOxygens()
    handleKeys()
    handleRoses()
    handleMetalGears()
    updateOxygenBar()
    updateScoreBar()

    handleSectorGeneration()

    if (backgroundMusic.paused && audioMuted == false && gameOverDelay == 0){
        backgroundMusic.play()
    }
    else{
        if (!backgroundMusic.paused && audioMuted == true){
            backgroundMusic.pause()
        }

        if (gameOverDelay != 0){
            backgroundMusic.pause()
        }
    }
}



spawnPlayer("400px", "250px")
createOxygenBar()
createScoreBar()

if (window.innerWidth <= 800){   
    //createMobileControls()
    createInfoMessage()
}

audioMute.addEventListener("mousedown", () => {
    audioMuted = !audioMuted

    if (audioMuted){
        audioMute.src = "LevelAssets/AudioIcon_muted.png"
    }
    else{
        audioMute.src = "LevelAssets/AudioIcon.png"
    }
})
document.addEventListener("keydown", (key) => {
    if (key.code == "Space" || key.code == "KeyW" || key.code == "ArrowUp"){
        jumpTrigger = true
    }

    if (key.code == "Enter"){
        enterTrigger = true
    }

    if (key.code == "KeyA" || key.code == "ArrowLeft"){
        moveLeftTrigger = true
    }

    if (key.code == "KeyD" || key.code == "ArrowRight"){
        moveRightTrigger = true
    }
})
document.addEventListener("keyup", (key) => {
    if (key.code == "Space" || key.code == "KeyW" || key.code == "ArrowUp"){
        jumpTrigger = false
    }

    if (key.code == "Enter"){
        enterTrigger = false
    }

    if (key.code == "KeyA" || key.code == "ArrowLeft"){
        moveLeftTrigger = false
    }

    if (key.code == "KeyD" || key.code == "ArrowRight"){
        moveRightTrigger = false
    }
})
setInterval(runtime, 10)