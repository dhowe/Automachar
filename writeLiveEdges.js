if (typeof Path2D == 'undefined') Path2D = (class Path2DMock {});

let lang = 'trad';

let fs = require('fs');
let words = JSON.parse(fs.readFileSync('words-'+lang+'.json', 'utf8'));
let chars = JSON.parse(fs.readFileSync('chardata.json', 'utf8'));

let CharUtils  = require('./cutils.js');
let Autochar  = require('./autochar.js');

millis = function () { return +Date.now(); }
textWidth = function () { return -1; }
textAscent = function () { return -1; }
textDescent = function () { return -1; }

let word, count = 1;
let args = process.argv.slice(2);
let numlines = args && args[0] || 10;
let writeFile = (args && args.length > 1 && args[1] == '-f');
let edgeFile = 'live-edges-'+numlines+'.'+millis()+'.csv';
let edgeData = 'source,target,med,step\n';

util = new CharUtils(chars, words, null, require('fast-levenshtein'), 0, lang);
typer = new Autochar(util, onActionComplete, null, false);
typer.disableTriggers();

if (writeFile) console.log('target: ' + edgeFile)

word = typer.word.literal;
step();

function step() {
  typer.step();
  if (count <= numlines) {

    setTimeout(step, 1);

  } else {

    //console.log(edgeData);
    if (writeFile) {
      fs.appendFileSync(edgeFile, edgeData);
      console.log('wrote: ' + edgeFile)
    }
  }
}

function onActionComplete(next, med) {
  if (next) {
    if (word) {
      var line = word + ',' + next.literal + ',' + med;
      if (writeFile) edgeData += line + ','+count+'\n';
      else console.log(line);
    }
    word = next.literal;
    if (++count % 200 == 0) {
      fs.appendFileSync(edgeFile, edgeData);
      console.log(Math.floor((count / numlines) * 1000) / 10 + '% complete');
    }
  }
}
