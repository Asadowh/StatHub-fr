export interface CountryData {
  name: string;
  code: string;
  flag: string;
  colors: string[];
}

export const countryDatabase: CountryData[] = [
  // Europe
  { name: "Portugal", code: "PT", flag: "🇵🇹", colors: ["#006600", "#FF0000"] },
  { name: "Spain", code: "ES", flag: "🇪🇸", colors: ["#AA151B", "#F1BF00"] },
  { name: "France", code: "FR", flag: "🇫🇷", colors: ["#002395", "#ED2939"] },
  { name: "Germany", code: "DE", flag: "🇩🇪", colors: ["#000000", "#DD0000", "#FFCE00"] },
  { name: "Italy", code: "IT", flag: "🇮🇹", colors: ["#009246", "#CE2B37"] },
  { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", colors: ["#FFFFFF", "#CE1124"] },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", colors: ["#012169", "#C8102E"] },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", colors: ["#AE1C28", "#21468B"] },
  { name: "Belgium", code: "BE", flag: "🇧🇪", colors: ["#FDDA24", "#EF3340"] },
  { name: "Croatia", code: "HR", flag: "🇭🇷", colors: ["#FF0000", "#171796"] },
  { name: "Poland", code: "PL", flag: "🇵🇱", colors: ["#FFFFFF", "#DC143C"] },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", colors: ["#005BBB", "#FFD500"] },
  { name: "Sweden", code: "SE", flag: "🇸🇪", colors: ["#006AA7", "#FECC00"] },
  { name: "Norway", code: "NO", flag: "🇳🇴", colors: ["#EF2B2D", "#002868"] },
  { name: "Denmark", code: "DK", flag: "🇩🇰", colors: ["#C60C30", "#FFFFFF"] },
  { name: "Finland", code: "FI", flag: "🇫🇮", colors: ["#003580", "#FFFFFF"] },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", colors: ["#FF0000", "#FFFFFF"] },
  { name: "Austria", code: "AT", flag: "🇦🇹", colors: ["#ED2939", "#FFFFFF"] },
  { name: "Greece", code: "GR", flag: "🇬🇷", colors: ["#0D5EAF", "#FFFFFF"] },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿", colors: ["#D7141A", "#11457E"] },
  { name: "Romania", code: "RO", flag: "🇷🇴", colors: ["#002B7F", "#FCD116", "#CE1126"] },
  { name: "Hungary", code: "HU", flag: "🇭🇺", colors: ["#CE2939", "#FFFFFF", "#477050"] },
  { name: "Serbia", code: "RS", flag: "🇷🇸", colors: ["#C6363C", "#0C4076"] },
  { name: "Slovenia", code: "SI", flag: "🇸🇮", colors: ["#005DA4", "#ED1C24"] },
  { name: "Slovakia", code: "SK", flag: "🇸🇰", colors: ["#0B4EA2", "#EE1C25"] },
  { name: "Bosnia", code: "BA", flag: "🇧🇦", colors: ["#002395", "#FECB00"] },
  { name: "Iceland", code: "IS", flag: "🇮🇸", colors: ["#02529C", "#DC1E35"] },
  { name: "Ireland", code: "IE", flag: "🇮🇪", colors: ["#169B62", "#FF883E"] },
  { name: "Scotland", code: "SCT", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", colors: ["#005EB8", "#FFFFFF"] },
  { name: "Wales", code: "WLS", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", colors: ["#00AB39", "#FFFFFF", "#C8102E"] },
  { name: "Russia", code: "RU", flag: "🇷🇺", colors: ["#FFFFFF", "#0039A6", "#D52B1E"] },
  { name: "Bulgaria", code: "BG", flag: "🇧🇬", colors: ["#FFFFFF", "#00966E", "#D62612"] },
  { name: "Albania", code: "AL", flag: "🇦🇱", colors: ["#E41E20", "#000000"] },
  { name: "Montenegro", code: "ME", flag: "🇲🇪", colors: ["#C40308", "#D4AF37"] },
  { name: "North Macedonia", code: "MK", flag: "🇲🇰", colors: ["#D20000", "#FFE600"] },
  { name: "Kosovo", code: "XK", flag: "🇽🇰", colors: ["#244AA5", "#D0A650"] },
  { name: "Moldova", code: "MD", flag: "🇲🇩", colors: ["#003DA5", "#FFD200", "#AD1519"] },
  { name: "Belarus", code: "BY", flag: "🇧🇾", colors: ["#C8313E", "#4AA657"] },
  { name: "Lithuania", code: "LT", flag: "🇱🇹", colors: ["#FDB913", "#006A44", "#C1272D"] },
  { name: "Latvia", code: "LV", flag: "🇱🇻", colors: ["#9E3039", "#FFFFFF"] },
  { name: "Estonia", code: "EE", flag: "🇪🇪", colors: ["#0072CE", "#000000", "#FFFFFF"] },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺", colors: ["#ED2939", "#FFFFFF", "#00A1DE"] },
  { name: "Malta", code: "MT", flag: "🇲🇹", colors: ["#FFFFFF", "#CF142B"] },
  { name: "Cyprus", code: "CY", flag: "🇨🇾", colors: ["#FFFFFF", "#D47600"] },
  
  // Asia & Middle East
  { name: "Turkey", code: "TR", flag: "🇹🇷", colors: ["#E30A17", "#FFFFFF"] },
  { name: "Azerbaijan", code: "AZ", flag: "🇦🇿", colors: ["#00B5E2", "#ED2939", "#3F9C35"] },
  { name: "Georgia", code: "GE", flag: "🇬🇪", colors: ["#FF0000", "#FFFFFF"] },
  { name: "Armenia", code: "AM", flag: "🇦🇲", colors: ["#D90012", "#0033A0", "#F2A800"] },
  { name: "Iran", code: "IR", flag: "🇮🇷", colors: ["#239F40", "#DA0000"] },
  { name: "Iraq", code: "IQ", flag: "🇮🇶", colors: ["#CE1126", "#FFFFFF", "#007A3D"] },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", colors: ["#006C35", "#FFFFFF"] },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", colors: ["#00732F", "#FF0000"] },
  { name: "Qatar", code: "QA", flag: "🇶🇦", colors: ["#8D1B3D", "#FFFFFF"] },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", colors: ["#007A3D", "#CE1126"] },
  { name: "Bahrain", code: "BH", flag: "🇧🇭", colors: ["#CE1126", "#FFFFFF"] },
  { name: "Oman", code: "OM", flag: "🇴🇲", colors: ["#DB161B", "#FFFFFF", "#008000"] },
  { name: "Yemen", code: "YE", flag: "🇾🇪", colors: ["#CE1126", "#FFFFFF", "#000000"] },
  { name: "Jordan", code: "JO", flag: "🇯🇴", colors: ["#007A3D", "#CE1126", "#000000"] },
  { name: "Lebanon", code: "LB", flag: "🇱🇧", colors: ["#ED1C24", "#FFFFFF", "#00A651"] },
  { name: "Syria", code: "SY", flag: "🇸🇾", colors: ["#CE1126", "#FFFFFF", "#000000"] },
  { name: "Palestine", code: "PS", flag: "🇵🇸", colors: ["#007A3D", "#CE1126", "#000000"] },
  { name: "Israel", code: "IL", flag: "🇮🇱", colors: ["#0038B8", "#FFFFFF"] },
  { name: "Japan", code: "JP", flag: "🇯🇵", colors: ["#FFFFFF", "#BC002D"] },
  { name: "South Korea", code: "KR", flag: "🇰🇷", colors: ["#C60C30", "#003478"] },
  { name: "North Korea", code: "KP", flag: "🇰🇵", colors: ["#024FA2", "#ED1C27"] },
  { name: "China", code: "CN", flag: "🇨🇳", colors: ["#DE2910", "#FFDE00"] },
  { name: "Taiwan", code: "TW", flag: "🇹🇼", colors: ["#FE0000", "#000095"] },
  { name: "Hong Kong", code: "HK", flag: "🇭🇰", colors: ["#DE2910", "#FFFFFF"] },
  { name: "India", code: "IN", flag: "🇮🇳", colors: ["#FF9933", "#138808"] },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", colors: ["#01411C", "#FFFFFF"] },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", colors: ["#006A4E", "#F42A41"] },
  { name: "Nepal", code: "NP", flag: "🇳🇵", colors: ["#DC143C", "#003893"] },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰", colors: ["#8D153A", "#FFBE29"] },
  { name: "Afghanistan", code: "AF", flag: "🇦🇫", colors: ["#000000", "#BF0000", "#009900"] },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", colors: ["#FF0000", "#FFFFFF"] },
  { name: "Thailand", code: "TH", flag: "🇹🇭", colors: ["#A51931", "#2D2A4A"] },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", colors: ["#DA251D", "#FFCD00"] },
  { name: "Philippines", code: "PH", flag: "🇵🇭", colors: ["#0038A8", "#CE1126"] },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", colors: ["#010066", "#CC0001"] },
  { name: "Singapore", code: "SG", flag: "🇸🇬", colors: ["#ED2939", "#FFFFFF"] },
  { name: "Myanmar", code: "MM", flag: "🇲🇲", colors: ["#FECB00", "#34B233", "#EA2839"] },
  { name: "Cambodia", code: "KH", flag: "🇰🇭", colors: ["#032EA1", "#E00025"] },
  { name: "Laos", code: "LA", flag: "🇱🇦", colors: ["#CE1126", "#002868"] },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", colors: ["#00AFCA", "#FEC50C"] },
  { name: "Uzbekistan", code: "UZ", flag: "🇺🇿", colors: ["#1EB53A", "#0099B5"] },
  { name: "Turkmenistan", code: "TM", flag: "🇹🇲", colors: ["#00843D", "#D22630"] },
  { name: "Kyrgyzstan", code: "KG", flag: "🇰🇬", colors: ["#E8112D", "#FFEF00"] },
  { name: "Tajikistan", code: "TJ", flag: "🇹🇯", colors: ["#CC0000", "#FFFFFF", "#006600"] },
  { name: "Mongolia", code: "MN", flag: "🇲🇳", colors: ["#C4272F", "#015197"] },
  
  // Americas
  { name: "United States", code: "US", flag: "🇺🇸", colors: ["#B22234", "#3C3B6E"] },
  { name: "Canada", code: "CA", flag: "🇨🇦", colors: ["#FF0000", "#FFFFFF"] },
  { name: "Mexico", code: "MX", flag: "🇲🇽", colors: ["#006847", "#CE1126"] },
  { name: "Brazil", code: "BR", flag: "🇧🇷", colors: ["#009C3B", "#FFDF00"] },
  { name: "Argentina", code: "AR", flag: "🇦🇷", colors: ["#74ACDF", "#FFFFFF"] },
  { name: "Colombia", code: "CO", flag: "🇨🇴", colors: ["#FCD116", "#003893", "#CE1126"] },
  { name: "Chile", code: "CL", flag: "🇨🇱", colors: ["#D52B1E", "#0039A6"] },
  { name: "Peru", code: "PE", flag: "🇵🇪", colors: ["#D91023", "#FFFFFF"] },
  { name: "Venezuela", code: "VE", flag: "🇻🇪", colors: ["#FFCC00", "#00247D", "#CF142B"] },
  { name: "Ecuador", code: "EC", flag: "🇪🇨", colors: ["#FFD100", "#034EA2"] },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", colors: ["#0038A8", "#FFFFFF"] },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", colors: ["#D52B1E", "#0038A8"] },
  { name: "Bolivia", code: "BO", flag: "🇧🇴", colors: ["#007934", "#D52B1E", "#F9E300"] },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", colors: ["#002B7F", "#CE1126"] },
  { name: "Panama", code: "PA", flag: "🇵🇦", colors: ["#005293", "#D21034"] },
  { name: "Jamaica", code: "JM", flag: "🇯🇲", colors: ["#009B3A", "#FED100"] },
  { name: "Cuba", code: "CU", flag: "🇨🇺", colors: ["#002A8F", "#CB1515"] },
  { name: "Dominican Republic", code: "DO", flag: "🇩🇴", colors: ["#002D62", "#CE1126"] },
  { name: "Puerto Rico", code: "PR", flag: "🇵🇷", colors: ["#ED0000", "#0050F0"] },
  { name: "Honduras", code: "HN", flag: "🇭🇳", colors: ["#0073CF", "#FFFFFF"] },
  { name: "El Salvador", code: "SV", flag: "🇸🇻", colors: ["#0F47AF", "#FFFFFF"] },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", colors: ["#4997D0", "#FFFFFF"] },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", colors: ["#000067", "#FFFFFF"] },
  { name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹", colors: ["#DA291C", "#000000", "#FFFFFF"] },
  { name: "Haiti", code: "HT", flag: "🇭🇹", colors: ["#00209F", "#D21034"] },
  { name: "Suriname", code: "SR", flag: "🇸🇷", colors: ["#377E3F", "#B40A2D"] },
  { name: "Guyana", code: "GY", flag: "🇬🇾", colors: ["#009E49", "#FCD116", "#CE1126"] },
  
  // Africa
  { name: "Morocco", code: "MA", flag: "🇲🇦", colors: ["#C1272D", "#006233"] },
  { name: "Algeria", code: "DZ", flag: "🇩🇿", colors: ["#006233", "#D21034"] },
  { name: "Tunisia", code: "TN", flag: "🇹🇳", colors: ["#E70013", "#FFFFFF"] },
  { name: "Libya", code: "LY", flag: "🇱🇾", colors: ["#000000", "#239E46", "#E70013"] },
  { name: "Egypt", code: "EG", flag: "🇪🇬", colors: ["#CE1126", "#000000"] },
  { name: "Sudan", code: "SD", flag: "🇸🇩", colors: ["#007229", "#D21034", "#000000"] },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", colors: ["#008751", "#FFFFFF"] },
  { name: "Ghana", code: "GH", flag: "🇬🇭", colors: ["#006B3F", "#FCD116", "#CE1126"] },
  { name: "Senegal", code: "SN", flag: "🇸🇳", colors: ["#00853F", "#FDEF42", "#E31B23"] },
  { name: "Cameroon", code: "CM", flag: "🇨🇲", colors: ["#007A5E", "#CE1126", "#FCD116"] },
  { name: "Ivory Coast", code: "CI", flag: "🇨🇮", colors: ["#F77F00", "#FFFFFF", "#009E60"] },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", colors: ["#007A4D", "#FFB612", "#DE3831"] },
  { name: "Kenya", code: "KE", flag: "🇰🇪", colors: ["#006600", "#BB0000"] },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿", colors: ["#1EB53A", "#00A3DD"] },
  { name: "Uganda", code: "UG", flag: "🇺🇬", colors: ["#000000", "#FCDC04", "#D90000"] },
  { name: "Ethiopia", code: "ET", flag: "🇪🇹", colors: ["#078930", "#FCDD09", "#DA121A"] },
  { name: "DR Congo", code: "CD", flag: "🇨🇩", colors: ["#007FFF", "#F7D618", "#CE1021"] },
  { name: "Mali", code: "ML", flag: "🇲🇱", colors: ["#14B53A", "#FCD116", "#CE1126"] },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫", colors: ["#EF2B2D", "#009E49"] },
  { name: "Niger", code: "NE", flag: "🇳🇪", colors: ["#E05206", "#FFFFFF", "#0DB02B"] },
  { name: "Chad", code: "TD", flag: "🇹🇩", colors: ["#002664", "#FECB00", "#C60C30"] },
  { name: "Angola", code: "AO", flag: "🇦🇴", colors: ["#CC092F", "#000000"] },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿", colors: ["#009A44", "#000000", "#FCE100", "#D21034"] },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼", colors: ["#006400", "#FFD200", "#DE2010"] },
  { name: "Zambia", code: "ZM", flag: "🇿🇲", colors: ["#198A00", "#EF7D00", "#000000", "#DE2010"] },
  { name: "Botswana", code: "BW", flag: "🇧🇼", colors: ["#75AADB", "#000000", "#FFFFFF"] },
  { name: "Namibia", code: "NA", flag: "🇳🇦", colors: ["#003580", "#009A44", "#D21034"] },
  { name: "Rwanda", code: "RW", flag: "🇷🇼", colors: ["#00A1DE", "#FAD201", "#20603D"] },
  { name: "Somalia", code: "SO", flag: "🇸🇴", colors: ["#4189DD", "#FFFFFF"] },
  { name: "Madagascar", code: "MG", flag: "🇲🇬", colors: ["#FFFFFF", "#FC3D32", "#007E3A"] },
  { name: "Mauritius", code: "MU", flag: "🇲🇺", colors: ["#EA2839", "#1A206D", "#FFD500", "#00A551"] },
  { name: "Cape Verde", code: "CV", flag: "🇨🇻", colors: ["#003893", "#CF2027"] },
  { name: "Gambia", code: "GM", flag: "🇬🇲", colors: ["#CE1126", "#3A7728", "#0C1C8C"] },
  { name: "Guinea", code: "GN", flag: "🇬🇳", colors: ["#CE1126", "#FCD116", "#009460"] },
  { name: "Liberia", code: "LR", flag: "🇱🇷", colors: ["#002868", "#BF0A30"] },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱", colors: ["#1EB53A", "#FFFFFF", "#0072C6"] },
  { name: "Togo", code: "TG", flag: "🇹🇬", colors: ["#006A4E", "#FFCE00", "#D21034"] },
  { name: "Benin", code: "BJ", flag: "🇧🇯", colors: ["#008751", "#FCD116", "#E8112D"] },
  { name: "Gabon", code: "GA", flag: "🇬🇦", colors: ["#009E60", "#FCD116", "#3A75C4"] },
  { name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", colors: ["#3E9A00", "#E32118", "#0073CE"] },
  { name: "Central African Republic", code: "CF", flag: "🇨🇫", colors: ["#003082", "#FFFFFF", "#289728", "#FFCE00", "#D21034"] },
  
  // Oceania
  { name: "Australia", code: "AU", flag: "🇦🇺", colors: ["#00008B", "#FFFFFF"] },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", colors: ["#00247D", "#CC142B"] },
  { name: "Fiji", code: "FJ", flag: "🇫🇯", colors: ["#68BFE5", "#CE1126"] },
  { name: "Papua New Guinea", code: "PG", flag: "🇵🇬", colors: ["#000000", "#CE1126", "#FCD116"] },
  { name: "Samoa", code: "WS", flag: "🇼🇸", colors: ["#002B7F", "#CE1126"] },
  { name: "Tonga", code: "TO", flag: "🇹🇴", colors: ["#C10000", "#FFFFFF"] },
];

export function findCountryByName(input: string): CountryData | null {
  if (!input) return null;
  const searchTerm = input.toLowerCase().trim();
  
  // Exact match by code or name
  const exactMatch = countryDatabase.find(
    c => c.name.toLowerCase() === searchTerm || c.code.toLowerCase() === searchTerm
  );
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = countryDatabase.find(
    c => c.name.toLowerCase().includes(searchTerm) || searchTerm.includes(c.name.toLowerCase())
  );
  
  return partialMatch || null;
}

export function getGradientFromColors(colors: string[]): string {
  if (colors.length === 1) {
    return `linear-gradient(135deg, ${colors[0]}, ${colors[0]})`;
  }
  if (colors.length === 2) {
    return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  }
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`;
}
