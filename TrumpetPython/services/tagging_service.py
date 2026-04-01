from typing import List, Dict
from sqlmodel import Session, select
from models.item import Item
from models.metadata_value import MetadataValue

class TaggingService:
    def __init__(self, session: Session):
        self.session = session

    # Predefined tags for known items
    _predefined_tags: Dict[str, List[str]] = {
        "metodo per lo studio del pianoforte": ["Piano", "Pedagogy", "Instructional"],
        "marche hongroise": ["Classical", "Orchestral", "Piano Solo"],
        "spanische tanze": ["Dance", "Spanish", "Romantic"],
        "libro iii, mazurke per pianoforte op.6": ["Chopin", "Mazurka", "Piano"],
        "menuet aus mozart's sinfonie in es": ["Mozart", "Symphony", "Arrangement"],
        "etude iii": ["Study", "Technique", "Piano"],
        "danse de la frayeur": ["de Falla", "Modern", "Spanish"],
        "preghiera del mose": ["Rossini", "Opera", "Sacred"],
        "iris serenata di jor": ["Mascagni", "Opera", "Serenade"],
        "la gioconda": ["Ponchielli", "Opera", "Vocal Score"],
        "herodiade": ["Massenet", "French Opera", "Biblical"],
        "il barbiere di siviglia": ["Rossini", "Opera Buffa", "Italian"],
        "chant hindou": ["Rimsky-Korsakov", "Opera", "Sadko"],
        "vorrei morire!...": ["Tosti", "Romanza", "Vocal"],
        "rigoletto": ["Verdi", "Opera", "Drama"],
        "tosca": ["Puccini", "Opera", "Verismo"],
        "mefistofele": ["Boito", "Opera", "Faust"],
        "rondo capriccioso": ["Mendelssohn", "Virtuoso", "Piano"],
        "danze spagnuole per pianoforte, op.12": ["Moszkowski", "Dance", "Piano"],
        "caprice espagnol": ["Rimsky-Korsakov", "Orchestral", "Spanish"],
        "nocturnes": ["Chopin", "Romantic", "Piano"],
        "humoresques de concert menuet pour piano": ["Paderewski", "Piano Solo", "Concert"],
        "fedora": ["Giordano", "Opera", "Verismo"],
        "czardas": ["Monti", "Hungarian", "Violin/Piano"],
        "die lustige witwe": ["Lehár", "Operetta", "Viennese"],
        "serenade / σερενάδα": ["Vocal", "Romantic", "Melodic"],
        "cavalerie legere": ["von Suppé", "Overture", "Operetta"],
        "le tango de nos amours": ["Tango", "Dance", "Popular"],
        "26 melodies": ["Vocal", "Collection", "Art Song"],
        "der zigeunerprimas": ["Kálmán", "Operetta", "Gypsy Style"],
        "egmont": ["Beethoven", "Incidental Music", "Overture"],
        "ο γέρο δήμος": ["Karreras", "Greek Song", "Folklore"],
        "lakme": ["Delibes", "French Opera", "Exoticism"],
        "cavalleria rusticana": ["Mascagni", "Verismo", "Opera"],
        "mignon": ["Thomas", "Opéra Comique", "French"],
        "cavatine de leïla": ["Bizet", "The Pearl Fishers", "Soprano"],
        "mireille": ["Gounod", "Opera", "Provençal"],
        "romeo et juliette": ["Gounod", "Shakespeare", "Opera"],
        "i puritani": ["Bellini", "Bel Canto", "Opera"],
        "la sonnambula": ["Bellini", "Bel Canto", "Opera"],
        "die csárdásfürstin": ["Kálmán", "Operetta", "Hungarian"],
        "aida": ["Verdi", "Grand Opera", "Egypt"],
        "ouverture de guillaume tell": ["Rossini", "Overture", "Final"],
        "pagliacci": ["Leoncavallo", "Verismo", "Opera"],
        "μέθυσες μια καρδιά": ["Greek", "Popular", "Vocal"],
        "souvenir des aples": ["Flute/Piano", "Romantic", "Alpine"],
        "madame butterfly": ["Puccini", "Opera", "Japan"],
        "invitation a la valse": ["Weber", "Waltz", "Piano"],
        "manon": ["Massenet", "French Opera", "Drama"],
        "mattinata": ["Leoncavallo", "Song", "Italian"],
        "chanson de solveig": ["Grieg", "Peer Gynt", "Vocal"],
        "tannhauser": ["Wagner", "German Opera", "Romantic"]
    }

    async def generate_tags(self, item: Item) -> List[str]:
        # 1. Check Predefined Tags
        normalized_name = item.Name.lower().strip()
        for key, tags in self._predefined_tags.items():
            if key in normalized_name:
                return tags

        # 2. Heuristic Analysis
        context_text = item.Name
        useful_fields = ["dc.description", "dc.subject", "dc.contributor", "dc.type", "dc.title"]
        for meta in item.metadata_entries:
            if any(meta.Field.startswith(f) for f in useful_fields):
                context_text += f" {meta.Value}"

        return await self._simulated_ai_analysis(context_text)

    async def _simulated_ai_analysis(self, text: str) -> List[str]:
        lower_text = text.lower()
        potential_tags = set()

        # Simple keyword matching
        keywords = {
            "Music": ["music", "song"],
            "Ensemble": ["band", "orchestra"],
            "Oral History": ["interview", "oral info"],
            "Sheet Music": ["score", "sheet", "notation"],
            "Audio Recording": ["recording", "tape"],
            "Corfu Heritage": ["corfu", "kerkyra"],
            "Choral": ["χορωδία", "choir"],
            "Piano": ["πιάνο", "πιάνου", "piano"],
            "Violin": ["βιολί", "violin"],
            "Jazz": ["jazz"],
            "Classical": ["classical", "symphony"],
            "Sacred Music": ["church", "sacred", "chant"],
            "Folk": ["folk", "traditional"],
            "Brass": ["trumpet", "brass"]
        }

        for tag, words in keywords.items():
            if any(word in lower_text for word in words):
                potential_tags.add(tag)

        if not potential_tags:
            return ["Uncategorized", "Archive Item"]

        return list(potential_tags)[:3]

    async def backfill_tags(self):
        # Implementation of backfill
        from sqlalchemy.orm import selectinload
        statement = select(Item).options(selectinload(Item.metadata_entries))
        items = self.session.exec(statement).all()
        
        count = 0
        for item in items:
            # Remove existing tags
            existing_tags = [m for m in item.metadata_entries if m.Field == "trumpet.tag"]
            for et in existing_tags:
                self.session.delete(et)
            
            tags = await self.generate_tags(item)
            for tag in tags:
                new_meta = MetadataValue(
                    ItemId=item.Id,
                    Field="trumpet.tag",
                    Value=tag,
                    Language="en"
                )
                self.session.add(new_meta)
            count += 1
        
        self.session.commit()
        return count
