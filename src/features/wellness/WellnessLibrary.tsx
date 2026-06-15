import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Sparkles, Flame, Moon, ArrowRight, Heart} from 'lucide-react';
import { translations } from '../../locales/translations';

interface WellnessLibraryProps {
  language: 'en' | 'hi' | 'bn';
}

interface ArticleContent {
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  tips?: string[];
  asana?: string;
}

interface Article {
  id: string;
  category: 'basics' | 'conditions' | 'ayurveda' | 'faq';
  translations: {
    en: ArticleContent;
    hi: ArticleContent;
    bn: ArticleContent;
  };
}

export default function WellnessLibrary({ language }: WellnessLibraryProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'conditions' | 'ayurveda' | 'faq'>('all');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const t = translations[language];

  // Category labels and UI text mapping
  const categoryLabels = {
    en: {
      all: 'All Wisdom',
      basics: 'Cycle Biology',
      conditions: 'Conditions Guide',
      ayurveda: 'Ayurvedic Doshas',
      faq: 'Health FAQ',
      searchPlaceholder: 'Search keywords (e.g. Vata, PCOS, Sleep)...',
      noArticles: 'No matching wellness articles found in this query. Change keywords or clear search filter.',
      readerHeader: 'Holistic Wellness Reader',
      closeBtn: 'Close',
      guidanceTips: 'Practical Wellness Guidance Tips',
      recommendedAsana: 'Recommended Restorative Asana',
    },
    hi: {
      all: 'पूर्ण ज्ञान',
      basics: 'मासिक चक्र विज्ञान',
      conditions: 'स्वास्थ्य स्थितियां',
      ayurveda: 'आयुर्वेदिक दोष',
      faq: 'स्वास्थ्य प्रश्न उत्तर',
      searchPlaceholder: 'कीवर्ड खोजें (उदा: वात, पीसीओएस, नींद)...',
      noArticles: 'इस खोज के लिए कोई स्वास्थ्य लेख नहीं मिले। कीवर्ड्स बदलें या खोज साफ़ करें।',
      readerHeader: 'समग्र कल्याण वाचक',
      closeBtn: 'बंद करें',
      guidanceTips: 'व्यावहारिक स्वास्थ्य निर्देश और सुझाव',
      recommendedAsana: 'अनुशंसित योगासन',
    },
    bn: {
      all: 'সব জ্ঞান',
      basics: 'মাসিক চক্র বিজ্ঞান',
      conditions: 'শারীরিক অবস্থা গাইড',
      ayurveda: 'আয়ুর্বেদিক লাইব্রেরী',
      faq: 'স্বাস্থ্য প্রশ্নোত্তর',
      searchPlaceholder: 'সহজ শব্দে খুঁজুন (যেমন: Vata, PCOS, ঘুম)...',
      noArticles: 'খোঁজা শব্দের সাথে মেলে এমন কোনো স্বাস্থ্য নিবন্ধ পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।',
      readerHeader: 'সমগ্র ঋতু কল্যাণ পাঠক',
      closeBtn: 'বন্ধ করুন',
      guidanceTips: 'ব্যবহারিক স্বাস্থ্য নির্দেশাবলী',
      recommendedAsana: 'প্রস্তাবিত ক্ষতিকারক প্রশমনকারী যোগব্যায়াম',
    }
  }[language] || {
    all: 'All Wisdom',
    basics: 'Cycle Biology',
    conditions: 'Conditions Guide',
    ayurveda: 'Ayurvedic Doshas',
    faq: 'Health FAQ',
    searchPlaceholder: 'Search keywords (e.g. Vata, PCOS, Sleep)...',
    noArticles: 'No matching wellness articles found in this query. Change keywords or clear search filter.',
    readerHeader: 'Holistic Wellness Reader',
    closeBtn: 'Close',
    guidanceTips: 'Practical Wellness Guidance Tips',
    recommendedAsana: 'Recommended Restorative Asana',
  };

  // Rich offline-article library conforming to "Ancient Indian Wisdom, Modern Medical Science"
  const articles: Article[] = [
    {
      id: 'cycle_basics_overview',
      category: 'basics',
      translations: {
        en: {
          title: 'Menstrual Cycle Basics & Lunar Rhythms',
          subtitle: 'Understanding the biological sync of your monthly phases.',
          content: 'The menstrual cycle is a fluid feedback loop between your ovaries, pituitary gland, and hypothalamus. The average cycle spans 28 days, divided into four key stages: Menstruation (Days 1-5), Follicular (Days 6-13), Ovulation (Day 14), and the Luteal phase (Days 15-28). Aligning with these phases allows you to adjust dietary needs, work stress, and energy output smoothly.',
          tags: ['Physiology', 'Beginner', 'Cycle Basics'],
          tips: [
            'Track flow color to log oxygenation stages.',
            'Vary exercise intensities relative to follicular estrogen peaks.',
            'Embrace rest on heavy bleeding days to coordinate cellular recovery.'
          ],
          asana: 'Baddha Konasana (Bound Angle Butterfly Posture) for pelvic blood circulation.'
        },
        hi: {
          title: 'मासिक धर्म चक्र की बुनियादी बातें और चंद्र लय',
          subtitle: 'अपने मासिक चरणों के जैविक संकायों को समझना।',
          content: 'मासिक धर्म चक्र आपके अंडाशय, पीयूष ग्रंथि (pituitary gland) और हाइपोथैलेमस के बीच एक तरल फीडबैक लूप है। औसत चक्र 28 दिनों का होता है, जिसे चार प्रमुख चरणों में विभाजित किया गया है: मासिक धर्म (दिन 1-5), फॉलिकुलर (दिन 6-13), ओव्यूलेशन (दिन 14), और ल्यूटियल चरण (दिन 15-28)। इन चरणों के साथ तालमेल बिठाने से आप अपने आहार, काम के तनाव और ऊर्जा के स्तर को आसानी से संतुलित कर सकते हैं।',
          tags: ['शारीरिक विज्ञान', 'शुरुआती', 'चक्र मूल बातें'],
          tips: [
            'ऑक्सीजनेशन के स्तर को ट्रैक करने के लिए बहाव के रंग पर नज़र रखें।',
            'फॉलिकुलर एस्ट्रोजन पीक के अनुसार व्यायाम की तीव्रता बदलें।',
            'कोशिकीय सुधार के लिए भारी बहाव वाले दिनों में आराम करें।'
          ],
          asana: 'पेल्विक रक्त परिसंचरण के लिए बद्ध कोणासन (तितली आसन)।'
        },
        bn: {
          title: 'মাসিক চক্রের প্রাথমিক তথ্য ও চন্দ্র ছন্দ',
          subtitle: 'আপনার মাসিক পর্যায়ের জৈবিক তালকে বুঝতে পারা।',
          content: 'মাসিক চক্র বা পিরিয়ড সাইকেল হলো ডিম্বাশয়, পিটুইটারি গ্রন্থি এবং হাইপোথ্যালামাসের মধ্যে একটি পারস্পরিক সংকেত আদানপ্রদান। গড় চক্র বা সাইকেল সাধারণত ২৮ দিন স্থায়ী হয়, যা চারটি মূল ধাপে বিভক্ত: ঋতুস্রাব পর্যায় (১-৫ দিন), ফলিকুলার পর্যায় (৬-১৩ দিন), ওভিউলেশন বা ডিম্বস্ফোটন দিন (১৪ ম দিন) এবং লুটিয়াল পর্যায় (১৫-২৮ দিন)। এই পর্যায়গুলির সাথে সামঞ্জস্য রেখে ডায়েট পরিবর্তন ও মানসিক চাপ নিয়ন্ত্রণ করা সহজ হয়।',
          tags: ['শারীরবৃত্ত', 'নতুন', 'মাসিক চক্রের তথ্য'],
          tips: [
            'রক্তের বর্ণ ট্র্যাক করার মাধ্যমে অক্সিজেনের মাত্রা যাচাই করুন।',
            'ফলিকুলার পর্যায়ে এনার্জি বৃদ্ধির সাথে কসরতের মাত্রা বাড়ান।',
            'ভারীস্রাবের দিনগুলিতে পর্যাপ্ত বিশ্রাম নিন যাতে শরীর পুনরুজ্জীবিত হয়।'
          ],
          asana: 'শ্রোণিদেশের রক্ত সঞ্চালন বাড়াতে বদ্ধ কোণাসন (প্রজাপতি আসন)।'
        }
      }
    },
    {
      id: 'ovulation_fertility_window',
      category: 'basics',
      translations: {
        en: {
          title: 'The Magic of Ovulation & Hormones',
          subtitle: 'Estrogen spikes, LH surges, and tracking your highest fertility.',
          content: 'Ovulation represents the release of a mature follicle. Triggered by a surge in Luteinizing Hormone (LH), your body experiences peak levels of Estrogen and Testosterone. This hormone synchronization elevates libido, brain cognitive speed, skin glow, and social confidence. The fertile window consists of the 5 days preceding ovulation, plus the day of ovulation itself.',
          tags: ['Ovulation', 'Fertility', 'Estrogen'],
          tips: [
            'Identify cervical mucus changes—resembling thin egg whites during highest peak.',
            'Harness high-energy levels for intense cardiovascular runs or public speaking tasks.'
          ],
          asana: 'Vrikshasana (Tree Pose) representing fertile balance.'
        },
        hi: {
          title: 'ओव्यूलेशन और हार्मोन का जादू',
          subtitle: 'एस्ट्रोजन स्पाइक्स, एलएच सर्ज और अपनी उच्चतम प्रजनन क्षमता को ट्रैक करना।',
          content: 'ओव्यूलेशन एक परिपक्व कूप (follicle) की रिहाई का प्रतिनिधित्व करता है। ल्यूटिनाइजिंग हार्मोन (LH) में उछाल से प्रेरित, आपका शरीर एस्ट्रोजन और टेस्टोस्टेरोन के उच्च स्तर का अनुभव करता है। यह हार्मोन तालमेल कामेच्छा, मस्तिष्क की संज्ञानात्मक गति, त्वचा की चमक और सामाजिक आत्मविश्वास को बढ़ाता है। फर्टाइल विंडो ओव्यूलेशन से पहले के 5 दिनों और ओव्यूलेशन के दिन से मिलकर बनी होती है।',
          tags: ['ओव्यूलेशन', 'प्रजनन क्षमता', 'एस्ट्रोजन'],
          tips: [
            'ग्रीवा बलगम (cervical mucus) के बदलावों की पहचान करें—सबसे उपजाऊ दिनों में यह कच्चे अंडे की सफेदी जैसा दिखता है।',
            'सार्वजनिक भाषण या कठिन व्यायाम के लिए उच्च ऊर्जा स्तर का लाभ उठाएं।'
          ],
          asana: 'संतुलन को प्रदर्शित करने के लिए वृक्षासन (पेड़ का ढांचा)'
        },
        bn: {
          title: 'ওভিউলেশন এবং হরমোনের ম্যাজিক',
          subtitle: 'এস্ট্রোজেন বৃদ্ধি, এলএইচ হরমোন নিঃসরণ এবং সর্বোচ্চ উর্বর সময় ট্র্যাক করা।',
          content: 'ওভিউলেশন হলো ডিম্বাশয় থেকে একটি পরিণত ডিম্বাণু নির্গত হওয়ার প্রক্রিয়া। লুটিনাইজিং হরমোনের (LH) প্রভাবে এই সময় শরীরে এস্ট্রোজেন এবং টেস্টোস্টেরনের মাত্রা শীর্ষে পৌঁছায়। এই বিশেষ হরমোন পরিবর্তনের ফলে মনের প্রফুল্লতা, ত্বকের ঔজ্জ্বল্য এবং আত্মবিশ্বাস বৃদ্ধি পায়। ওভিউলেশনের পূর্ববর্তী ৫ দিন এবং ওভিউলেশনের দিনটি মিলিয়ে উর্বর উইন্ডো গঠিত হয়।',
          tags: ['ওভিউলেশন', 'উর্বরতা', 'এস্ট্রোজেন'],
          tips: [
            'জরায়ুর নিঃসরণ পরীক্ষা করুন—উর্বর দিনে এটি পাতলা ডিমের লালার মতো পিচ্ছিল দেখায়।',
            'উচ্চ শক্তির দিনগুলিকে কাজে লাগিয়ে কায়িক পরিশ্রম ও সৃজনশীল কাজ করুন।'
          ],
          asana: 'উর্বরতার ভারসাম্য রূপায়নে বৃক্ষাসন (গাছের ন্যায় খাড়া ভঙ্গি)।'
        }
      }
    },
    {
      id: 'pms_pmdd_holistic',
      category: 'basics',
      translations: {
        en: {
          title: 'Relieving PMS & PMDD Holistically',
          subtitle: 'Nutritional and herbal guidance to calm premenstrual storms.',
          content: 'Premenstrual Syndrome (PMS) and Premenstrual Dysphoric Disorder (PMDD) arise from a sharp decline in Estrogen and Progesterone over the late luteal cycle. This depletion triggers mood fluctuations, water retention, food cravings, and insomnia. High nutrient dense foods combined with magnesium rich herbal infusions significantly soothe cramps and psychological stress.',
          tags: ['PMS', 'Mood Swings', 'Magnesium'],
          tips: [
            'Sip hot Chamomile or Roasted Fennel seed infusions to calm bloating and intestinal swelling.',
            'Optimize dark chocolate containing 70%+ organic cacao for endorphins and magnesium replenishment.',
            'Reduce refined sugars and excess sodium which trigger cellular edema.'
          ],
          asana: 'Balasana (Child Pose) to release spinal tension.'
        },
        hi: {
          title: 'पीएमएस और पीएमडीडी से समग्र राहत',
          subtitle: 'मासिक धर्म पूर्व की समस्याओं को शांत करने के लिए पोषण और हर्बल मार्गदर्शन।',
          content: 'प्रेमन्स्ट्रूअल सिंड्रोम (PMS) और प्रेमन्स्ट्रूअल डिस्फोरिक डिसऑर्डर (PMDD) ल्यूटियल चरण के अंत में एस्ट्रोजन और प्रोजेस्टेरोन की भारी कमी के कारण होते हैं। इस कमी से मनोदशा में उतार-चढ़ाव, शरीर में पानी का जमाव, मीठे की लालसा और अनिद्रा जैसी समस्याएं हो सकती हैं। उच्च पोषक तत्वों वाले भोजन और मैग्नीशियम से भरपूर हर्बल चाय के सेवन से ऐंठन और मानसिक तनाव में काफी राहत मिलती है।',
          tags: ['पीएमएस', 'मूड स्विंग्स', 'मैग्नीशियम'],
          tips: [
            'पेट फूलने और सूजन को कम करने के लिए कैमोमाइल या भुनी हुई सौंफ की चाय पिएं।',
            'एंडोर्फिन और मैग्नीशियम के लिए कम से कम 70% डार्क चॉकलेट का आनंद लें।',
            'रिफाइंड चीनी और अत्यधिक नमक से बचें जो शरीर में पानी के जमाव को बढ़ाते हैं।'
          ],
          asana: 'रीढ़ की हड्डी के तनाव को दूर करने के लिए बालासन (शिशु मुद्रा)।'
        },
        bn: {
          title: 'পিএমএস ও পিএমডিডি থেকে প্রাকৃতিক মুক্তি',
          subtitle: 'মাসিক-পূর্ব বিষণ্ণতা ও শারীরিক অস্বস্তি কাটাতে পুষ্টিকর ডায়েট এবং ভেষজ সমাধান।',
          content: 'মাসিক শুরু হওয়ার ঠিক আগে প্রজেস্টেরন ও এস্ট্রোজেন হরমোনের মাত্রা হঠাৎ কমে যাওয়ার ফলে প্রাক-মাসিক লক্ষণ (PMS) বা পিএমডিডি (PMDD) দেখা দেয়। এর জেরে মেজাজ খিটখিটে হওয়া, শরীরে জল জমা, মিষ্টি খাওয়ার তীব্র আকাঙ্ক্ষা ও অনিদ্রার মতো উপসর্গ হতে পারে। পুষ্টিকর খাদ্য গ্রহণ ও ম্যাগনেসিয়াম সমৃদ্ধ ভেষজ চা খেলে ক্র্যাম্প এবং মানসিক অবসাদ দূর হয়।',
          tags: ['পিএমএস', 'মেজাজ পরিবর্তন', 'ম্যাগনেসিয়াম'],
          tips: [
            'পেট ফাঁপা ও গ্যাস কমাতে উষ্ণ ক্যামোমাইল চা বা মৌরি দানার জল পান করুন।',
            'শরীরে এন্ডোরফিন ও ম্যাগনেসিয়ামের মাত্রা ঠিক রাখতে ৭০% ডার্ক চকলেট খেতে পারেন।',
            'অতিরিক্ত সাদা নুন ও চিনি খাওয়া এড়িয়ে চলুন যা ফোলাভাব বাড়ায়।'
          ],
          asana: 'মেরুদণ্ডের ক্লান্তি অপনোদনে বালাসন (শিশু ভঙ্গি)।'
        }
      }
    },
    {
      id: 'pcos_insulin_recovery',
      category: 'conditions',
      translations: {
        en: {
          title: 'Managing PCOS & Hormonal Balance',
          subtitle: 'Polycystic Ovary Syndrome science, cycles, and insulin sync.',
          content: 'PCOS is a complex metabolic-hormonal condition marked by insulin resistance, elevated androgen factors, and irregular ovulations. It can present as elongated tracking cycles, stubborn acne, or sudden hair thinning. Modern clinical guidelines emphasize balancing blood sugar levels through protein-rich food structures, steady sleep hygiene, and specialized strength resistance training.',
          tags: ['PCOS', 'Insulin', 'Acne'],
          tips: [
            'Prioritize complex fiber (seeds, legumes, oats) before carbohydrates to minimize insulin spikes.',
            'Integrate Cinnamon tea inside morning routines for insulin receptor sensitivity.',
            'Engage in low-impact steady resistance weights in the follicular phase.'
          ],
          asana: 'Dhanurasana (Bow Pose) to stimulate pelvic nodes and thyroid meridians.'
        },
        hi: {
          title: 'पीसीओएस प्रबंधन और हार्मोनल संतुलन',
          subtitle: 'पॉलीसिस्टिक ओवरी सिंड्रोम विज्ञान, चक्र और इंसुलिन संतुलन।',
          content: 'पीसीओएस (PCOS) एक जटिल चयापचय-हार्मोनल स्थिति है जो इंसुलिन प्रतिरोध, बढ़े हुए एण्ड्रोजन कारक और अनियमित ओव्यूलेशन द्वारा चिह्नित होती है। यह लंबे चक्र, मुंहासे या बालों के झड़ने के रूप में सामने आ सकती है। नैदानिक दिशानिर्देश प्रोटीन युक्त प्रोटीन संरचनाओं, स्थिर नींद की स्वच्छता और शक्ति प्रशिक्षण के माध्यम से रक्त शर्करा के स्तर को संतुलित करने पर जोर देते हैं।',
          tags: ['पीसीओएस', 'इंसुलिन', 'मुँहासे'],
          tips: [
            'इंसुलिन स्पाइक को कम करने के लिए कार्बोहाइड्रेट से पहले जटिल फाइबर (बीज, फलियां, जई) लें।',
            'सुबह की दिनचर्या में इंसुलिन संवेदनशीलता के लिए दालचीनी की चाय को शामिल करें।',
            'फॉलिकुलर चरण में कम प्रभाव वाले शक्ति प्रशिक्षण का अभ्यास करें।'
          ],
          asana: 'पेल्विक नोड्स और थायरॉयड को उत्तेजित करने के लिए धनुरासन (धनुष मुद्रा)।'
        },
        bn: {
          title: 'পিসিওএস নিয়ন্ত্রণ ও হরমোনের সমতা',
          subtitle: 'পলিসিস্টিক ওভারি সিন্ড্রোম বিজ্ঞান, জটিল স্বাস্থ্য সমস্যা ও ইনসুলিনের সমন্বয়।',
          content: 'পিসিওএস (PCOS) হলো হরমোনজনিত একটি বিপাকীয় সমস্যা যা ইনসুলিন রেজিস্ট্যান্স, পুরুষ হরমোনের আধিক্য এবং অনিয়মিত ডিম্বস্ফোটনের কারণ হতে পারে। এর ফলে পিরিয়ড বেশি দেরিতে হওয়া, মুখে ব্রণ বা চুল পড়ে যাওয়ার মতো লক্ষণ দেখা যায়। পর্যাপ্ত প্রোটিন গ্রহণ, নিয়মিত ঘুমের অভ্যাস এবং হাল্কা ব্যায়ামের মাধ্যমে রক্তে শর্করার মাত্রা ও ইনসুলিন নিয়ন্ত্রণ সম্ভব।',
          tags: ['পিসিওএস', 'ইনসুলিন', 'ব্রণ'],
          tips: [
            'রক্তে ইনসুলিনের আকস্মিক বৃদ্ধি রুখতে খাবারের শুরুতে ফাইবার ও বীজ জাতীয় খাদ্য খান।',
            'ইনসুলিন গ্রহণে সাহায্য করার জন্য সকালে দারুচিনির চা পান করুন।',
            'ফলিকুলার পর্যায়ে হাল্কা ওয়েট ট্রেইনিং করা শরীরের পক্ষে ভালো।'
          ],
          asana: 'শ্রোণিদেশ ও থাইরয়েড গ্রন্থিকে উদ্দীপিত করতে ধনুরাসন (ধনু ভঙ্গি)।'
        }
      }
    },
    {
      id: 'endometriosis_inflam_soothe',
      category: 'conditions',
      translations: {
        en: {
          title: 'Endometriosis Recovery & Anti-inflammatory Living',
          subtitle: 'Soothe deep chronic pelvic pain through cellular guidelines.',
          content: 'Endometriosis occurs when cells similar to the inner uterine lining (endometrium) migrate outside the womb. This causes intense scarring, adhesions, and severe menstrual cramp pain. Recovery centers heavily on a dairy-free, gluten-reduced anti-inflammatory diet that reduces prostaglandin compound triggers.',
          tags: ['Endometriosis', 'Pain', 'Inflammation'],
          tips: [
            'Incorporate Curcumin (Turmeric active node) and high quality Omega-3 ginger extracts.',
            'Apply castor oil heat packs over pelvic areas 3 days before expected menstruation start.',
            'Eliminate ultra-processed seed oils like canola or vegetable blends.'
          ],
          asana: 'Supta Baddha Konasana (Reclining Butterfly with supportive pillows).'
        },
        hi: {
          title: 'एंडोमेट्रियोसिस सुधार और एंटी-इंफ्लेमेटरी जीवन शैली',
          subtitle: 'कोशिकीय दिशानिर्देशों के माध्यम से पुराने पेल्विक दर्द को शांत करें।',
          content: 'एंडोमेट्रियोसिस तब होता है जब गर्भाशय के अंदर की परत (एंडोमेट्रियम) जैसी कोशिकाएं गर्भाशय के बाहर बढ़ने लगती हैं। इसके कारण गंभीर दर्द, जमाव और ऐंठन होती है। इससे सुधार के लिए डेयरी-मुक्त और ग्लूटेन-मुक्त एंटी-इंफ्लेमेटरी आहार को प्राथमिकता दी जाती है जो प्रोस्टाग्लैंडीन कंपाउंड को कम करता है।',
          tags: ['एंडोमेट्रियोसिस', 'दर्द', 'सूजन'],
          tips: [
            'हल्दी का अर्क (करक्यूमिन) और ओमेगा -3 समृद्ध अदरक का रस लें।',
            'मासिक धर्म से 3 दिन पहले पेल्विक हिस्से पर कैस्टर ऑयल पैक का गर्म सेक लगाएं।',
            'कैनोला या रिफाइंड वनस्पति तेलों के सेवन से बचें।'
          ],
          asana: 'तकियों के सहारे सुप्त बद्ध कोणासन का आराम लें।'
        },
        bn: {
          title: 'অ্যান্ডোমেট্রিওসিস প্রশমন ও প্রদাহহীন জীবনধারা',
          subtitle: 'শ্রোণিদেশের তীব্র দীর্ঘস্থায়ী ব্যথা কমিয়ে ফেলার প্রাকৃতিক বৈজ্ঞানিক পদ্ধতি।',
          content: 'জরায়ুর ভেতরের টিস্যুর অনুরূপ কোষ জরায়ুর বাইরে বৃদ্ধি পেলে তাকে অ্যান্ডোমেট্রিওসিস বলা হয়। এর ফলে ভীষণ তলপেট ব্যথা ও রক্তক্ষরণ হতে পারে। দুগ্ধজাতীয় ও গ্লুটেনযুক্ত খাবার এড়িয়ে অ্যান্টি-ইনফ্লেমেটরি ডায়েট মেনে চললে এই ব্যথা উৎপাদক হরমোনের তীব্রতা হ্রাস পায়।',
          tags: ['অ্যান্ডোমেট্রিওসিস', 'ব্যথা', 'ইনফ্লামেশন'],
          tips: [
            'হলুদের কারকিউমিন উপাদান এবং ওমেগা -৩ সমৃদ্ধ আদার রস ডায়েটে রাখুন।',
            'পিরিয়ড শুরু হওয়ার দিন তিনেক আগে তলপেটে ক্যাস্টর অয়েলের সেঁক দিতে পারেন।',
            'প্রক্রিয়াজাত রিফাইন্ড তেল খাওয়া সম্পূর্ণ বর্জন করুন।'
          ],
          asana: 'উষ্ণ নরম বালিশের ঠেস দিয়ে সুপ্ত বদ্ধ কোণাসন করা সবচেয়ে সুবিধাজনক।'
        }
      }
    },
    {
      id: 'ayurveda_three_doshas',
      category: 'ayurveda',
      translations: {
        en: {
          title: 'Ayurvedic Wellness & The Three Doshas',
          subtitle: 'Vata, Pitta, and Kapha alignments during your menstrual cycles.',
          content: 'Ayurveda views the menstrual cycle as a sacred cleansing ritual governed by the three natural Doshas. 1) Menstruation is dominated by Vata (Apana Vayu), requiring warm, oily foods and heavy rest. 2) The follicular and ovulatory stages are led by Kapha, supporting metabolic stamina and creative growth. 3) The luteal stage is regulated by Pitta, which can generate hot flashes, anger, and oil spikes if unbalanced.',
          tags: ['Ayurveda', 'Dosha', 'Vata', 'Pitta'],
          tips: [
            'Vata Care: Sip comforting Ginger-Tulsi milk. Avoid dry popcorn and raw iced beverages.',
            'Pitta Care: Enjoy cool peppermint tea or fresh sweet fruits. Avoid excessive spicy chilis.',
            'Kapha Care: Incorporate bitter greens, ginger root tea, and dynamic warm-ups.'
          ],
          asana: 'Nadi Shodhana Pranayama (Alternate Nostril Breathing) to cleanse Vata elements.'
        },
        hi: {
          title: 'आयुर्वेदिक कल्याण और तीन दोष',
          subtitle: 'मासिक धर्म चक्र के दौरान वात, पित्त और कफ का संतुलन।',
          content: 'आयुर्वेद मासिक धर्म को तीन प्राकृतिक दोषों द्वारा नियंत्रित एक पवित्र सफाई अनुष्ठान मानता है। 1) मासिक धर्म पर वात (अपान वायु) का प्रभाव रहता है, इसलिए गर्म, तैलीय और मीठे खाद्य पदार्थों की आवश्यकता होती है। 2) फॉलिकुलर और ओव्यूलेशन के चरण कफ दोष के अधीन होते हैं, जो सहनशक्ति और रचनात्मकता का समर्थन करते हैं। 3) ल्यूटियल चरण पित्त दोष द्वारा नियंत्रित होता है, जो ध्यान न देने पर क्रोध और गर्मी बढ़ा सकता है।',
          tags: ['आयुर्वेद', 'दोष', 'वात', 'पित्त'],
          tips: [
            'वात की देखभाल: गर्म अदरक-तुलसी की चाय पिएं। सूखे पापड़ और ठंडे पेय से बचें।',
            'पित्त की देखभाल: पुदीने की चाय या ताजे मीठे फल खाएं। अत्यधिक मिर्च-मसालों से बचें।',
            'कफ की देखभाल: कड़वे साग, अदरक की चाय और हल्का व्यायाम करें।'
          ],
          asana: 'वात तत्वों को शुद्ध करने के लिए नाड़ी शोधन प्राणायाम (वैकल्पिक नासिका श्वसन)।'
        },
        bn: {
          title: 'আয়ুর্বেদিক জীবনধারা ও তিন দোষ তত্ত্ব',
          subtitle: 'মাসিক চক্র চলাকালীন বাথ, পিত্ত ও কফ হরমোনজনিত সুস্থতার যোগসূত্র।',
          content: 'আয়ুর্বেদ শাস্ত্র অনুযায়ী মাসিক চক্র হলো একটি পবিত্র অভ্যন্তরীণ শুদ্ধিকরণ প্রক্রিয়া, যা প্রকৃতির প্রধান তিনটি ‘দোষ’ দ্বারা পরিচালিত হয়। ১) রক্তস্রাবের দিনগুলিতে ‘বাত’ (অপান বায়ু) সক্রিয় থাকে, তাই এই সময় ওষধি উষ্ণ সহজপাচ্য খাবার খাওয়া দরকার। ২) ফলিকুলার ও ডিম্বস্ফোটন দশা পরিচালিত হয় ‘কফ’ দ্বারা, যা প্রাণশক্তি ও রোগ প্রতিরোধ ক্ষমতা জোগায়। ৩) ল্যুটিয়াল পর্যায়ে ‘পিত্ত’ এর প্রভাব থাকে, যার জন্য মেজাজ গরম বা ব্রণ হতে পারে।',
          tags: ['আয়ুর্বেদ', 'দোষ', 'বাত', 'পিত্ত'],
          tips: [
            'বাত নিয়ন্ত্রণ: আদা ও তুলসী ডিককশন খান। খুব ঠান্ডা বা ফ্রিজের জল পান করবেন না।',
            'পিত্ত নিয়ন্ত্রণ: পুদিনা পাতা ও মিষ্টি তাজা মরশুমি ফল খান। অতি ঝাল ডিম-মাংস খাবেন না।',
            'কফ নিয়ন্ত্রণ: তেতো শাকসবজি, আদার রস এবং গায়ে হাওয়া লাগানোর মতো হাঁটাচলা করুন।'
          ],
          asana: 'বাত দোষ প্রশমন করতে নাড়ী শোধন প্রাণায়াম (অনুলোম-বিলোম শ্বাসক্রিয়া)।'
        }
      }
    },
    {
      id: 'apana_vayu_downward',
      category: 'ayurveda',
      translations: {
        en: {
          title: 'Apana Vayu: The Sacred Force of Elimination',
          subtitle: 'Preserving downward physical energy during the menstruation phase.',
          content: 'In Ayurvedic terms, Apana Vayu is the downward-flowing sub-dosha of Vata positioned in the lower abdomen. It directs menstruation, elimination, and childbirth. Restricting this flow by taking toxic substances, heavy exercises, upside-down headstands, or cold baths causes the prana to flow upwards, resulting in heavy spasms, migraine symptoms, and irregular intervals.',
          tags: ['Ayurveda', 'Apana Vayu', 'Spasms'],
          tips: [
            'Avoid inversions (headstands, shoulder-stands) during flow days.',
            'Keep the pelvic zone warm and protected from cold drafts.',
            'Allow the mind to rest in silent reflective journaling.'
          ],
          asana: 'Shavasana (Corpse Pose) with absolute muscular surrender.'
        },
        hi: {
          title: 'अपान वायु: निष्कासन की पवित्र शक्ति',
          subtitle: 'मासिक धर्म के दौरान शरीर की अधोमुखी ऊर्जा का संरक्षण।',
          content: 'आयुर्वेद में अपान वायु वात का वह उप-दोष है जो निचले पेट में स्थित है और मासिक धर्म व मल-मूत्र त्याग को निर्देशित करता है। भारी व्यायाम, ठंडे पानी से स्नान या सिर के बल योगासन (जैसे शीर्षासन) करने से यह प्रवाह ऊपर की ओर मुड़ जाता है, जिससे तीव्र ऐंठन, माइग्रेन और अनियमितता हो सकती है।',
          tags: ['आयुर्वेद', 'अपान वायु', 'ऐंठन'],
          tips: [
            'मासिक धर्म के दौरान उल्टे योगासन (जैसे शीर्षासन या कंधे के बल खड़ा होना) न करें।',
            'निचले पेट के हिस्से को गर्म और सुरक्षित रखें।',
            'शांत मन से अपनी भावनाओं का डायरी लेखन करें।'
          ],
          asana: 'पूर्ण शारीरिक समर्पण के लिए शवासन का अभ्यास करें।'
        },
        bn: {
          title: 'অপান বায়ু: রেচন ও নিঃসরণের আদি উৎস',
          subtitle: 'মাসিক চলাকালীন অধোমুখী শারীরিক শক্তির সংরক্ষণ বজায় রাখা।',
          content: 'আয়ুর্বেদ অনুসারে গর্ভ ও শ্রোণিদেশে ‘অপান বায়ু’ নামক এক নিম্নমুখী প্রাণশক্তি অবয়ব থাকে যা ঋতুস্রাব ও শরীর থেকে বর্জ্য নিষ্কাশন পরিচালনা করে। তলপেটে হঠাৎ ঠান্ডা জল লাগালে কিংবা ভারী কসরত ও উল্টো ভঙ্গির আসন (যেমন শীর্ষাসন) করলে এই শক্তি বিপরীত বা ঊর্ধমুখী প্রবাহ শুরু করে, যার ফলে অস্বাভাবিক রক্তস্রাব ও প্রচণ্ড তলপেট খিল ধরা বেদনা দেখা দিতে পারে।',
          tags: ['আয়ুর্বেদ', 'অপান বায়ু', 'ক্র্যাম্পস'],
          tips: [
            'স্রাব চলাকালীন কোমর বাঁকিয়ে মাথা নিচে অবয়বের যোগব্যায়াম একদম করবেন না।',
            'তলপেট ও শ্রোণিদেশ ঠাণ্ডা বাতাস থেকে অবগুন্ঠিত রাখুন।',
            'শান্ত হয়ে শয্যায় শুয়ে বিশ্রাম নিন ও ধ্যান করুন।'
          ],
          asana: 'সর্বাঙ্গীন পেশী শিথিল করতে ও ক্লান্তি দূর করতে শবাসন করুন।'
        }
      }
    },
    {
      id: 'faq_cycle_regularity',
      category: 'faq',
      translations: {
        en: {
          title: "Women's Health FAQ: What is 'Normal'?",
          subtitle: 'Answers to essential cycle, flow, and duration questions.',
          content: "A standard healthy cycle ranges between 21 and 35 days. Blood color is bright red on peak days, potentially light pink at start or dark brown at end. Period flow typically lasts 3 to 7 days, releasing about 30 to 80ml of fluid. If your cycles frequently vary by more than 7-9 days, or if you bleed heavily enough to soak a pad within single hours, it is highly recommended to consult a trusted healthcare physician.",
          tags: ['FAQ', 'Bleeding', 'Regularity'],
          tips: [
            'Bleeding should feel fluid—clots tiny like peas are common; large plum-sized clots require medical review.',
            'Track metrics consistently using RituSmriti database to compile precise cycle deviation indices.'
          ]
        },
        hi: {
          title: "महिला स्वास्थ्य अक्सर पूछे जाने वाले प्रश्न: 'सामान्य' क्या है?",
          subtitle: 'चक्र, बहाव और अवधि से जुड़े आवश्यक सवालों के जवाब।',
          content: 'एक सामान्य चक्र 21 से 35 दिनों का होता है। मासिक धर्म का खून मुख्य दिनों में चमकीला लाल होता है, शुरुआत में पीला-गुलाबी और अंत में गहरा भूरा हो सकता है। बहाव 3 से 7 दिनों तक रहता है, जिसमें लगभग 30 से 80 मिलीलीटर तरल निकलता है। यदि आपका चक्र बार-बार 7-9 दिनों से अधिक भिन्न होता है, या बहाव बहुत अधिक है, तो चिकित्सक से परामर्श लें।',
          tags: ['अक्सर पूछे जाने वाले प्रश्न', 'रक्तस्राव', 'नियमितता'],
          tips: [
            'बहाव तरल होना चाहिए—छोटे थक्के सामान्य हैं; बड़े थक्के होने पर जांच जरूर करवाएं।',
            'सटीक भविष्यवाणियों के लिए ऋतुस्मृति डेटाबेस का लगातार उपयोग करें।'
          ]
        },
        bn: {
          title: "নারী স্বাস্থ্য সাধারণ জিজ্ঞাসা: কোনটি 'স্বাভাবিক' পিরিয়ড?",
          subtitle: 'মাসিক চক্রের গতিবিধি ও জটিলতা নিয়ে কিছু জরুরী প্রশ্নের উত্তর।',
          content: 'একটি সুস্থ স্বভাবিক পিরিয়ড সাইকেল ২১ থেকে ৩৫ দিন স্থায়ী হতে পারে। পিরিয়ডের রক্তের কালার শুরু বা শেষের দিকে বাদামী বা হালকা লালচে হতে পারে এবং মূল সময়ে উজ্জ্বল লাল দেখায়। স্রাব সাধারণত ৩ থেকে ৭ দিন স্থায়ী হয়ে মোট ৩০-৮০ মিলি নিঃসরণ হতে পারে। যদি আপনার পিরিয়ডের স্বাভাবিক ডেট বারবার ৭ থেকে ৯ দিনের বেশি এদিকউদিক হয়, তবে বিশেষজ্ঞ গাইনিকোলজিস্টের পরামর্শ নিন।',
          tags: ['জিজ্ঞাসা', 'রক্ত স্রাব', 'স্বাভাবিক নিয়ম'],
          tips: [
            'পিরিয়ডের স্রাবের সাথে দানাদার বা মটরদানার মতো রক্তের ঢেলা সাধারণ; তবে বেশি বড় চাকা হলে অবশ্যই ডাক্তারের সাহায্য নিন।',
            'আপনার তথ্যসমূহ সম্পূর্ণ নিখুঁত করতে নিয়মিত ঋতুস্মৃতি ডায়েরিতে এন্ট্রি করতে থাকুন।'
          ]
        }
      }
    }
  ];

  // Map translations dynamically based on selected language
  const localizedArticles = useMemo(() => {
    return articles.map((art) => {
      const trans = art.translations[language] || art.translations['en'];
      return {
        id: art.id,
        category: art.category,
        title: trans.title,
        subtitle: trans.subtitle,
        content: trans.content,
        tags: trans.tags,
        tips: trans.tips,
        asana: trans.asana,
      };
    });
  }, [language]);

  // Filtering articles
  const filteredArticles = useMemo(() => {
    return localizedArticles.filter((art) => {
      const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
        art.title.toLowerCase().includes(query) ||
        art.subtitle.toLowerCase().includes(query) ||
        art.content.toLowerCase().includes(query) ||
        art.tags.some(tag => tag.toLowerCase().includes(query));
      
      return matchesCategory && matchesSearch;
    });
  }, [localizedArticles, activeCategory, searchQuery]);

  // Handle active selected article translation sync on language toggle
  const displayedSelectedArticle = useMemo(() => {
    if (!selectedArticle) return null;
    return localizedArticles.find((art) => art.id === selectedArticle.id) || null;
  }, [selectedArticle, localizedArticles]);

  return (
    <div className="flex flex-col gap-6" id="wellness-view">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-moon-rose" />
            <span>{t.libraryTitle || 'Ayurvedic & Menstrual Wisdom Library'}</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            {t.librarySub || 'Centering offline scientific and Ayurvedic natural methodologies for menstrual harmony.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-stone-400" />
          <input
            type="text"
            placeholder={categoryLabels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-stone-200 bg-stone-50 outline-hidden focus:ring-2 focus:ring-moon-rose bg-white shadow-xs focus:border-transparent transition"
          />
        </div>
      </div>

      {/* TABS SELECTORS */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-full overflow-x-auto self-start" id="library-tabs">
        {[
          { id: 'all', label: categoryLabels.all },
          { id: 'basics', label: categoryLabels.basics },
          { id: 'conditions', label: categoryLabels.conditions },
          { id: 'ayurveda', label: categoryLabels.ayurveda },
          { id: 'faq', label: categoryLabels.faq }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id as any);
              setSelectedArticle(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition cursor-pointer ${
              activeCategory === tab.id 
                ? 'bg-white text-stone-800 shadow-2xs' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CORE DISPLAY WINDOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ARTICLE LISTING */}
        <div className={`col-span-12 ${displayedSelectedArticle ? 'lg:col-span-7' : ''} grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {filteredArticles.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className={`p-5 rounded-2xl bg-white border text-left flex flex-col justify-between gap-4 transition-all hover:shadow-xs hover:border-stone-300 cursor-pointer ${
                displayedSelectedArticle?.id === art.id 
                  ? 'border-moon-rose ring-1 ring-moon-rose' 
                  : 'border-stone-100'
              }`}
            >
              <div>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-3 ${
                  art.category === 'ayurveda' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-150' 
                    : art.category === 'conditions' 
                      ? 'bg-rose-50 text-rose-800 border border-rose-150' 
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-150'
                }`}>
                  {art.category}
                </span>

                <h3 className="font-serif text-base font-bold text-stone-800 leading-snug">{art.title}</h3>
                <p className="text-stone-400 text-xs mt-1 line-clamp-2">{art.subtitle}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1">
                  {art.tags.slice(0, 2).map((tg, idx) => (
                    <span key={idx} className="text-[9px] font-medium bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-500">
                      #{tg}
                    </span>
                  ))}
                </div>
                <ArrowRight className="w-4 h-4 text-moon-rose" />
              </div>
            </button>
          ))}

          {filteredArticles.length === 0 && (
            <div className="col-span-2 text-center py-24 text-xs text-stone-400 italic bg-white rounded-3xl border border-stone-100 p-6">
              {categoryLabels.noArticles}
            </div>
          )}
        </div>

        {/* EXPANDED DETAILED ARTICLE BOARD */}
        {displayedSelectedArticle && (
          <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-5 sticky top-8 animate-fade-in" id="expanded-article-view">
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] font-bold uppercase text-stone-400">{categoryLabels.readerHeader}</span>
                <h2 className="font-serif text-xl font-bold text-stone-800 mt-1">{displayedSelectedArticle.title}</h2>
                <p className="text-stone-500 text-xs italic mt-0.5">{displayedSelectedArticle.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-stone-400 hover:text-stone-600 font-semibold text-xs border border-stone-200 px-2.5 py-1 rounded-full cursor-pointer hover:bg-stone-50 transition shrink-0"
              >
                {categoryLabels.closeBtn}
              </button>
            </div>

            <div className="w-full h-px bg-stone-100" />

            <div className="text-stone-600 text-xs leading-relaxed font-sans flex flex-col gap-4">
              <p className="whitespace-pre-wrap">{displayedSelectedArticle.content}</p>
            </div>

            {displayedSelectedArticle.tips && (
              <div className="bg-warm-cream p-4 rounded-2xl border border-stone-150 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-lotus-gold" />
                  <span>{categoryLabels.guidanceTips}</span>
                </span>
                <ul className="flex flex-col gap-2">
                  {displayedSelectedArticle.tips.map((item: string, idx: number) => (
                    <li key={idx} className="text-stone-700 text-xs flex items-start gap-1.5 leading-normal">
                      <span className="text-lotus-gold mt-1 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayedSelectedArticle.asana && (
              <div className="border border-lavender-mist/25 bg-lavender-mist/5 p-4 rounded-2xl flex items-start gap-2.5">
                <Heart className="w-5 h-5 text-moon-rose stroke-2 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-extrabold text-stone-500 block uppercase">{categoryLabels.recommendedAsana}</span>
                  <p className="text-stone-700 text-xs font-semibold leading-relaxed mt-0.5">{displayedSelectedArticle.asana}</p>
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>

    </div>
  );
}
