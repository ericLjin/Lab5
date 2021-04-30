// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const speech = window.speechSynthesis;
const f = document.getElementById('generate-meme');
const c = document.getElementById('user-image');
const img_upload = document.getElementById('image-input');
const volume = document.getElementById("volume-group");
const button_group = document.getElementById('button-group');
const clear_button = button_group.querySelector('button[type="reset"]');
const read_button = button_group.querySelector('button[type="button"]');
const voices = document.getElementById('voice-selection');
const ctx = c.getContext('2d');

// Fires whenever the img object loads a new image
img.addEventListener('load', () => {

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = 'black'; // fill canvas with black first
  ctx.fillRect(0, 0, c.width, c.height);

  // draw img, which is run through a method to size it to the canvas.
  let dim = getDimmensions(c.width, c.height, img.width, img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

  // clear top and bottom text boxes when new img is loaded
  document.getElementById('text-top').value = "";
  document.getElementById('text-bottom').value = "";
  toggleState(false); // toggle button states
});

img_upload.addEventListener('change', () => { //when user uploads an img
    const objectURL = URL.createObjectURL(img_upload.files[0]);
    img.src = objectURL;
});

f.addEventListener('submit', function(e) {
    //add text, all caps
    let txt_top = document.getElementById('text-top').value.toUpperCase();
    let txt_bot = document.getElementById('text-bottom').value.toUpperCase();
    ctx.font = "40px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(txt_top, c.width/2, 40);
    ctx.fillText(txt_bot, c.width/2, 375);

    toggleState(true); // toggle button states
    e.preventDefault(); //prevents the form from refreshing the page
});

clear_button.addEventListener('click', function() {
    ctx.clearRect(0, 0, c.width, c.height); //clear canvas
    toggleState(false); //toggle button status
});

read_button.addEventListener('click', function() {
    //get text to read
    let txt_top = document.getElementById('text-top').value;
    let txt_bot = document.getElementById('text-bottom').value;
    let read_top = new SpeechSynthesisUtterance(txt_top);
    let read_bot =  new SpeechSynthesisUtterance(txt_bot);
    //get voice type
    let selectedVoice = voices.selectedOptions[0].getAttribute('data-name');
    let voiceList = speech.getVoices();
    for(let v of voiceList)
    {
        if(v.name === selectedVoice)
        {
            read_top.voice = v;
            read_bot.voice = v;
        }
    }
    let volumeVal = (volume.querySelector("input").value)/100; //set Volume
    read_top.volume = volumeVal;
    read_bot.volume = volumeVal;
    speech.speak(read_top); //read
    speech.speak(read_bot);

});

//we only update when the 'voicesChanged' is emitted.
speech.addEventListener('voiceschanged', function() {
    let voiceList = speech.getVoices();
    if(voiceList && voiceList.length > 0)
    {
        voices.querySelector('option').style.display = "none"; //hide "none" option
        for(let v of voiceList) //fill voices select element
        {
            let option = document.createElement("option");
            option.textContent = v.name;
            if(v.default) {
                option.textContent += ' -- DEFAULT';
                option.selected = true;
            }
            option.setAttribute('data-lang', v.lang);
            option.setAttribute('data-name', v.name);
            voices.appendChild(option);
        }
    }
});

volume.addEventListener('input', function(e) {
    let vol = e.target.value;
    let vol_img = volume.querySelector("img"); //get img child

    if(vol < 1) vol_img.src = "./icons/volume-level-0.svg";
    else if(vol < 34) vol_img.src = "./icons/volume-level-1.svg";
    else if(vol < 67) vol_img.src = "./icons/volume-level-2.svg";
    else vol_img.src = "./icons/volume-level-3.svg";

});

//accepts bool, which is the state of the "submit" button
// clr, read, voices are toggled to !(state)
function toggleState(state)
{
    if(typeof state != "boolean")
        return;

    f.querySelector('button[type="submit"]').disabled = state;
    let buttons = button_group.querySelectorAll('button'); //clr and read
    for(let b of buttons) b.disabled = !state;
    voices.disabled = !state;
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
