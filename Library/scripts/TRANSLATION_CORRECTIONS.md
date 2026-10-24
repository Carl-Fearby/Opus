# Contextual translation corrections

Reviewed seven labels in all 47 non-English locales against the English source and component usage. Corrected audio nouns and counters, work-item opening actions, Kanban card creation, file attachment actions and Boolean conjunctions. Already suitable translations were retained where appropriate.

Updated the TypeScript dictionaries and regenerated `Library/public/i18n/*.json`. English is unchanged.

Validation: all 48 JSON files contain the same 796 keys, nonempty values and matching named placeholder occurrence counts. French `ET` does not remain in other locales’ filter conjunctions.

Scope: this is a correction of the supplied audit categories and adjacent labels, not a full native-speaker review of all 37,412 translated values. Other translation issues may remain.

## Resulting labels

| Locale | Key | English | Translation |
| --- | --- | --- | --- |
| ar | `audioPlayer.track` | Track | مقطع صوتي |
| ar | `audioPlayer.trackCount` | Track {current} of {total} | المقطع الصوتي {current} من {total} |
| ar | `kanban.openTicket` | Open ticket for {title} | افتح تذكرة {title} |
| ar | `kanban.addCard` | Add a card | أضف بطاقة |
| ar | `kanban.addCardSubmit` | Add card | أضف بطاقة |
| ar | `kanban.attach` | Attach | أرفق |
| ar | `filter.and` | AND | و |
| az | `audioPlayer.track` | Track | Trek |
| az | `audioPlayer.trackCount` | Track {current} of {total} | Trek {current} / {total} |
| az | `kanban.openTicket` | Open ticket for {title} | {title} üçün tapşırığı aç |
| az | `kanban.addCard` | Add a card | Kart əlavə et |
| az | `kanban.addCardSubmit` | Add card | Kart əlavə et |
| az | `kanban.attach` | Attach | Fayl əlavə et |
| az | `filter.and` | AND | VƏ |
| bg | `audioPlayer.track` | Track | Песен |
| bg | `audioPlayer.trackCount` | Track {current} of {total} | Песен {current} от {total} |
| bg | `kanban.openTicket` | Open ticket for {title} | Отвори задачата за {title} |
| bg | `kanban.addCard` | Add a card | Добави карта |
| bg | `kanban.addCardSubmit` | Add card | Добави карта |
| bg | `kanban.attach` | Attach | Прикачи |
| bg | `filter.and` | AND | И |
| bn | `audioPlayer.track` | Track | ট্র্যাক |
| bn | `audioPlayer.trackCount` | Track {current} of {total} | {total}টির মধ্যে ট্র্যাক {current} |
| bn | `kanban.openTicket` | Open ticket for {title} | {title} এর টিকিট খুলুন |
| bn | `kanban.addCard` | Add a card | কার্ড যোগ করুন |
| bn | `kanban.addCardSubmit` | Add card | কার্ড যোগ করুন |
| bn | `kanban.attach` | Attach | ফাইল সংযুক্ত করুন |
| bn | `filter.and` | AND | এবং |
| cs | `audioPlayer.track` | Track | Skladba |
| cs | `audioPlayer.trackCount` | Track {current} of {total} | Skladba {current} z {total} |
| cs | `kanban.openTicket` | Open ticket for {title} | Otevřít úkol {title} |
| cs | `kanban.addCard` | Add a card | Přidat kartu |
| cs | `kanban.addCardSubmit` | Add card | Přidat kartu |
| cs | `kanban.attach` | Attach | Přiložit |
| cs | `filter.and` | AND | A |
| da | `audioPlayer.track` | Track | Spor |
| da | `audioPlayer.trackCount` | Track {current} of {total} | Spor {current} af {total} |
| da | `kanban.openTicket` | Open ticket for {title} | Åbn opgaven {title} |
| da | `kanban.addCard` | Add a card | Tilføj kort |
| da | `kanban.addCardSubmit` | Add card | Tilføj kort |
| da | `kanban.attach` | Attach | Vedhæft |
| da | `filter.and` | AND | OG |
| de | `audioPlayer.track` | Track | Titel |
| de | `audioPlayer.trackCount` | Track {current} of {total} | Titel {current} von {total} |
| de | `kanban.openTicket` | Open ticket for {title} | Ticket für {title} öffnen |
| de | `kanban.addCard` | Add a card | Karte hinzufügen |
| de | `kanban.addCardSubmit` | Add card | Karte hinzufügen |
| de | `kanban.attach` | Attach | Anhängen |
| de | `filter.and` | AND | UND |
| el | `audioPlayer.track` | Track | Κομμάτι |
| el | `audioPlayer.trackCount` | Track {current} of {total} | Κομμάτι {current} από {total} |
| el | `kanban.openTicket` | Open ticket for {title} | Άνοιγμα αιτήματος για {title} |
| el | `kanban.addCard` | Add a card | Προσθήκη κάρτας |
| el | `kanban.addCardSubmit` | Add card | Προσθήκη κάρτας |
| el | `kanban.attach` | Attach | Επισύναψη |
| el | `filter.and` | AND | ΚΑΙ |
| es | `audioPlayer.track` | Track | Pista |
| es | `audioPlayer.trackCount` | Track {current} of {total} | Pista {current} de {total} |
| es | `kanban.openTicket` | Open ticket for {title} | Abrir ticket de {title} |
| es | `kanban.addCard` | Add a card | Añadir tarjeta |
| es | `kanban.addCardSubmit` | Add card | Añadir tarjeta |
| es | `kanban.attach` | Attach | Adjuntar |
| es | `filter.and` | AND | Y |
| fa | `audioPlayer.track` | Track | آهنگ |
| fa | `audioPlayer.trackCount` | Track {current} of {total} | آهنگ {current} از {total} |
| fa | `kanban.openTicket` | Open ticket for {title} | باز کردن تیکت {title} |
| fa | `kanban.addCard` | Add a card | افزودن کارت |
| fa | `kanban.addCardSubmit` | Add card | افزودن کارت |
| fa | `kanban.attach` | Attach | پیوست کردن |
| fa | `filter.and` | AND | و |
| fi | `audioPlayer.track` | Track | Raita |
| fi | `audioPlayer.trackCount` | Track {current} of {total} | Raita {current} / {total} |
| fi | `kanban.openTicket` | Open ticket for {title} | Avaa tehtävä {title} |
| fi | `kanban.addCard` | Add a card | Lisää kortti |
| fi | `kanban.addCardSubmit` | Add card | Lisää kortti |
| fi | `kanban.attach` | Attach | Liitä tiedosto |
| fi | `filter.and` | AND | JA |
| fil | `audioPlayer.track` | Track | Track |
| fil | `audioPlayer.trackCount` | Track {current} of {total} | Track {current} sa {total} |
| fil | `kanban.openTicket` | Open ticket for {title} | Buksan ang ticket para sa {title} |
| fil | `kanban.addCard` | Add a card | Magdagdag ng card |
| fil | `kanban.addCardSubmit` | Add card | Magdagdag ng card |
| fil | `kanban.attach` | Attach | Mag-attach ng file |
| fil | `filter.and` | AND | AT |
| fr | `audioPlayer.track` | Track | Piste |
| fr | `audioPlayer.trackCount` | Track {current} of {total} | Piste {current} sur {total} |
| fr | `kanban.openTicket` | Open ticket for {title} | Ouvrir le ticket {title} |
| fr | `kanban.addCard` | Add a card | Ajouter une carte |
| fr | `kanban.addCardSubmit` | Add card | Ajouter une carte |
| fr | `kanban.attach` | Attach | Joindre |
| fr | `filter.and` | AND | ET |
| gu | `audioPlayer.track` | Track | ટ્રેક |
| gu | `audioPlayer.trackCount` | Track {current} of {total} | કુલ {total}માંથી ટ્રેક {current} |
| gu | `kanban.openTicket` | Open ticket for {title} | {title} માટે ટિકિટ ખોલો |
| gu | `kanban.addCard` | Add a card | કાર્ડ ઉમેરો |
| gu | `kanban.addCardSubmit` | Add card | કાર્ડ ઉમેરો |
| gu | `kanban.attach` | Attach | ફાઇલ જોડો |
| gu | `filter.and` | AND | અને |
| he | `audioPlayer.track` | Track | רצועה |
| he | `audioPlayer.trackCount` | Track {current} of {total} | רצועה {current} מתוך {total} |
| he | `kanban.openTicket` | Open ticket for {title} | פתיחת הכרטיס של {title} |
| he | `kanban.addCard` | Add a card | הוספת כרטיס |
| he | `kanban.addCardSubmit` | Add card | הוספת כרטיס |
| he | `kanban.attach` | Attach | צירוף קובץ |
| he | `filter.and` | AND | וגם |
| hi | `audioPlayer.track` | Track | ट्रैक |
| hi | `audioPlayer.trackCount` | Track {current} of {total} | कुल {total} में से ट्रैक {current} |
| hi | `kanban.openTicket` | Open ticket for {title} | {title} का टिकट खोलें |
| hi | `kanban.addCard` | Add a card | कार्ड जोड़ें |
| hi | `kanban.addCardSubmit` | Add card | कार्ड जोड़ें |
| hi | `kanban.attach` | Attach | फ़ाइल संलग्न करें |
| hi | `filter.and` | AND | और |
| hr | `audioPlayer.track` | Track | Pjesma |
| hr | `audioPlayer.trackCount` | Track {current} of {total} | Pjesma {current} od {total} |
| hr | `kanban.openTicket` | Open ticket for {title} | Otvori zadatak {title} |
| hr | `kanban.addCard` | Add a card | Dodaj karticu |
| hr | `kanban.addCardSubmit` | Add card | Dodaj karticu |
| hr | `kanban.attach` | Attach | Priloži datoteku |
| hr | `filter.and` | AND | I |
| hu | `audioPlayer.track` | Track | Zeneszám |
| hu | `audioPlayer.trackCount` | Track {current} of {total} | Zeneszám: {current} / {total} |
| hu | `kanban.openTicket` | Open ticket for {title} | A(z) {title} hibajegy megnyitása |
| hu | `kanban.addCard` | Add a card | Kártya hozzáadása |
| hu | `kanban.addCardSubmit` | Add card | Kártya hozzáadása |
| hu | `kanban.attach` | Attach | Csatolás |
| hu | `filter.and` | AND | ÉS |
| id | `audioPlayer.track` | Track | Trek |
| id | `audioPlayer.trackCount` | Track {current} of {total} | Trek {current} dari {total} |
| id | `kanban.openTicket` | Open ticket for {title} | Buka tiket untuk {title} |
| id | `kanban.addCard` | Add a card | Tambahkan kartu |
| id | `kanban.addCardSubmit` | Add card | Tambahkan kartu |
| id | `kanban.attach` | Attach | Lampirkan |
| id | `filter.and` | AND | DAN |
| it | `audioPlayer.track` | Track | Brano |
| it | `audioPlayer.trackCount` | Track {current} of {total} | Brano {current} di {total} |
| it | `kanban.openTicket` | Open ticket for {title} | Apri il ticket {title} |
| it | `kanban.addCard` | Add a card | Aggiungi scheda |
| it | `kanban.addCardSubmit` | Add card | Aggiungi scheda |
| it | `kanban.attach` | Attach | Allega |
| it | `filter.and` | AND | E |
| ja | `audioPlayer.track` | Track | トラック |
| ja | `audioPlayer.trackCount` | Track {current} of {total} | 全{total}曲中{current}曲目 |
| ja | `kanban.openTicket` | Open ticket for {title} | {title}のチケットを開く |
| ja | `kanban.addCard` | Add a card | カードを追加 |
| ja | `kanban.addCardSubmit` | Add card | カードを追加 |
| ja | `kanban.attach` | Attach | ファイルを添付 |
| ja | `filter.and` | AND | AND |
| ka | `audioPlayer.track` | Track | ტრეკი |
| ka | `audioPlayer.trackCount` | Track {current} of {total} | ტრეკი {current} / {total} |
| ka | `kanban.openTicket` | Open ticket for {title} | გახსენით {title}-ის დავალება |
| ka | `kanban.addCard` | Add a card | ბარათის დამატება |
| ka | `kanban.addCardSubmit` | Add card | ბარათის დამატება |
| ka | `kanban.attach` | Attach | მიმაგრება |
| ka | `filter.and` | AND | და |
| kk | `audioPlayer.track` | Track | Трек |
| kk | `audioPlayer.trackCount` | Track {current} of {total} | {total} тректің {current}-і |
| kk | `kanban.openTicket` | Open ticket for {title} | {title} тапсырмасын ашу |
| kk | `kanban.addCard` | Add a card | Карточка қосу |
| kk | `kanban.addCardSubmit` | Add card | Карточка қосу |
| kk | `kanban.attach` | Attach | Файл тіркеу |
| kk | `filter.and` | AND | ЖӘНЕ |
| ko | `audioPlayer.track` | Track | 트랙 |
| ko | `audioPlayer.trackCount` | Track {current} of {total} | 총 {total}곡 중 {current}번째 트랙 |
| ko | `kanban.openTicket` | Open ticket for {title} | {title} 티켓 열기 |
| ko | `kanban.addCard` | Add a card | 카드 추가 |
| ko | `kanban.addCardSubmit` | Add card | 카드 추가 |
| ko | `kanban.attach` | Attach | 파일 첨부 |
| ko | `filter.and` | AND | 그리고 |
| mr | `audioPlayer.track` | Track | ट्रॅक |
| mr | `audioPlayer.trackCount` | Track {current} of {total} | एकूण {total} पैकी ट्रॅक {current} |
| mr | `kanban.openTicket` | Open ticket for {title} | {title} साठी तिकीट उघडा |
| mr | `kanban.addCard` | Add a card | कार्ड जोडा |
| mr | `kanban.addCardSubmit` | Add card | कार्ड जोडा |
| mr | `kanban.attach` | Attach | फाइल संलग्न करा |
| mr | `filter.and` | AND | आणि |
| ms | `audioPlayer.track` | Track | Trek |
| ms | `audioPlayer.trackCount` | Track {current} of {total} | Trek {current} daripada {total} |
| ms | `kanban.openTicket` | Open ticket for {title} | Buka tiket untuk {title} |
| ms | `kanban.addCard` | Add a card | Tambah kad |
| ms | `kanban.addCardSubmit` | Add card | Tambah kad |
| ms | `kanban.attach` | Attach | Lampirkan fail |
| ms | `filter.and` | AND | DAN |
| ne | `audioPlayer.track` | Track | ट्र्याक |
| ne | `audioPlayer.trackCount` | Track {current} of {total} | कुल {total} मध्ये ट्र्याक {current} |
| ne | `kanban.openTicket` | Open ticket for {title} | {title} को टिकट खोल्नुहोस् |
| ne | `kanban.addCard` | Add a card | कार्ड थप्नुहोस् |
| ne | `kanban.addCardSubmit` | Add card | कार्ड थप्नुहोस् |
| ne | `kanban.attach` | Attach | फाइल संलग्न गर्नुहोस् |
| ne | `filter.and` | AND | र |
| nl | `audioPlayer.track` | Track | Nummer |
| nl | `audioPlayer.trackCount` | Track {current} of {total} | Nummer {current} van {total} |
| nl | `kanban.openTicket` | Open ticket for {title} | Ticket voor {title} openen |
| nl | `kanban.addCard` | Add a card | Kaart toevoegen |
| nl | `kanban.addCardSubmit` | Add card | Kaart toevoegen |
| nl | `kanban.attach` | Attach | Bestand bijvoegen |
| nl | `filter.and` | AND | EN |
| no | `audioPlayer.track` | Track | Spor |
| no | `audioPlayer.trackCount` | Track {current} of {total} | Spor {current} av {total} |
| no | `kanban.openTicket` | Open ticket for {title} | Åpne oppgaven {title} |
| no | `kanban.addCard` | Add a card | Legg til kort |
| no | `kanban.addCardSubmit` | Add card | Legg til kort |
| no | `kanban.attach` | Attach | Legg ved |
| no | `filter.and` | AND | OG |
| pa | `audioPlayer.track` | Track | ਟਰੈਕ |
| pa | `audioPlayer.trackCount` | Track {current} of {total} | ਕੁੱਲ {total} ਵਿੱਚੋਂ ਟਰੈਕ {current} |
| pa | `kanban.openTicket` | Open ticket for {title} | {title} ਲਈ ਟਿਕਟ ਖੋਲ੍ਹੋ |
| pa | `kanban.addCard` | Add a card | ਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ |
| pa | `kanban.addCardSubmit` | Add card | ਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ |
| pa | `kanban.attach` | Attach | ਫ਼ਾਈਲ ਨੱਥੀ ਕਰੋ |
| pa | `filter.and` | AND | ਅਤੇ |
| pl | `audioPlayer.track` | Track | Utwór |
| pl | `audioPlayer.trackCount` | Track {current} of {total} | Utwór {current} z {total} |
| pl | `kanban.openTicket` | Open ticket for {title} | Otwórz zgłoszenie {title} |
| pl | `kanban.addCard` | Add a card | Dodaj kartę |
| pl | `kanban.addCardSubmit` | Add card | Dodaj kartę |
| pl | `kanban.attach` | Attach | Dołącz plik |
| pl | `filter.and` | AND | I |
| pt | `audioPlayer.track` | Track | Faixa |
| pt | `audioPlayer.trackCount` | Track {current} of {total} | Faixa {current} de {total} |
| pt | `kanban.openTicket` | Open ticket for {title} | Abrir ticket de {title} |
| pt | `kanban.addCard` | Add a card | Adicionar cartão |
| pt | `kanban.addCardSubmit` | Add card | Adicionar cartão |
| pt | `kanban.attach` | Attach | Anexar |
| pt | `filter.and` | AND | E |
| ro | `audioPlayer.track` | Track | Piesă |
| ro | `audioPlayer.trackCount` | Track {current} of {total} | Piesa {current} din {total} |
| ro | `kanban.openTicket` | Open ticket for {title} | Deschide tichetul pentru {title} |
| ro | `kanban.addCard` | Add a card | Adaugă un card |
| ro | `kanban.addCardSubmit` | Add card | Adaugă un card |
| ro | `kanban.attach` | Attach | Atașează |
| ro | `filter.and` | AND | ȘI |
| ru | `audioPlayer.track` | Track | Трек |
| ru | `audioPlayer.trackCount` | Track {current} of {total} | Трек {current} из {total} |
| ru | `kanban.openTicket` | Open ticket for {title} | Открыть задачу {title} |
| ru | `kanban.addCard` | Add a card | Добавить карточку |
| ru | `kanban.addCardSubmit` | Add card | Добавить карточку |
| ru | `kanban.attach` | Attach | Прикрепить |
| ru | `filter.and` | AND | И |
| sk | `audioPlayer.track` | Track | Skladba |
| sk | `audioPlayer.trackCount` | Track {current} of {total} | Skladba {current} z {total} |
| sk | `kanban.openTicket` | Open ticket for {title} | Otvoriť úlohu {title} |
| sk | `kanban.addCard` | Add a card | Pridať kartu |
| sk | `kanban.addCardSubmit` | Add card | Pridať kartu |
| sk | `kanban.attach` | Attach | Priložiť |
| sk | `filter.and` | AND | A |
| sr | `audioPlayer.track` | Track | Нумера |
| sr | `audioPlayer.trackCount` | Track {current} of {total} | Нумера {current} од {total} |
| sr | `kanban.openTicket` | Open ticket for {title} | Отвори задатак {title} |
| sr | `kanban.addCard` | Add a card | Додај картицу |
| sr | `kanban.addCardSubmit` | Add card | Додај картицу |
| sr | `kanban.attach` | Attach | Приложи датотеку |
| sr | `filter.and` | AND | И |
| sv | `audioPlayer.track` | Track | Spår |
| sv | `audioPlayer.trackCount` | Track {current} of {total} | Spår {current} av {total} |
| sv | `kanban.openTicket` | Open ticket for {title} | Öppna ärendet {title} |
| sv | `kanban.addCard` | Add a card | Lägg till kort |
| sv | `kanban.addCardSubmit` | Add card | Lägg till kort |
| sv | `kanban.attach` | Attach | Bifoga fil |
| sv | `filter.and` | AND | OCH |
| sw | `audioPlayer.track` | Track | Wimbo |
| sw | `audioPlayer.trackCount` | Track {current} of {total} | Wimbo {current} kati ya {total} |
| sw | `kanban.openTicket` | Open ticket for {title} | Fungua tiketi ya {title} |
| sw | `kanban.addCard` | Add a card | Ongeza kadi |
| sw | `kanban.addCardSubmit` | Add card | Ongeza kadi |
| sw | `kanban.attach` | Attach | Ambatisha faili |
| sw | `filter.and` | AND | NA |
| ta | `audioPlayer.track` | Track | பாடல் |
| ta | `audioPlayer.trackCount` | Track {current} of {total} | மொத்தம் {total} பாடல்களில் {current}வது பாடல் |
| ta | `kanban.openTicket` | Open ticket for {title} | {title}க்கான டிக்கெட்டைத் திறக்கவும் |
| ta | `kanban.addCard` | Add a card | அட்டையைச் சேர் |
| ta | `kanban.addCardSubmit` | Add card | அட்டையைச் சேர் |
| ta | `kanban.attach` | Attach | கோப்பை இணை |
| ta | `filter.and` | AND | மற்றும் |
| te | `audioPlayer.track` | Track | ట్రాక్ |
| te | `audioPlayer.trackCount` | Track {current} of {total} | మొత్తం {total}లో ట్రాక్ {current} |
| te | `kanban.openTicket` | Open ticket for {title} | {title} కోసం టికెట్‌ను తెరవండి |
| te | `kanban.addCard` | Add a card | కార్డును జోడించండి |
| te | `kanban.addCardSubmit` | Add card | కార్డును జోడించండి |
| te | `kanban.attach` | Attach | ఫైల్‌ను జత చేయండి |
| te | `filter.and` | AND | మరియు |
| th | `audioPlayer.track` | Track | แทร็ก |
| th | `audioPlayer.trackCount` | Track {current} of {total} | แทร็กที่ {current} จาก {total} |
| th | `kanban.openTicket` | Open ticket for {title} | เปิดทิกเก็ตสำหรับ {title} |
| th | `kanban.addCard` | Add a card | เพิ่มการ์ด |
| th | `kanban.addCardSubmit` | Add card | เพิ่มการ์ด |
| th | `kanban.attach` | Attach | แนบ |
| th | `filter.and` | AND | และ |
| tr | `audioPlayer.track` | Track | Parça |
| tr | `audioPlayer.trackCount` | Track {current} of {total} | Parça {current} / {total} |
| tr | `kanban.openTicket` | Open ticket for {title} | {title} için iş kaydını aç |
| tr | `kanban.addCard` | Add a card | Kart ekle |
| tr | `kanban.addCardSubmit` | Add card | Kart ekle |
| tr | `kanban.attach` | Attach | Dosya ekle |
| tr | `filter.and` | AND | VE |
| uk | `audioPlayer.track` | Track | Трек |
| uk | `audioPlayer.trackCount` | Track {current} of {total} | Трек {current} з {total} |
| uk | `kanban.openTicket` | Open ticket for {title} | Відкрити завдання {title} |
| uk | `kanban.addCard` | Add a card | Додати картку |
| uk | `kanban.addCardSubmit` | Add card | Додати картку |
| uk | `kanban.attach` | Attach | Прикріпити |
| uk | `filter.and` | AND | І |
| ur | `audioPlayer.track` | Track | ٹریک |
| ur | `audioPlayer.trackCount` | Track {current} of {total} | کل {total} میں سے ٹریک {current} |
| ur | `kanban.openTicket` | Open ticket for {title} | {title} کا ٹکٹ کھولیں |
| ur | `kanban.addCard` | Add a card | کارڈ شامل کریں |
| ur | `kanban.addCardSubmit` | Add card | کارڈ شامل کریں |
| ur | `kanban.attach` | Attach | فائل منسلک کریں |
| ur | `filter.and` | AND | اور |
| uz | `audioPlayer.track` | Track | Trek |
| uz | `audioPlayer.trackCount` | Track {current} of {total} | {total} ta trekdan {current}-trek |
| uz | `kanban.openTicket` | Open ticket for {title} | {title} topshirig‘ini ochish |
| uz | `kanban.addCard` | Add a card | Kartochka qo‘shish |
| uz | `kanban.addCardSubmit` | Add card | Kartochka qo‘shish |
| uz | `kanban.attach` | Attach | Biriktirish |
| uz | `filter.and` | AND | VA |
| vi | `audioPlayer.track` | Track | Bản nhạc |
| vi | `audioPlayer.trackCount` | Track {current} of {total} | Bản nhạc {current} trên {total} |
| vi | `kanban.openTicket` | Open ticket for {title} | Mở phiếu công việc {title} |
| vi | `kanban.addCard` | Add a card | Thêm thẻ |
| vi | `kanban.addCardSubmit` | Add card | Thêm thẻ |
| vi | `kanban.attach` | Attach | Đính kèm |
| vi | `filter.and` | AND | VÀ |
| zh | `audioPlayer.track` | Track | 音轨 |
| zh | `audioPlayer.trackCount` | Track {current} of {total} | 第 {current} 首，共 {total} 首 |
| zh | `kanban.openTicket` | Open ticket for {title} | 打开 {title} 的工单 |
| zh | `kanban.addCard` | Add a card | 添加卡片 |
| zh | `kanban.addCardSubmit` | Add card | 添加卡片 |
| zh | `kanban.attach` | Attach | 附加文件 |
| zh | `filter.and` | AND | 且 |
