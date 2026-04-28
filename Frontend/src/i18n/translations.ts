import type { Language } from '../hooks/useLanguage';

type TranslationKey =
       | 'nav.musicPaths'
       | 'nav.communities'
       | 'nav.events'
       | 'home.hero'
       | 'home.fromArchive'
       | 'home.browseAll'
       | 'home.recentlyAdded'
       | 'home.loadingArchive'
       | 'home.unknown'
       | 'communities.title'
       | 'communities.subtitle'
       | 'communities.searchPlaceholder'
       | 'communities.exploreCollection'
       | 'communities.backToHome'
       | 'communities.noResults'
       | 'communities.clearSearch'
       | 'communities.loading'
       | 'communities.fallbackDescription'
       | 'communities.pathTitle.artMusic'
       | 'communities.pathTitle.urbanPopular'
       | 'communities.pathTitle.ruralMusic'
       | 'communities.pathTitle.sacredMusic'
       | 'communities.pathTitle.all'
       | 'path.artMusic.title'
       | 'path.artMusic.subtitle'
       | 'path.artMusic.description'
       | 'path.urbanPopular.title'
       | 'path.urbanPopular.subtitle'
       | 'path.urbanPopular.description'
       | 'path.ruralMusic.title'
       | 'path.ruralMusic.subtitle'
       | 'path.ruralMusic.description'
       | 'path.sacredMusic.title'
       | 'path.sacredMusic.subtitle'
       | 'path.sacredMusic.description'
       | 'item.backToArchive'
       | 'item.archivalAsset'
       | 'item.mediaPlayback'
       | 'item.metadataOverview'
       | 'item.musicPath'
       | 'item.date'
       | 'item.description'
       | 'item.noDescription'
       | 'item.archiveFiles'
       | 'item.extendedRecord'
       | 'item.viewFullRecord'
       | 'item.hideMetadata'
       | 'item.youMightAlsoLike'
       | 'item.archivalField'
       | 'item.recordValue'
       | 'item.index'
       | 'item.unknownArchivist'
       | 'item.unknownArchive'
       | 'events.title'
       | 'events.subtitle'
       | 'events.loading';

type Translations = Record<TranslationKey, string>;

