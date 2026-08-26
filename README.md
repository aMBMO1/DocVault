# GestionDocuments — intégration Django + React + MySQL

Cette version est une base cohérente issue du projet fourni. Elle garde les modules montrés dans le PDF : Login, Dashboard admin/utilisateur, Personal Drive, catégories, documents, gestion utilisateurs et profil. fileciteturn2file0L12-L30

## 1. Architecture

- `backend/` : Django + Django REST Framework + JWT + MySQL + upload fichiers + OCR optionnel
- `frontend/` : React + Vite + React Router + Bootstrap
- Django expose `/api/...` et React appelle cette API avec `Authorization: Bearer <access_token>`.

## 2. MySQL

Créer la base :

```sql
CREATE DATABASE gestion_documents CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Le backend utilise par défaut : root, mot de passe vide, `127.0.0.1:3306`. Vous pouvez changer ces valeurs avec les variables `MYSQL_*`.

## 3. Backend

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API : `http://127.0.0.1:8000/api/`
Admin Django : `http://127.0.0.1:8000/admin/`

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

React : `http://localhost:5173`

Le fichier `.env.example` contient l'URL API. Vous pouvez créer `.env` avec :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 5. Flux d'intégration

1. Login React → `POST /api/auth/login/`.
2. Django vérifie l'utilisateur et renvoie `access` + `refresh` JWT.
3. React stocke les tokens dans `localStorage`.
4. Les appels API protégés envoient `Authorization: Bearer ...`.
5. Une réponse 401 déclenche un refresh automatique avec `/api/token/refresh/`.
6. Les catégories sont liées au `PersonalDrive` de l'utilisateur connecté.
7. Les documents sont liés aux catégories et donc au Drive de l'utilisateur.
8. Les uploads utilisent `multipart/form-data` et sont servis via `/media/...`.
9. Les fonctions admin (users) vérifient `request.user.role == "admin"` côté Django — pas seulement côté React.

## 6. Point important sur l'ancien code

Le fichier original contenait des versions contradictoires et des endpoints React qui n'existaient pas côté Django. Exemple : React appelait rename/delete/recent/category-detail alors que `documents/urls.py` ne déclarait que login/users/categories/documents de base. Les serializers contenaient aussi `SerializerMethodSerializer`, qui n'est pas le type DRF attendu pour ces champs calculés.

Cette version unifie le contrat API autour des champs utilisés par l'interface : `name`, `slug`, `count`, `categoryName`, `categorySlug`, `fileUrl`, `size`, `date`, etc.
