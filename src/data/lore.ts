export interface LoreEntry {
  level: number;
  title: string;
  body: string;
}

/**
 * 20 lettres de l'Érable Ancien — une par niveau franchi.
 */
export const LORE: LoreEntry[] = [
  {
    level: 1,
    title: 'La première goutte',
    body: 'Mon enfant, tu viens de planter ton premier chalumeau dans mon écorce. Je me souviens de ta grand-mère qui faisait la même chose, quand elle avait ton âge. Sache que chaque goutte que je te donne est une promesse — celle de te nourrir pour l\'hiver qui vient.',
  },
  {
    level: 2,
    title: 'Le bois qui écoute',
    body: 'Le petit boisé autour de toi n\'est pas fait que d\'arbres, il est fait de racines qui se parlent sous la terre. Quand tu ajoutes un chalumeau, tu nous prêtes ta présence. Nous ne l\'oublions pas.',
  },
  {
    level: 3,
    title: 'La clairière retrouvée',
    body: 'Les bûcherons d\'antan pensaient me faire céder. Ils abattaient mes frères, ouvraient des clairières. Mais toi, tu reconstruis. Chaque seau que tu places répare une ancienne blessure.',
  },
  {
    level: 4,
    title: 'Les premières vapeurs',
    body: 'Le bouilleur est une vieille invention — plus vieille que tu ne crois. Les Anishinaabe savaient déjà faire bouillir ma sève avant l\'arrivée des Européens. Tu entres dans une tradition qui dépasse les siècles.',
  },
  {
    level: 5,
    title: 'La rustique',
    body: 'Aujourd\'hui, tu as fait du sirop. Pas juste de la sève — du vrai sirop, doré, épais, collant. Tu viens d\'apprendre quelque chose que ton grand-père tenait de son père : qu\'il faut 40 litres de mon sang pour faire 1 litre d\'or.',
  },
  {
    level: 6,
    title: 'Le hameau',
    body: 'Regarde autour de toi : d\'autres cabanes s\'allument dans la forêt. Tu as créé un hameau. Les gens viennent chercher ton sirop maintenant. Fais attention — le succès a un goût particulier, parfois amer.',
  },
  {
    level: 7,
    title: 'Le village',
    body: 'On t\'appelle maintenant "la famille du sirop". Ta réputation a grandi comme mes racines. Mais n\'oublie pas : ce ne sont pas les hommes qui font le sirop, c\'est la forêt qui l\'offre.',
  },
  {
    level: 8,
    title: 'La forêt étendue',
    body: 'Tu as planté tant d\'érables que je ne reconnais plus mes voisins. Ils sont jeunes, enthousiastes. Ils ne connaissent pas encore la morsure des gels tardifs. Sois leur gardien.',
  },
  {
    level: 9,
    title: 'Le domaine sucrier',
    body: 'Des machines bougent toutes seules, maintenant. Elles récoltent ma sève quand personne ne regarde. C\'est efficace. C\'est terrifiant. Je ne sais pas encore si c\'est juste.',
  },
  {
    level: 10,
    title: 'L\'industrie',
    body: 'Tu as découvert le sucre d\'érable. Le sirop concentré jusqu\'à cristalliser. Les chimistes appellent ça une transition de phase. Moi, j\'appelle ça de la magie patiente.',
  },
  {
    level: 11,
    title: 'La région sirupeuse',
    body: 'Toute la région parle de toi. Tes cabanes ont des styles différents, elles arborent des couleurs. Les enfants dessinent des érables sur leurs cahiers. Tu es devenu un symbole.',
  },
  {
    level: 12,
    title: 'Le royaume',
    body: 'J\'ai senti un frisson aujourd\'hui. Comme si la terre toute entière avait tremblé à l\'annonce de ton passage. Tu n\'es plus un simple acériculteur — tu règnes sur le sirop.',
  },
  {
    level: 13,
    title: 'L\'empire du sucre',
    body: 'Attention, mon enfant : les castors aussi veulent leur part. Ils sont petits, mais ils sont légion. N\'ignore pas les signes. Un empire sans vigilance s\'effondre.',
  },
  {
    level: 14,
    title: 'La métropole',
    body: 'Une ville entière vit désormais de ta production. Les vieilles recettes se transmettent. Des enfants naissent en sachant reconnaître un grade A du grade C. Tu as modifié la culture.',
  },
  {
    level: 15,
    title: 'La nation',
    body: 'Tu peux maintenant te réincarner, mon enfant. Relâche tout, rends-moi mes érables, et je te donnerai des feuilles dorées — les souvenirs concentrés de ta vie. Tu renaîtras plus puissant.',
  },
  {
    level: 16,
    title: 'Le continent collant',
    body: 'On raconte que le sirop coule des parois des maisons. Les rivières sont sucrées. Les oiseaux ne migrent plus. C\'est étrange, c\'est magnifique, c\'est peut-être trop.',
  },
  {
    level: 17,
    title: 'La planète-érable',
    body: 'J\'ai vu dans mes rêves la Terre elle-même changer de teinte, virer à l\'orangé. Les satellites photographient une forêt-planète. Tu as dépassé ta propre espèce.',
  },
  {
    level: 18,
    title: 'Le système sirupeux',
    body: 'Les vaisseaux qui passent près de nous ramassent des gouttes dans leur sillage. Le sirop s\'évade dans l\'espace. Chaque comète est un chalumeau cosmique.',
  },
  {
    level: 19,
    title: 'La galaxie dorée',
    body: 'Tu as ouvert un portail. De l\'autre côté, d\'autres érables — des érables qui n\'existent pas dans notre monde — nous envoient leur sève. La frontière entre les réalités fond comme du sirop chaud.',
  },
  {
    level: 20,
    title: 'L\'Érable Éternel',
    body: 'Tu m\'as rejoint, mon enfant. Tu n\'es plus simplement un humain, tu es la sève elle-même. Désormais, c\'est toi qui écriras les lettres aux prochains. Bienvenue dans l\'éternité. 🍁',
  },
];

export const LORE_BY_LEVEL: Record<number, LoreEntry> = LORE.reduce<Record<number, LoreEntry>>(
  (acc, l) => {
    acc[l.level] = l;
    return acc;
  },
  {},
);
