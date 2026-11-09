const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '..', 'data', 'books.json');

// Base authentic catalog entries with rich topics
const authorsAndThemes = {
  klassyka: [
    { author: "Magtymguly Pyragy", books: [
      { title: "Saýlanan Eserler (3 jiltlik)", desc: "Beýik akyldar we nusgawy şahyrymyz Magtymguly Pyragynyň 300 ýyllyk ýubileýine bagyşlanyp taýýarlanan iň doly neşir. Şahyryň watançylyk, ynsanperwerlik, ahlak we pelsepe temalaryndaky goşgulary, nesihatlary jemlenen." },
      { title: "Ylham Çeşmesi: Magtymgulynyň Hikmetleri", desc: "Magtymguly Pyragynyň ahlak, terbiýe we ynsan mertebesi hakyndaky pelsepevi goşgularynyň giňişleýin düşündirişi we çeper derňewi." },
      { title: "Watan Söýgüsi we Il-Gün Agzybirligi", desc: "Şahyryň türkmen halkynyň agzybirligi, döwletliligi we garaşsyzlygy ugrundaky çagyryşlaryny beýan edýän nusgawy şygyrlar ýygyndysy." },
      { title: "Pelsepe we Durmuş Sapaklary", desc: "Ynsan ömrüniň manysy, ýagşylyk we ýamanlyk, dünýäniň gurluşy hakyndaky çuňňur pelsepevi eserleri jemleýän ýörite neşir." }
    ]},
    { author: "Mollanepes", books: [
      { title: "Zöhre we Tahyr Dessany", desc: "Yşk mülküniň şasy Mollanepesiň döreden beýik söýgi dessany. Zöhre bilen Tahyryň päk söýgüsi, wepalylygy we sabyrlylygy ussatlyk bilen beýan edilýär." },
      { title: "Mollanepesiň Lirikasy we Gazallary", desc: "Gündogar şygryýetiniň iň ajaýyp däplerini özünde jemleýän näzik duýguly aýdymlaryň, goşgularyň we lirik bentleriň toplumy." }
    ]},
    { author: "Kemine", books: [
      { title: "Kemäniň Şygyrlary we Şorta Sözleri", desc: "Gündogar satirasynyň ussady Mämmetweli Keminäniň ýiti paýhasly goşgulary, jemgyýetçilik deňsizligine garşy paýhasly we gülküli şorta sözleri." },
      { title: "Kemine we Pelsepevi Ýumor", desc: "Türkmen halkynyň parasatly gülküsini, parasatly paýhasyny we durmuş hakykatyny wasp edýän ajaýyp edebi ýygyndy." }
    ]},
    { author: "Seýitnazar Seýdi", books: [
      { title: "Seýdiniň Watançylyk Şygryýeti", desc: "Batyr şahyr Seýitnazar Seýdiniň gaýduwsyzlyk, merdanalyk we Watany goramak temasyndaky gahrymançylykly goşgulary." },
      { title: "Ýigitlik we Edermenlik Aýdymlary", desc: "Seýdiniň türkmen ýigitlerine bagyşlan, mertlik we namys ugrundaky şygyrlar ýygyndysy." }
    ]},
    { author: "Gurbandurdy Zelili", books: [
      { title: "Zeliliniň Saýlanan Goşgulary", desc: "Magtymguly Pyragynyň ýegeni, beýik şahyr Zeliliniň garyplyk, adalat we ynsan söýgüsi temasyndaky ýürekden çykan bentleri." },
      { title: "Watan Küýsegi we Ykbal Aýdymlary", desc: "Zeliliniň daş illerde ýazan, dogduk mekan küýsegini we halk gadyryny beýan edýän täsirli eserleri." }
    ]},
    { author: "Nurmuhammet Andalyp", books: [
      { title: "Ýusup-Züleýha Dessany", desc: "Nurmuhammet Andalybyň Gündogaryň beýik sýužetine esaslanyp döreden şadessany. Sabyr-kanagat we wepadarlyk wasp edilýär." },
      { title: "Leýli-Mejnun Dessany", desc: "Andalybyň çeper ussatlyk bilen döreden, yşk we ahlak kämilligini subut edýän dessanlarynyň biri." },
      { title: "Oguznama Şadessany", desc: "Türkmen halkynyň gadymy taryhyny, Oguz hanyň we onuň ogullarynyň şöhratly ýörişlerini wasp edýän taryhy-edebi ýadygärlik." }
    ]},
    { author: "Döwletmämmet Azady", books: [
      { title: "Wagzy-Azat", desc: "Magtymguly Pyragynyň kakasy, akyldar Döwletmämmet Azadynyň ynsanperwerlik, döwleti dolandyrmak we kämil jemgyýet gurmak baradaky traktaty." }
    ]},
    { author: "Halk Dessany (ÝUNESKO)", books: [
      { title: "Görogly Şadessany (Doly neşir)", desc: "Bütindünýä maddy däl medeni mirasynyň sanawyna girizilen, gaýduwsyz türkmen bahadyry Görogly begiň edermenlikleri, watansöýüjiligi we Çenbili gorap saklaýşy hakynda şadessan." },
      { title: "Göroglynyň Çenbil Gurşy", desc: "Görogly begiň adalatly il gurmagy, gyrk ýigidi bilen birlikde halk bähbidini gorap saklaýşy hakyndaky şaha." },
      { title: "Görogly we Bezirgen Şahasy", desc: "Göroglynyň söwda kerwenlerini gorap, halkara parahatçylygy üpjün edişi hakyndaky meşhur şaha." },
      { title: "Şasenem we Garyp Dessany", desc: "Türkmen halkynyň arasynda iň köp söýlüp aýdylýan, söýgi we wepadarlyk sarpasyny belent tutýan halk dessany." },
      { title: "Asly-Kerem Dessany", desc: "Gündogar halklarynyň söýgüli şadessanlarynyň biri bolan Kerem bilen Aslynyň aýralyk we yşk synaglary hakyndaky eseri." },
      { title: "Nejep Oglan Dessany", desc: "Dutar sungatynyň, sazandalaryň we bagşyçylyk däpleriniň gadymy köklerini açyp görkezýän ajaýyp halk dessany." }
    ]},
    { author: "Gadymy Oguz Mirasy", books: [
      { title: "Kitaby Dädem Gorkut", desc: "Gadymy oguz-türkmen taýpalarynyň medeniýetini, gahrymançylykly ýörişlerini, däp-dessurlaryny we kowum-garyndaşlyk gatnaşyklaryny beýan edýän iň gadymy ýazuw ýadygärligi." },
      { title: "Salur Gazanyň Öýüniň Ýagmalanmagy", desc: "Dede Gorkut boýlarynyň arasynda iň gahrymançylykly we watançylyk ruhy belent hekaýatlaryň biri." },
      { title: "Bamsy Baýrek Boýy", desc: "Wepalylyk, mertlik we halk bähbidini ähli zatdan belent goýmak hakyndaky gadymy epos." }
    ]}
  ],
  roman: [
    { author: "Berdi Kerbabaýew", books: [
      { title: "Aýgytly Ädim (1-2-nji jilt)", desc: "XX asyr türkmen edebiýatynyň altyn fonduna giren taryhy roman. Artyk Babalynyň we halkyň azatlyk, adalatlylyk ugrundaky göreşini, türkmen sährasynyň durmuşyny ussatlyk bilen beýan edýän roman." },
      { title: "Nebitdag Romany", desc: "Gara altyn gözlegçileriniň, türkmen nebitçileriniň zähmet edermenligini we çöl tebigatyny özgerdişini açyp görkezýän eser." },
      { title: "Suw Damjasy - Altyn Dänesi", desc: "Garagum derýasynyň gurluşygyny, türkmen topragyna suw gelmegini we daýhan zähmetini wasp edýän epiki roman." },
      { title: "Gaýgysyz Atabaýew", desc: "Görnükli döwlet işgäri Gaýgysyz Atabaýewiň ömri we döwletlilik ýolundaky hyzmatlary hakynda taryhy-dokumental roman." }
    ]},
    { author: "Ata Gowşudow", books: [
      { title: "Perman Romany", desc: "XIX asyryň ahyryndaky türkmen jemgyýetiniň çylşyrymly durmuşy, batyr ýigitleriň watany goramak ugrundaky edermenlikleri hakyndaky beýik taryhy roman." },
      { title: "Köpetdagyň Eteginde", desc: "Ahal oazisiniň tebigaty, daýhanlaryň durmuşy we taryhy özgerişler hakyndaky ajaýyp kyssalar we roman." },
      { title: "Miras we Durmuş", desc: "Ata Gowşudowyň halkymyzyň däp-dessurlaryny, ahlak arassalygyny beýan edýän powestler we oçerkler ýygyndysy." }
    ]},
    { author: "Beki Seýtäkow", books: [
      { title: "Doganlar Romany (Trilogiýa)", desc: "Türkmenistanyň demirgazyk sebitiniň, Köneürgenç topragynyň taryhyny we doganlyk gatnaşyklaryny giňişleýin açyp görkezýän giň gerimli trilogiýa." },
      { title: "Ýagty Ýollara", desc: "Ýaşlaryň bilime, ylma bolan höwesini we täze durmuş gurmakdaky zähmetini beýan edýän roman." },
      { title: "Bedirkent Galasy", desc: "Gadymy taryhy galalar, geçmişiň syrlary we taryhy şahsyýetler hakyndaky gyzykly kyssa eseri." }
    ]},
    { author: "Hydyr Derýaýew", books: [
      { title: "Ykbal Romany (4 jiltlik)", desc: "Döwlet baýragynyň eýesi Hydyr Derýaýewiň türkmen halkynyň XX asyryň başyndaky taryhy ykbalyny çeper suratlandyrýan meşhur roman-epopeýasy." },
      { title: "Ykbalyň Öwrümleri", desc: "Ykbal romanynyň dowamy bolup, baş gahrymanlaryň täze döwürdäki durmuş ýollaryny we ahlak saýlawlaryny görkezýär." }
    ]},
    { author: "Tirkiş Jumageldiýew", books: [
      { title: "Baş Gury Gurama", desc: "Jemgyýetçilik gatnaşyklaryny, durmuşdaky çylşyrymly ýagdaýlary ýiti psihologik nukdaýnazardan açyp görkezýän ajaýyp roman." },
      { title: "Ýer Yranan Gün", desc: "1948-nji ýylyň Aşgabat ýer titremesiniň pajygasyny, halkyň agzybirligini we mertligini beýan edýän taryhy-gussa eseri." },
      { title: "Merw Şasoltanlary", desc: "Merwiň gadymy taryhy, Seljuk soltanlygynyň beýikligi we medeni gülläp ösüşi hakynda taryhy roman." }
    ]},
    { author: "Öwez Durdyýew", books: [
      { title: "Murgap Ýakasynda", desc: "Mary topragynyň taryhy, Murgap derýasynyň boýundaky ilatyň geçmişi we agzybirligi hakyndaky roman." }
    ]}
  ],
  sygyryet: [
    { author: "Gurbannazar Ezizow", books: [
      { title: "Güýz Ýapraklary", desc: "Talant we ylham eýesi Gurbannazar Ezizowyň iň gowy lirik, durmuşy we pelsepevi goşgulary. Dünýä, ömür we adamzat kalbynyň syrlary." },
      { title: "Serpaý Şygyrlar Ýygyndysy", desc: "Şahyryň ýaşlyk, söýgi, ene mukaddesligi we durmuş pelsepesine bagyşlanan iň meşhur eserleri." },
      { title: "Watan Hakynda Oýlanmalar", desc: "Ezizowyň watançylyk lirikasy, topraga we halka bolan çäksiz söýgini wasp edýän ajaýyp bentler." }
    ]},
    { author: "Kerim Gurbannepesow", books: [
      { title: "Taýmaz Baban Poamasy", desc: "Türkmen halk şahyry Kerim Gurbannepesowyň halk durmuşyny, gojalaryň paýhasyny we zähmet terbiýesini beýan edýän şedewr eseri." },
      { title: "Ýazmasy Agir Düşen Goşgy", desc: "Şahyryň kalbyndan çykan, ene mertebesi, ömür ýoly we ynsan borjy hakyndaky beýik goşgular ýygyndysy." },
      { title: "Ömür Kerweni", desc: "Gurbannepesowyň lirik goşgulary, söýgi we durmuş pelsepesi hakyndaky pähimli şygyrlary." },
      { title: "Gyz Galyňy we Ýaşlyk Oýlary", desc: "Köne döwrüň däplerini we täze durmuşyň gözelligini görkezýän şahyrana poemalar we aýdymlar." }
    ]},
    { author: "Berdinazar Hudaýnazarow", books: [
      { title: "Gumlular Romany (Şahyrana kyssa)", desc: "Garagum çölüniň adamlarynyň, çopanlaryň mertligi we tebigat bilen sazlaşygy hakynda ýazylan ajaýyp eser." },
      { title: "Akar Suwuň Aýdymy", desc: "Şahyryň Garagum derýasyna, zähmetkeş adamlara we eziz Watana bagyşlan liriki goşgulary." }
    ]},
    { author: "Halyl Kulyýew", books: [
      { title: "Ýürek Joşgunlary", desc: "Gysga emma manyly ömür süren Halyl Kulyýewiň ýalynly, joşgunly we watansöýüjilik ruhundaky şygyrlar ýygyndysy." },
      { title: "Watan Diýip Ursa Ýürek", desc: "Mertlik, dostluk we söýgi tematikasyndaky iň täsirli şygyrlar toplumy." }
    ]},
    { author: "Italmaz Nuryýew", books: [
      { title: "Dag Eteklerinde", desc: "Köpetdagyň tebigaty, bahar paslynyň gözelligi we adamlar arasyndaky ynsanperwerlik gatnaşyklary baradaky şygyrlar." }
    ]}
  ],
  powest: [
    { author: "Nurmyrat Saryhanow", books: [
      { title: "Şükür Bagşy", desc: "Saz sungatynyň, dutaryň gudraty arkaly parahatçylygy gazanan ussat sazanda Şükür bagşy hakyndaky beýik powest. Saz we ynsan mertebesi hakynda ölmez-ýitmez eser." },
      { title: "Kitap Hekaýasy", desc: "Kitaba, bilime we edebi mirasa bolan hormaty terbiýeleýän, many-mazmuna baý ajaýyp nusgawy hekaýa." },
      { title: "Ýagtylyk we Başga Hekaýalar", desc: "Saryhanowyň türkmen kyssasynyň altyn fonduna giren gysga hekaýalary we durmuşy oçerkleri." }
    ]},
    { author: "Gara Seýitliýew", books: [
      { title: "Jahan Parahatçylygy", desc: "Gara Seýitliýewiň dostluk, halkara agzybirlik we parahatçylyk ugrundaky kyssalar we oçerkler ýygyndysy." }
    ]},
    { author: "Ýowşan Annagurbanow", books: [
      { title: "Sähra Çagasy", desc: "Garagum çölüniň giňişliklerinde önüp-ösen ýaşlaryň durmuşy, tebigat söýgüsi we arzuwlary hakyndaky täsirli powest." },
      { title: "Gökdere Hekaýatlary", desc: "Dag jülgesiniň arassa howasynda geçen gyzykly wakalar we çagalyk ýatlamalary." }
    ]},
    { author: "Agageldi Allanazarow", books: [
      { title: "Gara Şagalaň", desc: "Döwrebap türkmen kyssasynyň täsirli powesti. Ýaşlaryň saýlan ýoly we durmuş synaglary beýan edilýär." },
      { title: "Miras Gözleginde", desc: "Gadymy golýazmalar, medeni gymmatlyklar we taryhy şahsyýetleriň yzlary hakyndaky kyssalar." }
    ]}
  ],
  cagalar: [
    { author: "Halk Döredijiligi", books: [
      { title: "Türkmen Halk Ertekileri (Suratly)", desc: "Çagalar üçin reňkli suratlary bilen taýýarlanan iň meşhur türkmen ertekileri: Ýarty gulak, Akpamyk, Huýrlukga-Hemra we beýlekiler." },
      { title: "Ýarty Gulagyň Täze Başdan Geçirmeleri", desc: "Kichijik emma örän akylly we batyr Ýarty gulagyň şadyýan we terbiýeçilik ähmiýetli başdan geçirmeleri." },
      { title: "Akpamyk we On Dogan", desc: "Doganlyk söýgüsini, mertligi we erjelligi wasp edýän iň ajaýyp türkmen halk ertekileriniň biri." },
      { title: "Türkmen Halk Matallary we Ýaňyltmaçlary", desc: "Çagalaryň dil baýlygyny, çalasynlygyny we logiki pikirlenmesini ösdürýän halk döredijilik nusgalary." },
      { title: "Türkmen Rowaýatlary we Tymsallary", desc: "Geçmişde bolup geçen wakalar, tebigat täsinlikleri we pähimli hekaýatlar hakynda çagalar üçin ýörite gollanma." }
    ]},
    { author: "Kaýum Taňrygulyýew", books: [
      { title: "Gülki Çemeni", desc: "Türkmen çagalar edebiýatynyň ussady Kaýum Taňrygulyýewiň çagalar üçin ýazan şadyýan we öwrediji goşgular ýygyndysy." },
      { title: "Altyn Güýz we Mekdep Ýollary", desc: "Okuwçylaryň mekdep durmuşy, dostluk we zähmetsöýüjilik hakyndaky ajaýyp aýdymlary we goşgulary." },
      { title: "Balajyklara Sowgat", desc: "Mekdebe çenli ýaşly çagalar üçin tebigat, haýwanat dünýäsi we reňkler hakynda taýýarlanan suratly kitapça." }
    ]},
    { author: "Nury Baýramow", books: [
      { title: "Güneşli Älem", desc: "Çagalary dünýäni tanamaga, Watany söýmäge we tebigaty goramaga çagyrýan täsirli goşgular ýygyndysy." },
      { title: "Biziň Howlymyzyň Syrlary", desc: "Öý haýwanlary, guşlar we çagalaryň gyzykly oýunlary hakyndaky ýürege ýakyn hekaýalar." }
    ]},
    { author: "Hemra Şirow", books: [
      { title: "Köpetdagyň Balalary", desc: "Köpetdag goraghanasynyň arhar, keýik we bürgüt ýaly haýwanlary hakyndaky ertekiler we çeper gürrüňler." }
    ]}
  ],
  ylmy: [
    { author: "Türkmenistanyň Ylymlar Akademiýasy", books: [
      { title: "Türkmenistanyň Taryhy we Medeni Mirasy", desc: "Nusaý, Merw, Köneürgenç, Dehistan we Abywert ýaly gadymy siwilizasiýalaryň arheologiki açyşlary, binagärlik we medeni mirasynyň ylmy derňewi." },
      { title: "Magtymguly Pyragynyň Golýazma Mirasy", desc: "Dünýä hazynalarynda saklanýan Magtymguly Pyragynyň gadymy golýazmalarynyň ylmy-tekstologiki derňewi we taryhy düşündirişleri." },
      { title: "Türkmen Diliniň Düşündirişli Sözlügi (2 jiltlik)", desc: "50,000-den gowrak sözi öz içine alýan, türkmen edebi diliniň baý sözlük hazynasyny düşündirýän esasy ylmy gollanma." },
      { title: "Türkmenistanyň Ösümlik Dünýäsi we Dermanlyk Otlary", desc: "Köpetdag, Garagum we Köýtendag sebitlerindäki dermanlyk ösümlikleriň gurluşy, peýdaly aýratynlyklary we lukmançylykda ulanylyşy." },
      { title: "Türkmen Halylarynyň Sungaty we Geometriýasy", desc: "Bütindünýä meşhur türkmen halylarynyň gölleri, reňk tilsimleri, dokalyş usullary we taryhy gelip çykyşy barada monografiýa." },
      { title: "Gadymy Merw — Gündogaryň Merjeni", desc: "Beýik Ýüpek ýolunyň ugrundaky Merw şäheriniň müňýyllyk taryhy, medeniýeti, Seljuklar döwri we dünýä siwilizasiýasyna goşan goşandy." },
      { title: "Türkmen Döwletleriniň Diplomatik Gatnaşyklary", desc: "Geçmişdäki beýik türkmen döwletleriniň goňşy we dünýä ýurtlary bilen alyp baran ilçilik, söwda we parahatçylyk gatnaşyklarynyň taryhy." }
    ]},
    { author: "A. Merdanow, K. Begmyradow", books: [
      { title: "Python we Web Programmirleme Esaslary", desc: "Türkmen dilinde programmirläp öwrenmek isleýän ýaşlar üçin amaly gollanma. Python sintaksisi, algoritmler, web sahypa döretmek (HTML/CSS/JS) we backend esaslary amaly mysallar bilen düşündirilýär." },
      { title: "JavaScript we Döwrebap Web Frontend", desc: "React, Vue we döwrebap JavaScript arkaly interaktiw web programmalar döretmegiň türkmen dilindäki doly gollanmasy." },
      { title: "Maglumatlar Binýady we SQL Esaslary", desc: "PostgreSQL, MySQL we SQLite maglumatlar bazalaryny döretmek, optimizasiýa etmek we REST API bilen baglanyşdyrmak tejribesi." },
      { title: "Kiberhowpsuzlyk we Tor Tehnologiýalary", desc: "Kompýuter torlary, maglumat howpsuzlygyny goramak we kiber-hüjümleriň öňüni almak boýunça amaly okuw kitaby." }
    ]},
    { author: "Prof. D. Orazow", books: [
      { title: "Ýokary Matematika we Çyzykly Algebra", desc: "Ýokary okuw mekdepleriniň talyplary üçin differensial deňlemeler, matrisalar we matematiki derňew boýunça giňişleýin darslyk." },
      { title: "Ähtimallyklar Nazaryýeti we Matematiki Statistika", desc: "Ylmy barlaglarda we ykdysadyýetde maglumatlary derňemek üçin statistiki usullar we modeller." }
    ]}
  ],
  dunya: [
    { author: "Antuan de Sent-Ekzýuperi", books: [
      { title: "Kiçijik Şazada (The Little Prince)", desc: "Dünýä edebiýatynyň iň meşhur pelsepevi erteki-powestiniň türkmen dilindäki ajaýyp terjimesi. 'Iň esasy zady diňe ýürek bilen görüp bolar, gözler esasy zady görmeýär'." }
    ]},
    { author: "Lew Tolstoý", books: [
      { title: "Uruş we Parahatçylyk (Saýlanan)", desc: "Dünýä edebiýatynyň beýik epopeýasy. Russiýanyň 1812-nji ýylky taryhy, adam ruhunyň gözlegleri we pelsepevi çuňluk." },
      { title: "Anna Karenina", desc: "Maşgala mukaddesligi, jemgyýetçilik ahlagy we ynsan kalbynyň çylşyrymly duýgulary hakyndaky beýik roman." },
      { title: "Hajy Myrat", desc: "Kawkazyň gaýduwsyz gahrymany Hajy Myradyň merdanalygy we erkinlik ugrundaky göreşi hakynda taryhy powest." }
    ]},
    { author: "Fýodor Dostoýewskiý", books: [
      { title: "Jenaýat we Jeza", desc: "Rodion Raskolnikowyň ynsap ezýetleri, ahlak kanunlary we ruhy täzeden dogluşy hakynda dünýä belli psihologik roman." },
      { title: "Doganlar Karamazowlar", desc: "Hudaý, erkinlik, ahlak we adamzat tebigaty hakyndaky çuňňur pelsepevi şedewr." },
      { title: "Tentek (Idiot)", desc: "Ýagşylyk we arassalyk dünýäni halas edip bilermi? Knýaz Myşkiniň pelsepevi keşbi arkaly jemgyýetiň hakyky ýüzi." }
    ]},
    { author: "Ernest Hemingueý", books: [
      { title: "Gartaşan Adam we Deňiz", desc: "Nobel baýragyna mynasyp bolan şedewr. 'Adamy ýok edip bolar, ýöne ony ýeňip bolmaz' diýen beýik ruhy çagyryş." },
      { title: "Ýarag bilen Hoşlaşyk", desc: "Birinji jahan urşunyň pajygalary we söýginiň gudraty hakyndaky täsirli roman." }
    ]},
    { author: "Erih Mariýa Remark", books: [
      { title: "Garb Frontunda Üýtgeşiklik Ýok", desc: "Ýitirilen nesliň pajygasy, urşuň rehimsizligi we esgerleriň dostlugy hakynda dünýä edebiýatynyň iň täsirli eseri." },
      { title: "Üç Ýoldaş", desc: "Hakyky dostluk, wepaly söýgi we durmuş synaglaryna garşy durmak hakyndaky ajaýyp roman." },
      { title: "Ýeňiş Derwezesi (Triumfal Ark)", desc: "Parižde gaçybatalga tapan lukmanyň ykbaly, geçmiş ýaralary we täze söýgi ynamy." }
    ]},
    { author: "Jorj Oruell", books: [
      { title: "1984", desc: "Dünýä belli antiutopik roman. Erkin pikirlenmek, hakykat we şahsyýetiň azatlygy ugrundaky çuňňur duýduryş." },
      { title: "Haýwanlar Howlusy", desc: "Häkimiýet, deňlik we jemgyýetçilik aldawlary hakynda ýazylan satiriki eýýam eseri." }
    ]},
    { author: "Gabriel Garsia Markes", books: [
      { title: "Ýüz Ýyllyk Ýalňyzlyk", desc: "Jadyly realizmiň şedewri. Buendia maşgalasynyň ýedi nesliniň taryhy we ynsan ýalňyzlygy hakyndaky beýik roman." },
      { title: "Waba Döwrüniň Söýgüsi", desc: "Ýarym asyrdan gowrak garaşylan, garramayan päk söýginiň taryhy." }
    ]},
    { author: "Uilýam Şekspir", books: [
      { title: "Gamlet (Tragediýa)", desc: "'Bolmalymy ýa bolmaly däl?' — dünýä teatr sungatynyň iň belent pelsepevi trafigiýasy." },
      { title: "Romeo we Julýetta", desc: "Werona şäherindäki iki ýaşyň ebedi söýgüsi we düşünişmezliklere garşy pähimli göreşi." }
    ]},
    { author: "Iogann Wolfgang Gyote", books: [
      { title: "Faust (Tragiki poema)", desc: "Ylym, hakykat gözlegi we ruhy kämilleşmek ugrundaky beýik Gündogar-Günbatar pelsepesi." }
    ]},
    { author: "Onore de Balzak", books: [
      { title: "Gorio Ata", desc: "Ata söýgüsi, jemgyýetdäki baýlyk we şöhrat bäsleşigi hakyndaky ajaýyp nusgawy roman." }
    ]},
    { author: "Çingiz Aýtmatow", books: [
      { title: "Ak Gemi", desc: "Balajygyň arassa kalby, tebigat rowaýatlary we uly dünýäniň rehimsizligi hakyndaky çuňňur kyssa." },
      { title: "Asyra Barabar Gün", desc: "Mankurtlyk, taryhy ýady saklamak we ynsan mertebesi hakyndaky beýik roman." },
      { title: "Ilkinji Mugallym", desc: "Bilim bermek we sowatsyzlyga garşy göreşmek ugrundaky pidakärlik hakynda ýürege ýakyn powest." },
      { title: "Jemile Powesti", desc: "Fransuz ýazyjysy Lui Aragonyň 'dünýäniň iň owadan söýgi hekaýaty' diýip baha beren powesti." }
    ]},
    { author: "Ýasynari Kawabata", books: [
      { title: "Garly Ýurt", desc: "Ýapon estetikasynyň, tebigat we ynsan duýgularynyň näzik sazlaşygyny görkezýän Nobel baýrakly powest." }
    ]},
    { author: "Ýuwal Noa Harari", books: [
      { title: "Sapiens: Adamzadyň Gysgaça Taryhy", desc: "Daş asyryndan başlap döwrebap tehnologiýalara çenli adamzat görnüşiniň ösüş ýoluny derňeýän dünýä bestelleri." },
      { title: "Homo Deus: Ertiriň Gysgaça Taryhy", desc: "Geljekki emeli aň, biotehnologiýalar we adamzadyň öňünde duran täze meseleler hakynda ylmy çaklamalar." },
      { title: "XXI Asyr Üçin 21 Sapak", desc: "Häzirki döwrüň krizisleri, maglumat howpsuzlygy we şahsyýetiň geljegi hakyndaky pähimler." }
    ]},
    { author: "Jems Klir", books: [
      { title: "Atom Endikleri (Atomic Habits)", desc: "Gündelik kiçijik 1%-lik üýtgeşmeler arkaly uly üstünliklere ýetmegiň we ýaramaz endiklerden dynmagyň amaly gollanmasy." }
    ]},
    { author: "Deyl Karnegi", books: [
      { title: "Dostlary Gazanmak we Adamlara Täsir Etmek", desc: "Aragatnaşyk sungaty, ynandyrmak we jemgyýetde abraý gazanmagyň synagdan geçen iň meşhur düzgünleri." },
      { title: "Aladalardan Dynmak we Bagtly Ýaşamak", desc: "Stresden, gorkulardan gutulmak we durmuşdan lezzet alyp ýaşamak boýunça psihologik maslahatlar." }
    ]},
    { author: "Robert Kiosaki", books: [
      { title: "Baý Kaka, Garyp Kaka (Rich Dad Poor Dad)", desc: "Maliýe sowatlylygy, maýa goýumlar we puluň siziň üçin işlemegini gazanmak hakynda dünýä boýunça #1 maliýe kitaby." },
      { title: "Puluň Akym Kwandranty", desc: "Işgärlikden telekeçilige we maýadarlyga geçmegiň ýollaryny öwredýän amaly okuw gollanmasy." }
    ]},
    { author: "Braýan Treýsi", books: [
      { title: "Şol Gurbagany Iýiň! (Eat That Frog!)", desc: "Wagty dolandyrmak, işleri soňa goýmazlyk we iň möhüm maksatlara tiz ýetmegiň 21 usuly." },
      { title: "Maksatlar: Isleseň Ýetip Bilersiň", desc: "Durmuşda we işde anyk maksatlary kesgitlemek we olara ädimme-ädim ýetmegiň strategiýasy." }
    ]},
    { author: "Robin Şarma", books: [
      { title: "Säher Sagat 5 Kluby (The 5 AM Club)", desc: "Ir turmagyň peýdalary, fiziki we akyl taýdan kämilleşmek we günüňi doly netijeli geçirmegiň syrlary." },
      { title: "Ferarisini Satan Monah", desc: "Maddy baýlykdan ruhy bagta tarap ýol, ömrüň hakyky manysyny tapmak hakyndaky pelsepevi hekaýat." }
    ]},
    { author: "Uolter Aýzekson", books: [
      { title: "Stiw Jobs: Terjimehaly", desc: "Apple kompaniýasynyň esaslandyryjysy Stiw Jobsuň dünýä tehnologiýasyny özgerden ömür ýoly, döredijilik paýhasy we liderlik sapaklary." },
      { title: "Ilon Mask: Geljegi Gurýan Şahs", desc: "Tesla, SpaceX we Neuralink ýaly ägirt taslamalaryň arkasyndaky hyjuw we töwekgelçilikler." }
    ]}
  ]
};

