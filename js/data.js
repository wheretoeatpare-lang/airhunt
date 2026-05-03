// ============================================================
// AirHunt — Data Layer
// ============================================================

const AIRPORTS = [
  // ── PHILIPPINES ──────────────────────────────────────────
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'CEB', name: 'Mactan-Cebu International', city: 'Cebu', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'DVO', name: 'Francisco Bangoy International', city: 'Davao', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'ILO', name: 'Iloilo International', city: 'Iloilo', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'BCD', name: 'Bacolod-Silay International', city: 'Bacolod', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'CRK', name: 'Clark International', city: 'Clark / Angeles', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'KLO', name: 'Kalibo International', city: 'Kalibo / Boracay', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'PPS', name: 'Puerto Princesa International', city: 'Puerto Princesa / Palawan', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'ZAM', name: 'Zamboanga International', city: 'Zamboanga', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'GEN', name: 'General Santos International', city: 'General Santos', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'TAC', name: 'Daniel Z. Romualdez Airport', city: 'Tacloban', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'MPH', name: 'Godofredo P. Ramos Airport', city: 'Caticlan / Boracay', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'LGP', name: 'Legazpi Airport', city: 'Legazpi', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'CGY', name: 'Laguindingan Airport', city: 'Cagayan de Oro', country: 'Philippines', emoji: '🇵🇭' },
  { code: 'OZC', name: 'Labo Airport', city: 'Ozamiz', country: 'Philippines', emoji: '🇵🇭' },
  // ── SOUTHEAST ASIA ───────────────────────────────────────
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', emoji: '🇹🇭' },
  { code: 'DMK', name: 'Don Mueang International', city: 'Bangkok', country: 'Thailand', emoji: '🇹🇭' },
  { code: 'HKT', name: 'Phuket International', city: 'Phuket', country: 'Thailand', emoji: '🇹🇭' },
  { code: 'CNX', name: 'Chiang Mai International', city: 'Chiang Mai', country: 'Thailand', emoji: '🇹🇭' },
  { code: 'KUL', name: 'Kuala Lumpur International (KLIA)', city: 'Kuala Lumpur', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'KUL2', name: 'KLIA2 (AirAsia Hub)', city: 'Kuala Lumpur', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'PEN', name: 'Penang International', city: 'Penang', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'BKI', name: 'Kota Kinabalu International', city: 'Kota Kinabalu', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'JHB', name: 'Senai International', city: 'Johor Bahru', country: 'Malaysia', emoji: '🇲🇾' },
  { code: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam', emoji: '🇻🇳' },
  { code: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam', emoji: '🇻🇳' },
  { code: 'DAD', name: 'Da Nang International', city: 'Da Nang', country: 'Vietnam', emoji: '🇻🇳' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', emoji: '🇮🇩' },
  { code: 'DPS', name: 'Ngurah Rai International (Bali)', city: 'Bali / Denpasar', country: 'Indonesia', emoji: '🇮🇩' },
  { code: 'SUB', name: 'Juanda International', city: 'Surabaya', country: 'Indonesia', emoji: '🇮🇩' },
  { code: 'UPG', name: 'Sultan Hasanuddin International', city: 'Makassar', country: 'Indonesia', emoji: '🇮🇩' },
  { code: 'RGN', name: 'Yangon International', city: 'Yangon', country: 'Myanmar', emoji: '🇲🇲' },
  { code: 'REP', name: 'Siem Reap-Angkor International', city: 'Siem Reap', country: 'Cambodia', emoji: '🇰🇭' },
  { code: 'PNH', name: 'Phnom Penh International', city: 'Phnom Penh', country: 'Cambodia', emoji: '🇰🇭' },
  { code: 'VTE', name: 'Wattay International', city: 'Vientiane', country: 'Laos', emoji: '🇱🇦' },
  { code: 'BWN', name: 'Brunei International', city: 'Bandar Seri Begawan', country: 'Brunei', emoji: '🇧🇳' },
  // ── EAST ASIA ────────────────────────────────────────────
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan', emoji: '🇯🇵' },
  { code: 'ITM', name: 'Itami Airport', city: 'Osaka', country: 'Japan', emoji: '🇯🇵' },
  { code: 'NGO', name: 'Chubu Centrair International', city: 'Nagoya', country: 'Japan', emoji: '🇯🇵' },
  { code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan', emoji: '🇯🇵' },
  { code: 'CTS', name: 'New Chitose Airport', city: 'Sapporo / Hokkaido', country: 'Japan', emoji: '🇯🇵' },
  { code: 'OKA', name: 'Naha Airport', city: 'Okinawa', country: 'Japan', emoji: '🇯🇵' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', emoji: '🇰🇷' },
  { code: 'GMP', name: 'Gimpo International', city: 'Seoul', country: 'South Korea', emoji: '🇰🇷' },
  { code: 'PUS', name: 'Gimhae International', city: 'Busan', country: 'South Korea', emoji: '🇰🇷' },
  { code: 'CJU', name: 'Jeju International', city: 'Jeju Island', country: 'South Korea', emoji: '🇰🇷' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', emoji: '🇭🇰' },
  { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan', emoji: '🇹🇼' },
  { code: 'TSA', name: 'Taipei Songshan Airport', city: 'Taipei', country: 'Taiwan', emoji: '🇹🇼' },
  { code: 'KHH', name: 'Kaohsiung International', city: 'Kaohsiung', country: 'Taiwan', emoji: '🇹🇼' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', emoji: '🇨🇳' },
  { code: 'PKX', name: 'Daxing International', city: 'Beijing', country: 'China', emoji: '🇨🇳' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', emoji: '🇨🇳' },
  { code: 'SHA', name: 'Shanghai Hongqiao International', city: 'Shanghai', country: 'China', emoji: '🇨🇳' },
  { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China', emoji: '🇨🇳' },
  { code: 'SZX', name: 'Shenzhen Bao\'an International', city: 'Shenzhen', country: 'China', emoji: '🇨🇳' },
  { code: 'CTU', name: 'Chengdu Tianfu International', city: 'Chengdu', country: 'China', emoji: '🇨🇳' },
  { code: 'XMN', name: 'Xiamen Gaoqi International', city: 'Xiamen', country: 'China', emoji: '🇨🇳' },
  { code: 'MFM', name: 'Macau International', city: 'Macau', country: 'Macau', emoji: '🇲🇴' },
  // ── SOUTH ASIA ───────────────────────────────────────────
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', emoji: '🇮🇳' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', emoji: '🇮🇳' },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India', emoji: '🇮🇳' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India', emoji: '🇮🇳' },
  { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India', emoji: '🇮🇳' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India', emoji: '🇮🇳' },
  { code: 'CMB', name: 'Bandaranaike International', city: 'Colombo', country: 'Sri Lanka', emoji: '🇱🇰' },
  { code: 'DAC', name: 'Hazrat Shahjalal International', city: 'Dhaka', country: 'Bangladesh', emoji: '🇧🇩' },
  { code: 'KTM', name: 'Tribhuvan International', city: 'Kathmandu', country: 'Nepal', emoji: '🇳🇵' },
  { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan', emoji: '🇵🇰' },
  { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan', emoji: '🇵🇰' },
  // ── MIDDLE EAST ──────────────────────────────────────────
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', emoji: '🇦🇪' },
  { code: 'AUH', name: 'Zayed International', city: 'Abu Dhabi', country: 'UAE', emoji: '🇦🇪' },
  { code: 'DWC', name: 'Al Maktoum International', city: 'Dubai South', country: 'UAE', emoji: '🇦🇪' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', emoji: '🇶🇦' },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia', emoji: '🇸🇦' },
  { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia', emoji: '🇸🇦' },
  { code: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain', emoji: '🇧🇭' },
  { code: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait', emoji: '🇰🇼' },
  { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman', emoji: '🇴🇲' },
  { code: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan', emoji: '🇯🇴' },
  { code: 'BEY', name: 'Rafic Hariri International', city: 'Beirut', country: 'Lebanon', emoji: '🇱🇧' },
  { code: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel', emoji: '🇮🇱' },
  // ── EUROPE ───────────────────────────────────────────────
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', emoji: '🇫🇷' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', emoji: '🇫🇷' },
  { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', emoji: '🇫🇷' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', emoji: '🇩🇪' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', emoji: '🇩🇪' },
  { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', emoji: '🇩🇪' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', emoji: '🇪🇸' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', emoji: '🇮🇹' },
  { code: 'MXP', name: 'Milano Malpensa', city: 'Milan', country: 'Italy', emoji: '🇮🇹' },
  { code: 'VCE', name: 'Marco Polo Airport', city: 'Venice', country: 'Italy', emoji: '🇮🇹' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', emoji: '🇨🇭' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', emoji: '🇨🇭' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', emoji: '🇦🇹' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', emoji: '🇧🇪' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', emoji: '🇩🇰' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', emoji: '🇸🇪' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', emoji: '🇳🇴' },
  { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'Finland', emoji: '🇫🇮' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', emoji: '🇵🇹' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece', emoji: '🇬🇷' },
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', emoji: '🇵🇱' },
  { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', emoji: '🇨🇿' },
  { code: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungary', emoji: '🇭🇺' },
  { code: 'SVO', name: 'Sheremetyevo International', city: 'Moscow', country: 'Russia', emoji: '🇷🇺' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  { code: 'SAW', name: 'Sabiha Gökçen International', city: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  // ── NORTH AMERICA ────────────────────────────────────────
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', emoji: '🇺🇸' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', emoji: '🇺🇸' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'New York', country: 'USA', emoji: '🇺🇸' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', emoji: '🇺🇸' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', emoji: '🇺🇸' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', emoji: '🇺🇸' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', emoji: '🇺🇸' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', emoji: '🇺🇸' },
  { code: 'DFW', name: 'Dallas Fort Worth International', city: 'Dallas', country: 'USA', emoji: '🇺🇸' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', emoji: '🇺🇸' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu / Hawaii', country: 'USA', emoji: '🇺🇸' },
  { code: 'GUM', name: 'Antonio B. Won Pat International', city: 'Guam', country: 'USA (Guam)', emoji: '🇬🇺' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', emoji: '🇨🇦' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', emoji: '🇨🇦' },
  { code: 'YUL', name: 'Montreal-Trudeau International', city: 'Montreal', country: 'Canada', emoji: '🇨🇦' },
  { code: 'MEX', name: 'Benito Juárez International', city: 'Mexico City', country: 'Mexico', emoji: '🇲🇽' },
  // ── OCEANIA ──────────────────────────────────────────────
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', emoji: '🇦🇺' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', emoji: '🇦🇺' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', emoji: '🇦🇺' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', emoji: '🇦🇺' },
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide', country: 'Australia', emoji: '🇦🇺' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', emoji: '🇳🇿' },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', emoji: '🇳🇿' },
  { code: 'NAN', name: 'Nadi International', city: 'Nadi / Fiji', country: 'Fiji', emoji: '🇫🇯' },
  // ── AFRICA ───────────────────────────────────────────────
  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', emoji: '🇿🇦' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', emoji: '🇿🇦' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', emoji: '🇪🇬' },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', emoji: '🇰🇪' },
  { code: 'ADD', name: 'Addis Ababa Bole International', city: 'Addis Ababa', country: 'Ethiopia', emoji: '🇪🇹' },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria', emoji: '🇳🇬' },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', emoji: '🇲🇦' },
  // ── SOUTH AMERICA ────────────────────────────────────────
  { code: 'GRU', name: 'São Paulo Guarulhos International', city: 'São Paulo', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'GIG', name: 'Rio de Janeiro International', city: 'Rio de Janeiro', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'EZE', name: 'Ezeiza International', city: 'Buenos Aires', country: 'Argentina', emoji: '🇦🇷' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', emoji: '🇨🇴' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', emoji: '🇨🇱' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', emoji: '🇵🇪' },
];

const AIRLINES = [
  // ── Philippines ──
  { code: 'PR', name: 'Philippine Airlines', emoji: '✈️', color: '#002B7F' },
  { code: '5J', name: 'Cebu Pacific', emoji: '🟡', color: '#FFC000' },
  { code: 'Z2', name: 'AirAsia Philippines', emoji: '❤️', color: '#FF0000' },
  // ── Southeast Asia ──
  { code: 'SQ', name: 'Singapore Airlines', emoji: '🌙', color: '#00205B' },
  { code: 'TR', name: 'Scoot', emoji: '🟠', color: '#FF6600' },
  { code: 'AK', name: 'AirAsia', emoji: '❤️', color: '#FF0000' },
  { code: 'D7', name: 'AirAsia X', emoji: '❤️', color: '#CC0000' },
  { code: 'MH', name: 'Malaysia Airlines', emoji: '🌺', color: '#006FB4' },
  { code: 'TG', name: 'Thai Airways', emoji: '💜', color: '#5B2C8D' },
  { code: 'WE', name: 'Thai Smile', emoji: '😊', color: '#F26522' },
  { code: 'FD', name: 'Thai AirAsia', emoji: '❤️', color: '#FF0000' },
  { code: 'VN', name: 'Vietnam Airlines', emoji: '⭐', color: '#007DC5' },
  { code: 'VJ', name: 'VietJet Air', emoji: '💋', color: '#FF0000' },
  { code: 'GA', name: 'Garuda Indonesia', emoji: '🦅', color: '#0089CF' },
  { code: 'JT', name: 'Lion Air', emoji: '🦁', color: '#CC0000' },
  { code: 'BI', name: 'Royal Brunei Airlines', emoji: '👑', color: '#F7941D' },
  { code: 'MM', name: 'Peach Aviation', emoji: '🍑', color: '#FF5FA0' },
  // ── East Asia ──
  { code: 'CX', name: 'Cathay Pacific', emoji: '💚', color: '#006564' },
  { code: 'HX', name: 'Hong Kong Airlines', emoji: '🌊', color: '#E31837' },
  { code: 'JL', name: 'Japan Airlines', emoji: '🔴', color: '#C00F0C' },
  { code: 'NH', name: 'ANA (All Nippon Airways)', emoji: '🔷', color: '#13448C' },
  { code: 'KE', name: 'Korean Air', emoji: '☀️', color: '#00256C' },
  { code: 'OZ', name: 'Asiana Airlines', emoji: '🌸', color: '#E30613' },
  { code: 'CI', name: 'China Airlines', emoji: '🌺', color: '#C8102E' },
  { code: 'BR', name: 'EVA Air', emoji: '💚', color: '#007B40' },
  { code: 'CA', name: 'Air China', emoji: '🐉', color: '#CC0000' },
  { code: 'MU', name: 'China Eastern', emoji: '⭕', color: '#DF0030' },
  { code: 'CZ', name: 'China Southern', emoji: '🌻', color: '#1E5AA8' },
  // ── Middle East ──
  { code: 'EK', name: 'Emirates', emoji: '🌊', color: '#D71921' },
  { code: 'EY', name: 'Etihad Airways', emoji: '🦅', color: '#BD8B13' },
  { code: 'QR', name: 'Qatar Airways', emoji: '🌟', color: '#5C0632' },
  { code: 'GF', name: 'Gulf Air', emoji: '🌙', color: '#C8A951' },
  { code: 'KU', name: 'Kuwait Airways', emoji: '🔵', color: '#003580' },
  { code: 'ME', name: 'Middle East Airlines', emoji: '🌲', color: '#006233' },
  // ── Europe ──
  { code: 'BA', name: 'British Airways', emoji: '🔵', color: '#075AAA' },
  { code: 'AF', name: 'Air France', emoji: '🇫🇷', color: '#002157' },
  { code: 'LH', name: 'Lufthansa', emoji: '🦅', color: '#05164D' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines', emoji: '💙', color: '#00A1DE' },
  { code: 'IB', name: 'Iberia', emoji: '🌹', color: '#D31F31' },
  { code: 'AZ', name: 'ITA Airways', emoji: '🇮🇹', color: '#005CA9' },
  { code: 'TK', name: 'Turkish Airlines', emoji: '🌙', color: '#C8102E' },
  { code: 'SK', name: 'SAS Scandinavian Airlines', emoji: '❄️', color: '#003087' },
  { code: 'AY', name: 'Finnair', emoji: '🔵', color: '#003580' },
  { code: 'LX', name: 'Swiss International', emoji: '🇨🇭', color: '#FF0000' },
  { code: 'OS', name: 'Austrian Airlines', emoji: '🇦🇹', color: '#ED2226' },
  { code: 'FR', name: 'Ryanair', emoji: '💛', color: '#073590' },
  { code: 'U2', name: 'easyJet', emoji: '🟠', color: '#FF6600' },
  { code: 'VY', name: 'Vueling', emoji: '💛', color: '#FFD700' },
  // ── Oceania ──
  { code: 'QF', name: 'Qantas', emoji: '🦘', color: '#E40000' },
  { code: 'JQ', name: 'Jetstar', emoji: '⭐', color: '#FF6600' },
  { code: 'NZ', name: 'Air New Zealand', emoji: '🥝', color: '#00529B' },
  { code: 'FJ', name: 'Fiji Airways', emoji: '🌺', color: '#005EB8' },
  // ── North America ──
  { code: 'AA', name: 'American Airlines', emoji: '🦅', color: '#0078D2' },
  { code: 'UA', name: 'United Airlines', emoji: '🌐', color: '#003580' },
  { code: 'DL', name: 'Delta Air Lines', emoji: '🔺', color: '#C01933' },
  { code: 'AC', name: 'Air Canada', emoji: '🍁', color: '#CC0000' },
  // ── South Asia ──
  { code: 'AI', name: 'Air India', emoji: '🪷', color: '#FF6600' },
  { code: 'IX', name: 'Air India Express', emoji: '🪷', color: '#E87722' },
  { code: 'UL', name: 'SriLankan Airlines', emoji: '🌿', color: '#00548B' },
  // ── Africa ──
  { code: 'ET', name: 'Ethiopian Airlines', emoji: '🌍', color: '#009A44' },
  { code: 'SA', name: 'South African Airways', emoji: '🦁', color: '#006BB6' },
];

const DEALS_DATA = [
  // ── Southeast Asia ──────────────────────────────────────
  { dest: 'Singapore',      from: 'Manila', code: 'SIN', region: 'Southeast Asia', emoji: '🦁', price: 3499,  original: 5200,  airline: 'Cebu Pacific',          discount: '33%', colors: ['#0B5394','#00897B'] },
  { dest: 'Bangkok',        from: 'Manila', code: 'BKK', region: 'Southeast Asia', emoji: '🛕', price: 4299,  original: 6800,  airline: 'AirAsia',               discount: '37%', colors: ['#E65100','#F57F17'] },
  { dest: 'Kuala Lumpur',   from: 'Manila', code: 'KUL', region: 'Southeast Asia', emoji: '🏙️', price: 2999, original: 4200,  airline: 'AirAsia Philippines',   discount: '29%', colors: ['#1B5E20','#004D40'] },
  { dest: 'Bali',           from: 'Manila', code: 'DPS', region: 'Southeast Asia', emoji: '🌺', price: 5499,  original: 8200,  airline: 'Garuda Indonesia',      discount: '33%', colors: ['#BF360C','#E65100'] },
  { dest: 'Ho Chi Minh City', from: 'Manila', code: 'SGN', region: 'Southeast Asia', emoji: '🏯', price: 3299, original: 4900, airline: 'VietJet Air',          discount: '33%', colors: ['#C62828','#AD1457'] },
  { dest: 'Phuket',         from: 'Manila', code: 'HKT', region: 'Southeast Asia', emoji: '🏖️', price: 5899, original: 8500,  airline: 'Thai Airways',          discount: '31%', colors: ['#00695C','#00838F'] },
  { dest: 'Hanoi',          from: 'Manila', code: 'HAN', region: 'Southeast Asia', emoji: '🌉', price: 3799,  original: 5600,  airline: 'Vietnam Airlines',      discount: '32%', colors: ['#4A148C','#6A1B9A'] },
  { dest: 'Jakarta',        from: 'Manila', code: 'CGK', region: 'Southeast Asia', emoji: '🕌', price: 4599,  original: 6800,  airline: 'Lion Air',              discount: '32%', colors: ['#1A237E','#283593'] },
  { dest: 'Siem Reap',      from: 'Manila', code: 'REP', region: 'Southeast Asia', emoji: '🛕', price: 4899,  original: 7200,  airline: 'Cebu Pacific',          discount: '32%', colors: ['#33691E','#558B2F'] },
  // ── East Asia ───────────────────────────────────────────
  { dest: 'Tokyo',          from: 'Manila', code: 'NRT', region: 'East Asia',      emoji: '🗼', price: 8990,  original: 14500, airline: 'Philippine Airlines',   discount: '38%', colors: ['#7B1FA2','#C2185B'] },
  { dest: 'Osaka',          from: 'Manila', code: 'KIX', region: 'East Asia',      emoji: '🏯', price: 8499,  original: 13200, airline: 'Japan Airlines',        discount: '36%', colors: ['#880E4F','#AD1457'] },
  { dest: 'Fukuoka',        from: 'Manila', code: 'FUK', region: 'East Asia',      emoji: '🌸', price: 7499,  original: 11500, airline: 'ANA',                   discount: '35%', colors: ['#1B5E20','#2E7D32'] },
  { dest: 'Sapporo',        from: 'Manila', code: 'CTS', region: 'East Asia',      emoji: '❄️', price: 9999,  original: 15800, airline: 'Peach Aviation',        discount: '37%', colors: ['#01579B','#0277BD'] },
  { dest: 'Seoul',          from: 'Manila', code: 'ICN', region: 'East Asia',      emoji: '🌸', price: 7200,  original: 11000, airline: 'Korean Air',            discount: '35%', colors: ['#311B92','#1A237E'] },
  { dest: 'Busan',          from: 'Manila', code: 'PUS', region: 'East Asia',      emoji: '🎆', price: 7800,  original: 11900, airline: 'Asiana Airlines',       discount: '34%', colors: ['#004D40','#00695C'] },
  { dest: 'Hong Kong',      from: 'Manila', code: 'HKG', region: 'East Asia',      emoji: '🌃', price: 3799,  original: 5500,  airline: 'Cathay Pacific',        discount: '31%', colors: ['#006064','#01579B'] },
  { dest: 'Taipei',         from: 'Manila', code: 'TPE', region: 'East Asia',      emoji: '🧋', price: 4599,  original: 7000,  airline: 'EVA Air',               discount: '34%', colors: ['#006064','#00838F'] },
  { dest: 'Shanghai',       from: 'Manila', code: 'PVG', region: 'East Asia',      emoji: '🌆', price: 6499,  original: 9800,  airline: 'China Eastern',         discount: '34%', colors: ['#B71C1C','#C62828'] },
  { dest: 'Beijing',        from: 'Manila', code: 'PEK', region: 'East Asia',      emoji: '🏯', price: 7299,  original: 11000, airline: 'Air China',             discount: '34%', colors: ['#4E342E','#6D4C41'] },
  // ── South Asia ──────────────────────────────────────────
  { dest: 'New Delhi',      from: 'Manila', code: 'DEL', region: 'South Asia',     emoji: '🕌', price: 9499,  original: 14800, airline: 'Air India',             discount: '36%', colors: ['#E65100','#BF360C'] },
  { dest: 'Mumbai',         from: 'Manila', code: 'BOM', region: 'South Asia',     emoji: '🌊', price: 10200, original: 15900, airline: 'Air India Express',     discount: '36%', colors: ['#37474F','#455A64'] },
  { dest: 'Kathmandu',      from: 'Manila', code: 'KTM', region: 'South Asia',     emoji: '🏔️', price: 11500, original: 17500, airline: 'Qatar Airways',         discount: '34%', colors: ['#263238','#37474F'] },
  { dest: 'Colombo',        from: 'Manila', code: 'CMB', region: 'South Asia',     emoji: '🌴', price: 8999,  original: 13500, airline: 'SriLankan Airlines',    discount: '33%', colors: ['#01579B','#0277BD'] },
  // ── Middle East ─────────────────────────────────────────
  { dest: 'Dubai',          from: 'Manila', code: 'DXB', region: 'Middle East',    emoji: '🏙️', price: 14500, original: 22000, airline: 'Emirates',              discount: '34%', colors: ['#880E4F','#BF360C'] },
  { dest: 'Abu Dhabi',      from: 'Manila', code: 'AUH', region: 'Middle East',    emoji: '🕌', price: 13800, original: 21000, airline: 'Etihad Airways',        discount: '34%', colors: ['#4A148C','#6A1B9A'] },
  { dest: 'Doha',           from: 'Manila', code: 'DOH', region: 'Middle East',    emoji: '🌙', price: 13200, original: 20000, airline: 'Qatar Airways',         discount: '34%', colors: ['#37474F','#546E7A'] },
  { dest: 'Riyadh',         from: 'Manila', code: 'RUH', region: 'Middle East',    emoji: '🌵', price: 15800, original: 23500, airline: 'Saudi Airlines',        discount: '33%', colors: ['#1B5E20','#2E7D32'] },
  // ── Europe ──────────────────────────────────────────────
  { dest: 'London',         from: 'Manila', code: 'LHR', region: 'Europe',         emoji: '🎡', price: 35900, original: 55000, airline: 'British Airways',       discount: '35%', colors: ['#0D47A1','#1565C0'] },
  { dest: 'Paris',          from: 'Manila', code: 'CDG', region: 'Europe',         emoji: '🗼', price: 38500, original: 59000, airline: 'Air France',            discount: '35%', colors: ['#880E4F','#AD1457'] },
  { dest: 'Amsterdam',      from: 'Manila', code: 'AMS', region: 'Europe',         emoji: '🌷', price: 36200, original: 56000, airline: 'KLM',                   discount: '35%', colors: ['#006064','#00838F'] },
  { dest: 'Frankfurt',      from: 'Manila', code: 'FRA', region: 'Europe',         emoji: '🏰', price: 37800, original: 58500, airline: 'Lufthansa',             discount: '35%', colors: ['#212121','#424242'] },
  { dest: 'Rome',           from: 'Manila', code: 'FCO', region: 'Europe',         emoji: '🏛️', price: 39500, original: 61000, airline: 'Qatar Airways',         discount: '35%', colors: ['#BF360C','#D84315'] },
  { dest: 'Barcelona',      from: 'Manila', code: 'BCN', region: 'Europe',         emoji: '🎭', price: 38900, original: 59500, airline: 'Iberia',                discount: '35%', colors: ['#E65100','#F57F17'] },
  { dest: 'Istanbul',       from: 'Manila', code: 'IST', region: 'Europe',         emoji: '🕌', price: 24500, original: 37000, airline: 'Turkish Airlines',      discount: '34%', colors: ['#B71C1C','#C62828'] },
  { dest: 'Zurich',         from: 'Manila', code: 'ZRH', region: 'Europe',         emoji: '🏔️', price: 41000, original: 62000, airline: 'Swiss International',   discount: '34%', colors: ['#880E4F','#C2185B'] },
  // ── Oceania ─────────────────────────────────────────────
  { dest: 'Sydney',         from: 'Manila', code: 'SYD', region: 'Oceania',        emoji: '🦘', price: 18900, original: 28000, airline: 'Philippine Airlines',   discount: '32%', colors: ['#004D40','#1B5E20'] },
  { dest: 'Melbourne',      from: 'Manila', code: 'MEL', region: 'Oceania',        emoji: '🎨', price: 19500, original: 29500, airline: 'Qantas',                discount: '34%', colors: ['#0D47A1','#1565C0'] },
  { dest: 'Auckland',       from: 'Manila', code: 'AKL', region: 'Oceania',        emoji: '🥝', price: 22000, original: 33000, airline: 'Air New Zealand',       discount: '33%', colors: ['#01579B','#006064'] },
  { dest: 'Fiji',           from: 'Manila', code: 'NAN', region: 'Oceania',        emoji: '🌺', price: 21500, original: 32000, airline: 'Fiji Airways',          discount: '33%', colors: ['#00695C','#00796B'] },
  // ── North America ───────────────────────────────────────
  { dest: 'Los Angeles',    from: 'Manila', code: 'LAX', region: 'North America',  emoji: '🎬', price: 29900, original: 46000, airline: 'Philippine Airlines',   discount: '35%', colors: ['#4A148C','#7B1FA2'] },
  { dest: 'San Francisco',  from: 'Manila', code: 'SFO', region: 'North America',  emoji: '🌉', price: 31000, original: 48000, airline: 'United Airlines',       discount: '35%', colors: ['#E65100','#BF360C'] },
  { dest: 'New York',       from: 'Manila', code: 'JFK', region: 'North America',  emoji: '🗽', price: 34900, original: 55000, airline: 'Delta Air Lines',       discount: '37%', colors: ['#B71C1C','#880E4F'] },
  { dest: 'Honolulu',       from: 'Manila', code: 'HNL', region: 'North America',  emoji: '🌺', price: 18500, original: 27000, airline: 'United Airlines',       discount: '31%', colors: ['#006064','#00838F'] },
  { dest: 'Guam',           from: 'Manila', code: 'GUM', region: 'North America',  emoji: '🏝️', price: 7900,  original: 11800, airline: 'Philippine Airlines',   discount: '33%', colors: ['#006064','#00897B'] },
  { dest: 'Vancouver',      from: 'Manila', code: 'YVR', region: 'North America',  emoji: '🍁', price: 33500, original: 51000, airline: 'Air Canada',            discount: '34%', colors: ['#C62828','#B71C1C'] },
  // ── Africa ──────────────────────────────────────────────
  { dest: 'Johannesburg',   from: 'Manila', code: 'JNB', region: 'Africa',         emoji: '🦁', price: 42000, original: 64000, airline: 'Emirates',              discount: '34%', colors: ['#33691E','#558B2F'] },
  { dest: 'Nairobi',        from: 'Manila', code: 'NBO', region: 'Africa',         emoji: '🦒', price: 38500, original: 58000, airline: 'Qatar Airways',         discount: '34%', colors: ['#1B5E20','#2E7D32'] },
  { dest: 'Cairo',          from: 'Manila', code: 'CAI', region: 'Africa',         emoji: '🏛️', price: 28900, original: 44000, airline: 'Emirates',              discount: '34%', colors: ['#F57F17','#E65100'] },
  // ── South America ───────────────────────────────────────
  { dest: 'São Paulo',      from: 'Manila', code: 'GRU', region: 'South America',  emoji: '🎉', price: 52000, original: 79000, airline: 'Qatar Airways',         discount: '34%', colors: ['#006064','#00695C'] },
  { dest: 'Buenos Aires',   from: 'Manila', code: 'EZE', region: 'South America',  emoji: '🥩', price: 54000, original: 82000, airline: 'Qatar Airways',         discount: '34%', colors: ['#37474F','#455A64'] },
];

// Approximate flight hours by region pair (from Philippine perspective)
const ROUTE_PROFILES = {
  // Short-haul (< 4h)
  short: {
    minH: 1.5, maxH: 4,
    minPrice: 1800, maxPrice: 8000,
    hubs: ['SIN', 'HKG', 'TPE'],
  },
  // Medium-haul (4–8h)
  medium: {
    minH: 4, maxH: 8,
    minPrice: 6000, maxPrice: 20000,
    hubs: ['NRT', 'ICN', 'PEK', 'DOH', 'DXB'],
  },
  // Long-haul (8–14h)
  long: {
    minH: 8, maxH: 14,
    minPrice: 18000, maxPrice: 55000,
    hubs: ['SYD', 'DEL', 'FRA', 'LHR'],
  },
  // Ultra-long-haul (14h+)
  ultralong: {
    minH: 14, maxH: 22,
    minPrice: 28000, maxPrice: 90000,
    hubs: ['LHR', 'CDG', 'JFK', 'LAX', 'GRU', 'JNB'],
  },
};

function getRouteProfile(fromCode, toCode) {
  const short    = ['SIN','BKK','HKG','KUL','SGN','HAN','DPS','REP','BWN','PNH','CEB','DVO','ILO'];
  const medium   = ['NRT','HND','KIX','FUK','CTS','ICN','GMP','PUS','CJU','TPE','PEK','PVG','CAN','DXB','AUH','DOH','SYD','MEL','BNE','DEL','BOM','GUM','HNL'];
  const ultralong= ['LHR','LGW','CDG','FRA','AMS','MAD','FCO','JFK','LAX','SFO','GRU','EZE','JNB','NBO'];

  const dest = toCode;
  if (short.includes(dest))     return ROUTE_PROFILES.short;
  if (medium.includes(dest))    return ROUTE_PROFILES.medium;
  if (ultralong.includes(dest)) return ROUTE_PROFILES.ultralong;
  return ROUTE_PROFILES.long;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}

// Generate realistic mock flight results
function generateFlights(from, to, date, pax = 1) {
  const profile = getRouteProfile(from?.code, to?.code);
  const results = [];

  const departureTimes = [
    '00:30','04:45','05:30','06:15','07:00','07:45','08:30','09:15',
    '10:00','10:45','11:30','12:15','13:00','13:45','14:30','15:15',
    '16:00','16:45','17:30','18:15','19:00','19:45','20:30','21:15','22:00','23:15',
  ];

  const viaCities = ['SIN','HKG','NRT','DOH','DXB','ICN','KUL','BKK','IST','TPE'];
  const shuffledTimes = shuffleArray([...departureTimes]);
  const usedAirlines = shuffleArray([...AIRLINES]).slice(0, 10);

  const numFlights = 14;

  for (let i = 0; i < numFlights; i++) {
    const airline = usedAirlines[i % usedAirlines.length];
    const deptTime = shuffledTimes[i % shuffledTimes.length];

    // Direct flights: shorter duration, higher price per hour
    const isDirect = i < 4 || Math.random() > 0.55;
    const stops = isDirect ? 0 : (Math.random() > 0.65 ? 1 : 2);

    const baseHours = randomBetween(profile.minH, profile.maxH);
    const stopPenalty = stops * randomBetween(1.5, 3.5); // hours added for stops
    const totalHours = baseHours + stopPenalty;
    const totalMin = Math.round(totalHours * 60 / 5) * 5;

    const arrTime = addMinutes(deptTime, totalMin);

    // Price: direct is ~20–40% more expensive than with stops
    const priceBase = randomBetween(profile.minPrice, profile.maxPrice);
    const directPremium = isDirect ? 1.0 : (stops === 1 ? 0.75 : 0.6);
    const priceRaw = priceBase * directPremium;
    const price = Math.round(priceRaw / 100) * 100;

    // Via city
    const via = stops === 0 ? null
      : stops === 1 ? viaCities[Math.floor(Math.random() * viaCities.length)]
      : viaCities[Math.floor(Math.random() * viaCities.length)] + ', ' + viaCities[Math.floor(Math.random() * viaCities.length)];

    const priceChangeAmt = Math.floor(Math.random() * Math.max(500, price * 0.1));
    const priceChange = (Math.random() > 0.5 ? '+' : '-') + '₱' + priceChangeAmt.toLocaleString();

    const baggageOptions = ['7kg carry-on only', '7kg + 20kg checked', '7kg + 30kg checked', '2x 23kg checked'];
    const baggage = stops === 0
      ? baggageOptions[Math.floor(Math.random() * 2)]
      : baggageOptions[1 + Math.floor(Math.random() * 2)];

    results.push({
      id: `FLT${i + 1000}`,
      airline,
      from: from?.code || 'MNL',
      to: to?.code || 'SIN',
      fromCity: from?.city || 'Manila',
      toCity: to?.city || 'Singapore',
      depart: deptTime,
      arrive: arrTime,
      duration: formatDuration(totalMin),
      durationMin: totalMin,
      stops,
      via,
      price: Math.round(price * pax / 100) * 100,
      pricePerPax: Math.round(price / 100) * 100,
      priceChange,
      baggage,
      refundable: Math.random() > 0.55,
      seats: Math.floor(Math.random() * 9) + 1,
      flightNum: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
      class: 'Economy',
    });
  }

  // Sort by price
  results.sort((a, b) => a.price - b.price);

  // Assign badges
  results[0].badge = 'cheapest';
  const fastestIdx = results.reduce((best, f, i, arr) => f.durationMin < arr[best].durationMin ? i : best, 0);
  results[fastestIdx].badge = fastestIdx === 0 ? 'fastest' : 'fastest';
  const bestIdx = results.findIndex((f, i) => i !== 0 && i !== fastestIdx);
  if (bestIdx !== -1) results[bestIdx].badge = 'best';

  return results;
}

function generateCalendarPrices(date) {
  const days = [];
  const base = new Date(date || Date.now());
  const minIdx = Math.floor(Math.random() * 14) + 5;
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    let price = 4500 + Math.floor(Math.random() * 8000);
    if (dayOfWeek === 0 || dayOfWeek === 6) price += 2000;
    if (i === minIdx) price = Math.floor(price * 0.55);
    days.push({ date: d, price, cheapest: i === minIdx });
  }
  return days;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const rh = Math.floor(total / 60) % 24;
  const rm = total % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

function formatPrice(n) {
  return '₱' + n.toLocaleString('en-PH');
}

function formatDate(d) {
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}
