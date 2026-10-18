export interface LocalityItem {
  id: string;
  name: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  popular?: boolean;
  nearby: {
    name: string;
    distance: string;
    pincode?: string;
  }[];
}

export const INDIAN_LOCALITIES_DATABASE: LocalityItem[] = [
  // 1. MUMBAI & MMR
  {
    id: 'mum-bandra',
    name: 'Bandra West, Mumbai',
    locality: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    lat: 19.0596,
    lng: 72.8295,
    popular: true,
    nearby: [
      { name: 'Khar West', distance: '1.8 km', pincode: '400052' },
      { name: 'Santacruz West', distance: '3.2 km', pincode: '400054' },
      { name: 'Bandra Kurla Complex (BKC)', distance: '3.9 km', pincode: '400051' },
      { name: 'Mahim West', distance: '2.7 km', pincode: '400016' }
    ]
  },
  {
    id: 'mum-andheri',
    name: 'Andheri West, Mumbai',
    locality: 'Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    lat: 19.1136,
    lng: 72.8697,
    popular: true,
    nearby: [
      { name: 'Lokhandwala Complex', distance: '2.1 km', pincode: '400053' },
      { name: 'Juhu Beach Area', distance: '3.4 km', pincode: '400049' },
      { name: 'Versova Beach', distance: '2.8 km', pincode: '400061' },
      { name: 'Andheri East (MIDC)', distance: '4.2 km', pincode: '400069' }
    ]
  },
  {
    id: 'mum-powai',
    name: 'Powai (Hiranandani), Mumbai',
    locality: 'Powai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400076',
    lat: 19.1176,
    lng: 72.9060,
    popular: true,
    nearby: [
      { name: 'Chandivali', distance: '1.9 km', pincode: '400072' },
      { name: 'Vikhroli West', distance: '3.6 km', pincode: '400079' },
      { name: 'Kanjurmarg West', distance: '3.4 km', pincode: '400078' },
      { name: 'Saki Naka', distance: '4.1 km', pincode: '400072' }
    ]
  },
  {
    id: 'mum-colaba',
    name: 'Colaba, South Mumbai',
    locality: 'Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400005',
    lat: 18.9067,
    lng: 72.8147,
    popular: true,
    nearby: [
      { name: 'Nariman Point', distance: '2.2 km', pincode: '400021' },
      { name: 'Marine Drive', distance: '3.1 km', pincode: '400020' },
      { name: 'Fort Business District', distance: '2.5 km', pincode: '400001' },
      { name: 'Cuffe Parade', distance: '1.4 km', pincode: '400005' }
    ]
  },
  {
    id: 'mum-borivali',
    name: 'Borivali West, Mumbai',
    locality: 'Borivali West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400092',
    lat: 19.2307,
    lng: 72.8567,
    nearby: [
      { name: 'Kandivali West (Mahavir Nagar)', distance: '3.1 km', pincode: '400067' },
      { name: 'Dahisar West', distance: '3.5 km', pincode: '400068' },
      { name: 'Shimpoli', distance: '1.6 km', pincode: '400092' },
      { name: 'IC Colony', distance: '2.4 km', pincode: '400103' }
    ]
  },
  {
    id: 'mum-thane',
    name: 'Thane West, MMR',
    locality: 'Thane West',
    city: 'Thane',
    state: 'Maharashtra',
    pincode: '400601',
    lat: 19.2183,
    lng: 72.9781,
    nearby: [
      { name: 'Majiwada', distance: '2.2 km', pincode: '400601' },
      { name: 'Ghodbunder Road', distance: '4.6 km', pincode: '400615' },
      { name: 'Naupada', distance: '2.5 km', pincode: '400602' },
      { name: 'Vartak Nagar', distance: '2.8 km', pincode: '400606' }
    ]
  },
  {
    id: 'mum-vashi',
    name: 'Vashi, Navi Mumbai',
    locality: 'Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400703',
    lat: 19.0771,
    lng: 72.9986,
    nearby: [
      { name: 'Sanpada', distance: '2.3 km', pincode: '400705' },
      { name: 'Nerul (Seawoods)', distance: '4.5 km', pincode: '400706' },
      { name: 'Kopar Khairane', distance: '3.7 km', pincode: '400709' },
      { name: 'Palm Beach Road', distance: '3.0 km', pincode: '400703' }
    ]
  },

  // 2. PUNE
  {
    id: 'pune-baner',
    name: 'Baner, Pune',
    locality: 'Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    lat: 18.5590,
    lng: 73.7868,
    popular: true,
    nearby: [
      { name: 'Balewadi High Street', distance: '2.3 km', pincode: '411045' },
      { name: 'Aundh', distance: '3.6 km', pincode: '411007' },
      { name: 'Hinjewadi Phase 1', distance: '5.2 km', pincode: '411057' },
      { name: 'Wakad', distance: '4.4 km', pincode: '411057' },
      { name: 'Pashan', distance: '3.1 km', pincode: '411021' }
    ]
  },
  {
    id: 'pune-kothrud',
    name: 'Kothrud, Pune',
    locality: 'Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    lat: 18.5074,
    lng: 73.8077,
    popular: true,
    nearby: [
      { name: 'Karve Nagar', distance: '2.2 km', pincode: '411052' },
      { name: 'Bavdhan', distance: '3.9 km', pincode: '411021' },
      { name: 'Erandwane', distance: '2.8 km', pincode: '411004' },
      { name: 'Deccan Gymkhana', distance: '4.2 km', pincode: '411004' }
    ]
  },
  {
    id: 'pune-hinjewadi',
    name: 'Hinjewadi IT Hub, Pune',
    locality: 'Hinjewadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    lat: 18.5913,
    lng: 73.7389,
    popular: true,
    nearby: [
      { name: 'Hinjewadi Phase 2', distance: '2.4 km', pincode: '411057' },
      { name: 'Hinjewadi Phase 3 (Megapolis)', distance: '4.8 km', pincode: '411057' },
      { name: 'Wakad Datta Mandir', distance: '3.5 km', pincode: '411057' },
      { name: 'Marunji', distance: '2.7 km', pincode: '411057' }
    ]
  },
  {
    id: 'pune-viman-nagar',
    name: 'Viman Nagar, Pune',
    locality: 'Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014',
    lat: 18.5679,
    lng: 73.9143,
    popular: true,
    nearby: [
      { name: 'Kalyani Nagar', distance: '2.5 km', pincode: '411006' },
      { name: 'Kharadi World Trade Center', distance: '4.1 km', pincode: '411014' },
      { name: 'Koregaon Park (KP)', distance: '3.8 km', pincode: '411001' },
      { name: 'Wadgaon Sheri', distance: '2.2 km', pincode: '411014' }
    ]
  },
  {
    id: 'pune-shivaji-nagar',
    name: 'Shivaji Nagar, Central Pune',
    locality: 'Shivaji Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411005',
    lat: 18.5308,
    lng: 73.8475,
    nearby: [
      { name: 'Model Colony', distance: '1.7 km', pincode: '411016' },
      { name: 'FC Road (Fergusson College)', distance: '1.2 km', pincode: '411004' },
      { name: 'JM Road', distance: '1.4 km', pincode: '411005' },
      { name: 'Senapati Bapat Road (SB Road)', distance: '2.6 km', pincode: '411016' }
    ]
  },

  // 3. BENGALURU
  {
    id: 'blr-koramangala',
    name: 'Koramangala, Bengaluru',
    locality: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    lat: 12.9352,
    lng: 77.6245,
    popular: true,
    nearby: [
      { name: 'HSR Layout (Sector 1-6)', distance: '3.6 km', pincode: '560102' },
      { name: 'Indiranagar 100ft Road', distance: '5.2 km', pincode: '560038' },
      { name: 'BTM Layout 2nd Stage', distance: '3.1 km', pincode: '560076' },
      { name: 'Bellandur EcoSpace', distance: '5.8 km', pincode: '560103' }
    ]
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar, Bengaluru',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    lat: 12.9784,
    lng: 77.6408,
    popular: true,
    nearby: [
      { name: 'Domlur Layout', distance: '2.3 km', pincode: '560071' },
      { name: 'Old Airport Road', distance: '3.0 km', pincode: '560008' },
      { name: 'Ulsoor Lake', distance: '2.8 km', pincode: '560008' },
      { name: 'Thippasandra', distance: '1.9 km', pincode: '560075' }
    ]
  },
  {
    id: 'blr-whitefield',
    name: 'Whitefield IT Corridor, Bengaluru',
    locality: 'Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    lat: 12.9698,
    lng: 77.7500,
    popular: true,
    nearby: [
      { name: 'ITPL International Tech Park', distance: '2.2 km', pincode: '560066' },
      { name: 'Kadugodi', distance: '3.4 km', pincode: '560067' },
      { name: 'Hoodi Circle', distance: '3.1 km', pincode: '560048' },
      { name: 'Marathahalli Bridge', distance: '5.5 km', pincode: '560037' }
    ]
  },
  {
    id: 'blr-electronic-city',
    name: 'Electronic City, Bengaluru',
    locality: 'Electronic City',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    lat: 12.8452,
    lng: 77.6602,
    nearby: [
      { name: 'Electronic City Phase 1', distance: '1.2 km', pincode: '560100' },
      { name: 'Electronic City Phase 2', distance: '2.5 km', pincode: '560100' },
      { name: 'Bommasandra Industrial Area', distance: '4.1 km', pincode: '560099' },
      { name: 'Hosa Road', distance: '3.3 km', pincode: '560100' }
    ]
  },

  // 4. DELHI NCR
  {
    id: 'del-connaught-place',
    name: 'Connaught Place (CP), Central Delhi',
    locality: 'Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    lat: 28.6304,
    lng: 77.2177,
    popular: true,
    nearby: [
      { name: 'Barakhamba Road', distance: '1.4 km', pincode: '110001' },
      { name: 'Bengali Market', distance: '1.8 km', pincode: '110001' },
      { name: 'Patel Chowk / Janpath', distance: '1.9 km', pincode: '110001' },
      { name: 'Karol Bagh Market', distance: '4.2 km', pincode: '110005' }
    ]
  },
  {
    id: 'del-south-ex',
    name: 'South Extension, New Delhi',
    locality: 'South Extension',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110049',
    lat: 28.5700,
    lng: 77.2200,
    popular: true,
    nearby: [
      { name: 'Lajpat Nagar Central Market', distance: '2.2 km', pincode: '110024' },
      { name: 'Defence Colony', distance: '1.7 km', pincode: '110024' },
      { name: 'AIIMS / Ansari Nagar', distance: '1.9 km', pincode: '110029' },
      { name: 'Greater Kailash (GK 1 & 2)', distance: '3.8 km', pincode: '110048' }
    ]
  },
  {
    id: 'del-dwarka',
    name: 'Dwarka Sub-City, New Delhi',
    locality: 'Dwarka',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110075',
    lat: 28.5921,
    lng: 77.0460,
    nearby: [
      { name: 'Dwarka Sector 6 & 10', distance: '1.5 km', pincode: '110075' },
      { name: 'Dwarka Sector 12 Metro', distance: '2.4 km', pincode: '110078' },
      { name: 'Janakpuri District Centre', distance: '5.2 km', pincode: '110058' },
      { name: 'IGI Airport Terminal 3 Area', distance: '6.5 km', pincode: '110037' }
    ]
  },
  {
    id: 'ncr-noida',
    name: 'Noida Sector 18 & 62, NCR',
    locality: 'Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    lat: 28.5355,
    lng: 77.3910,
    popular: true,
    nearby: [
      { name: 'Sector 18 Atta Market', distance: '2.1 km', pincode: '201301' },
      { name: 'Sector 62 IT Hub', distance: '4.8 km', pincode: '201309' },
      { name: 'Sector 137 Expressway', distance: '6.2 km', pincode: '201305' },
      { name: 'Indirapuram (Ghaziabad)', distance: '4.5 km', pincode: '201014' }
    ]
  },
  {
    id: 'ncr-gurgaon',
    name: 'Gurgaon Cyber City & Golf Course Rd',
    locality: 'Gurugram',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    lat: 28.4595,
    lng: 77.0266,
    popular: true,
    nearby: [
      { name: 'DLF Cyber City Phase 2', distance: '2.3 km', pincode: '122002' },
      { name: 'Golf Course Extension Road', distance: '4.5 km', pincode: '122018' },
      { name: 'Sohna Road', distance: '5.2 km', pincode: '122018' },
      { name: 'Sector 29 Market & Leisure Valley', distance: '3.1 km', pincode: '122001' }
    ]
  },

  // 5. HYDERABAD
  {
    id: 'hyd-hitec',
    name: 'Hitec City, Hyderabad',
    locality: 'Hitec City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    lat: 17.4435,
    lng: 78.3772,
    popular: true,
    nearby: [
      { name: 'Madhapur Cyber Towers', distance: '1.8 km', pincode: '500081' },
      { name: 'Gachibowli Financial District', distance: '4.2 km', pincode: '500032' },
      { name: 'Kondapur RTO', distance: '2.6 km', pincode: '500084' },
      { name: 'Jubilee Hills Check Post', distance: '4.8 km', pincode: '500033' }
    ]
  },
  {
    id: 'hyd-banjara',
    name: 'Banjara Hills, Hyderabad',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    lat: 17.4156,
    lng: 78.4350,
    nearby: [
      { name: 'Jubilee Hills Road No. 36', distance: '2.5 km', pincode: '500033' },
      { name: 'Somajiguda', distance: '2.9 km', pincode: '500082' },
      { name: 'Panjagutta', distance: '2.2 km', pincode: '500082' },
      { name: 'Mehdipatnam', distance: '3.8 km', pincode: '500028' }
    ]
  },

  // 6. CHENNAI
  {
    id: 'chn-tnagar',
    name: 'T. Nagar, Chennai',
    locality: 'T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    lat: 13.0418,
    lng: 80.2341,
    popular: true,
    nearby: [
      { name: 'Nungambakkam High Road', distance: '2.8 km', pincode: '600034' },
      { name: 'Alwarpet / TTK Road', distance: '2.4 km', pincode: '600018' },
      { name: 'Kodambakkam', distance: '2.1 km', pincode: '600024' },
      { name: 'Mylapore Temple Area', distance: '4.2 km', pincode: '600004' }
    ]
  },
  {
    id: 'chn-adyar',
    name: 'Adyar & OMR, Chennai',
    locality: 'Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
    lat: 13.0067,
    lng: 80.2575,
    nearby: [
      { name: 'Besant Nagar Elliot Beach', distance: '1.9 km', pincode: '600090' },
      { name: 'Thiruvanmiyur OMR Start', distance: '2.4 km', pincode: '600041' },
      { name: 'Velachery Phoenix Marketcity', distance: '4.5 km', pincode: '600042' },
      { name: 'Guindy Industrial Estate', distance: '4.8 km', pincode: '600032' }
    ]
  },

  // 7. KOLKATA
  {
    id: 'kol-saltlake',
    name: 'Salt Lake (Bidhannagar), Kolkata',
    locality: 'Salt Lake',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700091',
    lat: 22.5867,
    lng: 88.4178,
    popular: true,
    nearby: [
      { name: 'Sector V IT Hub', distance: '2.1 km', pincode: '700091' },
      { name: 'New Town Action Area 1', distance: '4.2 km', pincode: '700156' },
      { name: 'Ultadanga Hub', distance: '3.5 km', pincode: '700067' },
      { name: 'Kankurgachi', distance: '3.8 km', pincode: '700054' }
    ]
  },
  {
    id: 'kol-parkstreet',
    name: 'Park Street & Camac St, Kolkata',
    locality: 'Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    lat: 22.5535,
    lng: 88.3518,
    nearby: [
      { name: 'Camac Street', distance: '1.2 km', pincode: '700017' },
      { name: 'Ballygunge Circular Road', distance: '3.1 km', pincode: '700019' },
      { name: 'Esplanade New Market', distance: '2.2 km', pincode: '700087' },
      { name: 'Alipore Zoo Road', distance: '3.9 km', pincode: '700027' }
    ]
  },

  // 8. AHMEDABAD
  {
    id: 'ahm-vastrapur',
    name: 'Vastrapur & SG Highway, Ahmedabad',
    locality: 'Vastrapur',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    lat: 23.0350,
    lng: 72.5293,
    popular: true,
    nearby: [
      { name: 'Bodakdev / SG Highway', distance: '2.2 km', pincode: '380054' },
      { name: 'Satellite Area', distance: '2.4 km', pincode: '380015' },
      { name: 'Prahlad Nagar Garden', distance: '4.1 km', pincode: '380015' },
      { name: 'Navrangpura / CG Road', distance: '3.8 km', pincode: '380009' }
    ]
  },

  // 9. JAIPUR
  {
    id: 'jai-cscheme',
    name: 'C-Scheme & Malviya Nagar, Jaipur',
    locality: 'C-Scheme',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    lat: 26.9077,
    lng: 75.8056,
    popular: true,
    nearby: [
      { name: 'Malviya Nagar (WTP)', distance: '4.8 km', pincode: '302017' },
      { name: 'Vaishali Nagar Amrapali', distance: '5.2 km', pincode: '302021' },
      { name: 'Mansarovar Metro Corridor', distance: '6.1 km', pincode: '302020' },
      { name: 'Raja Park', distance: '3.2 km', pincode: '302004' }
    ]
  },

  // 10. LUCKNOW
  {
    id: 'lko-gomtinagar',
    name: 'Gomti Nagar, Lucknow',
    locality: 'Gomti Nagar',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226010',
    lat: 26.8525,
    lng: 80.9995,
    popular: true,
    nearby: [
      { name: 'Gomti Nagar Extension', distance: '3.2 km', pincode: '226010' },
      { name: 'Hazratganj Market', distance: '5.1 km', pincode: '226001' },
      { name: 'Indira Nagar Munshi Pulia', distance: '3.8 km', pincode: '226016' },
      { name: 'Aliganj', distance: '6.2 km', pincode: '226024' }
    ]
  },

  // 11. CHANDIGARH
  {
    id: 'chd-sec17',
    name: 'Sector 17 & 35, Chandigarh',
    locality: 'Sector 17',
    city: 'Chandigarh',
    state: 'Punjab & Haryana',
    pincode: '160017',
    lat: 30.7398,
    lng: 76.7827,
    nearby: [
      { name: 'Sector 35 Market', distance: '2.8 km', pincode: '160035' },
      { name: 'Sector 43 Bus Stand Area', distance: '4.1 km', pincode: '160043' },
      { name: 'Mohali Phase 7 (Punjab)', distance: '6.5 km', pincode: '160062' },
      { name: 'Panchkula Sector 5 (Haryana)', distance: '7.1 km', pincode: '134109' }
    ]
  },

  // 12. INDORE
  {
    id: 'ind-vijaynagar',
    name: 'Vijay Nagar & Palasia, Indore',
    locality: 'Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    lat: 22.7533,
    lng: 75.8937,
    nearby: [
      { name: 'Old Palasia / 56 Dukan', distance: '3.8 km', pincode: '452001' },
      { name: 'Bhawar Kuan Square', distance: '6.2 km', pincode: '452001' },
      { name: 'Rajwada Palace Area', distance: '5.5 km', pincode: '452002' },
      { name: 'Bicholi Mardana', distance: '4.4 km', pincode: '452016' }
    ]
  },

  // 13. KOCHI
  {
    id: 'cok-marine-drive',
    name: 'Marine Drive & Kakkanad, Kochi',
    locality: 'Marine Drive',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682031',
    lat: 9.9796,
    lng: 76.2755,
    nearby: [
      { name: 'Kakkanad Infopark', distance: '7.5 km', pincode: '682042' },
      { name: 'Edappally Lulu Mall Area', distance: '5.2 km', pincode: '682024' },
      { name: 'MG Road Ernakulam', distance: '2.1 km', pincode: '682016' },
      { name: 'Fort Kochi Waterfront', distance: '8.1 km', pincode: '682001' }
    ]
  },

  // 14. GOA
  {
    id: 'goa-panaji',
    name: 'Panaji & Miramar, Goa',
    locality: 'Panaji',
    city: 'Panaji',
    state: 'Goa',
    pincode: '403001',
    lat: 15.4909,
    lng: 73.8278,
    nearby: [
      { name: 'Miramar Beach Road', distance: '2.8 km', pincode: '403001' },
      { name: 'Dona Paula Jetty Area', distance: '5.2 km', pincode: '403004' },
      { name: 'Porvorim Mall De Goa', distance: '4.6 km', pincode: '403521' },
      { name: 'Candolim Coast', distance: '9.2 km', pincode: '403515' }
    ]
  },

  // 15. NAGPUR
  {
    id: 'nag-dharampeth',
    name: 'Dharampeth & Civil Lines, Nagpur',
    locality: 'Dharampeth',
    city: 'Nagpur',
    state: 'Maharashtra',
    pincode: '440010',
    lat: 21.1458,
    lng: 79.0635,
    nearby: [
      { name: 'Civil Lines Green Belt', distance: '2.2 km', pincode: '440001' },
      { name: 'Ramdaspeth', distance: '2.4 km', pincode: '440010' },
      { name: 'Sitabuldi Interchange', distance: '3.1 km', pincode: '440012' },
      { name: 'Manish Nagar Belt', distance: '5.5 km', pincode: '440015' }
    ]
  }
];