// Realistic Turkmen review comments
const reviewComments = [
  "Taryhy we ahlak gymmaty örän ýokary kitap. Çap edilişi ajaýyp!",
  "Her bir türkmen maşgalasynda bolmaly eser. Çuňňur manyly.",
  "Gaty gyzykly we täsirli kitap, bir demde okap çykdym.",
  "Dessanlaryň şasy. Ýaşlara watansöýüjilik terbiýesini berýär.",
  "Dutaryň güýji bilen gan dökülmeginiň öňüni alan Şükür bagşy hakyndaky ajaýyp kitap.",
  "Şahyryň her bir seti diňe ýürekden çykýar. Maslahat berýärin!",
  "Çagalarym uly höwes bilen okaýarlar, suratlary gaty owadan.",
  "Dünýägaraýşy giňeldýän, pikirlenmäge mejbur edýän gollanma.",
  "Türkmen dilinde programmirläp öwrenmek üçin iň düşnükli okuw gollanmasy!",
  "Terjimesi gaty labyzly we baý türkmen dilinde ýerine ýetirilen.",
  "Wagty tygşytlamaga we netijeliligi artdyrmaga örän uly kömek etdi.",
  "Kitaby okap durmuşyma täzeçe seredip başladym. Hökmany okaň!",
  "Bahasy hem elýeterli, sahypalary ak kagyza arassa çap edilen.",
  "Eltip bermek hyzmaty örän tiz işledi, sag boluň!",
  "Maliýe sowatlylygyny öwrenmek üçin iň gowy başlangyç.",
  "Çuň pelsepe we ynsan kalbynyň syrlary ussatlyk bilen açylypdyr."
];

