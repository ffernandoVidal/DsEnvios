from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def hello_world(request):
    """
    Endpoint que devuelve un mensaje de Hola Mundo
    """
    return Response({
        'message': 'Hola Mundo desde Django!',
        'status': 'success'
    })