import subprocess
import os
from dotenv import load_dotenv
import string
import random

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

id = id_generator()


load_dotenv()
cmd = ['./expect_twilio_login.sh', os.environ["TWILIO_SID"], os.environ["TWILIO_AUTH"], id]
proc = subprocess.Popen(cmd)
proc.communicate()

proc2= subprocess.Popen(['./twilio_profiles.sh', id])
proc2.communicate()

print('code: ' + str(proc.returncode))
print('code: ' + str(proc2.returncode))