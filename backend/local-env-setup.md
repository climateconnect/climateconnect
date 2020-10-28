# ENV variable setup

Following is a list of `.backend_env` variables required to run server
locally.

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


CLIMATE_CONNECT_SUPPORT_EMAIL=<SUPPORT EMAIL>
FRONTEND_URL=<YOUR FRONTEND URL. eg: http://localhost:3001


SECRET_KEY=<Django secret key>
DATABASE_NAME=<database name>
DATABASE_USER=<database user>
DATABASE_PASSWORD=<database admin>
DATABASE_HOST=<database host>
DATABASE_PORT=<database port>
ALLOWED_HOSTS=<hosts allowed. eg: http://localhost:8000>
ENVIRONMENT=<Environment you are in, eg: development>
GS_BUCKET_NAME=<google storage bucket>
GOOGLE_APPLICATION_CREDENTIALS=<path to google app credentials>
```
