
# ';--have i been pwned?
## Check if your email or phone is in a data breach

La doc : https://haveibeenpwned.com/API/v3#Authorisation  
L'API nodeJS me plait bien... : https://github.com/wKovacs64/hibp  

Haveibeenpwned API KEY : cbd********************36a3  

Dev : http://ihavebp.eu.ngrok.io  
Prod : https://hibp.labinno.fr  
GIT : https://git.labinno.fr/cloud/hibp/server  

reCAPTCHA : https://www.google.com/u/0/recaptcha/admin/site/475183744  
Doc : https://www.google.com/u/0/recaptcha/admin/site/475183744/setup  
Site KEY : 6LdeClYc********************i7  
Secret KEY : 6LdeCl********************sZ  
Recaptacha : 596********************i368.apps.googleusercontent.com  

Google Cloud : https://console.cloud.google.com/apis/credentials/wizard?authuser=1&folder=&organizationId=&project=pwned-3********************8  
API KEY : AIz********************1ySk

## Ngrok

https://ngrok.com/docs#config  
Put ngrok bin in current project then...

```shell
$ sudo nano $HOME/.ngrok2/ngrok.yml
```

```yaml
authtoken: 42nv34********************c1i9C
tunnels:
  ihbp:
    addr: 80
    proto: http
    hostname: ihavebp.eu.ngrok.io
    region: eu
```

```shell
$ cd /mnt/c/www/i.have.be/server/
$ ./ngrok start ihbp
```
## WSL

in /home/juju/.bashrc  

```shell
alias browser="/mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe"
```

...thus in package.json  

```JSON
"scripts": {
    "open": "npm run start && browser http://ihavebp.eu.ngrok.io"
}
```

## NodeJS start

Start Ngrok

```shell
$ cd /mnt/c/www/i.have.be/server/
$ ./ngrok start ihbp
```

Start application

```shell
$ cd /mnt/c/www/i.have.be/server/
$ npm run start
```