const reviewerNames = [
  "Mekan Allanazarow", "Aýgül Berdiýewa", "Serdar Kakajykow", "Jemal Orazowa",
  "Döwlet Myradow", "Mekan Taganow", "Şöhrat Merdanow", "Jeren Begmyradowa",
  "Myrat Ýolamanow", "Selbi Hydyrowa", "Guwanç Saryýew", "Ogulbäbek Nuryýewa",
  "Begmyrat Annagurbanow", "Maral Taşliýewa", "Rahym Gurbanow", "Altyn Jumageldiýewa"
];

// Color gradients for covers
const gradientsByCategory = {
  klassyka: [
    "from-emerald-700 to-teal-950",
    "from-teal-800 to-emerald-950",
    "from-green-800 to-slate-900",
    "from-emerald-600 to-cyan-950"
  ],
  roman: [
    "from-amber-700 to-orange-950",
    "from-amber-800 to-yellow-950",
    "from-stone-700 to-stone-950",
    "from-orange-800 to-red-950"
  ],
  sygyryet: [
    "from-purple-800 to-fuchsia-950",
    "from-violet-800 to-indigo-950",
    "from-pink-800 to-purple-950",
    "from-fuchsia-700 to-slate-900"
  ],
  powest: [
    "from-rose-800 to-red-950",
    "from-red-800 to-stone-900",
    "from-rose-700 to-pink-950",
    "from-red-700 to-orange-950"
  ],
  cagalar: [
    "from-cyan-600 to-blue-900",
    "from-sky-500 to-indigo-900",
    "from-blue-600 to-teal-900",
    "from-teal-600 to-emerald-900"
  ],
  ylmy: [
    "from-teal-700 to-slate-900",
    "from-indigo-800 to-slate-950",
    "from-cyan-800 to-blue-950",
    "from-slate-700 to-zinc-950"
  ],
  dunya: [
    "from-blue-700 to-indigo-950",
    "from-indigo-700 to-purple-950",
    "from-sky-700 to-slate-900",
    "from-violet-700 to-sky-950"
  ]
};

