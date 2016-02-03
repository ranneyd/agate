use strict;
use warnings;
use integer;

use Data::Dumper qw(Dumper);

sub analyze;
sub main;

sub analyze{
    my ( $code ) = @_;
}


sub main{

    # Read from file
    # thanks http://perlmaven.com/open-and-read-from-files
    my $filename = $ARGV[0];

    open(my $fh, '<:encoding(UTF-8)', $filename)
        or die "File '$filename' does not exist :(";

    my $code = "";


    while (my $row = <$fh>) {
        $code .= $row;
    }

    analyze $code;
}

main();