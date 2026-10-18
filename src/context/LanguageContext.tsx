import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'mr' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    mr: string;
    hi: string;
  };
}

export const DICTIONARY: Translations = {
  // App Bar & Global Nav
  appName: { en: 'SuperCart', mr: 'SuperCart', hi: 'SuperCart' },
  login: { en: 'Login', mr: 'लॉगिन', hi: 'लॉग इन' },
  logout: { en: 'Logout', mr: 'लॉगआउट', hi: 'लॉग आउट' },
  cart: { en: 'Cart', mr: 'कार्ट', hi: 'कार्ट' },
  home: { en: 'Home', mr: 'मुख्यपृष्ठ', hi: 'होम' },
  categories: { en: 'Categories', mr: 'श्रेण्या', hi: 'श्रेणियां' },
  exploreCategories: { en: 'Explore All Categories', mr: 'सर्व श्रेण्या पहा', hi: 'सभी श्रेणियां देखें' },
  allCategories: { en: 'All Categories', mr: 'सर्व श्रेण्या', hi: 'सभी श्रेणियां' },
  subCategories: { en: 'Sub-Categories', mr: 'उप-श्रेण्या', hi: 'उप-श्रेणियां' },
  wishlist: { en: 'Wishlist', mr: 'आवडती यादी', hi: 'विशलिस्ट' },
  myWishlist: { en: 'My Wishlist', mr: 'माझी आवडती यादी', hi: 'मेरी विशलिस्ट' },
  wishlistEmpty: { en: 'Your wishlist is empty', mr: 'तुमची आवडती यादी रिकामी आहे', hi: 'आपकी विशलिस्ट खाली है' },
  wishlistSubtitle: { en: 'Save your favorite items here to purchase later with 1-click', mr: 'तुमच्या पसंतीच्या वस्तू नंतर खरेदी करण्यासाठी येथे जतन करा', hi: 'बाद में खरीदने के लिए अपनी पसंदीदा वस्तुओं को यहां सहेजें' },
  orders: { en: 'Orders', mr: 'ऑर्डर्स', hi: 'ऑर्डर्स' },
  myOrders: { en: 'My Orders', mr: 'माझ्या ऑर्डर्स', hi: 'मेरे ऑर्डर्स' },
  recentOrders: { en: 'Recent Orders', mr: 'मागील ऑर्डर्स', hi: 'हाल के ऑर्डर्स' },
  settings: { en: 'Settings', mr: 'सेटिंग्ज', hi: 'सेटिंग्स' },
  profile: { en: 'Profile', mr: 'प्रोफाइल', hi: 'प्रोफाइल' },
  personalDetails: { en: 'Personal Details', mr: 'वैयक्तिक तपशील', hi: 'व्यक्तिगत विवरण' },
  editProfile: { en: 'Edit Profile', mr: 'प्रोफाइल संपादित करा', hi: 'प्रोफाइल एडिट करें' },
  bills: { en: 'Bills & Invoices', mr: 'बिले आणि पावत्या', hi: 'बिल और इनवॉइस' },
  billsSubtitle: { en: 'Download official GST tax invoices & order receipts', mr: 'अधिकृत जीएसटी टॅक्स इनव्हॉइस आणि पावत्या डाउनलोड करा', hi: 'आधिकारिक जीएसटी टैक्स इनवॉइस और रसीदें डाउनलोड करें' },
  selectLocation: { en: 'Select Location', mr: 'स्थान निवडा', hi: 'स्थान चुनें' },
  deliverTo: { en: 'Deliver To', mr: 'येथे पोहोचवा', hi: 'यहाँ पहुंचाएं' },
  searchPlaceholder: { en: 'Search 5000+ organic fresh items, groceries & daily staples...', mr: '५०००+ ताज्या सेंद्रिय भाज्या, फळे आणि किराणा शोधा...', hi: '5000+ ताज़ा फल, सब्ज़ियां और किराना खोजें...' },
  all: { en: 'All', mr: 'सर्व', hi: 'सभी' },
  backToHome: { en: 'Back to Home', mr: 'मुख्यपृष्ठावर परत जा', hi: 'होम पर वापस जाएं' },
  backToStore: { en: 'Back to Store', mr: 'दुकानावर परत जा', hi: 'स्टोर पर वापस जाएं' },
  back: { en: 'Back', mr: 'मागे जा', hi: 'पीछे जाएं' },

  // Categories list translation
  catFruits: { en: 'Fruits', mr: 'फळे', hi: 'फल' },
  catVegetables: { en: 'Vegetables', mr: 'भाज्या', hi: 'सब्जियां' },
  catDairy: { en: 'Dairy & Breakfast', mr: 'दूध व दुग्धजन्य पदार्थ', hi: 'डेयरी व नाश्ता' },
  catBakery: { en: 'Bakery & Bread', mr: 'बेकरी आणि ब्रेड', hi: 'बेकरी व ब्रेड' },
  catSnacks: { en: 'Snacks & Drinks', mr: 'स्नॅक्स आणि शीतपेये', hi: 'स्नैक्स व पेय' },
  catStaples: { en: 'Staples & Spices', mr: 'धान्य आणि मसाले', hi: 'अनाज व मसाले' },
  catPersonalCare: { en: 'Personal Care & Beauty', mr: 'वैयक्तिक काळजी आणि सौंदर्य', hi: 'पर्सनल केयर व सौंदर्य' },
  catCleaning: { en: 'Cleaning & Household', mr: 'स्वच्छता आणि घरगुती साहित्य', hi: 'सफाई व घरेलू सामान' },
  catElectronics: { en: 'Electronics & Appliances', mr: 'इलेक्ट्रॉनिक्स आणि उपकरणे', hi: 'इलेक्ट्रॉनिक्स व उपकरणे' },

  // Seasonal & Banner
  seasonalFoods: { en: 'Seasonal Harvest Specials', mr: 'हंगामी ताज्या पदार्थांचे खास दालन', hi: 'मौसमी ताज़ा खास उत्पाद' },
  seasonalSubtitle: { en: 'Handpicked fresh organic produce directly from Indian farms', mr: 'भारतीय शेतातून थेट निवडलेली ताजी सेंद्रिय उत्पादने', hi: 'भारतीय खेतों से सीधे लाए गए ताज़ा फल व सब्ज़ियां' },
  exploreSeasonal: { en: 'Explore Seasonal Harvest', mr: 'हंगामी फळे व उत्पादने पहा', hi: 'मौसमी फसलें देखें' },
  instantDelivery: { en: '15-Min Fast Delivery', mr: '१५ मिनिटांत जलद डिलिव्हरी', hi: '15 मिनट में तेज़ डिलीवरी' },

  // Product cards & quick view
  addToCart: { en: 'Add', mr: 'जोडा', hi: 'जोड़ें' },
  added: { en: 'Added', mr: 'जोडले', hi: 'जोड़ा गया' },
  outOfStock: { en: 'Out of Stock', mr: 'उपलब्ध नाही', hi: 'उपलब्ध नहीं' },
  inStock: { en: 'In Stock', mr: 'उपलब्ध आहे', hi: 'उपलब्ध है' },
  quickView: { en: 'Quick View', mr: 'तपशील पहा', hi: 'त्वरित विवरण' },
  nutritionalInfo: { en: 'Nutritional Information (per serving / 100g)', mr: 'पोषण मूल्य माहिती (प्रति १०० ग्रॅम)', hi: 'पोषण संबंधी जानकारी (प्रति 100g)' },
  ingredients: { en: 'Ingredients & Sourcing', mr: 'घटक आणि स्रोत', hi: 'सामग्री व स्रोत' },
  calories: { en: 'Calories', mr: 'कॅलरीज', hi: 'कैलोरी' },
  protein: { en: 'Protein', mr: 'प्रथिने (Protein)', hi: 'प्रोटीन' },
  carbohydrates: { en: 'Carbohydrates', mr: 'कर्बोदके (Carbs)', hi: 'कार्बोहाइड्रेट' },
  fat: { en: 'Fats', mr: 'चरबी (Fats)', hi: 'वसा' },
  fiber: { en: 'Dietary Fiber', mr: 'फायबर (Fiber)', hi: 'फाइबर' },
  sugar: { en: 'Natural Sugar', mr: 'नैसर्गिक साखर', hi: 'शर्करा' },
  keyVitamins: { en: 'Vitamins & Minerals', mr: 'जीवनसत्त्वे आणि खनिजे', hi: 'विटामिन और खनिज' },
  origin: { en: 'Origin', mr: 'उत्पादनाचे मूळ ठिकाण', hi: 'उत्पत्ति' },
  organicCertified: { en: '100% Certified Organic', mr: '१००% प्रमाणित सेंद्रिय', hi: '100% प्रमाणित ऑर्गेनिक' },
  freshGuaranteed: { en: 'Farm Fresh Guaranteed', mr: 'शेत-ताजे हमी', hi: 'खेतों से ताज़ा गारंटी' },

  // Cart & Checkout
  yourCart: { en: 'Your Cart', mr: 'तुमची कार्ट', hi: 'आपकी कार्ट' },
  cartEmpty: { en: 'Your cart is empty', mr: 'तुमची कार्ट रिकामी आहे', hi: 'आपकी कार्ट खाली है' },
  emptyCartPrompt: { en: 'Add farm fresh items to begin your grocery checkout', mr: 'खरेदी सुरू करण्यासाठी ताजी उत्पादने जोडा', hi: 'किराना खरीदारी शुरू करने के लिए उत्पाद जोड़ें' },
  itemDetails: { en: 'Item Details', mr: 'वस्तू तपशील', hi: 'आइटम विवरण' },
  subtotal: { en: 'Subtotal', mr: 'उप-एकूण', hi: 'उप-कुल' },
  deliveryCharge: { en: 'Delivery Fee', mr: 'डिलिव्हरी शुल्क', hi: 'डिलीवरी शुल्क' },
  freeDelivery: { en: 'FREE', mr: 'मोफत', hi: 'मुफ्त' },
  taxAndFees: { en: 'GST & Taxes', mr: 'जीएसटी आणि कर', hi: 'जीएसटी और कर' },
  discount: { en: 'Discount Savings', mr: 'सूट बचत', hi: 'छूट' },
  totalToPay: { en: 'Total Amount', mr: 'एकूण देय रक्कम', hi: 'कुल देय राशि' },
  proceedToCheckout: { en: 'Proceed to Checkout', mr: 'ऑर्डर पुढे पाठवा', hi: 'ऑर्डर आगे बढ़ाएं' },
  placeOrder: { en: 'Place Order Now', mr: 'ऑर्डर निश्चित करा', hi: 'ऑर्डर प्लेस करें' },
  paymentMethod: { en: 'Payment Method', mr: 'पेमेंट पद्धत', hi: 'भुगतान का तरीका' },
  cashOnDelivery: { en: 'Cash on Delivery (COD)', mr: 'कॅश ऑन डिलिव्हरी', hi: 'कैश ऑन डिलीवरी' },
  upiNetBanking: { en: 'UPI / Google Pay / PhonePe', mr: 'युपीआय / गुगल पे / फोनपे', hi: 'यूपीआई / गूगल पे / फोनपे' },
  cardPayment: { en: 'Credit / Debit Card', mr: 'क्रेडिट / डेबिट कार्ड', hi: 'क्रेडिट / डेबिट कार्ड' },
  appliedCoupon: { en: 'Coupon Applied', mr: 'कूपन लागू झाले', hi: 'कूपन लागू' },

  // Settings
  settingsTitle: { en: 'Settings', mr: 'सेटिंग्ज', hi: 'सेटिंग्स' },
  settingsSubtitle: { en: 'Manage your profile, language, mood & recent bills', mr: 'तुमचे प्रोफाइल, भाषा, थीम आणि बिले व्यवस्थापित करा', hi: 'अपनी प्रोफाइल, भाषा, थीम और बिल प्रबंधित करें' },
  chooseLanguage: { en: 'Choose Language', mr: 'भाषा निवडा', hi: 'भाषा चुनें' },
  languageSubtitle: { en: 'Select your preferred app display language', mr: 'तुमची पसंतीची भाषा निवडा', hi: 'अपनी पसंदीदा भाषा चुनें' },
  themeMode: { en: 'Theme Mood', mr: 'थीम मूड', hi: 'थीम मूड' },
  themeSubtitle: { en: 'Switch between light and dark atmosphere', mr: 'लाईट किंवा डार्क मोड निवडा', hi: 'लाइट या डार्क मोड चुनें' },
  lightMode: { en: 'Light Mood', mr: 'लाईट मूड', hi: 'लाइट मूड' },
  darkMode: { en: 'Dark Mood', mr: 'डार्क मूड', hi: 'डार्क मूड' },
  gender: { en: 'Gender', mr: 'लिंग', hi: 'लिंग' },
  male: { en: 'Male', mr: 'पुरुष', hi: 'पुरुष' },
  female: { en: 'Female', mr: 'स्त्री', hi: 'महिला' },
  other: { en: 'Other', mr: 'इतर', hi: 'अन्य' },
  preferNotToSay: { en: 'Prefer not to say', mr: 'सांगू इच्छित नाही', hi: 'बताना नहीं चाहते' },
  fullName: { en: 'Full Name', mr: 'पूर्ण नाव', hi: 'पूरा नाम' },
  emailAddress: { en: 'Email Address', mr: 'ईमेल पत्ता', hi: 'ईमेल पता' },
  phoneNumber: { en: 'Phone Number', mr: 'फोन नंबर', hi: 'फोन नंबर' },
  saveChanges: { en: 'Save Profile Changes', mr: 'बदल जतन करा', hi: 'बदलाव सहेजें' },
  profileUpdated: { en: 'Profile updated successfully!', mr: 'प्रोफाइल यशस्वीरित्या अद्यतनित झाली!', hi: 'प्रोफाइल सफलतापूर्वक अपडेट हो गई!' },
  noBillsFound: { en: 'No past bills available yet', mr: 'कोणतीही मागील बिले उपलब्ध नाहीत', hi: 'कोई बिल उपलब्ध नहीं है' },
  viewInvoice: { en: 'View Invoice', mr: 'पावती पहा', hi: 'इनवॉइस देखें' },
  downloadPdf: { en: 'Print / Save Bill', mr: 'बिल प्रिंट / सेव्ह करा', hi: 'बिल प्रिंट / सेव करें' },
  billNumber: { en: 'Invoice #', mr: 'पावती क्र.', hi: 'इनवॉइस सं.' },
  orderDate: { en: 'Order Date', mr: 'ऑर्डर तारीख', hi: 'ऑर्डर दिनांक' },
  orderStatus: { en: 'Status', mr: 'स्थिती', hi: 'स्थिति' },
  delivered: { en: 'Delivered', mr: 'वितरीत केले', hi: 'डिलीवर किया गया' },
  processing: { en: 'Processing', mr: 'प्रक्रिया सुरू आहे', hi: 'प्रक्रिया में है' },
  outForDelivery: { en: 'Out for Delivery', mr: 'डिलिव्हरीसाठी बाहेर', hi: 'डिलीवरी के लिए निकला' },
  placed: { en: 'Placed', mr: 'नोंदवले', hi: 'दर्ज किया गया' },
  trackOrder: { en: 'Track Live Order', mr: 'थेट ऑर्डर ट्रॅक करा', hi: 'लाइव ऑर्डर ट्रैक करें' },
  reorder: { en: 'Reorder All', mr: 'पुन्हा मागवा', hi: 'फिर से ऑर्डर करें' },

  // Location Modal
  locationTitle: { en: 'Choose Delivery Location in India', mr: 'भारतातील डिलिव्हरी स्थान निवडा', hi: 'भारत में डिलीवरी स्थान चुनें' },
  useCurrentLocation: { en: 'Use Current Location', mr: 'सध्याचे स्थान वापरा', hi: 'वर्तमान स्थान का उपयोग करें' },
  detectingLocation: { en: 'Detecting your GPS location in India...', mr: 'भारतातील तुमचे स्थान शोधत आहे...', hi: 'भारत में आपका स्थान खोजा जा रहा है...' },
  enterIndianAddress: { en: 'Search city, state, or PIN code in India (e.g. Pune, Mumbai, 411001)...', mr: 'भारतातील शहर, राज्य किंवा पिनकोड शोधा (उदा. पुणे, मुंबई, ४११००१)...', hi: 'भारत में शहर, राज्य या पिन कोड खोजें (उदा. पुणे, मुंबई, 411001)...' },
  invalidLocation: { en: 'Invalid location. Please select a valid location in India.', mr: 'अवैध स्थान. कृपया भारतातील वैध स्थान निवडा.', hi: 'अमान्य स्थान। कृपया भारत में एक मान्य स्थान चुनें।' },
  selectOnMap: { en: 'Select Pin on Google Maps', mr: 'गुगल मॅपवर पिन निवडा', hi: 'गूगल मैप पर पिन चुनें' },
  confirmLocation: { en: 'Confirm Delivery Location', mr: 'स्थान निश्चित करा', hi: 'स्थान की पुष्टि करें' },
  noLocationSelected: { en: 'No location selected yet. Please choose your delivery destination.', mr: 'अद्याप कोणतेही स्थान निवडलेले नाही. कृपया डिलिव्हरी स्थान निवडा.', hi: 'अभी कोई स्थान नहीं चुना गया है। कृपया डिलीवरी स्थान चुनें।' },

  // Voice, Camera, QR Search
  cameraSearchTitle: { en: 'Visual Camera Search', mr: 'कॅमेरा व्हिज्युअल शोध', hi: 'कैमरा विजुअल खोज' },
  cameraSearchDesc: { en: 'Point camera at any vegetable, fruit or grocery item', mr: 'कोणत्याही भाजी, फळ किंवा किराणा वस्तूवर कॅमेरा दाखवा', hi: 'किसी भी फल, सब्जी या किराना उत्पाद पर कैमरा दिखाएं' },
  voiceSearchTitle: { en: 'Listening for voice search...', mr: 'आवाज ऐकत आहे...', hi: 'आवाज सुन रहा है...' },
  voiceSearchDesc: { en: 'Speak in Marathi, Hindi or English (e.g. "Mango", "Milk", "पालक", "केळी")', mr: 'मराठी, हिंदी किंवा इंग्रजीत बोला (उदा. "आंबा", "दूध", "पालक", "केळी")', hi: 'मराठी, हिंदी या अंग्रेजी में बोलें (उदा. "आम", "दूध", "पालक", "केला")' },
  qrScannerTitle: { en: 'Scan QR & Barcode', mr: 'क्यूआर आणि बारकोड स्कॅन करा', hi: 'क्यूआर और बारकोड स्कैन करें' },
  qrScannerDesc: { en: 'Align product barcode inside frame to find instantly', mr: 'उत्पादन बारकोड फ्रेममध्ये धरून त्वरित शोधा', hi: 'उत्पाद बारकोड को फ्रेम में रखें और तुरंत खोजें' },
  capturePhoto: { en: 'Capture Photo', mr: 'फोटो काढा', hi: 'फोटो लें' },
  stopCamera: { en: 'Close Camera', mr: 'कॅमेरा बंद करा', hi: 'कैमरा बंद करें' },

  // Running Footer items
  runningLive1: { en: '⚡ 15-Minute Express Grocery Delivery active across all major Indian cities', mr: '⚡ सर्व प्रमुख भारतीय शहरांमध्ये १५ मिनिटांत जलद किराणा डिलिव्हरी सुरू', hi: '⚡ सभी प्रमुख भारतीय शहरों में 15 मिनट में तेज़ किराणा डिलीवरी सक्रिय' },
  runningLive2: { en: '🌱 100% Certified Organic & Farm Fresh produce delivered straight from Indian farmers', mr: '🌱 भारतीय शेतकऱ्यांकडून थेट १००% शुद्ध आणि सेंद्रिय ताजी फळे व भाज्या', hi: '🌱 भारतीय किसानों से सीधे 100% शुद्ध और जैविक ताज़ा उत्पाद' },
  runningLive3: { en: '🥭 Seasonal Specials: Authentic Ratnagiri Alphonso Mangoes & Mahabaleshwar Strawberries in stock!', mr: '🥭 खास हंगामी फळे: अस्सल रत्नागिरी हापूस आंबे आणि महाबळेश्वर स्ट्रॉबेरी उपलब्ध!', hi: '🥭 मौसमी खास: असली रत्नागिरी हापुस आम और महाबलेश्वर स्ट्रॉबेरी उपलब्ध!' },
  runningLive4: { en: '🛡️ 100% Quality Guarantee: Instant doorstep return & refunds with zero questions asked', mr: '🛡️ १००% गुणवत्तेची हमी: दारातच त्वरित परतावा आणि रीफंड', hi: '🛡️ 100% गुणवत्ता गारंटी: दरवाज़े पर ही तुरंत रिटर्न और रिफंड' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    localStorage.setItem('supercart_language', 'en');
  }, []);

  const setLanguage = (_lang: Language) => {
    setLanguageState('en');
  };

  const t = (key: string, defaultText?: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key].en || defaultText || key;
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
