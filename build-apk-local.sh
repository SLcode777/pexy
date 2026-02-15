#!/bin/bash
set -e

echo "🚀 Build Android APK en local pour Pexy"
echo "========================================="
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

# 1. Vérifier les dépendances
echo "📦 Étape 1: Vérification des dépendances"
if [ ! -d "node_modules" ]; then
    info "Installation des dépendances..."
    npm install
    success "Dépendances installées"
else
    success "Dépendances OK"
fi

echo ""

# 2. Expo prebuild
echo "🔨 Étape 2: Génération du code natif Android"
info "Cela peut prendre quelques minutes..."

npx expo prebuild --platform android --clean || error "Échec du prebuild"
success "Code natif généré"

echo ""

# 3. Build de l'APK
echo "🏗️  Étape 3: Build de l'APK"
info "Cela peut prendre plusieurs minutes..."

cd "$SCRIPT_DIR/android"
chmod +x ./gradlew

# Utiliser Java 17 pour Gradle
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
info "Utilisation de Java 17 pour le build"

./gradlew assembleRelease || error "Échec du build APK"

success "APK généré avec succès! 🎉"

echo ""

# 4. Informations sur le fichier généré
APK_FILE="$SCRIPT_DIR/android/app/build/outputs/apk/release/app-release.apk"

echo "========================================="
echo "📱 Fichier APK:"
echo "   $APK_FILE"
echo ""
ls -lh "$APK_FILE"
echo ""

# 5. Copier l'APK dans un dossier facile d'accès
VERSION_NAME=$(node -p "require('$SCRIPT_DIR/app.json').expo.version")
info "Version: $VERSION_NAME"

OUTPUT_DIR="$HOME/Downloads/pexy-apk-v$VERSION_NAME"
mkdir -p "$OUTPUT_DIR"
cp "$APK_FILE" "$OUTPUT_DIR/"

success "APK copié dans: $OUTPUT_DIR/"

echo "========================================="
info "✨ Tu peux maintenant installer l'APK sur le téléphone!"
info "📂 Fichier: $OUTPUT_DIR/app-release.apk"

echo ""
echo "🧹 Nettoyage des fichiers générés..."
cd "$SCRIPT_DIR"
git restore android/ 2>/dev/null || true
git clean -fd android/ 2>/dev/null || true
success "Fichiers Android restaurés"
