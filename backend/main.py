from climateconnect_main.wsgi import application

# Google App engine looks for a main.py file at the root of the app with a
# WSGI-compatible export called app.
app = application