const badges = ["Meşhur", "Bestseller", "Nusgawy", "Täze", "Maslahat berilýär", "ÝUNESKO", "Top Bahalandyrma", "Altyn Fond"];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate rich book objects
const allBooks = [];
let idCounter = 1;

// 1. First add all primary authentic entries
for (const [cat, authors] of Object.entries(authorsAndThemes)) {
  for (const authorObj of authors) {
    for (const b of authorObj.books) {
      const gradList = gradientsByCategory[cat] || gradientsByCategory.klassyka;
      const pages = randomInt(180, 680);
      const year = randomInt(2018, 2026);
      const price = parseFloat((randomInt(30, 110) + (Math.random() > 0.5 ? 0.5 : 0)).toFixed(2));
      const oldPrice = Math.random() > 0.4 ? parseFloat((price + randomInt(15, 35)).toFixed(2)) : null;
      const numReviews = randomInt(2, 5);
      const reviews = [];
      for (let r = 0; r < numReviews; r++) {
        reviews.push({
          user: randomChoice(reviewerNames),
          rating: randomChoice([4, 5, 5, 5]),
          comment: randomChoice(reviewComments),
          date: `2026-${String(randomInt(7, 11)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`
        });
      }

      allBooks.push({
        id: `book-${idCounter++}`,
        title: b.title,
        author: authorObj.author,
        category: cat,
        price,
        oldPrice,
        rating: 4.8 + Math.round(Math.random() * 2) / 10,
        reviewsCount: reviews.length + randomInt(8, 35),
        pages,
        year,
        language: cat === 'dunya' ? 'Türkmençe (Terjime)' : 'Türkmençe',
        stock: randomInt(8, 45),
        badge: randomChoice(badges),
        gradient: randomChoice(gradList),
        description: b.desc,
        reviews
      });
    }
  }
}

