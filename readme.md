# id3

id3 tagging of mp3 files

Script made in nodejs, and made solely for my Ubuntu Linux machine.

## Install

Edit `bin/z.id3` to suit your preferred location  

Copy `bin/z.id3` to ~/bin  


`$ chmod +x z.id3`  

I prefix my scripts with "z." for convenience. Rename if you want to.

## Usage

    $ z.id3 path/to/folder

## Requirements

Nodejs (~14.17.6) must be installed.  

Command `id3v2` must be available for execSync.

The `folder` must follow a strong naming convention, or else it will complain and refuse to do anything until you have tidied up. What's the point of having a messy mp3 archive anyway? The script also assumes that you are a nice person who supports your favourite bands and buys their music.

Examples of excellent music with proper folder and file names:

    Disasterpeace - FEZ (2012)/01 - Adventure.mp3
    Highasakite - Silent Treatment (Vinyl Digital Audio) (2014)/04 - Hiroshima.mp3
    Tame Impala - InnerSpeaker (2010)/07 - Jeremy's Storm.mp3

## The story so far

2005-2007: first version coded in Perl. The script was a trusty old friend for many many years.

2015: converted to PHP with dependency get-id3

2021: rewrite using nodejs

