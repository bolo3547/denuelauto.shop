Certbot and Nginx notes for the API
==================================

A concrete config for `api.denuel-auto.com` is included as `api.denuel-auto.com.conf` in this directory. To create a config for another domain, either run `replace-domain.sh your.domain.com` (from this directory) to produce `api.your.domain.com.conf` or manually replace all occurrences of `DOMAIN.com` in the `api.DOMAIN.com.conf` file with your real domain. Ensure your DNS A record points to the server's public IP before requesting certificates.

Obtain a certificate (recommended: `--nginx` plugin):

```bash
# install certbot and nginx plugin (Debian/Ubuntu)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# automatically edit Nginx config and obtain cert for api.denuel-auto.com
sudo certbot --nginx -d api.denuel-auto.com
```

If you prefer `webroot` mode:

```bash
sudo certbot certonly --webroot -w /var/www/html -d api.denuel-auto.com
# then reload nginx after certs are placed
sudo systemctl reload nginx
```

Verify renewal (dry-run):

```bash
sudo certbot renew --dry-run
```

Automatic renewal is handled by systemd timers or cron installed by Certbot. You can also add a nightly cron that runs `certbot renew` and reloads Nginx on success:

```cron
0 3 * * * root certbot renew --quiet && systemctl reload nginx
```

Notes
- Ensure `server_name` in `api.DOMAIN.com.conf` matches your domain.
- Check logs at `/var/log/letsencrypt/` if certificate issuance fails.
- If you use Cloudflare or another proxy, either disable proxying (orange cloud) or use DNS-01 validation.
