# ENV variable setup

Following is a list of `.backend_env` variables required to run server
locally.


Basic env variables which you will need for initial setup:
(use double quotes for all values)
```
FRONTEND_URL=<YOUR FRONTEND URL. eg: http://localhost:3001>


SECRET_KEY=<Django secret key>
DATABASE_NAME=<database name>
DATABASE_USER=<database user>
DATABASE_PASSWORD=<database admin>
DATABASE_HOST=<database host>
DATABASE_PORT=<database port>
ALLOWED_HOSTS=<hosts allowed. eg: http://localhost:8000>
ENVIRONMENT=<Environment you are in, eg: development>
```
Env variables needed for email sending with [mailjet](https://www.mailjet.com/):

```EMAIL_HOST=<YOUR EMAIL HOST>
EMAIL_HOST_USER=<EMAIL CLIENT USER>
EMAIL_HOST_PASSWORD=<EMAIL CLIENT PASSWORD>
EMAIL_PORT=<EMAIL PORT>

MJ_APIKEY_PUBLIC=<API key public>
MJ_APIKEY_PRIVATE=<API secret>
EMAIL_VERIFICATION_TEMPLATE_ID=<TEMPLATE ID>
NEW_EMAIL_VERIFICATION_TEMPLATE_ID=<TEMPLATE ID>
RESET_PASSWORD_TEMPLATE_ID=<TEMPLATE ID>
FEEDBACK_TEMPLATE_ID=<TEMPLATE ID>
PRIVATE_MESSAGE_TEMPLATE_ID=<TEMPLATE ID>
GROUP_MESSAGE_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_COMMENT_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_COMMENT_REPLY_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_FOLLOWER_TEMPLATE_ID=<TEMPLATE ID>


CLIMATE_CONNECT_SUPPORT_EMAIL=<SUPPORT EMAIL>
```