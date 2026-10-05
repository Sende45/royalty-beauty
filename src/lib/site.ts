// Valeurs par défaut, utilisées tant que les Paramètres ne sont pas remplis dans l'admin
export const siteConfig = {
  name: "Royalty Beauty",
  tagline: "Salon de coiffure",
  phone: "+225 00 00 00 00 00",
  whatsapp: "2250000000000",
  address: "Adresse du salon, Abidjan",
  hours: [
    { days: "Lundi – Samedi", time: "08h00 – 20h00" },
    { days: "Dimanche", time: "Sur rendez-vous" },
  ],
};

// Passe par la route /whatsapp qui lit le numéro enregistré dans les Paramètres
export const whatsappLink = (message = "Bonjour Royalty Beauty, je souhaite prendre rendez-vous.") =>
  `/whatsapp?text=${encodeURIComponent(message)}`;