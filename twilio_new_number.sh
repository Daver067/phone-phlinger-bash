#!/bin/bash
# phone number is the first arg to this script
phone_number="$1"

# the domain being used is the second arg
voice_domain="https://${2}/incomingCall"
event_domain="https://${2}/events"

# save the list of phone numbers in result
result=`twilio api:core:incoming-phone-numbers:list`

# the word before the phone number is the sid 
sid="null"
lastword="null"
for word in $result
do
    if [[ "${word}" == "${phone_number}" ]]; then
        sid=$lastword
    fi
lastword=$word
done

# update the number to the right webhook location
test= twilio api:core:incoming-phone-numbers:update \
    --sid $sid \
    --voice-url $voice_domain \
    --status-callback $event_domain