const t: Record<Language, Translations> = {
       en: {
              'nav.musicPaths': 'Music Paths',
              'nav.communities': 'Communities',
              'nav.events': 'Events',
              'home.hero': "The long-standing musical tradition of Corfu can be encoded in the framework of four distinct, but at the same time interconnected musical \"paths\", which through time sometimes converged and sometimes diverged, but always expressed the Corfiots' musical instinct. These four musical paths are:",
              'home.fromArchive': 'From the Archive',
              'home.browseAll': 'Browse all',
              'home.recentlyAdded': 'Recently added treasures from our collections',
              'home.loadingArchive': 'Loading archive...',
              'home.unknown': 'Unknown',
              'communities.title': 'Communities',
              'communities.subtitle': "Explore communities preserving Corfu's rich musical heritage. Each organization holds unique collections of recordings, documents, and artifacts.",
              'communities.searchPlaceholder': 'Search communities...',
              'communities.exploreCollection': 'Explore Collection',
              'communities.backToHome': '← Back to Home',
              'communities.noResults': 'No communities found matching',
              'communities.clearSearch': 'Clear search',
              'communities.loading': 'Loading communities...',
              'communities.fallbackDescription': "Discover this community's unique musical heritage and explore their collection of archival materials.",
              'communities.pathTitle.artMusic': 'Art Music',
              'communities.pathTitle.urbanPopular': 'Urban Popular Music',
              'communities.pathTitle.ruralMusic': 'Rural Music',
              'communities.pathTitle.sacredMusic': 'Sacred Music',
              'communities.pathTitle.all': 'All Communities',
              'path.artMusic.title': 'Art Music',
              'path.artMusic.subtitle': 'Η μουσική του άστεως',
              'path.artMusic.description': 'Music ensembles and musical compositions of arty, "entechno", music, local composers, and organized music training',
              'path.urbanPopular.title': 'Urban Popular',
              'path.urbanPopular.subtitle': 'Η αστικολαϊκή μουσική',
              'path.urbanPopular.description': 'Bands, choirs, choruses with mandolins and, more recently, improvised jazz, pop and rock bands, as well as other forms of non-structured and experiential music training',
              'path.ruralMusic.title': 'Rural Music',
              'path.ruralMusic.subtitle': 'Η μουσική της υπαίθρου',
              'path.ruralMusic.description': "Music related to the annual performances in the, mainly agricultural and pastoral, exurban Corfiot communities of the past and how these have made it to today's reality",
              'path.sacredMusic.title': 'Sacred Music',
              'path.sacredMusic.subtitle': 'Η εκκλησιαστική μουσική',
              'path.sacredMusic.description': 'Primarily of the Orthodox faith, especially in the form of the local "Creto-Ionian" chant. Similarly, the liturgical music of the Catholic, Protestant and Israelite communities',
              'item.backToArchive': 'Back to Archive',
              'item.archivalAsset': 'Archival Asset',
              'item.mediaPlayback': 'Media Playback',
              'item.metadataOverview': 'Metadata Overview',
              'item.musicPath': 'Music Path',
              'item.date': 'Date',
              'item.description': 'Description',
              'item.noDescription': 'No description available for this archival item.',
              'item.archiveFiles': 'Archive Files',
              'item.extendedRecord': 'Extended Archival Record',
              'item.viewFullRecord': 'View Full Record',
              'item.hideMetadata': 'Hide Metadata',
              'item.youMightAlsoLike': 'You Might Also Like',
              'item.archivalField': 'Archival Field',
              'item.recordValue': 'Record Value',
              'item.index': 'Index',
              'item.unknownArchivist': 'Unknown Archivist',
              'item.unknownArchive': 'Unknown Archive',
              'events.title': 'Corfu Events',
              'events.subtitle': 'Discover upcoming musical performances, festivals and cultural events in Corfu.',
              'events.loading': 'Finding events...',
       },
       fr: {
              'nav.musicPaths': 'Chemins musicaux',
              'nav.communities': 'Communautés',
              'nav.events': 'Événements',
              'home.hero': "La longue tradition musicale de Corfou peut être encodée dans le cadre de quatre « chemins » musicaux distincts mais interconnectés, qui tantôt convergeaient, tantôt divergeaient, exprimant toujours l'instinct musical des Corfiotes. Ces quatre chemins musicaux sont :",
              'home.fromArchive': "De l'Archive",
              'home.browseAll': 'Tout parcourir',
              'home.recentlyAdded': 'Trésors récemment ajoutés de nos collections',
              'home.loadingArchive': "Chargement de l'archive...",
              'home.unknown': 'Inconnu',
              'communities.title': 'Communautés',
              'communities.subtitle': "Explorez les communautés qui préservent le riche patrimoine musical de Corfou. Chaque organisation détient des collections uniques d'enregistrements, de documents et d'artefacts.",
              'communities.searchPlaceholder': 'Rechercher des communautés...',
              'communities.exploreCollection': 'Explorer la collection',
              'communities.backToHome': "← Retour à l'accueil",
              'communities.noResults': 'Aucune communauté trouvée pour',
              'communities.clearSearch': 'Effacer la recherche',
              'communities.loading': 'Chargement des communautés...',
              'communities.fallbackDescription': "Découvrez le patrimoine musical unique de cette communauté et explorez leur collection de matériaux d'archive.",
              'communities.pathTitle.artMusic': 'Musique savante',
              'communities.pathTitle.urbanPopular': 'Musique populaire urbaine',
              'communities.pathTitle.ruralMusic': 'Musique rurale',
              'communities.pathTitle.sacredMusic': 'Musique sacrée',
              'communities.pathTitle.all': 'Toutes les communautés',
              'path.artMusic.title': 'Musique savante',
              'path.artMusic.subtitle': 'La musique de ville',
              'path.artMusic.description': 'Ensembles musicaux et compositions de musique artistique, « entechno », compositeurs locaux et formation musicale organisée',
              'path.urbanPopular.title': 'Populaire urbaine',
              'path.urbanPopular.subtitle': 'La musique populaire urbaine',
              'path.urbanPopular.description': "Fanfares, chorales, orchestres de mandolines et, plus récemment, groupes de jazz, pop et rock improvisés, ainsi que d'autres formes de formation musicale non structurée et expérientielle",
              'path.ruralMusic.title': 'Musique rurale',
              'path.ruralMusic.subtitle': 'La musique de la campagne',
              'path.ruralMusic.description': "Musique liée aux représentations annuelles dans les communautés corfiotes exurbaines, principalement agricoles et pastorales, du passé et comment elles ont survécu jusqu'aujourd'hui",
              'path.sacredMusic.title': 'Musique sacrée',
              'path.sacredMusic.subtitle': "La musique d'église",
              'path.sacredMusic.description': "Principalement de foi orthodoxe, notamment sous la forme du chant « créto-ionien » local. Également la musique liturgique des communautés catholique, protestante et israélite",
              'item.backToArchive': "Retour à l'archive",
              'item.archivalAsset': 'Ressource archivistique',
              'item.mediaPlayback': 'Lecture multimédia',
              'item.metadataOverview': 'Aperçu des métadonnées',
              'item.musicPath': 'Chemin musical',
              'item.date': 'Date',
              'item.description': 'Description',
              'item.noDescription': 'Aucune description disponible pour cet élément archivistique.',
              'item.archiveFiles': "Fichiers d'archive",
              'item.extendedRecord': 'Fiche archivistique étendue',
              'item.viewFullRecord': 'Voir la fiche complète',
              'item.hideMetadata': 'Masquer les métadonnées',
              'item.youMightAlsoLike': 'Vous aimerez peut-être aussi',
              'item.archivalField': 'Champ archivistique',
              'item.recordValue': 'Valeur',
              'item.index': 'Index',
              'item.unknownArchivist': 'Archiviste inconnu',
              'item.unknownArchive': 'Archive inconnue',
              'events.title': 'Événements à Corfou',
              'events.subtitle': 'Découvrez les représentations musicales, festivals et événements culturels à venir à Corfou.',
              'events.loading': 'Recherche d\'événements...',
       },
       de: {
              'nav.musicPaths': 'Musikpfade',
              'nav.communities': 'Gemeinschaften',
              'nav.events': 'Veranstaltungen',
              'home.hero': 'Die langjährige Musiktradition Korfus lässt sich in vier eigenständige, aber gleichzeitig miteinander verbundene musikalische „Pfade" einordnen, die im Laufe der Zeit manchmal konvergierten und manchmal divergierten, aber immer den musikalischen Instinkt der Korfioten ausdrückten. Diese vier Musikpfade sind:',
              'home.fromArchive': 'Aus dem Archiv',
              'home.browseAll': 'Alle durchsuchen',
              'home.recentlyAdded': 'Kürzlich hinzugefügte Schätze aus unseren Sammlungen',
              'home.loadingArchive': 'Archiv wird geladen...',
              'home.unknown': 'Unbekannt',
              'communities.title': 'Gemeinschaften',
              'communities.subtitle': 'Entdecken Sie Gemeinschaften, die das reiche Musikerbe Korfus bewahren. Jede Organisation verfügt über einzigartige Sammlungen von Aufnahmen, Dokumenten und Artefakten.',
              'communities.searchPlaceholder': 'Gemeinschaften suchen...',
              'communities.exploreCollection': 'Sammlung erkunden',
              'communities.backToHome': '← Zurück zur Startseite',
              'communities.noResults': 'Keine Gemeinschaften gefunden für',
              'communities.clearSearch': 'Suche löschen',
              'communities.loading': 'Gemeinschaften werden geladen...',
              'communities.fallbackDescription': 'Entdecken Sie das einzigartige Musikerbe dieser Gemeinschaft und stöbern Sie in ihrer Sammlung von Archivmaterialien.',
              'communities.pathTitle.artMusic': 'Kunstmusik',
              'communities.pathTitle.urbanPopular': 'Städtische Popularmusik',
              'communities.pathTitle.ruralMusic': 'Landmusik',
              'communities.pathTitle.sacredMusic': 'Geistliche Musik',
              'communities.pathTitle.all': 'Alle Gemeinschaften',
              'path.artMusic.title': 'Kunstmusik',
              'path.artMusic.subtitle': 'Die Musik der Stadt',
              'path.artMusic.description': 'Musikensembles und Kompositionen der Kunstmusik, „Entechno"-Musik, lokale Komponisten und organisierter Musikunterricht',
              'path.urbanPopular.title': 'Städtische Popularmusik',
              'path.urbanPopular.subtitle': 'Die städtische Volksmusik',
              'path.urbanPopular.description': 'Kapellen, Chöre, Mandolinenorchester und in jüngerer Zeit improvisierte Jazz-, Pop- und Rockbands sowie andere Formen nicht strukturierter und erfahrungsbasierter Musikausbildung',
              'path.ruralMusic.title': 'Landmusik',
              'path.ruralMusic.subtitle': 'Die Musik des Landes',
              'path.ruralMusic.description': 'Musik im Zusammenhang mit den jährlichen Aufführungen in den vorwiegend landwirtschaftlichen und pastoralen Vorortgemeinden Korfus der Vergangenheit und wie diese bis in die heutige Realität überlebt haben',
              'path.sacredMusic.title': 'Geistliche Musik',
              'path.sacredMusic.subtitle': 'Die Kirchenmusik',
              'path.sacredMusic.description': 'Vorwiegend orthodoxen Glaubens, insbesondere in Form des lokalen „kretisch-ionischen" Gesangs. Ebenso die liturgische Musik der katholischen, protestantischen und israelitischen Gemeinschaften',
              'item.backToArchive': 'Zurück zum Archiv',
              'item.archivalAsset': 'Archivmaterial',
              'item.mediaPlayback': 'Medienwiedergabe',
              'item.metadataOverview': 'Metadatenübersicht',
              'item.musicPath': 'Musikpfad',
              'item.date': 'Datum',
              'item.description': 'Beschreibung',
              'item.noDescription': 'Keine Beschreibung für dieses Archivelement verfügbar.',
              'item.archiveFiles': 'Archivdateien',
              'item.extendedRecord': 'Erweiterter Archiveintrag',
              'item.viewFullRecord': 'Vollständigen Eintrag anzeigen',
              'item.hideMetadata': 'Metadaten ausblenden',
              'item.youMightAlsoLike': 'Das könnte Ihnen auch gefallen',
              'item.archivalField': 'Archivfeld',
              'item.recordValue': 'Wert',
              'item.index': 'Index',
              'item.unknownArchivist': 'Unbekannter Archivar',
              'item.unknownArchive': 'Unbekanntes Archiv',
              'events.title': 'Veranstaltungen in Korfu',
              'events.subtitle': 'Entdecken Sie bevorstehende Musikaufführungen, Festivals und kulturelle Veranstaltungen in Korfu.',
              'events.loading': 'Veranstaltungen werden gesucht...',
       },
       it: {
              'nav.musicPaths': 'Percorsi musicali',
              'nav.communities': 'Comunità',
              'nav.events': 'Eventi',
              'home.hero': "La lunga tradizione musicale di Corfù può essere codificata nel quadro di quattro \"percorsi\" musicali distinti ma interconnessi, che nel tempo a volte convergevano e a volte divergevano, ma esprimevano sempre l'instinto musicale dei corfioti. Questi quattro percorsi musicali sono:",
              'home.fromArchive': "Dall'Archivio",
              'home.browseAll': 'Sfoglia tutto',
              'home.recentlyAdded': 'Tesori aggiunti di recente dalle nostre collezioni',
              'home.loadingArchive': 'Caricamento archivio...',
              'home.unknown': 'Sconosciuto',
              'communities.title': 'Comunità',
              'communities.subtitle': "Esplora le comunità che preservano il ricco patrimonio musicale di Corfù. Ogni organizzazione possiede collezioni uniche di registrazioni, documenti e manufatti.",
              'communities.searchPlaceholder': 'Cerca comunità...',
              'communities.exploreCollection': 'Esplora la collezione',
              'communities.backToHome': '← Torna alla home',
              'communities.noResults': 'Nessuna comunità trovata per',
              'communities.clearSearch': 'Cancella ricerca',
              'communities.loading': 'Caricamento comunità...',
              'communities.fallbackDescription': "Scopri il patrimonio musicale unico di questa comunità ed esplora la loro collezione di materiali d'archivio.",
              'communities.pathTitle.artMusic': 'Musica colta',
              'communities.pathTitle.urbanPopular': 'Musica popolare urbana',
              'communities.pathTitle.ruralMusic': 'Musica rurale',
              'communities.pathTitle.sacredMusic': 'Musica sacra',
              'communities.pathTitle.all': 'Tutte le comunità',
              'path.artMusic.title': 'Musica colta',
              'path.artMusic.subtitle': 'La musica della città',
              'path.artMusic.description': 'Ensemble musicali e composizioni di musica colta, "entechno", compositori locali e formazione musicale organizzata',
              'path.urbanPopular.title': 'Musica popolare urbana',
              'path.urbanPopular.subtitle': 'La musica popolare urbana',
              'path.urbanPopular.description': 'Bande, cori, cori con mandolini e, più recentemente, gruppi jazz, pop e rock improvvisati, nonché altre forme di formazione musicale non strutturata ed esperienziale',
              'path.ruralMusic.title': 'Musica rurale',
              'path.ruralMusic.subtitle': 'La musica della campagna',
              'path.ruralMusic.description': "Musica legata alle esecuzioni annuali nelle comunità corfiote exurbane, prevalentemente agricole e pastorali, del passato e di come queste siano giunte fino alla realtà odierna",
              'path.sacredMusic.title': 'Musica sacra',
              'path.sacredMusic.subtitle': 'La musica ecclesiastica',
              'path.sacredMusic.description': 'Principalmente di fede ortodossa, specialmente nella forma del canto locale "creto-ionico". Analogamente, la musica liturgica delle comunità cattolica, protestante e israelita',
              'item.backToArchive': "Torna all'archivio",
              'item.archivalAsset': 'Risorsa archivistica',
              'item.mediaPlayback': 'Riproduzione multimediale',
              'item.metadataOverview': 'Panoramica metadati',
              'item.musicPath': 'Percorso musicale',
              'item.date': 'Data',
              'item.description': 'Descrizione',
              'item.noDescription': 'Nessuna descrizione disponibile per questo elemento archivistico.',
              'item.archiveFiles': 'File di archivio',
              'item.extendedRecord': 'Scheda archivistica estesa',
              'item.viewFullRecord': 'Visualizza scheda completa',
              'item.hideMetadata': 'Nascondi metadati',
              'item.youMightAlsoLike': 'Potrebbe piacerti anche',
              'item.archivalField': 'Campo archivistico',
              'item.recordValue': 'Valore',
              'item.index': 'Indice',
              'item.unknownArchivist': 'Archivista sconosciuto',
              'item.unknownArchive': 'Archivio sconosciuto',
              'events.title': 'Eventi a Corfù',
              'events.subtitle': 'Scopri i prossimi spettacoli musicali, festival ed eventi culturali a Corfù.',
              'events.loading': 'Ricerca eventi...',
       },
       el: {
              'nav.musicPaths': 'Μουσικά Μονοπάτια',
              'nav.communities': 'Κοινότητες',
              'nav.events': 'Εκδηλώσεις',
              'home.hero': 'Η μακραίωνη μουσική παράδοση της Κέρκυρας μπορεί να κωδικοποιηθεί στο πλαίσιο τεσσάρων διακριτών, αλλά ταυτόχρονα διασυνδεδεμένων μουσικών «μονοπατιών», τα οποία στο διάβα του χρόνου άλλοτε συγκλίνουν και άλλοτε αποκλίνουν, εκφράζοντας πάντα το μουσικό ένστικτο των Κερκυραίων. Αυτά τα τέσσερα μουσικά μονοπάτια είναι:',
              'home.fromArchive': 'Από το Αρχείο',
              'home.browseAll': 'Περιήγηση όλων',
              'home.recentlyAdded': 'Πρόσφατα προσθήκες από τις συλλογές μας',
              'home.loadingArchive': 'Φόρτωση αρχείου...',
              'home.unknown': 'Άγνωστος',
              'communities.title': 'Κοινότητες',
              'communities.subtitle': 'Εξερευνήστε κοινότητες που διαφυλάσσουν την πλούσια μουσική κληρονομιά της Κέρκυρας. Κάθε οργανισμός διαθέτει μοναδικές συλλογές ηχογραφήσεων, εγγράφων και αντικειμένων.',
              'communities.searchPlaceholder': 'Αναζήτηση κοινοτήτων...',
              'communities.exploreCollection': 'Εξερεύνηση Συλλογής',
              'communities.backToHome': '← Πίσω στην αρχική',
              'communities.noResults': 'Δεν βρέθηκαν κοινότητες για',
              'communities.clearSearch': 'Καθαρισμός αναζήτησης',
              'communities.loading': 'Φόρτωση κοινοτήτων...',
              'communities.fallbackDescription': 'Ανακαλύψτε τη μοναδική μουσική κληρονομιά αυτής της κοινότητας και εξερευνήστε τη συλλογή αρχειακών υλικών τους.',
              'communities.pathTitle.artMusic': 'Έντεχνη Μουσική',
              'communities.pathTitle.urbanPopular': 'Αστικολαϊκή Μουσική',
              'communities.pathTitle.ruralMusic': 'Μουσική Υπαίθρου',
              'communities.pathTitle.sacredMusic': 'Εκκλησιαστική Μουσική',
              'communities.pathTitle.all': 'Όλες οι Κοινότητες',
              'path.artMusic.title': 'Έντεχνη Μουσική',
              'path.artMusic.subtitle': 'Η μουσική του άστεως',
              'path.artMusic.description': 'Μουσικά σύνολα και μουσικές συνθέσεις της έντεχνης μουσικής, τοπικοί συνθέτες και οργανωμένη μουσική εκπαίδευση',
              'path.urbanPopular.title': 'Αστικολαϊκή',
              'path.urbanPopular.subtitle': 'Η αστικολαϊκή μουσική',
              'path.urbanPopular.description': 'Μπάντες, χορωδίες, χορωδίες με μαντολίνα και, πιο πρόσφατα, αυτοσχέδια συγκροτήματα τζαζ, ποπ και ροκ, καθώς και άλλες μορφές μη δομημένης και βιωματικής μουσικής εκπαίδευσης',
              'path.ruralMusic.title': 'Μουσική Υπαίθρου',
              'path.ruralMusic.subtitle': 'Η μουσική της υπαίθρου',
              'path.ruralMusic.description': 'Μουσική σχετική με τις ετήσιες εκδηλώσεις στις, κυρίως αγροτικές και κτηνοτροφικές, εξωαστικές κοινότητες της Κέρκυρας του παρελθόντος και πώς αυτές έφτασαν στη σημερινή πραγματικότητα',
              'path.sacredMusic.title': 'Εκκλησιαστική Μουσική',
              'path.sacredMusic.subtitle': 'Η εκκλησιαστική μουσική',
              'path.sacredMusic.description': 'Κυρίως της Ορθόδοξης πίστης, ιδίως με τη μορφή του τοπικού «Κρητο-Ιόνιου» ύμνου. Επίσης, η λειτουργική μουσική των Καθολικών, Προτεσταντικών και Ισραηλιτικών κοινοτήτων',
              'item.backToArchive': 'Πίσω στο Αρχείο',
              'item.archivalAsset': 'Αρχειακό Υλικό',
              'item.mediaPlayback': 'Αναπαραγωγή Μέσων',
              'item.metadataOverview': 'Επισκόπηση Μεταδεδομένων',
              'item.musicPath': 'Μουσικό Μονοπάτι',
              'item.date': 'Ημερομηνία',
              'item.description': 'Περιγραφή',
              'item.noDescription': 'Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το αρχειακό τεκμήριο.',
              'item.archiveFiles': 'Αρχειακά Αρχεία',
              'item.extendedRecord': 'Εκτεταμένη Αρχειακή Εγγραφή',
              'item.viewFullRecord': 'Πλήρης Εγγραφή',
              'item.hideMetadata': 'Απόκρυψη Μεταδεδομένων',
              'item.youMightAlsoLike': 'Ίσως σας αρέσει επίσης',
              'item.archivalField': 'Αρχειακό Πεδίο',
              'item.recordValue': 'Τιμή',
              'item.index': 'Δείκτης',
              'item.unknownArchivist': 'Άγνωστος Αρχειονόμος',
              'item.unknownArchive': 'Άγνωστο Αρχείο',
              'events.title': 'Εκδηλώσεις στην Κέρκυρα',
              'events.subtitle': 'Ανακαλύψτε επερχόμενες μουσικές παραστάσεις, φεστιβάλ και πολιτιστικές εκδηλώσεις στην Κέρκυρα.',
              'events.loading': 'Αναζήτηση εκδηλώσεων...',
       },
};

export function tr(lang: Language, key: TranslationKey): string {
       return t[lang]?.[key] ?? t['en'][key] ?? key;
}
