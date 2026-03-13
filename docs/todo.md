1- 当前网站是http，如何改成https。 ✅

vul@kooreyw:/var/www/html/learn$ sudo certbot --apache -d learn.mtnote.cn -d www.mtnote.cn
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for learn.mtnote.cn and www.mtnote.cn

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/learn.mtnote.cn/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/learn.mtnote.cn/privkey.pem
This certificate expires on 2026-06-06.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for learn.mtnote.cn to /etc/apache2/sites-available/learn-mtnote-le-ssl.conf
Successfully deployed certificate for www.mtnote.cn to /etc/apache2/sites-available/mtnote-main-le-ssl.conf
Congratulations! You have successfully enabled HTTPS on https://learn.mtnote.cn and https://www.mtnote.cn

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# 如果真的过期了
sudo certbot renew

# 万一域名解析变了
sudo certbot --apache -d learn.mtnote.cn -d www.mtnote.cn