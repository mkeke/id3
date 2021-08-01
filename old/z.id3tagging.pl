#!/usr/bin/perl
# z.id3.tagging.v2 <dir>
# create id3v1 & id3v2 tags on multiple mp3 files based on path/filename
# path/filename must conform to the following standard:
# artist - title (year)/track - song title.mp3
# this script requires that the command id3v2 is accessible
# May 1 2005 Simen Lysebo (simen@slaatten.net)
# June 12 2006 Simen Lysebo (simen@slaatten.net)
# June 2 2007 Simen Lysebo (simen@slaatten.net)
#      modified to only use the id3v2 command

if ($#ARGV < 0){ die "z.id3.tagging.v2 <dir>\n"; }
if (!-d $ARGV[0]){ die "$ARGV[0] is not a directory\n"; }

@arrFiles; # contains all the valid files in <dir> as "path/filename"

# put all valid dirs in @arrTempDirs
print "1. getting list of mp3 files within $ARGV[0] ..\n";
opendir (DIR, $ARGV[0]) or die "can't open $ARGV[0] - $!\n";
my @arrTempDirs = grep !/^\.\.?$/, readdir(DIR);
closedir (DIR);

# put all mp3 files in @arrFiles
foreach $strTempDir (sort @arrTempDirs){
  # ignore everything but dirs
  if (-d "$ARGV[0]/$strTempDir"){
    opendir (DIR, "$ARGV[0]/$strTempDir") or die "can't open $strTempDir - $!\n";
    my @arrTempFiles = grep !/^\.\.?$/, readdir(DIR);
    closedir (DIR);
    foreach $strTempFile (@arrTempFiles){
      if ($strTempFile =~ m/.*\.mp3?$/i){
        push @arrFiles, "$strTempDir/$strTempFile";
      }
    }
  }
}

print "2. checking paths and file names ..\n";
$blnOK = "true";
foreach $strFile (@arrFiles){
  if ($strFile !~ m/^(.*)? - (.*)? \((\d\d\d\d)\)\/(\d\d) - (.*)?\.mp3?$/i){
    print " not accepted: $strFile\n";
    $blnOK = "false";
  }
  else{
    if ($1 eq "" || $2 eq "" || $3 eq "" || $4 eq "" || $5 eq ""){
      print "something fishy with $strFile\n";
      $blnOK = "false";
    }
#    ($strFirst, $strSecond) = split ("/", $strFile);
#    if (length($strFirst) > 103){
#       print "Album > 103 chars: $strFirst\n";
#       $blnOK = "false";
#    }
#    if (length($strSecond) > 103){
#       print "Song title > 103 chars: $strFile\n";
#       $blnOK = "false";
#    }
#    print "$strFile ------------------------------\n";
#    print "artist: $1\n";
#    print "album: $2\n";
#    print "year: $3\n";
#    print "track: $4\n";
#    print "title: $5\n";
  }

}
if ($blnOK eq "false"){
  die "fix the filename errors and try again.\n";
}

print "3. applying id3 tags ..\n";
foreach $strFile (@arrFiles){
  print "$strFile\n";
}
die "2021\n";

foreach $strFile (@arrFiles){
  if ($strFile =~ m/^(.*)? - (.*)? \((\d\d\d\d)\)\/(\d\d) - (.*)?\.mp3?$/i){
#    print "$strFile og $1\n";
    $strArtist = $1;
    $strAlbum = $2;
    $strYear = $3;
    $strTrack = $4;
    $strTitle = $5;
#    print " $strArtist - $strAlbum - $strYear - $strTrack - $strTitle\n";

    # backslash "
    
    $strFile =~ s/"/\\"/g; # "
    $strArtist =~ s/"/\\"/g; # "
    $strAlbum =~ s/"/\\"/g; # "
    $strTitle =~ s/"/\\"/g; # "

    # backslash $
    $strFile =~ s/\$/\\\$/g; # "
    $strArtist =~ s/\$/\\\$/g; # "
    $strAlbum =~ s/\$/\\\$/g; # "
    $strTitle =~ s/\$/\\\$/g; # "


    # remove id3v1 and id3v2
    system "id3v2 -D \"$ARGV[0]/$strFile\"";

    # set only id3v2 tags
    system "id3v2 -2 -a \"$strArtist\" -A \"$strAlbum\" -t \"$strTitle\" -y $strYear -T \"$strTrack\" \"$ARGV[0]/$strFile\"";

    #system "id3v2 -2 -a \"$strArtist\" -A \"$strAlbum\" -y \"$strYear\" -T \"$strTrack\" -t \"$strTitle\" $ARGV[0]/$strFile";
    # set both id3v1 and id3v2
    # print "id3tag -a$strArtist -A$strAlbum -s$strTitle -y$strYear -t$strTrack $ARGV[0]/$strFile \n";
    # system "id3tag -a$strArtist -A$strAlbum -s$strTitle -y$strYear -t$strTrack $ARGV[0]/$strFile";
    #print ".";


  }
}