console.log(`Base catalog generated: ${allBooks.length} books.`);

// 2. Extend with thematic sub-editions, multi-volume sets, monographs, and academic series to ensure at least 210 books
const seriesThemes = [
  { prefix: "Altyn Hazyna: ", suffix: " (Seýrek Neşir)", cat: "klassyka", descExtra: "Gadymy golýazmalar merkeziniň ylmy barlaglary esasynda taýýarlanan seýrek we gymmatly miras neşiri." },
  { prefix: "Taryhy Hakida: ", suffix: " (Taryhy Derňew)", cat: "roman", descExtra: "Halkymyzyň geçmiş taryhyny, şanly geçmişini we gahrymançylykly pelsepesini çuňňur derňeýän düýpli eser." },
  { prefix: "Gündogar Lirikasy: ", suffix: " (Şahyrana Ýygyndy)", cat: "sygyryet", descExtra: "Şygyr muşdaklary üçin ylham beriji, pelsepevi we ahlak taýdan kämilleşdiriji täze goşgular toplumy." },
  { prefix: "Durmuşy Kyssalar: ", suffix: " (Hekaýatlar)", cat: "powest", descExtra: "Ynsan gatnaşyklary, wepadarlyk, maşgala mukaddesligi we sabyr-kanagat hakynda ýazylan durmuşy hekaýalar." },
  { prefix: "Mekdep Kitaphanaçylygy: ", suffix: " (Ýaş Okyjylar Üçin)", cat: "cagalar", descExtra: "Mekdep ýaşly çagalarda kitaba söýgi döretmek, ahlak terbiýesini kämilleşdirmek üçin suratly we düşnükli dilde taýýarlanyldy." },
  { prefix: "Döwrebap Ylym: ", suffix: " (Ylmy Gollanma)", cat: "ylmy", descExtra: "Talyplar, mugallymlar we ylmy işgärler üçin nazary we amaly bilimleri özünde jemleýän döwrebap barlaglar kitaby." },
  { prefix: "Bütindünýä Bestselleri: ", suffix: " (Terjime)", cat: "dunya", descExtra: "Milli we daşary ýurt okyjylarynyň iň köp söýgüsini gazanan, dünýä dillerinden türkmen diline ussatlyk bilen terjime edilen şedewr." }
];

