function selectImages(conf, onSelectionsFound){
    let fileUrl = conf.fileUrl
    let canvas = conf.canvas
    let startX = conf.startX
    loadFileInCanvas(fileUrl, canvas, function (imageObj, context) {
        var w = imageObj.width, h = imageObj.height;
        imageData = context.getImageData(0, 0, w, h).data
        refPixel = getPixel(conf.startX, conf.start)
        if(onSelectionsFound){
            onSelectionsFound(findImageFrom(0, 0))
        }
    })

}

var imageData, canvas, context, imageObj, refPixel

function loadFileInCanvas(dataURL, cnv, callback) {
    canvas = cnv;
    context = canvas.getContext('2d');

    // load image from data url
    imageObj = new Image();
    imageObj.onload = function () {
        canvas.width = imageObj.width
        canvas.height = imageObj.height
        context.drawImage(this, 0, 0)
        callback(imageObj, context)
    };

    imageObj.src = dataURL;
}

function getPixel(x, y) {
    return {
        x: x,
        y:y,
        red:   imageData[(imageObj.width * y + x) * 4],
        green: imageData[(imageObj.width * y + x) * 4 + 1],
        blue:  imageData[(imageObj.width * y + x) * 4 + 2],
        alpha: imageData[(imageObj.width * y + x) * 4 + 3]
    }
}

/*******************************/


function isEmptyPixel(targetPixel){
    return targetPixel.alpha === 0
    /*
     return targetPixel.red === refPixel.red
     && targetPixel.blue === refPixel.blue
     && targetPixel.green === refPixel.green
     //*/
}
function scanForFrames(){
    //let firstPixel = findImageFrom()


}

function debugSelection(selection){
    context.beginPath()
    context.lineWidth='1'
    context.strokeStyle='red'
    context.rect(selection.x, selection.y, selection.width, selection.height)

    context.stroke()

}

function isPixelInSelections(selections, pixel){
    let maxWidth = imageObj.width
    let maxHeight = imageObj.height

    for(let i = 0, max = selections.length; i < max; i++){
        let selection = selections[i]
        let minX = selection.x
        let minY = selection.y

        let maxX = selection.x + selection.width
        let maxY = selection.y + selection.height

        if(    pixel.x >= minX && pixel.x <= maxX
            && pixel.y >= minY && pixel.y <= maxY  ){
            return true
        }
    }

    return false
}


function findImageFrom(startX, startY){
    let firstPixel = scanLinesFrom(startX, startY)

    let selection = {
        x: firstPixel.x,
        y: firstPixel.y,
        width:1,
        height:1
    }

    expandFromPixel(selection)

    return [selection]
}

function scanLinesFrom(beginX, beginY){
    for(let y = beginY, max = imageObj.height; y < imageObj.height; y++){
        let pixel = findFirstContentInLine(y, beginX)

        if(pixel){
            return pixel
        }
    }
}

function findFirstContentInLine(y, beginX){
    for(let x = beginX, maxX = imageObj.width; x < maxX; x++){
        let targetPixel = getPixel(x, y)
        if(!isEmptyPixel(targetPixel)){
            return targetPixel
        }

    }
}


function expandFromPixel(selection){


    let isFinished = false, count = 0

    while(!isFinished){
        count+= 1
        let offset = expandFromAllDirections(selection)

        if(offset === 0 || count === 3){
            isFinished = true
        }
    }
}

function isLineEmptyToTheRight(selection){
    let xToCheck = selection.x + selection.width
    let yToCheck = selection.y


    for(let y = yToCheck, max = (yToCheck + selection.height); y < max; y++){
        if(!isEmptyPixel(getPixel(xToCheck, y))){
            return false
        }
    }

    return true
}

function isLineEmptyToTheLeft(selection){
    let xToCheck = selection.x - 1
    let yToCheck = selection.y

    for(let y = yToCheck, max =  (yToCheck + selection.height); y < max; y++){
        if(!isEmptyPixel(getPixel(xToCheck, y))){
            return false
        }
    }

    return true
}


function isLineEmptyToTheBottom(selection){
    let xToCheck = selection.x
    let yToCheck = selection.y + selection.height

    for(let x = xToCheck, max =  ( xToCheck + selection.width); x < max; x++){
        if(!isEmptyPixel(getPixel(x, yToCheck))){
            return false
        }
    }

    return true
}

function isLineEmptyToTheTop(selection){
    let xToCheck = selection.x
    let yToCheck = selection.y - 1

    for(let x = xToCheck, max =  ( xToCheck + selection.width); x < max; x++){
        if(!isEmptyPixel(getPixel(x, yToCheck))){
            return false
        }
    }

    return true
}


function expandFromAllDirections(selection){
    let offset = 0

    offset += expandToTheRight(selection)
    offset += expandToTheBottom(selection)
    offset += expandToTheLeft(selection)
    offset += expandToTheTop(selection)

    return offset
}

function expandToTheRight(selection){
    let offset = 0

    let isFinished = false
    while(!isFinished){


        if(isLineEmptyToTheRight(selection)){
            isFinished = true
            break
        }

        offset += 1
        selection.width += 1
    }

    return offset
}

function expandToTheLeft(selection){
    let offset = 0

    let isFinished = false
    while(!isFinished){


        if(isLineEmptyToTheLeft(selection)){
            isFinished = true
            break
        }

        offset += 1
        selection.x -= 1
        selection.width += 1
    }

    return offset
}

function expandToTheBottom(selection){
    let offset = 0

    let isFinished = false
    while(!isFinished){


        if(isLineEmptyToTheBottom(selection)){
            isFinished = true
            break
        } else {
            offset += 1
            selection.height += 1
        }
    }


    return offset
}

function expandToTheTop(selection){
    let offset = 0

    let isFinished = false
    while(!isFinished){
        if(isLineEmptyToTheTop(selection)){
            isFinished = true
            break
        }

        offset += 1
        selection.y -= 1
        selection.height += 1
    }


    return offset
}