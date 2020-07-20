```yaml
# Client Metadata Options
OPENID_CLIENT_ID=<client_id>
OPENID_CLIENT_SECRET=<client_seret>
OPENID_REDIRECT_URIS=http://localhost:8080/openid/callback

# Session Options
OPENID_SESSION_KEYS=<session_key>

OPENID_SCOPE=user email

# Enable Oauth2
ENABLE_OAUTH2=true
OAUTH2_AUTH_ENDPOINT=https://github.com/login/oauth/authorize
OAUTH2_TOKEN_ENDPOINT=https://github.com/login/oauth/access_token
OAUTH2_USERINFO_ENDPOINT=https://github.com/api/v3/user

# Logger Options
OPENID_LOG_NAME=next-app
```