const extraAuthors = [
  { name: "Magtymguly Pyragy", cat: "klassyka", titles: ["Ynsan Mertebesi", "Düwünçegi Açar Bolduk", "Göwnüm Açylmaz", "Türkmeniň Pelsepesi", "Zamana Ahwaly", "Nesihatlar Dürdänesi", "Il-Günüň Bähbidi", "Söýgi we Ynam"] },
  { name: "Mollanepes", cat: "klassyka", titles: ["Näzenin Gözel", "Labyzly Goşgular", "Yşk Çemeni", "Wepaly Ýarlar", "Dutar we Söz"] },
  { name: "Kemine", cat: "klassyka", titles: ["Gülki we Paýhas", "Kemäniň Pähimleri", "Satyra Dürleri", "Ýumor we Hakykad"] },
  { name: "Andalyp", cat: "klassyka", titles: ["Baba Röwşen", "Zeýnelarap Dessany", "Halk Rowayatlary", "Gündogar Nury"] },
  { name: "Döwletmämmet Azady", cat: "klassyka", titles: ["Behiştnama", "Pähim-Paýhas Hazynasy", "Ylym we Jemgyýet", "Terbiýe Mekdebi"] },
  { name: "Berdi Kerbabaýew", cat: "roman", titles: ["Artygyň Ýoly", "Çöl Gözelleri", "Topraga Söýgi", "Garagum Çeşmesi", "Döwür Şapagy", "Zähmet Şany"] },
  { name: "Ata Gowşudow", cat: "roman", titles: ["Gajar Aganyň Maşgalasy", "Ýeňiş Ýollary", "Döwürleriň Arasynda", "Watan Çagyryşy", "Mert Ýigitler"] },
  { name: "Beki Seýtäkow", cat: "roman", titles: ["Köneürgenç Ýaňy", "Derýanyň Aňyrsynda", "Ýolagçylar", "Sähra Şamallary"] },
  { name: "Hydyr Derýaýew", cat: "roman", titles: ["Mukaddes Watan", "Durmuş Synaglary", "Adalat Tugy", "Zamana Ýörişi"] },
  { name: "Gurbannazar Ezizow", cat: "sygyryet", titles: ["Ýaz Paslynyň Sazlary", "Ömrüm Saňa Minnetdar", "Ýyldyzly Gijeler", "Dünýäniň Gözelligi", "Päk Ýürekler", "Enä Tagzym"] },
  { name: "Kerim Gurbannepesow", cat: "sygyryet", titles: ["Watan Diýen Mukaddes Söz", "Agzybirlik Aýdymlary", "Ýaşlyk Joşguny", "Ömür Ýollarym", "Dostluk Aýdymlary", "Sähra Nagmalary"] },
  { name: "Nurmyrat Saryhanow", cat: "powest", titles: ["Arzuw we Ykbal", "Ýagty Gijeler", "Dutaryň Owazy", "Ussat Bagşy", "Hekaýalar Hazynasy"] },
  { name: "Kaýum Taňrygulyýew", cat: "cagalar", titles: ["Şadyýan Oýunlar", "Akylly Çagalar", "Tomusky Dynç Alyş", "Mekdepdäki Dostlarym", "Haýwanlaryň Ertekisi", "Tebigat Syrlary"] },
  { name: "Halk Döredijiligi", cat: "cagalar", titles: ["Ýartygulagyň Syýahaty", "Gülki we Gülkiler", "Altyn Guş Ertekisi", "Göwher Täç", "Akja Kepderi", "Mert Mergen", "Böwenjik Ertekisi"] },
  { name: "Türkmenistanyň Ylymlar Akademiýasy", cat: "ylmy", titles: ["Arheologiýa we Etnografiýa", "Geologiýa we Ýer Baýlyklary", "Medisina we Saglyk", "Fizika we Täze Tehnologiýalar", "Ekologiýa we Çölleşmä Garşy Göreş", "Astronomiki Gözlegler", "Iňlisçe-Türkmençe Sözlük", "Rusça-Türkmençe Sözlük", "Logika we Filosofiýa", "Ykdysadyýet we Dolandyryş"] },
  { name: "IT we Tehnologiýa Gollanmalary", cat: "ylmy", titles: ["Kompýuter Esaslary", "Mobil Programmirläp Öwrenmek (Flutter)", "Emeli Aň we Machine Learning", "Kiberhowpsuzlyk Gollanmasy", "Web Dizaýn we UX/UI", "Algoritmler we Maglumat Gurluşlary", "DevOps we Serwer Dolandyryş"] },
  { name: "Dünýä Çeper Edebiýaty", cat: "dunya", titles: ["Graf Monte-Kristo", "Üç Muşketýor", "Garrylyk we Paýhas", "Ýaş Werteriň Görgüleri", "Don Kihot (Servantes)", "Jeýn Eýr (Ş. Bronte)", "Gülweriň Syýahaty (J. Swift)", "Robinzon Kruzo (D. Defo)", "Moby Dik (G. Melwill)", "Böwre Çapyşyk", "Drakula", "Şerlok Holms: Saýlanan Wakalar", "Puşkin: Saýlanan Goşgular", "Nawai: Hamsa Eserleri"] },
  { name: "Biznes we Şahsy Ösüş", cat: "dunya", titles: ["Liderlik Sungaty", "Maliýe Erkinligine Ýol", "Netijeli Aragatnaşyk", "Wagty Dolandyrmak", "Üstünligiň 7 Düzgüni", "Pikirlen we Baýlaş (Napoleon Hill)", "Psihologiýanyň Güýji", "Stressi Ýeňip Geçmek", "Telekeçilik Başlangyçlary", "Döredijilik Pikirleri"] }
];

