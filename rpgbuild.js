#!/usr/bin/env node

// RPG Build is released under the GPLV3 License.
// https://www.gnu.org/licenses/gpl-3.0.en.html

const fs = require('fs');
const path = require('node:path');
const markdown = require('markdown').markdown;
const configPath = "./rpgbuild.json";
const argv = process.argv;

const cliArgs = processArguments(argv);

// sort cli arguments into flags and filepaths
function processArguments(argv) {
    var args = {
        filePaths : [],
        flags : []
    };

    // start at 2 because skipping first two
    for(let i = 2; i < argv.length; i++) {
        let c = argv[i];
        if (c.startsWith('-')) {
            args.flags.push(c);
        } else {
            args.filePaths.push(c);
        }
    }
    return args;
}

function hasCliFlag(...args) {
    let exists = false;
    cliArgs.flags.forEach(cmd => {
        args.forEach(checkCmd => {
            if (cmd == checkCmd) {
                exists = true;
            }    
        });
    });
    return exists;
}

const isDryRun = hasCliFlag("--dry-run", "-dr");
const verbose = hasCliFlag("--verbose", "-v");
const outputLists = hasCliFlag("--list", "-ls");
// const warn = hasCliFlag("--warn", "-w");

const manualRequested = hasCliFlag("--man", "-m", "-h");

if (manualRequested) {
    printManual();
    process.exit();
}

if (isDryRun) {
    console.log("Dry run...");
}
if (verbose) {
    console.log("Verbose...");
}

var jobs = null;

// Check to see if there are any commandline arguments, and attempt to
// interpret them as input and output filenames
if (cliArgs.filePaths.length > 0) {
    var filePaths = cliArgs.filePaths;
    var pathToSourceFile = filePaths[0];
    
    if (fs.existsSync(pathToSourceFile)) {

        jobs = [];

        switch (filePaths.length) {
            case 1: 
            jobs.push({
                sourceFile: pathToSourceFile,
                outputFile: changeSuffix(pathToSourceFile, "html")
            });
            break;

            case 2: 
            var outputPath = filePaths[1];
            if (pathToSourceFile == outputPath) {
                console.log("Error - saving output to path would overwrite the input file! :", outputPath);
                process.exit();
            }

            // create the output directory if it does not exist
            var ouputDir = path.dirname(outputPath);
            if (!fs.existsSync(ouputDir)){
                fs.mkdirSync(ouputDir);
            }

            // create the job
            jobs.push({
                sourceFile: pathToSourceFile,
                outputFile: outputPath
            });
            break;
        }
    }
}

function changeSuffix(filePath, newSuffix) {
    var suffix = path.extname(filePath);
    var newPath = filePath.substring(0, filePath.length - suffix.length)
        + "." + newSuffix;
    return newPath;
}

// if the jobs were not derived from the cli arguments, 
// we will attempt to load the config tile
if (jobs == null) {

    // check if the config file exists
    if (!fs.existsSync(configPath)) {
        console.log("Error - ", configPath, " was not found.");
        process.exit();
    }

    // Load the config
    var config = fs.readFileSync(configPath);
    try {
        jobs = JSON.parse(config);
    } catch (ex) {
        console.log("JSON Parse Failed. Likely invalid JSON in `rpgbuild.json`. Aborting");
        process.exit();
    }
    
}

const UnusedRangeStrategy = {
  LeaveEmpty: 'LeaveEmpty',
  ExpandLastItem: 'ExpandLastItem',
  RollAgain: 'RollAgain'
};

var unusedRangeStrategy = UnusedRangeStrategy.RollAgain;

const RollAgainString = "Roll again";
const TableEndToken = "[end_table]";

var defaultAutoColumns = 1;
var d66Spacer = false;
var renderDieType = true;
var renderItemCount = true;
var printWarningsInDocument = true;


var htmlHead = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title}</title>
<!--  
<link rel="stylesheet" href="reset.css">
-->
  <style>
    .pagebreak {
        width: 100%;
        height: 0px;
        background: none;
        padding:0;
        margin:0;
    }

    @media print {
        .pagebreak {
            width: 0;
            height: 0;
            background: none;
            padding:0;
            margin:0;
            clear: both;
            page-break-after: always;
        }
    }
  </style>
  <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="main-content">
