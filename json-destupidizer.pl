use 5.22.1;
use strict;
use integer;


my $out = "[\n";
my $buff;


# Loop over lines of input until only a newline is entered
while( ($buff = <>) =~ /^[^\n]+$/ ){
    chomp $buff;

    $buff =~ s/\[|\]//g;
    $buff =~ s/  ?\{(?!')/    \{\n/g;
    $buff =~ s/\"/\\\"/g;
    $buff =~ s/ (type|line|column|text)(?=:)/        \"\1\"/g;
    $buff =~ s/,/,\n/g;
    $buff =~ s/\'/\"/g;

    $buff =~ s/ \} ?/\n    \}/g;

    $out .= $buff;
}

print $out . "\n]";
