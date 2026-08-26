from django.contrib import admin
from .models import Categorie, Document, PersonalDrive, User

admin.site.register(User)
admin.site.register(PersonalDrive)
admin.site.register(Categorie)
admin.site.register(Document)