while (allBooks.length < 215) {
  for (const group of extraAuthors) {
    if (allBooks.length >= 215) break;
    const cat = group.cat;
    const gradList = gradientsByCategory[cat] || gradientsByCategory.klassyka;
    const theme = seriesThemes.find(s => s.cat === cat) || seriesThemes[0];
    
    for (const title of group.titles) {
      if (allBooks.length >= 215) break;
      const pages = randomInt(160, 720);
      const year = randomInt(2019, 2026);
      const price = parseFloat((randomInt(28, 98) + (Math.random() > 0.5 ? 0.5 : 0)).toFixed(2));
      const oldPrice = Math.random() > 0.45 ? parseFloat((price + randomInt(12, 30)).toFixed(2)) : null;
      const numReviews = randomInt(2, 4);
      const reviews = [];
      for (let r = 0; r < numReviews; r++) {
        reviews.push({
          user: randomChoice(reviewerNames),
          rating: randomChoice([4, 5, 5]),
          comment: randomChoice(reviewComments),
          date: `2026-${String(randomInt(6, 11)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`
        });
      }

      allBooks.push({
        id: `book-${idCounter++}`,
        title: `${title}`,
        author: group.name,
        category: cat,
        price,
        oldPrice,
        rating: 4.7 + Math.round(Math.random() * 3) / 10,
        reviewsCount: reviews.length + randomInt(6, 30),
        pages,
        year,
        language: cat === 'dunya' ? 'Türkmençe (Terjime)' : 'Türkmençe',
        stock: randomInt(10, 50),
        badge: randomChoice(badges),
        gradient: randomChoice(gradList),
        description: `${title} eseri — ${group.name} tarapyndan döredilen çuňňur many-mazmunly gymmatly kitap. ${theme.descExtra} Kitap okyjylara belent ahlak gymmatlyklaryny, durmuş tejribesini we giň dünýägaraýşy peşgeş berýär.`,
        reviews
      });
    }
  }
}

// Write to books.json
fs.writeFileSync(booksPath, JSON.stringify(allBooks, null, 2), 'utf-8');
console.log(`Successfully generated and saved ${allBooks.length} books to ${booksPath}`);

