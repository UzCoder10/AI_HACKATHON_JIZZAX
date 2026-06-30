import 'package:flutter/material.dart';

class Scholar {
  final String id;
  final String name;
  final String years;
  final String field;
  final Color solidColor;
  final Color pastelColor;
  final String initials;
  final IconData iconData;
  final String introText;
  final List<String> suggestedQuestions;
  final List<String> fallbackResponses;

  // History detail fields for Encyclopedia
  final String historyLocation;
  final String mapLabel;
  final List<String> keyDiscoveries;
  final String famousQuote;

  const Scholar({
    required this.id,
    required this.name,
    required this.years,
    required this.field,
    required this.solidColor,
    required this.pastelColor,
    required this.initials,
    required this.iconData,
    required this.introText,
    required this.suggestedQuestions,
    required this.fallbackResponses,
    required this.historyLocation,
    required this.mapLabel,
    required this.keyDiscoveries,
    required this.famousQuote,
  });
}

class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final bool isDrawing;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isDrawing = false,
  });
}

class Quest {
  final String id;
  final String title;
  final String description;
  final int rewardStars;
  bool isCompleted;
  final IconData iconData;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.rewardStars,
    this.isCompleted = false,
    required this.iconData,
  });
}

enum MoodType { happy, neutral, sad }

class MoodLog {
  final DateTime date;
  final MoodType mood;
  
  MoodLog({required this.date, required this.mood});

  IconData get iconData {
    switch (mood) {
      case MoodType.happy:
        return Icons.sentiment_very_satisfied_rounded;
      case MoodType.neutral:
        return Icons.sentiment_neutral_rounded;
      case MoodType.sad:
        return Icons.sentiment_very_dissatisfied_rounded;
    }
  }

  String get label {
    switch (mood) {
      case MoodType.happy:
        return "Xursand";
      case MoodType.neutral:
        return "Oddiy";
      case MoodType.sad:
        return "Xafa";
    }
  }
}

