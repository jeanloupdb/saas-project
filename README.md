
# Saas Project

## Description

Saas Project est une application SaaS qui permet aux entreprises de créer des actions interactives pour leurs clients, de gérer des récompenses et de proposer des jeux. Le projet inclut un jeu de roulette opérationnel, une gestion des lots gagnés, et diverses fonctionnalités pour les clients et les entreprises.

## Fonctionnalités

### Pour les entreprises
- **Gestion des actions** : Création et modification d'actions (clics, quiz) avec aperçu en temps réel.
- **Gestion des lots** : Création, modification et gestion des récompenses à offrir aux clients.
- **Statistiques** : Visualisation des statistiques des lots gagnés et des actions réalisées.
- **Jeux** : Configuration et gestion des jeux proposés aux clients, comme la roulette.

### Pour les clients
- **Réalisation d'actions** : Participation aux actions pour gagner des jetons.
- **Jeux** : Participation à des jeux comme la roulette pour gagner des lots.
- **Récompenses** : Visualisation des lots gagnés et informations sur la récupération des lots.

## Fonctionnalités en cours de développement

- **Code de retrait pour les lots gagnés** : Mise en place d'un système de codes de retrait pour permettre aux clients de récupérer leurs lots en agence.
- **Autres jeux** : Ajout de nouveaux jeux en plus de la roulette.
- **Gestion des abonnements aux réseaux sociaux** : Création d'actions spécifiques pour l'abonnement à des réseaux sociaux, les commentaires et les notes.
- **Connexion via Google** : Intégration de la connexion via Google pour faciliter l'accès aux actions liées à ces comptes.
- **Prolongation de validité des jetons** : Système pour prolonger la validité des jetons pour une connexion longue durée.

## Prérequis

- **Node.js** (v12 ou plus récent)
- **MongoDB** : Base de données NoSQL utilisée pour stocker les informations du projet.
- **NPM** : Gestionnaire de paquets Node.js

## Installation

### 1. Clonez le repository :
```bash
git clone https://github.com/votre-utilisateur/saas-project.git
cd saas-project
```

### 2. Installez les dépendances :
- **Backend :**
  ```bash
  cd backend
  npm install
  ```
- **Frontend :**
  ```bash
  cd frontend
  npm install
  ```

### 3. Configuration des fichiers `.env` :
- Copiez le fichier `.env.example` en `.env` dans les dossiers `backend` et `frontend`, et ajustez les configurations selon vos besoins.

### 4. Démarrez le serveur :
- **Backend :**
  ```bash
  cd backend
  npm start
  ```
- **Frontend :**
  ```bash
  cd frontend
  npm start
  ```

### 5. Accédez à l'interface utilisateur :
- Ouvrez votre navigateur et allez à l'adresse `http://localhost:3000`.

## Tutoriel : Comment lancer le site

### 1. Préparation de l'environnement
Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) et [MongoDB](https://www.mongodb.com/try/download/community) sur votre machine. Clonez ensuite le projet depuis GitHub :

```bash
git clone https://github.com/votre-utilisateur/saas-project.git
cd saas-project
```

### 2. Installation des dépendances
Naviguez dans les dossiers `backend` et `frontend` pour installer les dépendances nécessaires :

- Pour le backend :
  ```bash
  cd backend
  npm install
  ```

- Pour le frontend :
  ```bash
  cd frontend
  npm install
  ```

### 3. Configuration des variables d'environnement
Dans chaque dossier (`backend` et `frontend`), copiez le fichier `.env.example` et renommez-le en `.env` :

```bash
cp .env.example .env
```

Ouvrez le fichier `.env` et configurez les variables selon votre environnement (par exemple, les connexions à MongoDB, les clés secrètes, etc.).

### 4. Démarrage du serveur
Pour lancer le backend, utilisez la commande suivante dans le dossier `backend` :

```bash
npm start
```

Le backend écoute généralement sur le port 5000, mais cela peut être configuré dans votre fichier `.env`.

Pour lancer le frontend, utilisez la commande suivante dans le dossier `frontend` :

```bash
npm start
```

Le frontend est accessible via `http://localhost:3000`.

### 5. Accès à l'application
Ouvrez votre navigateur et accédez à `http://localhost:3000`. Vous devriez voir l'interface utilisateur du projet. Les entreprises peuvent se connecter pour gérer les actions et les lots, tandis que les clients peuvent participer aux jeux et voir leurs récompenses.

## Contribution

1. **Forkez le projet**
2. **Créez une branche pour votre fonctionnalité :**
   ```bash
   git checkout -b feature/nom-de-votre-fonctionnalité
   ```
3. **Commitez vos modifications :**
   ```bash
   git commit -m "Ajout de la fonctionnalité X"
   ```
4. **Poussez vos modifications sur votre fork :**
   ```bash
   git push origin feature/nom-de-votre-fonctionnalité
   ```
5. **Ouvrez une Pull Request**

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

- **Auteur** : Votre Nom
- **Email** : votre.email@example.com
- **GitHub** : [votre-utilisateur](https://github.com/votre-utilisateur)

```

### Ajout du README.md sur GitHub

1. **Créez un fichier `README.md`** dans votre projet localement, copiez le contenu ci-dessus, puis enregistrez-le.
2. **Ajoutez et committez** le fichier `README.md` :
   ```bash
   git add README.md
   git commit -m "Ajout du README avec un tutoriel pour lancer le site"
   git push origin master
   ```

Cela mettra à jour votre repository GitHub avec le nouveau README bien formaté et incluant le tutoriel pour lancer le site.
