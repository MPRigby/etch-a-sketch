$(document).ready(function() {
  //set default grid size and create grid
  var squareNum = 16;
  createGrid(squareNum);

//////////////////////Left Side Controls///////////////////////////
  //enable click of Clear button, though it's more accurately "recolor grid white"
  $('#clear').on('click', function(){
    $('.innerDiv').css('background-color', '#FFF');
  });

  //enable click of New Grid button
  $('#newGrid').on('click', function(){
    newBoard();
  });

  //enable click of toggle sketching button
  $('#enable').hide(); //initilize toggleSketch Button
  $('#toggleSketch').on('click', function(){
    $('#enable').toggle();
    $('#disable').toggle();
  });

//////////////////////Right Side Controls///////////////////////////
  //setup solid selector
  $('#solid').on('click', function(){
    $('#colorPickerP').show();
    $('#darkenDiv').hide();
  });

  //setup darken selector
  $('#slider').slider(); //initialize slider
  $('#darken').on('click', function(){
    $('#colorPickerP').show();
    $('#darkenDiv').show();
    var darkenAmount = document.getElementById('slider').value; //grab default value
    $('#sliderP').text("Darken by: " + darkenAmount + "%"); //update slider display
  });
  //setup darken slider to update display on change
  $('#slider').change(function() {
    darkenAmount = document.getElementById('slider').value;
    $('#sliderP').text("Darken by: " + darkenAmount + "%");
  });

  //setup random sketcher
  $('#random').on('click', function(){
    $('#colorPickerP').hide();
    $('#darkenDiv').hide();
  });

  //initialize to Solid mode and enable sketching
  $('#darkenDiv').hide();
  sketch();
});

function createGrid (squareNum) {
  $('.gridRow').remove(); //clear existing rows
  //$('.innerDiv').remove(); //clear existing grid boxes
  //add a <p> element gridRow for each row of the grid
  for (var i=0; i<squareNum; i++) {
    $('#sketchAreaContainer').append('<p class="gridRow"></p>');
  }
  //fill each <p> gridRow with the correct number of columns
  for (var i=0; i<squareNum; i++) {
    $('.gridRow').append('<div class="innerDiv"></div>');
  }
  //size each box so grid fits in sketchAreaContainer
  boxSize = Math.floor(560/squareNum); //floor will leave a large area of the grid unfilled, because the size of each grid square is rounded down
  $('.innerDiv').css('width', boxSize);
  $('.innerDiv').css('height', boxSize);

  //add 1px to the width and height of each box until all remaining pizels in sketch area are filled
  var remainder = 560%squareNum;
  if (remainder != 0) {   //only make adjustments if neccesary
    for (var i=1; i<=remainder; i++) {
      $('.innerDiv:nth-child('+ i +')').css('width', boxSize+1); //in each gridRow, extend the with of the first n=remainder boxes by one pixel
      $('.gridRow:nth-child('+ i +')').children('.innerDiv').css('height', boxSize+1);  //in the first n=remainder gridRows, extend the height of each box by one pixel
    }
  }
}

function newBoard() {
  var input = prompt("Input number of squares per side for new sketch board: ", "16");
  promptHandler(input);
}

function promptHandler(input) {
  if (input==null){ //if input is null, cancel was pressed, do nothing
  } else if (input=='' || isNaN(input)==true || /\S/.test(input)==false || input == 'true'){ //if input is empty string or invalid number, report error
    alert('Please input a valid number.');
    newBoard();
  } else if (input < 1) {
    alert('Please input a number greater than 0.');
    newBoard();
  } else if (input%1 !=0) {
    alert('Please input a non-decimal number.');
    newBoard();
  } else { //if input is a valid number, set as grid size and create grid
    createGrid(input);
    sketch();
  }
}

