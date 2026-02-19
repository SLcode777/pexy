import { Category } from "@/types";
import { Colors } from "./colors";

/**
 * All categories for the app (32 categories)
 */

export const CATEGORIES: Category[] = [
  {
    id: "custom",
    icon: "✨",
    image: "assets/categories/custom.webp",
    color: Colors.primary,
    translations: {
      fr: "Pictogrammes personnalisés",
      en: "Custom Pictograms",
    },
  },
  {
    id: "letters",
    icon: "🔤",
    image: "assets/categories/letters.webp",
    color: Colors.mintGreen,
    translations: {
      fr: "Lettres",
      en: "Letters",
    },
  },
  {
    id: "numbers",
    icon: "🔢",
    image: "assets/categories/numbers.webp",
    color: Colors.lightBlue,
    translations: {
      fr: "Nombres",
      en: "Numbers",
    },
  },
  {
    id: "multiplications",
    icon: "✖️",
    image: "assets/categories/multiplications.webp",
    color: Colors.lavender,
    translations: {
      fr: "Multiplications",
      en: "Multiplications",
    },
  },
  {
    id: "transport",
    icon: "🚗",
    image: "assets/categories/transport.webp",
    color: Colors.softYellow,
    translations: {
      fr: "Transports",
      en: "Transport",
    },
  },
  {
    id: "clothes",
    icon: "👕",
    image: "assets/categories/clothes.webp",
    color: Colors.lavender,
    translations: {
      fr: "Vêtements",
      en: "Clothes",
    },
  },
  {
    id: "conversation",
    icon: "💬",
    image: "assets/categories/conversation.webp",
    color: Colors.pink,
    translations: {
      fr: "Conversation",
      en: "Conversation",
    },
  },
  {
    id: "people",
    icon: "👥",
    image: "assets/categories/people.webp",
    color: Colors.peach,
    translations: {
      fr: "Personnes",
      en: "People",
    },
  },
  {
    id: "feelings",
    icon: "😊",
    image: "assets/categories/feelings.webp",
    color: Colors.softYellow,
    translations: {
      fr: "Sentiments",
      en: "Feelings",
    },
  },
  {
    id: "food",
    icon: "🍽️",
    image: "assets/categories/food.webp",
    color: Colors.coral,
    translations: {
      fr: "Nourriture",
      en: "Food",
    },
  },
  {
    id: "animals",
    icon: "🐾",
    image: "assets/categories/animals.webp",
    color: Colors.mintGreen,
    translations: {
      fr: "Animaux",
      en: "Animals",
    },
  },
  {
    id: "school",
    icon: "📚",
    image: "assets/categories/school.webp",
    color: Colors.lightBlue,
    translations: {
      fr: "École",
      en: "School",
    },
  },
  {
    id: "activities",
    icon: "🎯",
    image: "assets/categories/activities.webp",
    color: Colors.lavender,
    translations: {
      fr: "Activités",
      en: "Activities",
    },
  },
  {
    id: "shapes",
    icon: "⬛",
    image: "assets/categories/shapes.webp",
    color: Colors.pink,
    translations: {
      fr: "Formes",
      en: "Shapes",
    },
  },
  {
    id: "colors",
    icon: "🎨",
    image: "assets/categories/colors.webp",
    color: Colors.peach,
    translations: {
      fr: "Couleurs",
      en: "Colors",
    },
  },
  {
    id: "toys",
    icon: "🧸",
    image: "assets/categories/toys.webp",
    color: Colors.softYellow,
    translations: {
      fr: "Jouets",
      en: "Toys",
    },
  },
  {
    id: "drinks",
    icon: "🥤",
    image: "assets/categories/drinks.webp",
    color: Colors.lightBlue,
    translations: {
      fr: "Boissons",
      en: "Drinks",
    },
  },
  {
    id: "snacks",
    icon: "🍪",
    image: "assets/categories/snacks.webp",
    color: Colors.coral,
    translations: {
      fr: "Collations",
      en: "Snacks",
    },
  },
  {
    id: "professions",
    icon: "👷",
    image: "assets/categories/professions.webp",
    color: Colors.mintGreen,
    translations: {
      fr: "Professions",
      en: "Professions",
    },
  },
  {
    id: "party",
    icon: "🎉",
    image: "assets/categories/party.webp",
    color: Colors.lavender,
    translations: {
      fr: "Fête",
      en: "Party",
    },
  },
  {
    id: "carnival",
    icon: "🎡",
    image: "assets/categories/carnival.webp",
    color: Colors.softYellow,
    translations: {
      fr: "Fête Foraine",
      en: "Carnival",
    },
  },
  {
    id: "fruits",
    icon: "🍎",
    image: "assets/categories/fruits.webp",
    color: Colors.pink,
    translations: {
      fr: "Fruits",
      en: "Fruits",
    },
  },
  {
    id: "vegetables",
    icon: "🥕",
    image: "assets/categories/vegetables.webp",
    color: Colors.mintGreen,
    translations: {
      fr: "Légumes",
      en: "Vegetables",
    },
  },
  {
    id: "sports",
    icon: "⚽",
    image: "assets/categories/sports.webp",
    color: Colors.peach,
    translations: {
      fr: "Sports",
      en: "Sports",
    },
  },
  {
    id: "travel",
    icon: "✈️",
    image: "assets/categories/travel.webp",
    color: Colors.lightBlue,
    translations: {
      fr: "Voyage",
      en: "Travel",
    },
  },
  {
    id: "gardening",
    icon: "🌱",
    image: "assets/categories/gardening.webp",
    color: Colors.mintGreen,
    translations: {
      fr: "Jardinage",
      en: "Gardening",
    },
  },
  {
    id: "medical",
    icon: "🏥",
    image: "assets/categories/medical.webp",
    color: Colors.coral,
    translations: {
      fr: "Médical",
      en: "Medical",
    },
  },
  {
    id: "cooking",
    icon: "🍳",
    image: "assets/categories/cooking.webp",
    color: Colors.softYellow,
    translations: {
      fr: "Cuisine",
      en: "Cooking",
    },
  },
  {
    id: "places",
    icon: "🏛️",
    image: "assets/categories/places.webp",
    color: Colors.lavender,
    translations: {
      fr: "Lieux",
      en: "Places",
    },
  },
  {
    id: "selfcare",
    icon: "🧼",
    image: "assets/categories/selfcare.webp",
    color: Colors.pink,
    translations: {
      fr: "Soin de soi",
      en: "Self Care",
    },
  },
  {
    id: "household",
    icon: "🏠",
    image: "assets/categories/household.webp",
    color: Colors.peach,
    translations: {
      fr: "Dans la maison",
      en: "Household",
    },
  },
  {
    id: "diabetes",
    icon: "🩸",
    image: "assets/categories/diabetes.webp",
    color: Colors.coral,
    translations: {
      fr: "Diabète",
      en: "Diabetes",
    },
  },
];
