```yaml
# Client Metadata Options
OPENID_CLIENT_ID=<client_id>
OPENID_CLIENT_SECRET=<client_seret>
OPENID_REDIRECT_URIS=http://localhost:8080/openid/callback

# Session Options
OPENID_SESSION_KEYS=<session_key>

# Client Server Options
OPENID_DISCOVERY_ENDPOINT=https://login.microsoftonline.com/db05faca-c82a-4b9d-b9c5-0f64b6755421/v2.0/.well-known/openid-configuration
OPENID_SCOPE=openid profile email offline_access

# Proxy Options
OPENID_PROXY_PATHS=/api
OPENID_PROXY_HOSTS=http://localhost:3005

# Logger Options
OPENID_LOG_NAME=next-app
```