function sketch () {
  $('.innerDiv').mouseenter(function() {
    //color box on mouse over if sketching is enabled
    if ($('#enable').css('display') == 'none') {
      //solid sketch and random sketch will ignore darken amount, and random sketch will ignore color, thus it is only neccessary to re-run sketch when the color picker or slider value change
      if ($('#solid:checked').length>0) {
        //solid sketch
        var color = $('#colorPicker').val();
        color = forceRGBaColor (color);
        $(this).css('background-color', color);
      } else if ($('#darken:checked').length>0) {
        //darken sketch
        var color = $('#colorPicker').val();
        var darkenAmount = (document.getElementById('slider').value)/100;
        var bg = $(this).css('background-color');
        color = darkenAlpha(color, bg, darkenAmount);
        $(this).css('background-color', color);
      } else if ($('#random:checked').length>0) {
        //random sketch
        var color = randomRGBaColor();
        color = forceRGBaColor (color);
        $(this).css('background-color', color);
      }
    } else { //do not change background if sketching is not enabled
      var bg = $(this).css('background-color');
      $(this).css('background-color', bg);
    }
  });
}

function randomRGBaColor() {
  var r = Math.floor(Math.random()*256);
  var g = Math.floor(Math.random()*256);
  var b = Math.floor(Math.random()*256);
  var color = assembleRGBaColor (r, g, b, 1);
  return color;
}

function assembleRGBaColor (r, g, b, a) {
  if (a>=0 && a<=1) { //if valid alpha, make rgba
    var color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a +')';
    return color;
  } else { //if invalid alpha, make rgb
    var color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    return color;
  }
}

function forceRGBaColor (color) {
  if (color[0]=='#') { //if color is a hex, convert to rgb
    color = hexToRgb(color);
  }
  //convert rgb(a) string to int array
  var colorStr = color.slice(color.indexOf('(') + 1, color.indexOf(')'));  //slice off 'rgba(' and ')'
  var colorArr = colorStr.split(', ');
  if (colorArr.length !=4) { //not an rgba, so force an alpha to be included
    for (var i=0; i<colorArr.length; i++){
      colorArr[i] = parseInt(colorArr[i], 10);
    }
    //grab rgb values and force an alpha of almost 1 to ensure it is not dropped
    var r = colorArr[0];
    var g = colorArr[1];
    var b = colorArr[2];
    var a = 0.99;
    var color = assembleRGBaColor(r, g, b, a);
  }
  return color;
}

function hexToRgb (hex) {
  if (hex.length == 7)  { //if full length hex
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
  } else if (hex.length == 4) { //if abbreviated
    var r = parseInt(hex.slice(1, 2)+color.slice(1, 2), 16);
    var g = parseInt(hex.slice(2, 3)+color.slice(2, 3), 16);
    var b = parseInt(hex.slice(3, 4)+color.slice(3, 4), 16);
  } else {
    //bad hex
  }
  var rgb = assembleRGBaColor (r, g, b);
  return rgb;
}

function darkenAlpha (color, bg, darkenAmount) {
  if (color[0]=='#') { //if color is a hex, convert to rgb
    color = hexToRgb(color);
  }

  //convert rgb(a) string to int array
  var colorStr = color.slice(color.indexOf('(') + 1, color.indexOf(')'));  //slice off 'rgba(' and ')'
  var colorArr = colorStr.split(', ');
  for (var i=0; i<colorArr.length; i++){
    colorArr[i] = parseInt(colorArr[i], 10);
  }

  //modify grab rgb values from color extracted from color picker
  var r = colorArr[0];
  var g = colorArr[1];
  var b = colorArr[2];

  //grab existing alpha from background color bg, if applicable
  var a=0; //initialize such tath if there is no alpha, darkening starts from 0
  if (bg[0]=='#') {
    //bg is hex, therefore no alpha
  } else {
    var bgStr = bg.slice(bg.indexOf('(') + 1, bg.indexOf(')'));  //slice off 'rgba(' and ')'
    var bgArr = bgStr.split(', '); //turn bg into an array
    if (bgArr.length == 4) { //there is alpha
      a = parseFloat(bgArr[3], 10);
    }
  }
  a = a + darkenAmount;
  if (a>=1) {a=0.99;} //cap a at almost 1; an alpha of 1 will be automatically dropped from the bg

  var colorOut = assembleRGBaColor(r, g, b, a);
  return colorOut;
}
