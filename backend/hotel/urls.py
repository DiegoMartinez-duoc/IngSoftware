from django.urls import path
from .views import registro, login
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('registro/', registro, name='registro'),
    path('login/', login, name='login'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)