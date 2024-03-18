import subprocess
import os
from dotenv import load_dotenv


load_dotenv()
cmd = ['./expect_twilio_login.sh', os.environ["TWILIO_SID"], os.environ["TWILIO_AUTH"], 'hi']
proc = subprocess.Popen(cmd)
proc.communicate()

proc2= subprocess.Popen(['./twilio_profiles.sh', 'hi'])
proc2.communicate()

print('code: ' + str(proc.returncode))
print('code: ' + str(proc2.returncode))