#!/bin/bash
# Uses the first argument as the profile
twilio profiles:use $1

# deploys the serverless functions
deploy=`twilio serverless:deploy`

# saves the deployment in a variable to pull the service sid out of after

# in the deploy, the word after the word "domain" is the actual domain name
nextword=false
voice_domain="null"
event_domain="null"
for word in $deploy
do
    if [[ $nextword == true ]]; then
        #this is the domain
        voice_domain="https://${word}/incomingCall"
        event_domain="https://${word}/events"
        nextword=false
    fi
    if [[ "${word}" == "domain" ]]; then
        nextword=true
    fi
done

# need to remove the deploy info because it bogs down the next deployment
rm .twiliodeployinfo

# need to see all the phone numbers in twilio
result=`twilio api:core:incoming-phone-numbers:list`

# the word before the phone number is the sid 
sid="null"
lastword="null"
for word in $result
do
    if [[ "${word:0:1}" == "+" ]]; then
        sid=$lastword
    fi
lastword=$word
done
echo $voice_domain
# This will update the phone number to the new service
test= twilio api:core:incoming-phone-numbers:update \
    --sid $sid \
    --voice-url $voice_domain \
    --status-callback $event_domain

# to change to ui-editable
#twilio api:serverless:v1:services:update \
#    --sid ZS75489d15d55c02de14d460caaa1bab7d \
#    --ui-editable

# to delete
#twilio api:serverless:v1:services:remove \
#    --sid ZSfa7881333f99d5ca76dbd140e8213171 


#run this script
# ./twilio_profiles.sh {userName}


