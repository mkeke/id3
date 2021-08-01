#!/usr/bin/php
<?php
require "vendor/autoload.php";

/*
  id3tagging.php
  tags mp3 files in a folder

  install:
  composer install

  usage:
  id3tagging.php <dir>

  dependency: get-id3
  https://github.com/nass600/getID3

  dir must conform to the following naming convention:
  artist - title (year)

  mp3 files in dir must conform to the following naming convention:
  04 - the title.mp3

  no tagging will be done if one or more files do not adhere to the
  naming convention.

  2015-11-10 Simen Lysebo

  TODO: keep other tags if present, such as image
    might have to extract stuff and put it back in.
*/

/*
// Initialize getID3 engine
$getID3 = new getID3;
// Analyze file and store returned data in $ThisFileInfo
$tags = $getID3->analyze("testfile.mp3");
var_dump($tags);

$getID3 = new getID3;
$getID3->setOption(array('encoding'=>'UTF-8'));
*/

$tagwriter = new getid3_writetags;
$tagwriter->tagformats = array('id3v2.3');
$tagwriter->overwrite_tags = true;
$tagwriter->tag_encoding   = 'UTF-8';
$tagwriter->remove_other_tags = false;

// check params
if (count($argv) < 2) {
  die("  usage: id3tagging <dir>\n");
}
if (!is_dir($argv[1])) {
  die("  '" . $argv[1] . "' is not a valid dir\n");
}

// remove any trailing slash
$dir = $argv[1];
$dir = preg_replace('/\/$/', '', $dir);

echo "  looking for files in '$dir'\n";

// collect relevant files in dir
$files = [];
foreach(glob($dir . '/*') as $file) {
  if (preg_match('/\.mp3$/i', $file)) {
    $files[] = $file;
  }
}

// check naming convention
echo "  checking " . count($files) . " file names\n";
$errors = false;
foreach($files as $file) {
  if (!preg_match('/^(.+)? - (.+)? \((\d\d\d\d)\)\/(\d\d) - (.+)?\.mp3?$/i', $file)) {
    echo "  - not accepted: $file\n";    
    $errors = true;
  }
}
if ($errors) {
  die ("  fix errors and try again\n");
}

// tag files
echo "  tagging..\n";
foreach ($files as $file) {
  preg_match('/^(.+)? - (.+)? \((\d\d\d\d)\)\/(\d\d) - (.+)?\.mp3?$/i', $file, $matches);
  $tagData = array(
    'artist' => array($matches[1]),
    'album' => array($matches[2]),
    'year' => array($matches[3]),
    'track' => array($matches[4]),
    'title' => array($matches[5]),
  );
  $tagwriter->filename = $file;
  $tagwriter->tag_data = $tagData;
  if ($tagwriter->WriteTags()) {
    echo "  OK $file\n";
  } else {
    echo "  ERR: $file " . $tagwriter->errors . "\n";
  }

}

echo "  done.\n";
