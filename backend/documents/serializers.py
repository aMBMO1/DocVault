from django.conf import settings
from django.utils.text import slugify
from rest_framework import serializers

from .models import Categorie, Document, User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "initials",
            "role",
            "is_active",
            "date_joined",
        ]

    def get_name(self, obj):
        full = (
            f"{obj.first_name} {obj.last_name}"
        ).strip()

        return full or obj.username

    def get_initials(self, obj):
        if obj.first_name and obj.last_name:
            return (
                f"{obj.first_name[0]}"
                f"{obj.last_name[0]}"
            ).upper()

        return obj.username[:2].upper()


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="nom",
        read_only=True,
    )

    slug = serializers.SerializerMethodField()

    count = serializers.SerializerMethodField()

    documentCount = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Categorie

        fields = [
            "id",
            "name",
            "nom",
            "slug",
            "description",
            "date_creation",
            "count",
            "documentCount",
        ]

    def get_slug(self, obj):
        return slugify(obj.nom)

    def get_count(self, obj):
        return obj.documents.count()

    def get_documentCount(self, obj):
        return obj.documents.count()


class DocumentSerializer(
    serializers.ModelSerializer
):
    name = serializers.CharField(
        source="nom",
        read_only=True,
    )

    fileUrl = (
        serializers.SerializerMethodField()
    )

    categorySlug = (
        serializers.SerializerMethodField()
    )

    categoryName = (
        serializers.SerializerMethodField()
    )

    size = (
        serializers.SerializerMethodField()
    )

    date = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Document

        fields = [
            "id",
            "name",
            "nom",
            "description",
            "fileUrl",
            "fichier",
            "type",
            "taille",
            "size",
            "date",
            "date_creation",
            "date_modification",
            "categorySlug",
            "categoryName",
            "texte_ocr",
        ]

        read_only_fields = [
            "name",
            "nom",
            "fileUrl",
            "fichier",
            "type",
            "taille",
            "size",
            "date",
            "date_creation",
            "date_modification",
            "categorySlug",
            "categoryName",
            "texte_ocr",
        ]

    # ==========================================
    # FILE URL
    # ==========================================

    def get_fileUrl(self, obj):
        if not obj.fichier:
            return ""

        # Railway production:
        # use the explicit backend public URL
        backend_url = getattr(
            settings,
            "BACKEND_PUBLIC_URL",
            "",
        ).rstrip("/")

        if backend_url:
            return (
                f"{backend_url}"
                f"{settings.MEDIA_URL}"
                f"{obj.fichier.name}"
            )

        # Local development fallback
        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.fichier.url
            )

        return obj.fichier.url

    # ==========================================
    # CATEGORY SLUG
    # ==========================================

    def get_categorySlug(self, obj):
        return slugify(
            obj.categorie.nom
        )

    # ==========================================
    # CATEGORY NAME
    # ==========================================

    def get_categoryName(self, obj):
        return obj.categorie.nom

    # ==========================================
    # FILE SIZE
    # ==========================================

    def get_size(self, obj):
        size = obj.taille or 0

        if size < 1024:
            return f"{size} o"

        if size < 1024 * 1024:
            return (
                f"{size / 1024:.1f} Ko"
            )

        if size < 1024 * 1024 * 1024:
            return (
                f"{size / (1024 * 1024):.1f} Mo"
            )

        return (
            f"{size / (1024 * 1024 * 1024):.2f} Go"
        )

    # ==========================================
    # DATE
    # ==========================================

    def get_date(self, obj):
        if not obj.date_creation:
            return ""

        return obj.date_creation.strftime(
            "%d/%m/%Y"
        )