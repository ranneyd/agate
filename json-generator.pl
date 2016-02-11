use 5.22.1;
use strict;
use integer;


my $out = "[\n";
my $buff;
my $noTextTokens = qw{indent dedent newline assignment openParen closeParen};

# Loop over lines of input until only a newline is entered
while( ($buff = <>) =~ /^[^\n]+$/ ){
    # Replace all contiguous whitespace with a single space
    # $buff =~ s/\s+//g;
    chomp $buff;

    $out .= "\t{\n\t\t\"type\": \"$buff\",\n";

    if( !(grep {$buff eq $_} $noTextTokens) ) {
        my $newbuff = <>;
        chomp $newbuff;
        $newbuff =~ s/"/\\"/g;
        $out .= "\t\t\"text\": \"$newbuff\"\n";
    }

    $out .= "\t},\n";
}

print $out . "]";
