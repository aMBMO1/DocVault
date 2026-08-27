from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Categorie, Document, PersonalDrive, User
from .ocr import extract_text
from .permissions import IsAdminUserRole
from .serializers import CategorySerializer, DocumentSerializer, UserSerializer

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from .models import Categorie
from .serializers import CategorySerializer


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def category_rename(request, category_id):
    category = get_object_or_404(
        Categorie,
        id=category_id,
        drive__user=request.user,
    )

    name = str(
        request.data.get("name", "")
    ).strip()

    if not name:
        return Response(
            {
                "detail": "Le nom de la catégorie est obligatoire."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    category.nom = name

    category.save()

    return Response(
        CategorySerializer(category).data,
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def category_delete(request, category_id):
    try:
        category = Categorie.objects.get(
            id=category_id,
            drive__user=request.user,
        )
    except Categorie.DoesNotExist:
        return Response(
            {"detail": "Catégorie introuvable."},
            status=status.HTTP_404_NOT_FOUND,
        )

    category.delete()

    return Response(
        {"detail": "Catégorie supprimée avec succès."},
        status=status.HTTP_200_OK,
    )

def _user_categories(request):
    qs = Categorie.objects.select_related("drive", "drive__user")
    if request.user.role == "admin":
        return qs
    return qs.filter(drive__user=request.user)


def _user_documents(request):
    qs = Document.objects.select_related("categorie", "categorie__drive", "categorie__drive__user")
    if request.user.role == "admin":
        return qs
    return qs.filter(categorie__drive__user=request.user)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = str(request.data.get("email", "")).strip().lower()
    password = request.data.get("password", "")
    if not email or not password:
        return Response({"detail": "Email et mot de passe obligatoires."}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "Email ou mot de passe incorrect."}, status=401)

    if not user.is_active:
        return Response({"detail": "Ce compte est désactivé."}, status=403)
    if authenticate(username=user.username, password=password) is None:
        return Response({"detail": "Email ou mot de passe incorrect."}, status=401)

    PersonalDrive.objects.get_or_create(
        user=user,
        defaults={"nom": f"Personal Drive {user.first_name or user.username}"},
    )
    refresh = RefreshToken.for_user(user)
    data = UserSerializer(user).data
    data.update({"refresh": str(refresh), "access": str(refresh.access_token)})
    return Response(data)


@api_view(["GET"])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
def users_list(request):
    if request.user.role != "admin":
        return Response({"detail": "Accès réservé aux administrateurs."}, status=403)
    return Response(UserSerializer(User.objects.order_by("-id"), many=True).data)


@api_view(["POST"])
def users_create(request):
    if request.user.role != "admin":
        return Response({"detail": "Accès réservé aux administrateurs."}, status=403)

    username = str(request.data.get("username", "")).strip()
    email = str(request.data.get("email", "")).strip().lower()
    password = request.data.get("password", "")
    role = request.data.get("role", "user")
    first_name = str(request.data.get("first_name", "")).strip()
    last_name = str(request.data.get("last_name", "")).strip()
    if role not in {"admin", "user"}:
        role = "user"
    if not username or not email or not password:
        return Response({"detail": "username, email et password sont obligatoires."}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "Ce username existe déjà."}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "Cet email existe déjà."}, status=400)

    user = User.objects.create(
        username=username,
        email=email,
        password=make_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_staff=(role == "admin"),
    )
    PersonalDrive.objects.create(user=user, nom=f"Personal Drive {first_name or username}")
    return Response(UserSerializer(user).data, status=201)


@api_view(["PATCH", "DELETE"])
def user_detail(request, user_id):
    if request.user.role != "admin":
        return Response({"detail": "Accès réservé aux administrateurs."}, status=403)
    user = get_object_or_404(User, id=user_id)
    if request.method == "DELETE":
        if user.id == request.user.id:
            return Response({"detail": "Vous ne pouvez pas supprimer votre propre compte."}, status=400)
        user.delete()
        return Response(status=204)

    name = request.data.get("name")
    if name is not None:
        parts = str(name).strip().split()
        user.first_name = parts[0] if parts else ""
        user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    role = request.data.get("role")
    if role in {"admin", "user"}:
        user.role = role
        user.is_staff = role == "admin"
    user.save()
    return Response(UserSerializer(user).data)


@api_view(["PATCH"])
def user_status(request, user_id):
    if request.user.role != "admin":
        return Response({"detail": "Accès réservé aux administrateurs."}, status=403)
    user = get_object_or_404(User, id=user_id)
    if user.id == request.user.id:
        return Response({"detail": "Vous ne pouvez pas désactiver votre propre compte."}, status=400)
    value = request.data.get("status")
    user.is_active = value in {True, "true", "1", 1, "active", "Actif"}
    user.save(update_fields=["is_active"])
    return Response(UserSerializer(user).data)




@api_view(["GET"])
def categories_list(request):
    return Response(CategorySerializer(_user_categories(request), many=True).data)


@api_view(["GET"])
def category_detail(request, slug):
    category = next((c for c in _user_categories(request) if slugify(c.nom) == slug), None)
    if category is None:
        return Response({"detail": "Catégorie introuvable."}, status=404)
    return Response(CategorySerializer(category).data)


