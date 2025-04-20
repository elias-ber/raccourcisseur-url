# ✂️ Raccourcisseur URL

Un raccourcisseur d'URL simple permettant de transformer des URLs longues en versions plus courtes et plus faciles à partager.

## Table des matières

- [Stack (outils utilisés)](#️-stack-outils-utilisés)
- [Fonctionnalités](#✨-fonctionnalités)
- [Routes Express](#🌍-routes-express)
- [Installation](#⚡-installation)

## 🛠️ Stack (outils utilisés)

### 🎨 Frontend
- **Mustache.js** : Utilisé pour construire l'interface utilisateur.
- **Axios** : Pour gérer les requêtes HTTP vers le backend.
- **CSS** : Pour le style de l'application.

### ⚙️ Backend
- **Node.js** : Environnement d'exécution pour le backend.
- **Express.js** : Framework pour gérer les routes et les requêtes HTTP.
- **MySQL** : Base de données relationnelle pour stocker les URLs raccourcies.
- **dotenv** : Gestion des variables d'environnement.
- **bcryptjs** : Pour le hachage des mots de passe.
- **argon2** : Pour le hachage des mots de passe.
- **passport** : Pour l'authentification des utilisateurs.
- **passport-local** : Stratégie d'authentification locale pour Passport.
- **multer** : Pour gérer les téléchargements de fichiers.
- **csv-parser** : Pour parser les fichiers CSV.
- **geoip-lite** : Pour obtenir des informations géographiques à partir des adresses IP.
- **validator** : Validation des entrées utilisateur.

#### 📦 Librairies utilisées :
- `axios`
- `body-parser`
- `bcryptjs`
- `argon2`
- `csv-parser`
- `dotenv`
- `express`
- `express-session`
- `fs`
- `geoip-lite`
- `multer`
- `mustache-express`
- `mysql2`
- `passport`
- `passport-local`
- `validator`
- `nodemon`

## ✨ Fonctionnalités
- 🔗 **Raccourcissement d'URL** : Permet de convertir une URL longue en une version courte.
- 🔄 **Redirection** : Lorsqu'un utilisateur accède à une URL raccourcie, il est redirigé vers l'URL d'origine.
- 📊 **Suivi des clics** : Enregistrement du nombre de clics pour chaque URL raccourcie.
- ⏳ **Expiration des liens** : Les liens raccourcis peuvent avoir une date d'expiration configurable.
- 🏷️ **Personnalisation de l'URL** : L'utilisateur peut choisir une partie de l'URL raccourcie (si elle est disponible).
- 📲 **Génération de QR Code** : Création d'un QR code pour chaque URL raccourcie (via `easyqrcodejs-nodejs`).
- 📂 **Importation CSV** : Possibilité d'importer plusieurs URLs depuis un fichier CSV.
- 🔐 **Protection par mot de passe** : Option pour protéger une URL raccourcie avec un mot de passe.
- 🔒 **Authentification des utilisateurs** : Système d'authentification pour gérer les utilisateurs.
- 📝 **Gestion des profils utilisateurs** : Les utilisateurs peuvent mettre à jour leurs informations de profil.

## 🌍 Routes Express

### 🏠 Application

| METHOD | Routes            | Description                                        |
|--------|-------------------|----------------------------------------------------|
| GET    | `/`               | Redirige vers la page de connexion.               |
| GET    | `/login`          | Affiche la page de connexion.                     |
| POST   | `/login`          | Gère la connexion des utilisateurs.               |
| GET    | `/register`       | Affiche la page d'inscription.                    |
| POST   | `/register`       | Gère l'inscription des nouveaux utilisateurs.     |
| POST   | `/logout`         | Gère la déconnexion des utilisateurs.              |
| GET    | `/dashboard`      | Affiche le tableau de bord des URLs raccourcies.  |
| POST   | `/links`          | Crée une nouvelle URL raccourcie.                 |
| POST   | `/links/:id`      | Met à jour une URL raccourcie existante.         |
| POST   | `/links/:id/delete` | Supprime une URL raccourcie.                     |
| POST   | `/links/bulk-upload` | Importe plusieurs URLs depuis un fichier CSV.    |
| GET    | `/links/:id/stats` | Affiche les statistiques d'une URL raccourcie.   |
| POST   | `/links/delete`   | Supprime plusieurs URLs raccourcies.              |
| GET    | `/profile`        | Affiche le profil de l'utilisateur.               |
| POST   | `/profile`        | Met à jour les informations du profil utilisateur.|
| GET    | `/:shortId`       | Redirige vers l'URL d'origine.                    |
| POST   | `/:shortId/verify` | Vérifie le mot de passe avant la redirection.     |

## ⚡ Installation

### 🔧 Prérequis
- **Node.js** installé
- **MySQL** installé et configuré

### 📥 Cloner le projet
```bash
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
```

📦 Installer les dépendances
```bash
npm install
```


⚙️ Configurer l'environnement
Créer un fichier `.env` à la racine du projet en vous basant sur `.example.env` :

```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=urls
SECRET_KEY=
```

🔄 Migrer la base de données
```bash
npx sequelize-cli db
```


🚀 Lancer le serveur
```bash
npm start
!!!

Ou avec Nodemon (pour le développement) :
```bash
npm run dev
```
