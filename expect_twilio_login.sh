#!/usr/bin/expect
set sid [lindex $argv 0];
set auth [lindex $argv 1];
set user [lindex $argv 2];
spawn ./twilio_login.sh
expect -exact "? The Account SID for your Twilio Account or Subaccount:\r"
send -- "${sid}\r"
expect -exact "? Your Twilio Auth Token for your Twilio Account or Subaccount:\r"
send -- "${auth}\r"
expect -exact "? Shorthand identifier for your profile:\r"
send -- "${user}\r"
expect eof


# to run this file use code below
#./expect_twilio_login.sh {SID} {AUTH} hihihi