@api_view(["POST"])
def category_create(request):
    name = str(request.data.get("name", "")).strip()
    description = str(request.data.get("description", "")).strip()
    if not name:
        return Response({"detail": "Nom de catégorie obligatoire."}, status=400)
    drive, _ = PersonalDrive.objects.get_or_create(
        user=request.user,
        defaults={"nom": f"Personal Drive {request.user.first_name or request.user.username}"},
    )
    try:
        category = Categorie.objects.create(drive=drive, nom=name, description=description)
    except IntegrityError:
        return Response({"detail": "Cette catégorie existe déjà dans votre Drive."}, status=400)
    return Response(CategorySerializer(category).data, status=201)


@api_view(["PATCH", "DELETE"])
def category_detail_by_id(request, category_id):
    category = get_object_or_404(_user_categories(request), id=category_id)
    if request.method == "PATCH":
        name = str(request.data.get("name", "")).strip()
        description = request.data.get("description")
        if name:
            category.nom = name
        if description is not None:
            category.description = str(description)
        try:
            category.save()
        except IntegrityError:
            return Response({"detail": "Cette catégorie existe déjà."}, status=400)
        return Response(CategorySerializer(category).data)
    category.delete()
    return Response(status=204)


@api_view(["GET"])
def documents_list(request):
    qs = _user_documents(request)
    slug = request.GET.get("category")
    search = request.GET.get("search", "").strip()
    if slug:
        qs = qs.filter(categorie__nom__isnull=False)
        qs = [d for d in qs if slugify(d.categorie.nom) == slug]
    else:
        qs = qs
    if search:
        search_l = search.lower()
        qs = [d for d in qs if search_l in d.nom.lower() or search_l in d.description.lower()]
    if isinstance(qs, list):
        docs = qs
    else:
        docs = qs.order_by("-date_creation")
    return Response(DocumentSerializer(docs, many=True, context={"request": request}).data)


@api_view(["GET"])
def documents_recent(request):
    try:
        limit = max(1, min(int(request.GET.get("limit", 5)), 20))
    except ValueError:
        limit = 5
    docs = _user_documents(request).order_by("-date_creation")[:limit]
    return Response(DocumentSerializer(docs, many=True, context={"request": request}).data)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def document_create(request):
    name = str(request.data.get("name", "")).strip()
    description = str(request.data.get("description", "")).strip()
    category_id = request.data.get("categoryId") or request.data.get("category")
    uploaded_file = request.FILES.get("file")
    if not uploaded_file or not category_id:
        return Response({"detail": "Fichier et catégorie obligatoires."}, status=400)

    category = get_object_or_404(_user_categories(request), id=category_id)
    document = Document.objects.create(
        categorie=category,
        nom=name or uploaded_file.name,
        description=description,
        fichier=uploaded_file,
        type=uploaded_file.content_type or "application/octet-stream",
        taille=uploaded_file.size,
    )

    try:
        document.texte_ocr = extract_text(document.fichier.path)
        document.save(update_fields=["texte_ocr"])
    except Exception:
        # OCR must never block a normal upload.
        pass

    return Response(DocumentSerializer(document, context={"request": request}).data, status=201)


@api_view(["PATCH", "DELETE"])
def document_detail(request, document_id):
    document = get_object_or_404(_user_documents(request), id=document_id)
    if request.method == "PATCH":
        name = str(request.data.get("name", "")).strip()
        description = request.data.get("description")
        if name:
            document.nom = name
        if description is not None:
            document.description = str(description)
        document.save()
        return Response(DocumentSerializer(document, context={"request": request}).data)
    if document.fichier:
        document.fichier.delete(save=False)
    document.delete()
    return Response(status=204)


@api_view(["POST"])
def change_password(request):
    current = request.data.get("current_password", "")
    new = request.data.get("new_password", "")
    confirm = request.data.get("confirm_password", "")
    if not check_password(current, request.user.password):
        return Response({"detail": "Le mot de passe actuel est incorrect."}, status=400)
    if len(new) < 6:
        return Response({"detail": "Le nouveau mot de passe doit contenir au moins 6 caractères."}, status=400)
    if new != confirm:
        return Response({"detail": "Les mots de passe ne correspondent pas."}, status=400)
    request.user.set_password(new)
    request.user.save(update_fields=["password"])
    return Response({"detail": "Mot de passe modifié avec succès."})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def storage_info(request):
    documents = Document.objects.filter(
        categorie__drive__user=request.user
    )

    used_bytes = sum(
        document.taille or 0
        for document in documents
    )

    total_bytes = 100 * 1024 * 1024 * 1024  # 100 GB

    return Response({
        "used_bytes": used_bytes,
        "total_bytes": total_bytes,
        "used_gb": round(
            used_bytes / (1024 ** 3),
            2
        ),
        "total_gb": 100,
        "percentage": round(
            (used_bytes / total_bytes) * 100,
            2
        ) if total_bytes else 0,
    })
@api_view(["POST"])
@permission_classes([AllowAny])
def users_create(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()

    if not username:
        return Response(
            {"detail": "Nom d'utilisateur obligatoire."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not email:
        return Response(
            {"detail": "Email obligatoire."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not password:
        return Response(
            {"detail": "Mot de passe obligatoire."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "Ce nom d'utilisateur existe déjà."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "Cet email est déjà utilisé."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role="user",
    )

    PersonalDrive.objects.get_or_create(
        user=user,
        defaults={
            "nom": f"Personal Drive {user.username}"
        },
    )

    return Response(
        UserSerializer(user).data,
        status=status.HTTP_201_CREATED,
    )