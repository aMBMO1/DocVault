from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Administrateur"),
        ("user", "Utilisateur"),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class PersonalDrive(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="drive")
    nom = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom


class Categorie(models.Model):
    drive = models.ForeignKey(PersonalDrive, on_delete=models.CASCADE, related_name="categories")
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_creation"]
        constraints = [
            models.UniqueConstraint(fields=["drive", "nom"], name="unique_category_per_drive"),
        ]

    def __str__(self):
        return self.nom


class Document(models.Model):
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name="documents")
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    fichier = models.FileField(upload_to="documents/")
    type = models.CharField(max_length=100, blank=True)
    taille = models.BigIntegerField(default=0)
    texte_ocr = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return self.nom