`;

var htmlTail = `
    </div>
</body>
</html>
`;

var tableHead = `<table style="width:100%;" valign="top">`;
var tableTail = `</table>`;

var tdHead = `<td valign="top" style="width:{width_style}">`;
var tdTail = '</td>';

var trHead = '<tr>';
var trTail = '</tr>';

const pageBreakDiv = `<div class="pagebreak"> </div>`;

if (outputLists) {
    // overwrite heads and tails to replace table rendering
    // with plan divs 
    tableHead = '<div class = "rpgtable">';
    tableTail = '</div>';
    tdHead = '<div class="rpgtabletd">';
    tdTail = '</div>';
    trHead = '<div class="rpgtabletr">';;
    trTail = '</div>';
}

// used to recognise if a line contains a command
const commandHeuristics = [
    "[table",
    "[raw",
    "[set",
    "[end",
    "[page"
];

const d66RollsString = "11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66";
const d666RollsString = "111,112,113,114,115,116,121,122,123,124,125,126,131,132,133,134,135,136,141,142,143,144,145,146,151,152,153,154,155,156,161,162,163,164,165,166,211,212,213,214,215,216,221,222,223,224,225,226,231,232,233,234,235,236,241,242,243,244,245,246,251,252,253,254,255,256,261,262,263,264,265,266,311,312,313,314,315,316,321,322,323,324,325,326,331,332,333,334,335,336,341,342,343,344,345,346,351,352,353,354,355,356,361,362,363,364,365,366,411,412,413,414,415,416,421,422,423,424,425,426,431,432,433,434,435,436,441,442,443,444,445,446,451,452,453,454,455,456,461,462,463,464,465,466,511,512,513,514,515,516,521,522,523,524,525,526,531,532,533,534,535,536,541,542,543,544,545,546,551,552,553,554,555,556,561,562,563,564,565,566,611,612,613,614,615,616,621,622,623,624,625,626,631,632,633,634,635,636,641,642,643,644,645,646,651,652,653,654,655,656,661,662,663,664,665,666";
const d666TwosRollsString = "111-112,113-114,115-116,121-122,123-124,125-126,131-132,133-134,135-136,141-142,143-144,145-146,151-152,153-154,155-156,161-162,163-164,165-166,211-212,213-214,215-216,221-222,223-224,225-226,231-232,233-234,235-236,241-242,243-244,245-246,251-252,253-254,255-256,261-262,263-264,265-266,311-312,313-314,315-316,321-322,323-324,325-326,331-332,333-334,335-336,341-342,343-344,345-346,351-352,353-354,355-356,361-362,363-364,365-366,411-412,413-414,415-416,421-422,423-424,425-426,431-432,433-434,435-436,441-442,443-444,445-446,451-452,453-454,455-456,461-462,463-464,465-466,511-512,513-514,515-516,521-522,523-524,525-526,531-532,533-534,535-536,541-542,543-544,545-546,551-552,553-554,555-556,561-562,563-564,565-566,611-612,613-614,615-616,621-622,623-624,625-626,631-632,633-634,635-636,641-642,643-644,645-646,651-652,653-654,655-656,661-662,663-664,665-666";
const d666ThreesString = "111-113,114-116,121-123,124-126,131-133,134-136,141-143,144-146,151-153,154-156,161-163,164-166,211-213,214-216,221-223,224-226,231-233,234-236,241-243,244-246,251-253,254-256,261-263,264-266,311-313,314-316,321-323,324-326,331-333,334-336,341-343,344-346,351-353,354-356,361-363,364-366,411-413,414-416,421-423,424-426,431-433,434-436,441-443,444-446,451-453,454-456,461-463,464-466,511-513,514-516,521-523,524-526,531-533,534-536,541-543,544-546,551-553,554-556,561-563,564-566,611-613,614-616,621-623,624-626,631-633,634-636,641-643,644-646,651-653,654-656,661-663,664-666";

const d66Rolls = d66RollsString.split(',');
const d666Rolls = d666RollsString.split(',');
const d666TwosRolls = d666TwosRollsString.split(',');
const d666ThreesRolls = d666ThreesString.split(',');

/// MAIN Execution //////

var totalTablesGenerated = 0;

jobs.forEach( (job) => {
    if (verbose) {
        console.log("Job:", job);
    }

    var data = "";
    // reset per job
    totalTablesGenerated = 0;
    if (job.hasOwnProperty("sourceFiles")) {
        var allData = [];
        job.sourceFiles.forEach((sourceFile)=>{
            try {
                var fileData = fs.readFileSync(sourceFile, {encoding:'utf8', flag:'r'});
            } catch {
                console.log("Failed to load file", sourceFile, "Aborting...");
                process.exit();
            }
                

            // if the data does not have a line break at the end, add one
            // otherwise, if the file ends with [end_table], we may lose
            // the first line of the following file
            if (!fileData.endsWith("\n")) {
                fileData += "\n";
            }

            allData.push(fileData);
        });
        data = allData.join("");
    } else {
        data = fs.readFileSync(job.sourceFile, {encoding:'utf8', flag:'r'});        
    } 

    const compiled = parse(data, job.title || "");

    if (!isDryRun) {
        fs.writeFileSync(job.outputFile, compiled);        
    }
    
    console.log("Tables Generated:", totalTablesGenerated);
});

/////////////////////////

function createMarker() {
    return "{{" + createUUID() + "}}";
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
       return v.toString(16);
    });
 }

 function stripHtmlComments(content) {
  return content.replace(/<!--(?!>)[\S\s]*?-->/g, '');
}

function containsCommand(s) {
    for (let index = 0; index < commandHeuristics.length; index++) {
        const c = commandHeuristics[index];
        if (s.startsWith(c)) {
            return true;
        } 
    }
    return false;
}

function createInsertMarker(inserts, outputLines, s) {
    var insert = {
        "marker": createMarker(),
        "insertString": s
    }
    inserts.push(insert);
    // insert the marker, so we can replace it later
    outputLines.push(insert.marker);
}

function removeCommentedLines(lines) {
    var stripped = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (removeAllWhitespace(line).startsWith("//")) {
            continue;
        }
        stripped.push(line);
    }
    return stripped;
}

function parse(data, title = "") {
    // split the input into individual lines    
    var lines = data.split("\n");

    // TODO: parse and remove comment lines
    lines = removeCommentedLines(lines);

    // "inserts" are info used to hold generated preprocessor 
    // html data, to be inserted into the 
    // final html after parsing with markdown
    var inserts = [];

    var outputLines = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        // remove "outline notes" - which are headings that have 
        // an @ symbol - used to display outline notes 
        // in a text outliner, but for it to be removed at compile
        if (isOutlineNote(line)) {
            continue;
        }

        // if a line contains custom markup
        if (containsCommand(line)) {

            var autoColumns = defaultAutoColumns;

            // parse the command string to see if it has arguments
            var optionSplit = line.split(":");

            if (optionSplit.length > 1) {
                var optionTokens = optionSplit[1].split(" ");
                var parsedColumns = parseInt(optionTokens[0]);
                if (!isNaN(parsedColumns)) {
                    autoColumns = parsedColumns;
                }
            }
            
            // a target array to pass to hold the resulting table lines
            var tableLines = [];
            var linesConsumed = 0;


            // process commands:

            if (line.includes("[table_d666twos")) {
                linesConsumed = generateTableD666Twos(lines, lineIndex + 1, tableLines, autoColumns);
            }
            else if (line.includes("[table_d666threes")) {
                linesConsumed = generateTableD666Threes(lines, lineIndex + 1, tableLines, autoColumns);
            }

            else if (line.includes("[table_d666")) {
                linesConsumed = generateTableD666(lines, lineIndex + 1, tableLines, autoColumns);
            }

            else if (line.includes("[table_d66")) {
                linesConsumed = generateTableD66(lines, lineIndex + 1, tableLines, autoColumns);
            }

            
            // NOTE: removing this older functionality
            // may bring it back as `table_d66_raw` or something...
            // else if (line.includes("[table_d66")) {
            //     linesConsumed = generateTableD66(lines, lineIndex + 1, 36, 3, 12, tableLines);
            // } 

            else if (line.includes("[table_d100")) {
                linesConsumed = generateAutoD100(lines, lineIndex + 1, tableLines, autoColumns);
            } else if (line.includes("[table_seq")) {
                linesConsumed = generateSequentialNumberedTable(lines, lineIndex + 1, tableLines, autoColumns);
            }
            else if (line.includes("[table_poly")) {
                linesConsumed = generatePolydieAutoTable(lines, lineIndex + 1, tableLines, autoColumns);
            }
            else if (line.includes("[raw")) {
                linesConsumed = generateRawChunk(lines, lineIndex + 1, tableLines);
            } else if (line.includes("[set")) {
                processSet(line);
            }
            else if (line.includes("[page_break")) {
                createInsertMarker(inserts, outputLines, pageBreakDiv);
            }
            
            // create an insert data object to associate the marker and the table html
            createInsertMarker(inserts, outputLines, tableLines.join("\n"));

            // jump over the lines making up the unparsed table
            lineIndex += linesConsumed;

            // HACKY way to infer that a table was created...
            if (linesConsumed > 0) {
                totalTablesGenerated++;
            }

        } else {
            // if no parsable item was found occurred, 
            // just push the current line
            outputLines.push(line);
        }
    }

    var finalOutput = "";
    // build a string from all the lines
    finalOutput += outputLines.join("\n");
    // remove html comments from the input before running markdown
    finalOutput = stripHtmlComments(finalOutput);
    // parse the markdown of the remaining text
    var finalOutput = markdown.toHTML(finalOutput);
    // replace all the table markers with the actual table html
    inserts.forEach((insert)=>{
        finalOutput = finalOutput.replace(insert.marker, insert.insertString);
    });
    var customHtmlHead = htmlHead.replace("{title}", title);
    // add html head and tail
    finalOutput = [customHtmlHead, finalOutput, htmlTail].join("");
    return finalOutput;
}

function processSet(commandString) {
    commandString = commandString.replace("[", "");
    commandString = commandString.replace("]", "");
    var tokens = commandString.split(" ");

    if (tokens.length == 1) {
        return;
    } 
    var target = tokens[1];

    // TODO: Put these in a dictionary so I don't have to translate the var name
    switch (target) {
        case "default_columns":
            if (tokens.length < 3) { 
                console.log("Invalid:", commandString);
                return; 
            } 
            var newValue = parseInt(tokens[2]);
            if (isNaN(newValue)) {
                console.log("Invalid (isNan):", commandString);
            } else {
                // TODO: i could make this a push/pop ??
                defaultAutoColumns = newValue;
            }
            break;

        case "d66_spacer":
            if (tokens.length < 3) { 
                console.log("Invalid:", commandString);
                return; 
            } 
            var boolString = removeAllWhitespace(tokens[2]);
            d66Spacer = boolString === 'true';
            break;

         case "render_die_type":
            if (tokens.length < 3) { 
                console.log("Invalid:", commandString);
                return; 
            } 
            var boolString = removeAllWhitespace(tokens[2]);
            renderDieType = boolString === 'true';
            break;

        default:
            console.log("Unknown set:", commandString);
            break;
    }
}

function generateRawChunk(lines, lineIndex, tableLines) {
    var endIndex = lineIndex;
    var linesConsumed = 0;
    // first, seek the end raw token
    for (let seekIndex = lineIndex; seekIndex < lines.length; seekIndex++) {
        const line = lines[seekIndex];
        linesConsumed++;
        if (line.includes("end_raw")) {
            endIndex = seekIndex - 1;
            break;
        }
    }
    for (let i = lineIndex; i <= endIndex; i++) {
        tableLines.push(lines[i]);
    }
    return linesConsumed;
}

function generateTableD66(lines, start, size, columns, rows, output) {
    output.push(tableHead);

    if (start >= lines.length) {
        console.log("start is out of index", start, "/" , size);
        return 0;
    }

    if (start + size >= lines.length) {
        console.log("Truncating table size, not enough data to fill", start, "/" , size);
        return 0;
    }

    output.push(`D66`);
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        output.push("  " + trHead);
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            output.push('      ' + tdHead);
            var lineIndex = start + rowIndex + columnIndex * rows;
            if (lineIndex < lines.length) {
                output.push("          " + lines[lineIndex]);    
            }
            output.push("      " + tdTail);
        }
        output.push("  " + trTail);
    }
    
    output.push(tableTail);

    return size;
}

function removeAllWhitespace(s) {
    // return line breaks
    s = s.replace(/(\r\n|\n|\r)/gm, "");
    // return spaces
    return s.replace(/\s+/g, '');
}

function isOutlineNote(s) {

    // if it's not a hash, then it's not an outline note
    if (s[0] != '#') {
        return false;
    }

    // find the first character that isn't a hash or a space
    // and if it's an `@`, it's an Outline Note
    for (var i = 1; i < s.length; i++) {
        var c = s[i];
        if (c != "#" && c != " ") {
            return c == '@';
        }
    }
}

// TODO: use this for comment detection instead of remove whitespace
function findFirstNonWhitespaceCharacter() {
    for (var i = 1; i < s.length; i++) {
        var c = s[i];
        if (c != " " && c != "\n    ") {
            return c == '@';
        }
    }
}

function seekTableEnd(lines, start) {
   // seek the end table token
   for (let seekIndex = start; seekIndex < lines.length; seekIndex++) {
        const line = lines[seekIndex];
        if (line.includes(TableEndToken)) {
            // minus one because we don't want to include the token in the table
            return seekIndex - 1;
        }
    }
    return -1;
}

function collectValidLines(lines, startIndex, endIndex) {
     // iterate the line range, and collect valid lines
    // (allows us to skip empty lines that have been used for 
    // organisational purpose while composing table lists)

    var hash = new Map();

    var validLines = [];
    for (let i = startIndex; i <= endIndex; i++) {
        var isLastItem = i == endIndex;
        const line = lines[i];
        // skip empty lines
        if (removeAllWhitespace(line) == "") {
            continue;
        }
        validLines.push(line);

        // check for duplicate entries
        if (hash.has(line)) {
            console.log("Warning - duplicate entry encountered:", line);
        }

        hash.set(line, true);
    }
    return validLines;
}

function generateAutoD100(lines, lineIndex, tableLines, columns = 3) {
    var endIndex = seekTableEnd(lines, lineIndex);
    if (endIndex < 0 || endIndex - lineIndex < 1) {
        // empty table
        return 0;
    }

    var linesConsumed = endIndex - lineIndex + 1;
    
    // iterate the line range, and collect valid lines
    // (allows us to skip empty lines that have been used for 
    // organisational purpose while composing table lists)
    var validLines = collectValidLines(lines, lineIndex, endIndex);
    var stride = Math.floor(100 / validLines.length);

    // build a basic list of numbered items before creating 
    // the final table lines
    var itemLines = [];

    // keep this outside the loop so we can look at it later.
    var rangeEnd = 0;
    for (let i = 0; i < validLines.length; i++) {
        var isLastItem = i == validLines.length - 1;
        const line = validLines[i];

        var rangeStart = (i * stride) + 1;
        rangeEnd = (i * stride + stride - 1) + 1;

        // Expand Last Item strategy:
        if (isLastItem && unusedRangeStrategy == UnusedRangeStrategy.ExpandLastItem) {
            rangeEnd = "100";
        } 

        var rangeString = rangeStart == rangeEnd ?
            "" + rangeStart
            : "" + rangeStart + "-" + rangeEnd;

        itemLines.push("<div><b>" + rangeString + "</b> - " + line + "</div>");
    }
    
    var fillerRange = null;
    if (rangeEnd < 100) {

        if (rangeEnd == 99) {
            fillerRange = "100"
        } else {
            fillerRange = "" + (rangeEnd + 1) + "-100";
        }    

        switch(unusedRangeStrategy) {
            case UnusedRangeStrategy.LeaveEmpty: /* Do nothing */ break;
            case UnusedRangeStrategy.ExpandLastItem: /* Handled Above */ break;
            case UnusedRangeStrategy.RollAgain: 
            itemLines.push("<div><b>" + fillerRange + "</b> - "+ RollAgainString + "</div>");
            break;
        }
    }

    // Finally, build the multi-column table
    buildMultiColumnTable(itemLines, tableLines, columns, "d100", validLines.length);

    return linesConsumed;
}

function generatePolydieAutoTable(lines, lineIndex, tableLines, columns = 3) {
    var endIndex = seekTableEnd(lines, lineIndex);

    if (endIndex < 0 || endIndex - lineIndex < 1) {
        // empty table
        return 0;
    }

    var linesConsumed = endIndex - lineIndex + 1;

    // iterate the line range, and collect valid lines
    // (allows us to skip empty lines)
    var validLines = collectValidLines(lines, lineIndex, endIndex);
    var lineCount = validLines.length;
    var linesConsumed = null;

    // select the best table type based on the number of items:
    switch (lineCount) {
        case 4: 
        case 6: 
        case 8:        
        case 10:
        case 12:
        case 20: 
        // these items are a good match for standard poly-die
        linesConsumed = generateSequentialNumberedTable(lines, lineIndex, tableLines, columns);
        break;
        
        case d66Rolls.length:
        // 36 items is a good fit for a d66 table
        linesConsumed = generateTableD66(lines, lineIndex, tableLines, columns);
        break;

        default:
            // fall back on a d100 table, with "roll again" padding if necessary
            linesConsumed = generateAutoD100(lines, lineIndex, tableLines, columns);
            break;
    }

    return linesConsumed;
}

function generateTableD66(lines, lineIndex, tableLines, columns = 3) {
    return generateTableLabeled(lines, lineIndex, tableLines, d66Rolls, d66Spacer, "d66", columns);
}

function generateTableD666(lines, lineIndex, tableLines, columns = 3) {
   return  generateTableLabeled(lines, lineIndex, tableLines, d666Rolls, d66Spacer, "d666", columns);
}

function generateTableD666Twos(lines, lineIndex, tableLines, columns = 3) {
   return  generateTableLabeled(lines, lineIndex, tableLines, d666TwosRolls, d66Spacer, "d666", columns);
}

function generateTableD666Threes(lines, lineIndex, tableLines, columns = 3) {
   return  generateTableLabeled(lines, lineIndex, tableLines, d666ThreesRolls, d66Spacer, "d666", columns);
}

function generateTableLabeled(
    lines, lineIndex, tableLines, 
    labels,
    useSpacer,
    tableTypeName,
    columns = 3
) {

    var endIndex = seekTableEnd(lines, lineIndex);

    if (endIndex < 0 || endIndex - lineIndex < 1) {
        // empty table
        return 0;
    }

    var linesConsumed = endIndex - lineIndex + 1;

    // iterate the line range, and collect valid lines
    // (allows us to skip empty lines)
    var validLines = collectValidLines(lines, lineIndex, endIndex);

    // build a basic list of numbered items before creating 
    // the final table lines
    var itemLines = [];
    var itemLength = labels.length;

    // build a list of spacer lines for this number of coumns
    var spacerLines = [];
    if (useSpacer) {
        var itemsPerColumn = Math.ceil( itemLength / columns);
        for (let i = 0; i < columns; i++) {
            var spacersRequired = Math.ceil(itemsPerColumn / 6) - 1;
            for (let ig = 0; ig < spacersRequired; ig++) {
                spacerLines.push(i*itemsPerColumn + ig * 6 + 6);
            }
        }
    }

    // keep this outside the loop so we can look at it later.
    var rangeEnd = 0;
    for (let i = 0; i < itemLength; i++) {

        var line = "<b>" +  labels[i] + "</b> - ";
        if (validLines.length > i) {

            if (useSpacer && spacerLines.indexOf(i) != -1) {
                itemLines.push("<div> &nbsp; </div>");
            }

            line += validLines[i];    
        }
        
        itemLines.push("<div>" + line + "</div>");
    }
    
    // Finally, build the multi-column table
    buildMultiColumnTable(itemLines, tableLines, columns, tableTypeName, validLines.length);

    return linesConsumed;
}


function generateSequentialNumberedTable(lines, lineIndex, tableLines, columns = 3) {
    var endIndex = seekTableEnd(lines, lineIndex);

    if (endIndex < 0 || endIndex - lineIndex < 1) {
        // empty table
        return 0;
    }

    var linesConsumed = endIndex - lineIndex + 1;

    // iterate the line range, and collect valid lines
    // (allows us to skip empty lines)
    var validLines = collectValidLines(lines, lineIndex, endIndex);

    // build a basic list of numbered items before creating 
    // the final table lines
    var itemLines = [];

    // keep this outside the loop so we can look at it later.
    var rangeEnd = 0;
    for (let i = 0; i < validLines.length; i++) {
        const line = validLines[i];
        itemLines.push("<div><b>" + (i+1) + "</b> - " + line + "</div>");
    }
    
    // Finally, build the multi-column table
    buildMultiColumnTable(itemLines, tableLines, columns, "d" + itemLines.length, validLines.length);

    return linesConsumed;
}

function buildMultiColumnTable(itemLines, tableLines, columns, rollType, validItemsCount) {
    var itemIndex = 0;
    var itemsPerColumn = Math.ceil(itemLines.length / columns);

    var customTdHead = tdHead.replace(
        "{width_style}",
        Math.floor(100 / columns) + "%" );

    if (verbose) {
        console.log("Table item count:", validItemsCount);
    }

    var tableItemsMax = columns * itemsPerColumn; 
    //console.log("size: ", validItemsCount, "/", tableItemsMax);
    if (validItemsCount > tableItemsMax) {
        console.log("Warning, some items are hidden ", validItemsCount, "/", tableItemsMax);
    }

    if (renderDieType) {
        if (renderItemCount) {
            tableLines.push(`<div><b>` + rollType + `</b> (<i>${validItemsCount} items</i>)</div>`);        
        } else {
            tableLines.push(`<div><b>` + rollType + `</b> </div>`);        
        }
    }

    if (printWarningsInDocument) {
        // warn about oversized arrays
        if (validItemsCount > tableItemsMax) {
            var numberHidden = validItemsCount - tableItemsMax;
            tableLines.push(`<div><b>WARNING</b> - ${numberHidden} items hidden (max. capacity: ${tableItemsMax} )</div>`);
        }
    }


    tableLines.push(tableHead);
    tableLines.push(trHead);


    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
        tableLines.push(customTdHead);
        for (let ci = 0; ci < itemsPerColumn; ci++) {
            if (itemIndex >= itemLines.length) {
                break;
            }
            tableLines.push(itemLines[itemIndex]);
            itemIndex++;
        }
        tableLines.push(tdTail);
    }
    tableLines.push(trTail);
    tableLines.push(tableTail);
}

// Outline notes are used to reveal outline notes
// within a text editor that will not be included in the 
// final output text
// any line that starts with hashes and is followed by 
// an at @ symbol (ignoring spaces)
// eg: ## @ Outline note goes here
function isOutlineNote(s) {

    // if it's not a hash, then it's not an outline note
    if (s[0] != '#') {
        return false;
    }

    // find the first character that isn't a hash or a space
    // and if it's an `@`, it's an Outline Note
    for (var i = 1; i < s.length; i++) {
        var c = s[i];
        if (c != "#" && c != " ") {
            return c == '@';
        }
    }
}



function printManual() {

    console.log(`
RPG Build

Usage - run command in directory containing \`rpgbuild.json\` config file: 

    \`rpgbuild\`

Format of \`rpgbuild.json\`

  {
    "title: ": "document_title",
    "sourceFiles": [
      "source/file1.md",
      "source/file2.md"
    ],
    "outputFile": "./www/output.html"
  }

Files are parsed and conbined into the final output html file.

Optional Arguments:

    --man -m -h - This Manual
    --verbose -v - Verbose Logging
    --dry-run -dr - Dry Run    
    `);

}