export interface SearchLocationsResult {
  matches: LocalityItem[];
  nearbySuggestions: {
    name: string;
    parentLocality: string;
    distance: string;
    pincode?: string;
    city: string;
    state: string;
    fullAddress: string;
  }[];
}

/**
 * Given a search string (city name, locality, or pincode),
 * return exact/partial matches AND all nearby localities near the location being searched!
 */
export function searchIndianLocationsWithNearby(query: string): SearchLocationsResult {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { matches: [], nearbySuggestions: [] };
  }

  // 1. Find all matching localities
  const matches = INDIAN_LOCALITIES_DATABASE.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.locality.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.pincode.includes(q)
    );
  });

  // 2. Aggregate nearby locations from all matched items (de-duplicated)
  const nearbySuggestionsMap = new Map<string, {
    name: string;
    parentLocality: string;
    distance: string;
    pincode?: string;
    city: string;
    state: string;
    fullAddress: string;
  }>();

  matches.forEach((matchedItem) => {
    matchedItem.nearby.forEach((n) => {
      const key = `${n.name.toLowerCase()}-${matchedItem.city.toLowerCase()}`;
      if (!nearbySuggestionsMap.has(key)) {
        nearbySuggestionsMap.set(key, {
          name: n.name,
          parentLocality: matchedItem.locality,
          distance: n.distance,
          pincode: n.pincode || matchedItem.pincode,
          city: matchedItem.city,
          state: matchedItem.state,
          fullAddress: `${n.name}, ${matchedItem.city}, ${matchedItem.state} ${n.pincode ? `(${n.pincode})` : ''}, India`
        });
      }
    });
  });

  return {
    matches,
    nearbySuggestions: Array.from(nearbySuggestionsMap.values())
  };
}