// Hardcoded scholars list with Sunny Pop UI accent colors (Marine Blue, Mandarin Orange, Apple Red, Mint Green, Sunny Yellow)
final List<Scholar> scholarsList = [
  const Scholar(
    id: "ulugbek",
    name: "Mirzo Ulug‘bek",
    years: "1394 – 1449",
    field: "Astronomiya va Matematika",
    solidColor: Color(0xFF00A8E8), // Marine Blue
    pastelColor: Color(0xFFE5F6FD),
    initials: "MU",
    iconData: Icons.nights_stay_rounded,
    introText: "Salom, yosh astronom! Men koinot sirlarini, yulduzlar harakatini va matematik qonuniyatlarni o‘rganganman. Menga koinot yoki yulduzlar haqida savol berishingiz mumkin!",
    suggestedQuestions: [
      "Yulduzlar qanday paydo bo‘lgan?",
      "Observatoriyangizda nimalarni kashf etgansiz?",
      "Yulduzlar jadvali (Zij) nima?",
      "Qanday qilib matematik bo‘lish mumkin?",
    ],
    fallbackResponses: [
      "Yulduzlar — koinotdagi ulkan va qizigan gaz sharlaridir. Ular koinot changi va gazlarining o‘zaro tortishish kuchi ta‘sirida siqilishidan paydo bo‘ladi. Xuddi kichkina uchqun alanga olganidek, ular uzoq yillar davomida nur sochib turadi.",
      "Samarqanddagi observatoriyamda o‘sha davrdagi eng katta sekstant asbobini qurdirganman. U yordamida yulduzlar va sayyoralarning harakatini aniq o‘rgandik. Bir yilning davomiyligi 365 kun, 6 soat, 10 daqiqa va 8 soniyadan iborat ekanini hisoblab chiqdik.",
      "Bizning eng mashhur asarimiz \"Ziji Jadidi Ko‘ragoniy\" (Yulduzlar jadvali) deb ataladi. Unda 1018 ta yulduzning osmondagi o‘rni va harakati juda aniq tasvirlangan. Bu jadval butun dunyoda yuzlab yillar davomida astronomlar uchun eng asosiy qo‘llanma bo‘lib xizmat qildi.",
      "Matematik bo‘lish uchun avvalo atrofingizdagi dunyoga qiziqishingiz, tabiat qonuniyatlarini kuzatishingiz kerak. Matematika bu — koinot tili! Har bir narsaning o‘z hisob-kitobi bor. Ko‘proq mantiqiy o‘yinlar o‘ynang va savol berishdan to‘xtamang!"
    ],
    historyLocation: "Samarqand observatoriyasi",
    mapLabel: "Samarqand, O‘zbekiston",
    keyDiscoveries: [
      "1018 ta yulduzning aniq koordinata jadvali.",
      "Quyosh yili uzunligini 365 kun, 6 soat, 10 daqiqagacha hisobladi.",
      "O‘rta asrlarning eng ulkan 40 metrlik sekstantini qurdirdi."
    ],
    famousQuote: "Koinotni o‘rganish aqlni komil qiladi va haqiqat eshiklarini ochadi.",
  ),
  const Scholar(
    id: "beruniy",
    name: "Abu Rayhon Beruniy",
    years: "973 – 1048",
    field: "Geografiya va Qomusiy Ilm",
    solidColor: Color(0xFFFFB627), // Sunny Yellow
    pastelColor: Color(0xFFFFF6E5),
    initials: "AB",
    iconData: Icons.public_rounded,
    introText: "Salom! Men dunyo kezib, geografiya, tabiat va Yerning shaklini o‘rganganman. Yer sayyorasi, qit‘alar va turli xalqlar haqida nimalarni bilishni istaysiz?",
    suggestedQuestions: [
      "Yerning shakli va hajmini qanday o‘lchagansiz?",
      "Hindistonga safaringiz haqida gapirib bering.",
      "Qanday qilib yangi qit‘ani (Amerikani) bashorat qilgansiz?",
      "Tabiat va minerallar haqida nimalarni bilasiz?",
    ],
    fallbackResponses: [
      "Men Yerning shaklini va radiusini aniqlash uchun oddiy va aqlli usuldan foydalandim. Baland tog‘ ustiga chiqib, ufq burchagini o‘lchadim va trigonometriya qoidalari yordamida Yer radiusini hisoblab chiqdim. Mening o‘lchovim bugungi sun‘iy yo‘ldoshlar hisoblaganidan atigi bir necha kilometrga farq qiladi, xolos!",
      "Hindistonga qilgan safarim davomida men u yerdagi xalqning tili (sanskrit), madaniyati, urf-odatlari va ilmini o‘rgandim. \"Hindiston\" nomli katta kitob yozdim. Turli madaniyatlarni o‘rganish insonga keng dunyoqarash beradi.",
      "Men Yer sharining bir tomonida quruqliklar bo‘lsa, ikkinchi tomonida ham muvozanatni saqlash uchun ulkan quruqlik (qit‘a) bo‘lishi kerakligini matematik hisoblab chiqqanman. Yevropa va Osiyoning narigi tomonidagi okean ortida quruqlik borligini bashorat qilgan edim.",
      "Tabiatdagi barcha narsa bir-biri bilan bog‘liq. Men mineral va toshlarning og‘irligini, tuzilishini o‘rganib, ularning katalogini yaratganman. Har bir tosh va o‘simlikning tabiatda o‘z vazifasi bor."
    ],
    historyLocation: "Xorazm Ma‘mun akademiyasi",
    mapLabel: "Xiva/Kat, O‘zbekiston",
    keyDiscoveries: [
      "Yer radiusini o‘lchashning original trigonometrik metodini yaratdi.",
      "Yarim sharning narigi tomonida quruqliklar (Amerika) borligini isbotladi.",
      "Qimmatbaho toshlar va metallarning solishtirma og‘irligini aniqladi."
    ],
    famousQuote: "Ilm kashf qilish yo‘lidagi zahmat — eng totli hissiyotdir.",
  ),
  const Scholar(
    id: "ibnsino",
    name: "Ibn Sino",
    years: "980 – 1037",
    field: "Tibbiyot va Falsafa",
    solidColor: Color(0xFF06D6A0), // Fresh Mint Green
    pastelColor: Color(0xFFE6FAF4),
    initials: "IS",
    iconData: Icons.favorite_rounded,
    introText: "Salom, kichik do‘stim! Men tabibman. Odamlar tanasining qanday ishlashi, sog‘lom bo‘lish sirlari va dorivor giyohlar haqida suhbatlashamiz.",
    suggestedQuestions: [
      "Qanday qilib sog‘lom bo‘lish mumkin?",
      "Siz yozgan eng mashhur kitob qaysi?",
      "Kasalliklar qanday tarqaladi?",
      "Miyaning ishlashi va his-tuyg‘ular haqida nima deysiz?",
    ],
    fallbackResponses: [
      "Sog‘lom bo‘lish uchun to‘g‘ri ovqatlanish, toza havoda harakat qilish va yaxshi uxlash kerak. \"Sog‘lik — bu tananing muvozanatidir\", degan edim. Jismoniy tarbiya bilan shug‘ullanish va keraksiz xavotirlardan uzoq bo‘lish tanangizni har qanday kasallikdan himoya qiladi.",
      "Mening eng mashhur kitobim \"Al-Qonun fit-tibb\" (Tibbiyot qonunlari) deb ataladi. Bu kitobda o‘sha davrdagi barcha tibbiy bilimlar, dorilar va davolash usullari jamlangan. U Yevropada yuzlab yillar davomida shifokorlar tayyorlash uchun darslik bo‘ldi.",
      "Men kasalliklar ko‘zga ko‘rinmas juda kichik tirik zarrachalar (mikroblar) orqali havodan yoki suvdan o‘tishini yozganman. Shuning hospice hamisha qo‘llarni toza yuvish, toza suv ichish va gigiyenaga rioya qilish juda muhimdir.",
      "Insonning ruhiy holati va jismoniy sog‘ligi bir-biri bilan chambarchas bog‘liq. Xavotir, qo'rquv va qayg‘u tanani zaiflashtiradi. Quvnoq va xotirjam bo‘lish esa tezroq tuzalishga yordam beradi. His-tuyg‘ularingizni boshqarishni o‘rganing."
    ],
    historyLocation: "Buxoro shifoxonasi",
    mapLabel: "Buxoro, O‘zbekiston",
    keyDiscoveries: [
      "Giyohlar va dorilardan foydalanishning mukammal qonuniyatlarini tuzdi.",
      "Kasalliklarning yuqumlilik tabiati va karantin usullarini taklif qildi.",
      "Miyaning ruhiy emotsional holat bilan bog‘liqligini isbotladi."
    ],
    famousQuote: "Sog‘liqni saqlashning asosi jismoniy harakat va toza havodir.",
  ),
  const Scholar(
    id: "xorazmiy",
    name: "Al-Xorazmiy",
    years: "780 – 850",
    field: "Matematika va Algebra",
    solidColor: Color(0xFFFF6B35), // Mandarin Orange
    pastelColor: Color(0xFFFFECE5),
    initials: "AX",
    iconData: Icons.grid_view_rounded,
    introText: "Salom, matematika ixlosmandi! Men bugungi kompyuter va telefonlarning asosi bo‘lgan \"algoritm\" hamda \"algebra\" fanlariga asos solganman. Savollaringizga tayyorman!",
    suggestedQuestions: [
      "Algoritm so‘zi qayerdan kelgan?",
      "Aljabr (Algebra) nima degani?",
      "Nol (0) raqamining qanday ahamiyati bor?",
      "Matematikadan hayotda qanday foydalanamiz?",
    ],
    fallbackResponses: [
      "Mening ismim \"Al-Xorazmiy\" bo‘lib, arab tilidagi asarlarim lotinchaga tarjima qilinganda \"Algoritmi\" deb yozilgan. Keyinchalik bu so‘z har qanday ketma-ketlik va qoidalarni bajarish tartibini anglatuvchi \"Algoritm\" atamasiga aylandi.",
      "\"Al-jabr\" so‘zi mening \"Al-Kitab al-muxtasar fi hisab al-jabr va‘l-muqabala\" kitobimdan olingan bo‘lib, \"tenglashtirish\" yoki \"qayta tiklash\" degan ma‘noni bildiradi. U tenglamalarni yechish usulidir.",
      "Nol (0) soni matematikada inqilob qildi! Biz hind arifmetikasini o‘rganib, nol yordamida o‘nlik sanoq tizimini mukammallashtirdik. Nol bo‘shliqni bildiradi, lekin boshqa sonlar yoniga qo‘yilganda ularning qiymatini 10 barobarga oshiradi.",
      "Matematika faqat sinfdagi misollar emas, u kunda-kunora hayotimizda bor. Do‘kondan xarid qilish, uyni loyihalash, vaqtni rejalashtirish va hattoki o‘yinlar yaratish ham matematikaga tayanadi. Matematikani o‘rganish miyani charxlaydi."
    ],
    historyLocation: "Dorul-hikma akademiyasi",
    mapLabel: "Xorazm / Bag‘dod",
    keyDiscoveries: [
      "Algebra faniga asos soldi va birinchi tenglama yechish usullarini berdi.",
      "Dunyoga o‘nlik sanoq sistemasini va Nol (0) raqamini yoydi.",
      "Komputer ilmining asosi bo‘lgan Algoritm qoidalarini kashf etdi."
    ],
    famousQuote: "Matematika — tafakkurning eng go‘zal va yorqin ifodasidir.",
  ),
  const Scholar(
    id: "buxoriy",
    name: "Imom al-Buxoriy",
    years: "810 – 870",
    field: "Hadisshunoslik va Odob",
    solidColor: Color(0xFFFFB627), // Sunny Yellow
    pastelColor: Color(0xFFFFF6E5),
    initials: "IB",
    iconData: Icons.menu_book_rounded,
    introText: "Salom, aziz bolajon. Men ezgulik, halollik va odob-axloq haqidagi Payg‘ambarimiz (s.a.v.) hadislarini to‘plaganman. Savob, yaxshilik va ota-onaga hurmat haqida suhbatlashamiz.",
    suggestedQuestions: [
      "Hadis nima va ularni qanday to‘plagansiz?",
      "\"Sahihi Buxoriy\" kitobi haqida so‘zlab bering.",
      "Ilm olishning qanday foydalari bor?",
      "Yaxshi xulq-atvor qanday bo‘lishi kerak?",
    ],
    fallbackResponses: [
      "Hadis — Payg‘ambarimiz Muhammad (s.a.v.)ning aytgan so‘zlari, qilgan ishlari va ko‘rsatmalari. Men ularni to‘plash uchun butun islom olamini kezip chiqdim. Har bir eshitgan hadisni yozishdan oldin, uni aytgan kishining to‘g‘ri so‘zligini tekshirdim.",
      "Mening eng katta asarim \"Al-Jome‘ as-sahih\" (Sahihi Buxoriy) deb ataladi. Unda eng ishonchli (sahih) deb topilgan 7275 ta hadis jamlangan. Bu kitob Qur‘ondan keyingi eng ishonchli manba hisoblanadi.",
      "Ilm olish — har bir inson uchun eng go‘zal va oliy vazifadir. \"Ilmdan boshqa najot yo‘q va bo‘lmaydi ham\", degan hikmat bor. Ilmli inson qorong‘ulikdagi chiroq kabidir. O‘rgangan bilimlaringiz jamiyatga foyda keltirishi kerak.",
      "Yaxshi xulq — insonning eng katta ziynatidir. Kattalarga hurmatda, kichiklarga shafqatda bo‘lish, hamisha to‘g‘ri so‘zlash, va‘daga vafo qilish va boshqalarga yomonlik tilamaslik chinakam go‘zal xulqdir."
    ],
    historyLocation: "Buxoro / Hartang",
    mapLabel: "Buxoro / Hartang, O‘zbekiston",
    keyDiscoveries: [
      "Roviylar biografiyasini o‘rganuvchi \"ilm-al-rijol\" ilmini rivojlantirdi.",
      "600 mikdan ortiq hadis orasidan eng sahih hadislarni saraladi.",
      "\"Sahihi Buxoriy\" - Islom olamidagi ikkinchi eng ishonchli manbaga asos soldi."
    ],
    famousQuote: "Ilmdan boshqa najot yo‘q va bo‘lmaydi ham.",
  ),
  const Scholar(
    id: "temur",
    name: "Amir Temur",
    years: "1336 – 1405",
    field: "Davlat boshqaruvi va Nizom",
    solidColor: Color(0xFFEF476F), // Apple Red
    pastelColor: Color(0xFFFCEAEF),
    initials: "AT",
    iconData: Icons.shield_rounded,
    introText: "Salom, vatanparvar farzand! Men ulug‘ saltanat qurganman. Men bilan davlat boshqaruvi, rejalashtirish, jasorat va adolat qoidalari haqida suhbatlashamiz.",
    suggestedQuestions: [
      "Saltanatni qanday boshqargansiz?",
      "\"Temur tuzuklari\" asari nima haqida?",
      "\"Kuch adolatdadir\" iborasini qanday tushunasiz?",
      "Bunyodkorlik ishlaringiz haqida gapiring.",
    ],
    fallbackResponses: [
      "Men ulkan saltanatni kuchli intizom, maslahat (kengash) va adolat qonunlari bilan boshqardim. Har bir ishni reja asosida qildim, aqlli va bilimdon vazirlar bilan kengashib qaror qabul qildim.",
      "\"Temur tuzuklari\" — mening davlat boshqarishdagi qoidalarim, harbiy san‘atim va shaxsiy o‘gitlarim to‘plamidir. Unda adolatli bo‘lish, qo‘l ostingdagilarga g‘amxo‘rlik qilish va har bir ishni reja bilan bajarish haqida yozilgan.",
      "Mening eng muhim shiorim — \"Kuch adolatdadir\". Bu degani, har qanday kuch va hokimiyat adolatga tayanmog‘i lozim. Adolatsiz kuch zulmdir, adolatli kuch esa tinchlik va taraqqiyot garovidir.",
      "Men Samarqand va boshqa shaharlarni dunyoning eng go‘zal maskanlariga aylantirishni istadim. Bibixonim masjidi, Go‘ri Amir maqbarasi, Oqsaroy kabi muhtasham binolar qurdirdim."
    ],
    historyLocation: "Samarqand Ko‘ksaroyi",
    mapLabel: "Samarqand / Shahrisabz, O‘zbekiston",
    keyDiscoveries: [
      "Markaziy Osiyoni birlashtirib buyuk qudratli davlat barpo etdi.",
      "Konstitutsion mohiyatdagi \"Temur tuzuklari\" boshqaruv qonunini yaratdi.",
      "Buyuk Ipak yo‘li xavfsizligini ta‘minlab, savdo tizimini rivojlantirdi."
    ],
    famousQuote: "Adolat bilan mamlakat barbod bo‘lishdan najot topadi.",
  ),
];
