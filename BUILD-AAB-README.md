# Guide de build AAB pour Google Play Store

## Prérequis

1. **Java 17** installé sur ton système
2. **Android SDK** configuré
3. Un **keystore Android** pour signer l'application

## Étapes pour créer le build AAB

### 1. Créer le keystore (première fois seulement)

Si tu n'as pas encore de keystore, génère-en un avec cette commande :

```bash
cd /home/lucy/DEV/pexy
keytool -genkeypair -v -storetype PKCS12 -keystore pexy-release.keystore -alias pexy-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important** :
- Choisis des mots de passe forts et **sauvegarde-les précieusement** ! Tu en auras besoin pour chaque mise à jour.
- Sauvegarde le fichier `pexy-release.keystore` en lieu sûr (et hors du repo git)
- Si tu perds ce keystore, tu ne pourras plus mettre à jour l'app sur le Play Store !

### 2. Configurer les credentials

Copie le template et remplis les valeurs :

```bash
cp .env.production.template .env.production
nano .env.production
```

Remplis avec tes valeurs :
```env
ANDROID_KEYSTORE_FILE=pexy-release.keystore
KEYSTORE_PASSWORD=ton_mot_de_passe_keystore
KEY_ALIAS=pexy-key-alias
KEY_PASSWORD=ton_mot_de_passe_clé
```

**Important** : Ajoute `.env.production` au `.gitignore` pour ne pas commit tes credentials !

### 3. Lancer le build

```bash
./build-aab-local.sh
```

Le script va :
1. Charger la configuration depuis `.env.production`
2. Vérifier les dépendances
3. Générer le code natif Android avec `expo prebuild`
4. Configurer la signature release
5. Activer R8 minification (réduction de la taille)
6. Compiler l'AAB
7. Copier les fichiers dans `~/PROJECTS/Pexy/_BUILD/pexy-app-bundle-v1.0.0-aab/`
8. Nettoyer les fichiers générés

### 4. Upload sur Google Play Console

Récupère les fichiers générés :
```bash
cd ~/PROJECTS/Pexy/_BUILD/pexy-app-bundle-v1.0.0-aab/
ls -lh
```

Tu devrais avoir :
- `app-release.aab` → À uploader sur Google Play Console
- `mapping.txt` → À sauvegarder pour déobfusquer les crash reports

## Troubleshooting

### Erreur "Keystore non trouvé"
- Vérifie que le fichier `pexy-release.keystore` existe dans `/home/lucy/DEV/pexy/`
- Vérifie que le chemin dans `.env.production` est correct

### Erreur de signature
- Vérifie que les mots de passe dans `.env.production` sont corrects
- Essaie de déverrouiller le keystore manuellement avec `keytool`

### Erreur Java
- Vérifie que Java 17 est installé : `java -version`
- Le script utilise automatiquement `/usr/lib/jvm/java-17-openjdk`

## Pour les prochaines versions

1. Mets à jour la version dans `app.json` :
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

2. Relance le build :
```bash
./build-aab-local.sh
```

3. Upload le nouveau AAB sur Google Play Console

---

**Note** : Garde précieusement ton keystore et tes mots de passe ! Sans eux, tu ne pourras plus mettre à jour ton app sur le Play Store.
