use 5.22.1;
use strict;
use integer;


my $out = "[\n";
my $buff;
my @noTextTokens = qw{indent
                      dedent
                      newline
                      assignment
                      openParen
                      closeParen
                      openCurly
                      closeCurly
                      hash
                      dot
                      tilde
                      script
                      style
                    };

# Loop over lines of input until only a newline is entered
while( ($buff = <>) =~ /^[^\n]+$/ ){
    # Replace all contiguous whitespace with a single space
    # $buff =~ s/\s+//g;
    chomp $buff;

    $out .= "\t{\n\t\t\"type\": \"$buff\"";

    if( !(grep {$buff eq $_} @noTextTokens) ) {
        my $newbuff = <>;
        chomp $newbuff;
        # fix backslashes
        $newbuff =~ s/\\/\\\\/g;
        # fix quotes
        $newbuff =~ s/"/\\"/g;
        $out .= ",\n\t\t\"text\": \"$newbuff\"";
    }

    $out .= "\n\t},\n";
}

print $out . "]";
