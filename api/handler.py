from memory_game.wsgi import application

def app(environ, start_response):
    return application(environ, start_response)
