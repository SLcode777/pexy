#!/bin/bash
set -e

echo "🚀 Build Android AAB en local - Pexy"
echo "====================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Charger les variables d'environnement
ENV_PROFILE="${1:-production}"
ENV_FILE="$SCRIPT_DIR/.env.$ENV_PROFILE"

echo "📋 Étape 1: Chargement de la configuration ($ENV_PROFILE)"
if [ ! -f "$ENV_FILE" ]; then
    error ".env.$ENV_PROFILE non trouvé dans $SCRIPT_DIR. Copie .env.production.template vers .env.production et remplis les valeurs."
fi

set -a
source "$ENV_FILE"
set +a

success "Configuration chargée (.env.$ENV_PROFILE)"

# Afficher les variables chargées
info "ANDROID_KEYSTORE_FILE = $ANDROID_KEYSTORE_FILE"
echo ""

# Vérifier que le keystore existe
KEYSTORE_PATH="$SCRIPT_DIR/$ANDROID_KEYSTORE_FILE"
if [ ! -f "$KEYSTORE_PATH" ]; then
    error "Keystore non trouvé: $KEYSTORE_PATH. Utilise keytool pour le générer (voir instructions dans .env.production.template)"
fi
success "Keystore trouvé: $ANDROID_KEYSTORE_FILE"

echo ""

# 2. Installation des dépendances si nécessaire
echo "📦 Étape 2: Vérification des dépendances"
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    info "Installation des dépendances..."
    npm install
    success "Dépendances installées"
else
    success "Dépendances OK"
fi

echo ""

# 3. Expo prebuild
echo "🔨 Étape 3: Génération du code natif Android"
info "Cela peut prendre quelques minutes..."

npx expo prebuild --platform android --clean || error "Échec du prebuild"
success "Code natif généré"

echo ""

# 4. Configuration de la signature dans build.gradle
echo "🔐 Étape 4: Configuration de la signature release"

BUILD_GRADLE="$SCRIPT_DIR/android/app/build.gradle"

if ! grep -q "signingConfigs.release" "$BUILD_GRADLE"; then
    info "Patching build.gradle..."

    awk '
    /signingConfigs \{/ { in_signing=1 }
    /keyPassword .android./ && in_signing {
        print
        print "        }"
        print "        release {"
        print "            if (System.getenv(\"KEYSTORE_FILE\")) {"
        print "                storeFile file(System.getenv(\"KEYSTORE_FILE\"))"
        print "                storePassword System.getenv(\"KEYSTORE_PASSWORD\")"
        print "                keyAlias System.getenv(\"KEY_ALIAS\")"
        print "                keyPassword System.getenv(\"KEY_PASSWORD\")"
        print "            } else {"
        print "                throw new GradleException(\"Release signing is not configured\")"
        print "            }"
        in_signing=0
        next
    }
    /buildTypes \{/ { in_buildtypes=1 }
    /release \{/ && in_buildtypes { in_release=1 }
    /signingConfig signingConfigs\.debug/ && in_release {
        sub(/signingConfigs\.debug/, "signingConfigs.release")
        in_release=0
    }
    /^\s*\}/ && in_release { in_release=0 }
    { print }
    ' "$BUILD_GRADLE" > "$BUILD_GRADLE.new"

    mv "$BUILD_GRADLE.new" "$BUILD_GRADLE"
    success "build.gradle patché"
else
    success "Signature déjà configurée"
fi

echo ""

# 5. Activation de R8 minification
echo "⚡ Étape 5: Configuration de R8 minification"

GRADLE_PROPS="$SCRIPT_DIR/android/gradle.properties"

if ! grep -q "android.enableMinifyInReleaseBuilds" "$GRADLE_PROPS"; then
    echo "" >> "$GRADLE_PROPS"
    echo "# Enable R8 minification and resource shrinking" >> "$GRADLE_PROPS"
    echo "android.enableMinifyInReleaseBuilds=true" >> "$GRADLE_PROPS"
    echo "android.enableShrinkResourcesInReleaseBuilds=true" >> "$GRADLE_PROPS"
    success "R8 activé"
else
    success "R8 déjà configuré"
fi

echo ""

# 6. Build de l'AAB
echo "🏗️  Étape 6: Build de l'AAB"
info "Cela peut prendre plusieurs minutes..."

cd "$SCRIPT_DIR/android"
chmod +x ./gradlew

# Export des variables pour Gradle
export KEYSTORE_FILE="$KEYSTORE_PATH"
export KEYSTORE_PASSWORD="$KEYSTORE_PASSWORD"
export KEY_ALIAS="$KEY_ALIAS"
export KEY_PASSWORD="$KEY_PASSWORD"

# Utiliser Java 17 pour Gradle
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
info "Utilisation de Java 17 pour le build"

./gradlew bundleRelease || error "Échec du build AAB"

success "AAB généré avec succès! 🎉"

echo ""

# 7. Informations sur le fichier généré
AAB_FILE="$SCRIPT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
MAPPING_FILE="$SCRIPT_DIR/android/app/build/outputs/mapping/release/mapping.txt"

echo "========================================="
echo "📦 Fichier AAB:"
echo "   $AAB_FILE"
echo ""
ls -lh "$AAB_FILE"
echo ""

if [ -f "$MAPPING_FILE" ]; then
    echo "📄 Fichier de mapping (ProGuard/R8):"
    echo "   $MAPPING_FILE"
    echo ""
fi

# 8. Copie des fichiers à uploader
VERSION_NAME=$(node -p "require('$SCRIPT_DIR/app.json').expo.version")
info "Version: $VERSION_NAME"

BUILD_DIR=~/PROJECTS/Pexy/_BUILD/pexy-app-bundle-v$VERSION_NAME-aab
mkdir -p "$BUILD_DIR"
cp "$AAB_FILE" "$BUILD_DIR/"
if [ -f "$MAPPING_FILE" ]; then
    cp "$MAPPING_FILE" "$BUILD_DIR/"
fi

success "Fichiers copiés dans $BUILD_DIR"

echo ""
echo "========================================="
info "Tu peux maintenant uploader l'AAB sur Google Play Console"
info "N'oublie pas de sauvegarder le fichier mapping.txt pour désobfusquer les crash reports!"

echo ""
echo "🧹 Nettoyage des fichiers générés..."
cd "$SCRIPT_DIR"
git restore android/ 2>/dev/null || true
success "Fichiers Android restaurés"
